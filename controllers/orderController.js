import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import Cart from '../models/Cart.js';
import Coupon from '../models/Coupon.js';
import { generateInvoice } from '../utils/invoiceGenerator.js';
import { sendOrderEmail } from '../utils/emailSender.js';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';

// PLACE ORDER
export const placeOrder = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const userEmail = req.user.email;
    const userName = req.user.name;

    const cart = await Cart.findOne({
      user: new mongoose.Types.ObjectId(userId)
    }).populate({
      path: 'items.product',
      model: 'Product'
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty' });
    }

    const { deliveryAddress, phone, paymentMethod, couponCode } = req.body;
    if (!deliveryAddress || !phone) {
      return res.status(400).json({ message: 'Delivery address and phone are required' });
    }

    let totalAmount = cart.items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    let discountAmount = 0;

    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode,
        isActive: true,
        expiresAt: { $gte: new Date() }
      });

      if (!coupon) {
        return res.status(400).json({ message: 'Invalid or expired coupon code' });
      }

      discountAmount = (totalAmount * coupon.discountPercentage) / 100;
      totalAmount -= discountAmount;
    }

    const newOrder = new Order({
      user: userId,
      items: [],
      deliveryAddress,
      phone,
      totalAmount,
      paymentMethod: paymentMethod || 'COD',
      isPaid: paymentMethod === 'COD' ? false : true,
      couponCode: couponCode || null,
      discount: discountAmount || 0
    });

    const savedOrder = await newOrder.save();

    const orderItemIds = [];
    for (const item of cart.items) {
      if (!item.product) continue;

      const orderItem = new OrderItem({
        order: savedOrder._id,
        product: item.product._id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price
      });

      const savedItem = await orderItem.save();
      orderItemIds.push(savedItem._id);
    }

    savedOrder.items = orderItemIds;
    await savedOrder.save();
    await Cart.findOneAndDelete({ user: new mongoose.Types.ObjectId(userId) });

    const invoicePath = path.resolve(`invoices/invoice-${savedOrder._id}.pdf`);
    if (!fs.existsSync('invoices')) fs.mkdirSync('invoices', { recursive: true });

    const fullOrder = await Order.findById(savedOrder._id)
      .populate('user', 'name email')
      .populate({
        path: 'items',
        populate: {
          path: 'product',
          model: 'Product'
        }
      });

    await generateInvoice(fullOrder, invoicePath);

    await sendOrderEmail(
      userEmail,
      '🧾 Your KalamKart Order Invoice',
      `Dear ${userName},\n\nThanks for your order! Please find the invoice attached.\n\nRegards,\nKalamKart`,
      invoicePath
    );

    fs.unlink(invoicePath, () => {});

    res.status(201).json({
      message: '✅ Order placed and invoice emailed successfully!',
      orderId: savedOrder._id,
      totalAmount,
      discount: discountAmount,
      couponCode: couponCode || null,
      createdAt: savedOrder.createdAt,
      updatedAt: savedOrder.updatedAt
    });

  } catch (err) {
    res.status(500).json({ message: '❌ Server error', error: err.message });
  }
};

// DOWNLOAD INVOICE
export const downloadInvoice = async (req, res) => {
  try {
    const orderId = req.params.orderId;

    const order = await Order.findById(orderId)
      .populate('user', 'name email')
      .populate({
        path: 'items',
        populate: {
          path: 'product',
          model: 'Product'
        }
      });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const invoicePath = path.resolve(`invoices/invoice-${order._id}.pdf`);
    const dir = path.dirname(invoicePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    await generateInvoice(order, invoicePath);

    res.download(invoicePath, (err) => {
      if (err) {
        console.error('❌ Error sending invoice:', err);
        return res.status(500).json({ message: 'Failed to download invoice' });
      }
    });

  } catch (err) {
    res.status(500).json({ message: '❌ Invoice error', error: err.message });
  }
};

// GET USER ORDERS
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate({
        path: 'items',
        populate: {
          path: 'product',
          model: 'Product'
        }
      })
      .sort({ createdAt: -1 });

    if (orders.length === 0) {
      return res.status(404).json({ message: 'No orders found' });
    }

    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ADMIN: GET ALL ORDERS
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate({
        path: 'items',
        populate: {
          path: 'product',
          model: 'Product'
        }
      });

    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ADMIN: UPDATE ORDER STATUS
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    const validStatuses = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    await order.save();

    res.status(200).json({ message: 'Order status updated', order });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ADMIN: MARK ORDER AS PAID
export const markOrderPaid = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId)
      .populate('user', 'name email')
      .populate({
        path: 'items',
        populate: {
          path: 'product',
          model: 'Product'
        }
      });

    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.isPaid) {
      return res.status(400).json({ message: 'Order is already marked as paid.' });
    }

    order.isPaid = true;
    order.paymentMethod = order.paymentMethod || 'COD';
    await order.save();

    const invoicePath = path.resolve(`invoices/invoice-${order._id}.pdf`);
    if (!fs.existsSync('invoices')) fs.mkdirSync('invoices', { recursive: true });

    await generateInvoice(order, invoicePath);

    await sendOrderEmail(
      order.user.email,
      '🧾 Updated Invoice - Payment Confirmed',
      `Dear ${order.user.name},\n\nYour payment has been confirmed. Please find the updated invoice attached.\n\nThank you,\nKalamKart`,
      invoicePath
    );

    fs.unlink(invoicePath, () => {});

    res.status(200).json({
      message: '✅ Order marked as paid and updated invoice emailed.',
      order
    });
  } catch (err) {
    res.status(500).json({ message: '❌ Server error', error: err.message });
  }
};
