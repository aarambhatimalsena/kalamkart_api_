import express from 'express';
import {
  placeOrder,
  downloadInvoice,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  markOrderPaid
} from '../controllers/orderController.js';

import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { validateOrder } from '../middleware/validators/orderValidator.js'; 

const router = express.Router();

router.post('/place', protect, validateOrder, placeOrder); // Order input validation
router.get('/invoice/:orderId', protect, downloadInvoice);
router.get('/my-orders', protect, getUserOrders);
router.get('/admin/all', protect, adminOnly, getAllOrders);
router.put('/admin/status', protect, adminOnly, updateOrderStatus);
router.put('/admin/mark-paid', protect, adminOnly, markOrderPaid);

export default router;
