import express from 'express';
import {
  handleEsewaSuccess,
  handleEsewaFailure,
  handleKhaltiVerification
} from '../controllers/paymentController.js';

const router = express.Router();

router.get('/esewa/success', handleEsewaSuccess);
router.get('/esewa/failure', handleEsewaFailure);
router.post('/khalti/verify', handleKhaltiVerification);

export default router;
