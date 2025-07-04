import express from 'express';
import multer from 'multer';

import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  googleAuthController,
  forgotPassword,
  resetPassword,
} from '../controllers/userController.js';

import {
  uploadProfileImage,
  deleteProfileImage,
} from '../controllers/uploadProfileController.js';

import { protect } from '../middleware/authMiddleware.js';
import {
  validateRegister,
  validateLogin,
} from '../middleware/validators/userValidator.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });



// Register & Login
router.post('/register', validateRegister, registerUser);
router.post('/login', validateLogin, loginUser);
router.post('/google-auth', googleAuthController);

// Forgot / Reset password
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);


// Get or update user profile
router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Upload profile image (Cloudinary)
router.put(
  '/profile/upload',
  protect,
  upload.single('image'), // key must be 'image' in frontend formData
  uploadProfileImage
);

// Delete profile image
router.delete('/profile/image', protect, deleteProfileImage);

export default router;
