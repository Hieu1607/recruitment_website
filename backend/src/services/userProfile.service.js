/**
 * UserProfile Service
 */
const { UserProfile } = require('../models');
const { NotFoundError } = require('../utils/errors');
const minioService = require('./minio.service');

const getMyProfile = async (userId) => {
  let profile = await UserProfile.findOne({ where: { user_id: userId } });
  
  if (!profile) {
    // Auto-create profile if not exists
    profile = await UserProfile.create({ user_id: userId });
  }
  
  return profile;
};

const updateMyProfile = async (userId, updateData, files = {}) => {
  let profile = await UserProfile.findOne({ where: { user_id: userId } });
  
  if (!profile) {
    // Create if not exists with files if provided
    let avatarUrl = null;
    let cvUrl = null;

    // Upload avatar if provided
    if (files.avatar) {
      try {
        avatarUrl = await minioService.uploadAvatar(files.avatar, userId);
      } catch (error) {
        throw new Error(`Failed to upload avatar: ${error.message}`);
      }
    }

    // Upload CV if provided
    if (files.cv) {
      try {
        cvUrl = await minioService.uploadCV(files.cv, userId);
      } catch (error) {
        throw new Error(`Failed to upload CV: ${error.message}`);
      }
    }

    profile = await UserProfile.create({ 
      user_id: userId, 
      ...updateData,
      avatar_url: avatarUrl,
      cv_url: cvUrl
    });
  } else {
    // Update existing profile
    // Prevent changing user_id
    delete updateData.user_id;

    let avatarUrl = profile.avatar_url; // Keep existing by default
    let cvUrl = profile.cv_url; // Keep existing by default

    // Upload new avatar if provided
    if (files.avatar) {
      try {
        const oldAvatarUrl = profile.avatar_url;
        avatarUrl = await minioService.uploadAvatar(files.avatar, userId);
        
        // Delete old avatar if exists
        if (oldAvatarUrl) {
          try {
            await minioService.deleteFileByUrl(oldAvatarUrl);
          } catch (deleteError) {
            console.warn('Failed to delete old avatar:', deleteError.message);
          }
        }
      } catch (error) {
        throw new Error(`Failed to upload avatar: ${error.message}`);
      }
    }

    // Upload new CV if provided
    if (files.cv) {
      try {
        const oldCvUrl = profile.cv_url;
        cvUrl = await minioService.uploadCV(files.cv, userId);
        
        // Delete old CV if exists
        if (oldCvUrl) {
          try {
            await minioService.deleteFileByUrl(oldCvUrl);
          } catch (deleteError) {
            console.warn('Failed to delete old CV:', deleteError.message);
          }
        }
      } catch (error) {
        throw new Error(`Failed to upload CV: ${error.message}`);
      }
    }

    await profile.update({
      ...updateData,
      avatar_url: avatarUrl,
      cv_url: cvUrl
    });
  }
  
  return profile;
};

const getProfileByUserId = async (userId) => {
  const profile = await UserProfile.findOne({ where: { user_id: userId } });
  if (!profile) throw new NotFoundError('Profile not found');
  return profile;
};

const deleteMyProfile = async (userId) => {
  const profile = await UserProfile.findOne({ where: { user_id: userId } });
  
  if (!profile) {
    throw new NotFoundError('Profile not found');
  }

  // Delete avatar from MinIO if exists
  if (profile.avatar_url) {
    try {
      await minioService.deleteFileByUrl(profile.avatar_url);
    } catch (error) {
      console.warn('Failed to delete avatar:', error.message);
    }
  }

  // Delete CV from MinIO if exists
  if (profile.cv_url) {
    try {
      await minioService.deleteFileByUrl(profile.cv_url);
    } catch (error) {
      console.warn('Failed to delete CV:', error.message);
    }
  }

  // Delete profile
  await profile.destroy();
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  getProfileByUserId,
  deleteMyProfile,
};
