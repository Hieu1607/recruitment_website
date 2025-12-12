/**
 * Authentication Middleware
 * Verifies JWT tokens and authenticates users
 */

const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');
const jwtConfig = require('../config/jwt');

/**
 * Authenticate middleware
 * Extracts and verifies JWT token from Authorization header
 */
const authenticate = async (req, res, next) => {
    try {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                error: 'Authorization header is missing',
            });
        }

        // Check if header starts with "Bearer "
        if (!authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Invalid authorization format. Use: Bearer <token>',
            });
        }

        // Extract token
        const token = authHeader.substring(7); // Remove "Bearer " prefix

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Token is missing',
            });
        }

        // Verify token
        let decoded;
        try {
            decoded = jwt.verify(token, jwtConfig.secret);
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    error: 'Token has expired',
                });
            }
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid token',
                });
            }
            throw error;
        }

        // Find user and attach to request
        const user = await User.findByPk(decoded.id, {
            include: [
                {
                    model: Role,
                    as: 'role',
                    attributes: ['id', 'name'],
                },
            ],
            attributes: {
                exclude: ['password_hash'],
            },
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'User not found',
            });
        }

        // Attach user to request object
        req.user = user.toJSON();
        req.userId = user.id;
        req.roleId = user.role_id;

        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            error: 'Authentication failed',
        });
    }
};

/**
 * Authorization Middleware
 * Checks if user has the required role (jobseeker)
 */
const authorizeJobseeker = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'User not authenticated',
        });
    }

    // Check if user role is 'jobseeker'
    if (req.user.role && req.user.role.name !== 'jobseeker') {
        return res.status(403).json({
            success: false,
            error: 'Access denied. Jobseeker role required',
        });
    }

    next();
};

/**
 * Authorization Middleware
 * Checks if user has the required role (employer)
 */
const authorizeEmployer = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'User not authenticated',
        });
    }

    // Check if user role is 'employer'
    if (req.user.role && req.user.role.name !== 'employer') {
        return res.status(403).json({
            success: false,
            error: 'Access denied. Employer role required',
        });
    }

    next();
};

module.exports = {
    authenticate,
    authorizeJobseeker,
    authorizeEmployer,
};
