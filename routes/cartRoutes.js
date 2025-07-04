import express from 'express';
import {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart 
} from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .post(protect, addToCart)       // Add or update
  .get(protect, getCart)          // Get full cart
  .put(protect, updateCartItem);  // Update quantity

router
  .route('/:itemId')
  .delete(protect, removeFromCart); // Remove item

router
  .route('/clear')
  .delete(protect, clearCart);      // Clear entire cart

export default router;
