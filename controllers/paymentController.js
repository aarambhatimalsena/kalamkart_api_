import axios from 'axios';
import Order from '../models/Order.js';

// eSewa Payment Success (Simulated for local testing)
export const handleEsewaSuccess = async (req, res) => {
  const { oid } = req.query;

  try {
    const order = await Order.findById(oid);
    if (!order) return res.status(404).send('❌ Order not found');

    order.isPaid = true;
    order.paymentMethod = 'eSewa';
    order.updatedAt = Date.now(); // Optional
    await order.save();

    return res.send('Local payment simulation successful!');
  } catch (err) {
    console.error('❌ ERROR in Esewa Success:', err.message);
    return res.status(500).json({
      message: '❌ Error while updating order',
      error: err.message,
    });
  }
};

//  eSewa Payment Failure
export const handleEsewaFailure = (req, res) => {
  res.status(400).send('❌ Payment failed or cancelled.');
};

// Khalti Payment Verification (with test token simulation)
export const handleKhaltiVerification = async (req, res) => {
  const { token, amount, orderId } = req.body;

  // SIMULATE LOCAL PAYMENT if using "test_local" token
  if (token === 'test_local') {
    try {
      const order = await Order.findById(orderId);
      if (!order) return res.status(404).json({ message: '❌ Order not found' });

      order.isPaid = true;
      order.paymentMethod = 'Khalti';
      await order.save();

      return res.json({ message: '✅ Local Khalti payment simulation successful!' });
    } catch (error) {
      return res.status(500).json({
        message: '❌ Error updating order',
        error: error.message,
      });
    }
  }

  //  REAL KHALTI VERIFICATION
  try {
    const response = await axios.post(
      'https://khalti.com/api/v2/payment/verify/',
      {
        token,
        amount
      },
      {
        headers: {
          Authorization: `Key test_secret_key_dc74b3fc69cf4e3db8b6f7fd178f630b`, // Use your Khalti test key
        },
      }
    );

    if (response.data?.idx) {
      const order = await Order.findById(orderId);
      if (!order) return res.status(404).json({ message: '❌ Order not found' });

      order.isPaid = true;
      order.paymentMethod = 'Khalti';
      await order.save();

      return res.json({ message: '✅ Khalti payment successful and order updated!' });
    } else {
      return res.status(400).json({ message: '❌ Payment verification failed' });
    }
  } catch (error) {
    return res.status(500).json({
      message: '❌ Khalti verification failed',
      error: error.response?.data || error.message,
    });
  }
};
