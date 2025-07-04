import express from 'express';
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
} from '../controllers/productController.js';

import { protect, adminOnly } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', getAllProducts);
router.get('/category/:categoryName', getProductsByCategory); 
router.get('/:id', getProductById);

// Admin-only routes
router.post('/admin', protect, adminOnly, upload.single('image'), createProduct);
router.put('/admin/:id', protect, adminOnly, upload.single('image'), updateProduct);
router.delete('/admin/:id', protect, adminOnly, deleteProduct);

export default router;
