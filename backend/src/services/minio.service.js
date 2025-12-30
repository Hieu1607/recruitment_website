const {
  minioClient,
  DEFAULT_BUCKET,
  createBucketIfNotExists,
  uploadFile,
  uploadBuffer,
  getFileUrl,
  deleteFile,
  listFiles
} = require('../config/minio');
const path = require('path');

class MinioService {
  // Initialize MinIO service
  async initialize() {
    try {
      await createBucketIfNotExists(DEFAULT_BUCKET);
      await createBucketIfNotExists('resumes');
      await createBucketIfNotExists('avatars');
      await createBucketIfNotExists('company-logos');
      console.log('MinIO service initialized successfully');
    } catch (error) {
      console.error('Error initializing MinIO service:', error);
      throw error;
    }
  }

  // Upload general file
  async uploadGeneralFile(bucketName, file, prefix = '') {
    try {
      const fileName = `${Date.now()}_${file.originalname}`;
      const objectName = prefix ? `${prefix}/${fileName}` : fileName;
      
      await uploadBuffer(bucketName, objectName, file.buffer, file.mimetype);
      return getFileUrl(bucketName, objectName);
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  // Delete file by URL
  async deleteFileByUrl(fileUrl) {
    try {
      // Extract bucket and object name from URL
      const url = new URL(fileUrl);
      const pathParts = url.pathname.split('/').filter(part => part);
      
      if (pathParts.length < 2) {
        throw new Error('Invalid file URL');
      }
      
      const bucketName = pathParts[0];
      const objectName = pathParts.slice(1).join('/');
      
      return await deleteFile(bucketName, objectName);
    } catch (error) {
      console.error('Error deleting file by URL:', error);
      throw error;
    }
  }

  // List files in bucket
  async listBucketFiles(bucketName, prefix = '') {
    try {
      return await listFiles(bucketName, prefix, true);
    } catch (error) {
      console.error('Error listening files:', error);
      throw error;
    }
  }

  // Upload avatar for user
  async uploadAvatar(file, userId) {
    try {
      return await this.uploadGeneralFile('avatars', file, `user_${userId}`);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    }
  }

  // Upload CV for user
  async uploadCV(file, userId) {
    try {
      return await this.uploadGeneralFile('resumes', file, `user_${userId}`);
    } catch (error) {
      console.error('Error uploading CV:', error);
      throw error;
    }
  }

  // Upload company logo
  async uploadCompanyLogo(file, companyId) {
    try {
      return await this.uploadGeneralFile('company-logos', file, `company_${companyId}`);
    } catch (error) {
      console.error('Error uploading company logo:', error);
      throw error;
    }
  }
  
}

module.exports = new MinioService();