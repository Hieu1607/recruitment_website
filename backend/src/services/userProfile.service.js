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
    let cvUrls = [];

    // Upload avatar if provided
    if (files.avatar) {
      try {
        avatarUrl = await minioService.uploadAvatar(files.avatar, userId);
      } catch (error) {
        throw new Error(`Failed to upload avatar: ${error.message}`);
      }
    }

    // Upload CVs if provided (can be multiple)
    if (files.cv && Array.isArray(files.cv)) {
      for (const cvFile of files.cv) {
        try {
          const cvUrl = await minioService.uploadCV(cvFile, userId);
          cvUrls.push(cvUrl);
        } catch (error) {
          throw new Error(`Failed to upload CV: ${error.message}`);
        }
      }
    }

    profile = await UserProfile.create({ 
      user_id: userId, 
      ...updateData,
      avatar_url: avatarUrl,
      cv_url: cvUrls
    });
  } else {
    // Update existing profile
    // Prevent changing user_id
    delete updateData.user_id;

    let avatarUrl = profile.avatar_url; // Keep existing by default
    let cvUrls = Array.isArray(profile.cv_url) ? [...profile.cv_url] : []; // Keep existing CVs

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

    // Upload new CVs if provided (add to existing CVs)
    if (files.cv && Array.isArray(files.cv)) {
      for (const cvFile of files.cv) {
        try {
          const cvUrl = await minioService.uploadCV(cvFile, userId);
          cvUrls.push(cvUrl);
        } catch (error) {
          throw new Error(`Failed to upload CV: ${error.message}`);
        }
      }
    }

    await profile.update({
      ...updateData,
      avatar_url: avatarUrl,
      cv_url: cvUrls
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

  // Delete all CVs from MinIO if exist
  if (Array.isArray(profile.cv_url) && profile.cv_url.length > 0) {
    for (const cvUrl of profile.cv_url) {
      try {
        await minioService.deleteFileByUrl(cvUrl);
      } catch (error) {
        console.warn('Failed to delete CV:', error.message);
      }
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
