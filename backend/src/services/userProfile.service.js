/**
 * UserProfile Service
 */
const { UserProfile } = require('../models');
const { NotFoundError } = require('../utils/errors');

const getMyProfile = async (userId) => {
  let profile = await UserProfile.findOne({ where: { user_id: userId } });
  
  if (!profile) {
    // Auto-create profile if not exists
    profile = await UserProfile.create({ user_id: userId });
  }
  
  return profile;
};

const updateMyProfile = async (userId, updateData) => {
  let profile = await UserProfile.findOne({ where: { user_id: userId } });
  
  if (!profile) {
    // Create if not exists
    profile = await UserProfile.create({ user_id: userId, ...updateData });
  } else {
    // Prevent changing user_id
    delete updateData.user_id;
    await profile.update(updateData);
  }
  
  return profile;
};

const getProfileByUserId = async (userId) => {
  const profile = await UserProfile.findOne({ where: { user_id: userId } });
  if (!profile) throw new NotFoundError('Profile not found');
  return profile;
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  getProfileByUserId,
};
