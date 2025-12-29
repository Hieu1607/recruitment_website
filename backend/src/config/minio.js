const Minio = require('minio');

// MinIO client configuration
const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT) || 9000,
  useSSL: process.env.MINIO_USE_SSL === 'true' || false,
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin123',
});

// Default bucket name
const DEFAULT_BUCKET = process.env.MINIO_BUCKET_NAME || 'recruitment-files';

// Helper function to create bucket if not exists
async function createBucketIfNotExists(bucketName = DEFAULT_BUCKET) {
  try {
    const bucketExists = await minioClient.bucketExists(bucketName);
    if (!bucketExists) {
      await minioClient.makeBucket(bucketName, 'us-east-1');
      console.log(`Bucket '${bucketName}' created successfully.`);
      
      // Set bucket policy to public-read
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: '*',
            Action: [
              's3:GetBucketLocation',
              's3:ListBucket'
            ],
            Resource: `arn:aws:s3:::${bucketName}`
          },
          {
            Effect: 'Allow',
            Principal: '*',
            Action: 's3:GetObject',
            Resource: `arn:aws:s3:::${bucketName}/*`
          }
        ]
      };
      
      await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
      console.log(`Bucket '${bucketName}' policy set to public-read.`);
    } else {
      console.log(`Bucket '${bucketName}' already exists.`);
    }
  } catch (error) {
    console.error('Error creating/checking bucket:', error);
    throw error;
  }
}

// Upload file to MinIO
async function uploadFile(bucketName, objectName, filePath, contentType) {
  try {
    await createBucketIfNotExists(bucketName);
    const result = await minioClient.fPutObject(bucketName, objectName, filePath, {
      'Content-Type': contentType || 'application/octet-stream'
    });
    return result;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

// Upload buffer to MinIO
async function uploadBuffer(bucketName, objectName, buffer, contentType) {
  try {
    await createBucketIfNotExists(bucketName);
    const result = await minioClient.putObject(bucketName, objectName, buffer, {
      'Content-Type': contentType || 'application/octet-stream'
    });
    return result;
  } catch (error) {
    console.error('Error uploading buffer:', error);
    throw error;
  }
}

// Get file URL
function getFileUrl(bucketName, objectName) {
  const protocol = minioClient.useSSL ? 'https' : 'http';
  const port = minioClient.port === 80 || minioClient.port === 443 ? '' : `:${minioClient.port}`;
  return `${protocol}://${minioClient.endPoint}${port}/${bucketName}/${objectName}`;
}

// Delete file
async function deleteFile(bucketName, objectName) {
  try {
    await minioClient.removeObject(bucketName, objectName);
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

// List files in bucket
async function listFiles(bucketName, prefix = '', recursive = false) {
  try {
    const objectsList = [];
    const objectsStream = minioClient.listObjects(bucketName, prefix, recursive);
    
    return new Promise((resolve, reject) => {
      objectsStream.on('data', (obj) => {
        objectsList.push(obj);
      });
      
      objectsStream.on('error', (err) => {
        reject(err);
      });
      
      objectsStream.on('end', () => {
        resolve(objectsList);
      });
    });
  } catch (error) {
    console.error('Error listing files:', error);
    throw error;
  }
}

module.exports = {
  minioClient,
  DEFAULT_BUCKET,
  createBucketIfNotExists,
  uploadFile,
  uploadBuffer,
  getFileUrl,
  deleteFile,
  listFiles
};