/**
 * User Service
 * Business logic for user operations: CRUD operations, profile management
 */

const bcrypt = require('bcryptjs');
const { User, Role, UserProfile } = require('../models');

/**
 * Hash password using bcrypt
 */
const hashPassword = async (password) => {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
};

/**
 * Create a new user
 * @param {Object} data - User data { name, email, password, role_id }
 * @returns {Object} User object without password_hash
 */
const createUser = async (data) => {
    const { name, email, password, role_id } = data;

    // Validate required fields
    if (!email || !password || !role_id) {
        throw new Error('Email, password, and role_id are required');
    }

    // Check if email already exists
    const existingUser = await User.findOne({
        where: { email },
    });

    if (existingUser) {
        throw new Error('Email already exists');
    }

    // Verify role exists
    const role = await Role.findByPk(role_id);
    if (!role) {
        throw new Error('Invalid role_id');
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Create user
    const user = await User.create({
        email,
        password_hash,
        role_id,
    });

    // Create user profile if name is provided
    if (name) {
        await UserProfile.create({
            user_id: user.id,
            full_name: name,
        });
    }

    // Return user without password_hash
    const userData = await User.findByPk(user.id, {
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

    return userData.toJSON();
};

/**
 * Get all users
 * @returns {Array} Array of user objects without password_hash
 */
const getAllUsers = async () => {
    const users = await User.findAll({
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
        order: [['created_at', 'DESC']],
    });

    return users.map(user => user.toJSON());
};

/**
 * Get user by ID
 * @param {Number} id - User ID
 * @returns {Object} User object without password_hash
 */
const getUserById = async (id) => {
    const user = await User.findByPk(id, {
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
        throw new Error('User not found');
    }

    return user.toJSON();
};

/**
 * Update user
 * @param {Number} id - User ID
 * @param {Object} data - Update data { name, email, role_id }
 * @returns {Object} Updated user object without password_hash
 */
const updateUser = async (id, data) => {
    const { name, email, role_id } = data;

    // Find user
    const user = await User.findByPk(id);
    if (!user) {
        throw new Error('User not found');
    }

    // Check if email is being updated and if it's unique
    if (email && email !== user.email) {
        const existingUser = await User.findOne({
            where: { email },
        });

        if (existingUser) {
            throw new Error('Email already exists');
        }

        user.email = email;
    }

    // Update role_id if provided
    if (role_id) {
        // Verify role exists
        const role = await Role.findByPk(role_id);
        if (!role) {
            throw new Error('Invalid role_id');
        }
        user.role_id = role_id;
    }

    // Save user changes
    await user.save();

    // Update user profile name if provided
    if (name) {
        const profile = await UserProfile.findOne({
            where: { user_id: id },
        });

        if (profile) {
            profile.full_name = name;
            await profile.save();
        } else {
            // Create profile if it doesn't exist
            await UserProfile.create({
                user_id: id,
                full_name: name,
            });
        }
    }

    // Return updated user without password_hash
    const updatedUser = await User.findByPk(id, {
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

    return updatedUser.toJSON();
};

/**
 * Delete user (hard delete)
 * @param {Number} id - User ID
 * @returns {Boolean} True if deleted successfully
 */
const deleteUser = async (id) => {
    const user = await User.findByPk(id);
    if (!user) {
        throw new Error('User not found');
    }

    // Delete user profile first (if exists)
    await UserProfile.destroy({
        where: { user_id: id },
    });

    // Delete user
    await User.destroy({
        where: { id },
    });

    return true;
};

module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
};
