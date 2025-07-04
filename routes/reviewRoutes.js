import express from 'express';
import {
  addReview,
  getProductReviews,
  deleteReview,
  getAllReviews, 
} from '../controllers/reviewController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// User Review Endpoints
router.post('/:productId', protect, addReview);                     
router.get('/:productId', getProductReviews);                      
router.delete('/:productId/:reviewId', protect, deleteReview);     

// Admin: Get all reviews across all products
router.get('/', protect, adminOnly, getAllReviews);               

export default router;
