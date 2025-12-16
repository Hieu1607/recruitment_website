/**
 * UserProfile Controller
 */
const userProfileService = require('../services/userProfile.service');
const { successResponse } = require('../utils/response');

const getMyProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const profile = await userProfileService.getMyProfile(userId);
    return successResponse(res, 200, profile, 'Profile retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const updateMyProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;
    const profile = await userProfileService.updateMyProfile(userId, updateData);
    return successResponse(res, 200, profile, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

const getProfileByUserId = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.userId);
    const profile = await userProfileService.getProfileByUserId(userId);
    return successResponse(res, 200, profile, 'Profile retrieved successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  getProfileByUserId,
};
