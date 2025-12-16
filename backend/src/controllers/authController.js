/**
 * Authentication Controller
 * Handles authentication-related requests: login, register
 */

const authService = require('../services/authService');

/**
 * Register a new user
 * POST /register
 * Body: { email, password, fullName }
 */
const register = async (req, res) => {
    try {
        const { email, password, fullName, roleName } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required',
            });
        }

        // Register user
        const user = await authService.registerUser(email, password, fullName, roleName);

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: user,
        });
    } catch (error) {
        if (error.message === 'Email already exists') {
            return res.status(409).json({
                success: false,
                error: error.message,
            });
        }

        res.status(500).json({
            success: false,
            error: error.message || 'Registration failed',
        });
    }
};

/**
 * Login user
 * POST /login
 * Body: { email, password }
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required',
            });
        }

        // Login user
        const result = await authService.loginUser(email, password);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: result,
        });
    } catch (error) {
        if (error.message === 'Invalid email or password') {
            return res.status(401).json({
                success: false,
                error: error.message,
            });
        }

        res.status(500).json({
            success: false,
            error: error.message || 'Login failed',
        });
    }
};

module.exports = {
    login,
    register,
};
