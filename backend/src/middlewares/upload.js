/**
 * Upload Middleware
 * Handles file uploads using multer with memory storage
 */

const multer = require('multer');
const path = require('path');

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  // Check file type based on field name
  if (file.fieldname === 'logo_company_url') {
    // Allow only image files for company logo
    const allowedMimes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed for company logo'), false);
    }
  } else if (file.fieldname === 'cv' || file.fieldname === 'resume') {
    // Allow PDF and DOC files for CV/Resume
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOC files are allowed for CV/Resume'), false);
    }
  } else if (file.fieldname === 'avatar') {
    // Allow only image files for avatar
    const allowedMimes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed for avatar'), false);
    }
  } else {
    cb(new Error('Unknown field name'), false);
  }
};

// Configure multer with options
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
    files: 5, // max 5 files per request
  }
});

// Middleware for single file upload
const uploadSingle = (fieldName) => {
  return upload.single(fieldName);
};

// Middleware for multiple files upload
const uploadMultiple = (fieldName, maxCount = 5) => {
  return upload.array(fieldName, maxCount);
};

// Middleware for mixed fields upload
const uploadFields = (fields) => {
  return upload.fields(fields);
};

// Company logo upload middleware
const uploadCompanyLogo = uploadSingle('logo_company_url');

// Avatar upload middleware  
const uploadAvatar = uploadSingle('avatar');

// CV upload middleware
const uploadCV = uploadSingle('cv');

// Profile upload middleware (avatar + CV)
const uploadProfile = uploadFields([
  { name: 'avatar', maxCount: 1 },
  { name: 'cv', maxCount: 1 }
]);

// Error handler middleware for multer errors
const handleUploadErrors = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          error: 'File too large. Maximum size allowed is 10MB.'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          error: 'Too many files. Maximum 5 files allowed.'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          error: 'Unexpected field name.'
        });
      default:
        return res.status(400).json({
          success: false,
          error: error.message || 'Upload error occurred.'
        });
    }
  } else if (error) {
    return res.status(400).json({
      success: false,
      error: error.message || 'Upload error occurred.'
    });
  }
  
  next();
};

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  uploadFields,
  uploadCompanyLogo,
  uploadAvatar,
  uploadCV,
  uploadProfile,
  handleUploadErrors
};