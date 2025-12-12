// cấu hình cho JWT trong backend Node.js

module.exports = {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
};

