/**
 * Response Utility
 * Standardized API response helpers
 */

const successResponse = (res, statusCode, data, message) => {
    return res.status(statusCode).json({
        success: true,
        message: message || 'Success',
        data,
    });
};

const errorResponse = (res, statusCode, message) => {
    return res.status(statusCode).json({
        success: false,
        error: message,
    });
};

module.exports = {
    successResponse,
    errorResponse,
};

