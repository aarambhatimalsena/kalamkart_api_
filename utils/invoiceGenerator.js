import PDFDocument from 'pdfkit';
import fs from 'fs';

export const generateInvoice = (order, filePath) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Title
    doc.fontSize(22).text('KalamKart Order Invoice', { align: 'center' });
    doc.moveDown();

    // Order details
    doc.fontSize(14).text(`Order ID: ${order._id}`);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`);
    doc.text(`Customer Name: ${order.user?.name || 'N/A'}`);
    doc.text(`Phone: ${order.phone}`);
    doc.text(`Delivery Address: ${order.deliveryAddress}`);
    doc.moveDown();

    // Item List
    doc.fontSize(16).text('Items:');

    order.items.forEach((item, index) => {
      const productName = item.product?.name || 'Unknown Product';
      const productPrice = item.product?.price ?? 0;
      const total = productPrice * item.quantity;

      doc.fontSize(12).text(
        `${index + 1}. ${productName} x${item.quantity} = Rs. ${total}`
      );
    });

    doc.moveDown();

    // Totals
    doc.fontSize(14).text(`Total Amount: Rs. ${order.totalAmount}`, {
      align: 'right',
    });

    // Optional: Discount + Coupon
    if (order.discount && order.couponCode) {
      doc.text(`Discount Applied (${order.couponCode}): -Rs. ${order.discount}`, {
        align: 'right',
      });
    }

    doc.moveDown();

    // Footer
    doc
      .fontSize(12)
      .text('Thank you for shopping with KalamKart!', { align: 'center' });

    doc.end();

    stream.on('finish', () => resolve());
    stream.on('error', (err) => reject(err));
  });
};
