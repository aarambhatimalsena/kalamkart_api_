import { body, validationResult } from 'express-validator';

export const validateOrder = [
  body('deliveryAddress')
    .notEmpty().withMessage('Delivery address is required')
    .isLength({ min: 5 }).withMessage('Address must be at least 5 characters long'),

  body('phone')
    .notEmpty().withMessage('Phone number is required')
    .isMobilePhone('any').withMessage('Invalid phone number'),

  body('paymentMethod')
    .optional()
    .isIn(['eSewa', 'Khalti', 'COD']).withMessage('Invalid payment method'),

  // Middleware to handle validation result
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];
