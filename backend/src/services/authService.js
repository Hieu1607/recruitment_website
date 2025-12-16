/**
 * Authentication Service
 * Business logic for authentication: password hashing, token generation, user validation
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Role, UserProfile } = require('../models');
const jwtConfig = require('../config/jwt');

/**
 * Hash password using bcrypt
 */
const hashPassword = async (password) => {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
};

/**
 * Compare password with hash
 */
const comparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};

/**
 * Generate JWT token
 */
const generateToken = (user) => {
    const payload = {
        id: user.id,
        email: user.email,
        role_id: user.role_id,
    };
    return jwt.sign(payload, jwtConfig.secret, {
        expiresIn: jwtConfig.expiresIn,
    });
};

/**
 * Register a new user
 */
const registerUser = async (email, password, fullName , roleName) => {
    // Check if email already exists
    const existingUser = await User.findOne({
        where: { email },
    });

    if (existingUser) {
        throw new Error('Email already exists');
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Get role_id (1 = admin, 2 = employer, 3 = jobseeker)
    if (!roleName) {
        roleName = 'jobseeker'; // default role
    }
    const defaultRole = await Role.findOne({
        where: { name: roleName },
    });

    if (!defaultRole) {
        throw new Error('Role not found');
    }

    // Create user
    const user = await User.create({
        email,
        password_hash,
        role_id: defaultRole.id,
    });

    // Create user profile if fullName is provided
    if (fullName && defaultRole.name === 'jobseeker') {
        await UserProfile.create({
            user_id: user.id,
            full_name: fullName,
        });
    }

    // Return user without password
    const userData = user.toJSON();
    delete userData.password_hash;

    return userData;
};

/**
 * Validate user credentials and return user
 */
const validateUser = async (email, password) => {
    // Find user with role
    const user = await User.findOne({
        where: { email },
        include: [
            {
                model: Role,
                as: 'role',
                attributes: ['id', 'name'],
            },
        ],
    });

    if (!user) {
        throw new Error('Invalid email or password');
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password_hash);

    if (!isPasswordValid) {
        throw new Error('Invalid email or password');
    }

    // Return user without password
    const userData = user.toJSON();
    delete userData.password_hash;

    return userData;
};

/**
 * Login user and return token with user data
 */
const loginUser = async (email, password) => {
    const user = await validateUser(email, password);
    const token = generateToken(user);

    return {
        token,
        user,
    };
};

module.exports = {
    hashPassword,
    comparePassword,
    generateToken,
    registerUser,
    validateUser,
    loginUser,
};
