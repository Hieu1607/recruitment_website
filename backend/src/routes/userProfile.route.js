/**
 * UserProfile Routes
 */
const express = require('express');
const router = express.Router();
const userProfileController = require('../controllers/userProfile.controller');
const userProfileValidator = require('../validators/userProfile.validator');
const { authenticate } = require('../middlewares/auth');
const { uploadProfile, handleUploadErrors } = require('../middlewares/upload');

// Protected - current user's profile
router.get('/me',
  authenticate,
  userProfileController.getMyProfile
);

router.put('/me',
  authenticate,
  uploadProfile,
  handleUploadErrors,
  userProfileValidator.updateProfileValidation,
  userProfileValidator.handleValidationErrors,
  userProfileController.updateMyProfile
);

// Delete current user's profile
router.delete('/me',
  authenticate,
  userProfileController.deleteMyProfile
);

// Public - view profile by user ID
router.get('/:userId',
  userProfileValidator.getProfileByUserIdValidation,
  userProfileValidator.handleValidationErrors,
  userProfileController.getProfileByUserId
);

module.exports = router;
