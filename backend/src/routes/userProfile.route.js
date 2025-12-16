/**
 * UserProfile Routes
 */
const express = require('express');
const router = express.Router();
const userProfileController = require('../controllers/userProfile.controller');
const userProfileValidator = require('../validators/userProfile.validator');
const { authenticate } = require('../middlewares/auth');

// Protected - current user's profile
router.get('/me',
  authenticate,
  userProfileController.getMyProfile
);

router.put('/me',
  authenticate,
  userProfileValidator.updateProfileValidation,
  userProfileValidator.handleValidationErrors,
  userProfileController.updateMyProfile
);

// Public - view profile by user ID
router.get('/:userId',
  userProfileValidator.getProfileByUserIdValidation,
  userProfileValidator.handleValidationErrors,
  userProfileController.getProfileByUserId
);

module.exports = router;
