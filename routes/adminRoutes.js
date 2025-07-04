import express from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

// Admin Auth & Stats
import {
  loginAdmin,
  getAdminStats,
  getAllUsers,
  deleteUser,
  updateUserRole
} from '../controllers/adminController.js';

// Product Controllers
import {
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js';

// Category Controllers
import {
  createCategory,
  bulkCreateCategories
} from '../controllers/categoryController.js';

// Coupon Controllers
import {
  createCoupon,
  deleteCoupon,
  getAllCoupons
} from '../controllers/couponController.js';

// Order Controllers
import {
  getAllOrders,
  updateOrderStatus,
  markOrderPaid
} from '../controllers/orderController.js';

// Review Controllers
import {
  getAllReviews
} from '../controllers/reviewController.js';

const router = express.Router();

// Admin Login & Stats
router.post('/login', loginAdmin);
router.get('/stats', protect, adminOnly, getAdminStats);

// Product Management
router.post('/products', protect, adminOnly, createProduct);
router.put('/products/:id', protect, adminOnly, updateProduct);
router.delete('/products/:id', protect, adminOnly, deleteProduct);

// Category Management
router.post('/categories/bulk', protect, adminOnly, bulkCreateCategories);

// Coupon Management
router.post('/coupons', protect, adminOnly, createCoupon);
router.delete('/coupons/:code', protect, adminOnly, deleteCoupon);
router.get('/coupons', protect, adminOnly, getAllCoupons);

// Order Management
router.get('/orders', protect, adminOnly, getAllOrders);
router.put('/orders/:id/status', protect, adminOnly, updateOrderStatus);
router.put('/orders/:id/pay', protect, adminOnly, markOrderPaid);

// User Management
router.get('/users', protect, adminOnly, getAllUsers);
router.delete('/users/:id', protect, adminOnly, deleteUser);
router.put('/users/:id', protect, adminOnly, updateUserRole);

// Review Management
router.get('/reviews', protect, adminOnly, getAllReviews);

export default router;
