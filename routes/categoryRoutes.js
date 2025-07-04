import express from 'express';
import {
  getAllCategories,
  createCategory,
  deleteCategory,
  updateCategory,
  bulkCreateCategories
} from '../controllers/categoryController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Public: Get all categories
router.get('/', getAllCategories);

// Admin: Create category with image
router.post('/', protect, adminOnly, upload.single('image'), createCategory);

// Admin: Update category (name + optional image)
router.put('/:id', protect, adminOnly, upload.single('image'), updateCategory);

// Admin: Delete category
router.delete('/:id', protect, adminOnly, deleteCategory);

// Admin: Bulk insert categories (JSON, no file upload)
router.post('/bulk', protect, adminOnly, bulkCreateCategories);

export default router;
