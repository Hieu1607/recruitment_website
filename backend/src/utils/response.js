/**
 * Response Utility
 * Standardized API response helpers
 */

const successResponse = (res, statusCode, data, message, pagination) => {
    const response = {
        success: true,
        message: message || 'Success',
        data,
    };
    
    if (pagination) {
        response.pagination = pagination;
    }
    
    return res.status(statusCode).json(response);
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

