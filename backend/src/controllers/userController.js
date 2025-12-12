/**
 * User Controller
 * Handles user-related requests: CRUD operations
 */

const userService = require('../services/userService');

/**
 * Create a new user
 * POST /users
 */
const createUser = async (req, res) => {
    try {
        const { name, email, password, role_id } = req.body;

        // Validate required fields
        if (!email || !password || !role_id) {
            return res.status(400).json({
                success: false,
                error: 'Email, password, and role_id are required',
            });
        }

        const user = await userService.createUser({
            name,
            email,
            password,
            role_id,
        });

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: user,
        });
    } catch (error) {
        if (error.message === 'Email already exists') {
            return res.status(409).json({
                success: false,
                error: error.message,
            });
        }

        if (error.message === 'Invalid role_id') {
            return res.status(400).json({
                success: false,
                error: error.message,
            });
        }

        res.status(500).json({
            success: false,
            error: error.message || 'Failed to create user',
        });
    }
};

/**
 * Get all users
 * GET /users
 */
const getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();

        res.status(200).json({
            success: true,
            message: 'Users retrieved successfully',
            data: users,
            count: users.length,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to retrieve users',
        });
    }
};

/**
 * Get user by ID
 * GET /users/:id
 */
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                error: 'Valid user ID is required',
            });
        }

        const user = await userService.getUserById(parseInt(id));

        res.status(200).json({
            success: true,
            message: 'User retrieved successfully',
            data: user,
        });
    } catch (error) {
        if (error.message === 'User not found') {
            return res.status(404).json({
                success: false,
                error: error.message,
            });
        }

        res.status(500).json({
            success: false,
            error: error.message || 'Failed to retrieve user',
        });
    }
};

/**
 * Update user
 * PUT /users/:id
 */
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role_id } = req.body;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                error: 'Valid user ID is required',
            });
        }

        // At least one field must be provided for update
        if (!name && !email && !role_id) {
            return res.status(400).json({
                success: false,
                error: 'At least one field (name, email, role_id) must be provided',
            });
        }

        const user = await userService.updateUser(parseInt(id), {
            name,
            email,
            role_id,
        });

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: user,
        });
    } catch (error) {
        if (error.message === 'User not found') {
            return res.status(404).json({
                success: false,
                error: error.message,
            });
        }

        if (error.message === 'Email already exists' || error.message === 'Invalid role_id') {
            return res.status(400).json({
                success: false,
                error: error.message,
            });
        }

        res.status(500).json({
            success: false,
            error: error.message || 'Failed to update user',
        });
    }
};

/**
 * Delete user
 * DELETE /users/:id
 */
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                error: 'Valid user ID is required',
            });
        }

        await userService.deleteUser(parseInt(id));

        res.status(200).json({
            success: true,
            message: 'User deleted successfully',
        });
    } catch (error) {
        if (error.message === 'User not found') {
            return res.status(404).json({
                success: false,
                error: error.message,
            });
        }

        res.status(500).json({
            success: false,
            error: error.message || 'Failed to delete user',
        });
    }
};

/**
 * Get user profile (for backward compatibility with existing routes)
 * GET /profile
 */
const getUserProfile = async (req, res) => {
    try {
        const userId = req.userId || req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated',
            });
        }

        const user = await userService.getUserById(userId);

        res.status(200).json({
            success: true,
            message: 'User profile retrieved',
            data: user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to retrieve profile',
        });
    }
};

/**
 * Update user profile (for backward compatibility with existing routes)
 * PUT /profile
 */
const updateUserProfile = async (req, res) => {
    try {
        const userId = req.userId || req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated',
            });
        }

        const { name, email, role_id } = req.body;

        const user = await userService.updateUser(userId, {
            name,
            email,
            role_id,
        });

        res.status(200).json({
            success: true,
            message: 'User profile updated',
            data: user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to update profile',
        });
    }
};

module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    getUserProfile,
    updateUserProfile,
};
