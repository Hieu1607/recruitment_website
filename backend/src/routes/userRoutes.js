/**
 * User Routes
 * RESTful routes for user CRUD operations
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middlewares/auth');

// All user routes require authentication
router.use(authenticate);

// REST routes
router.post('/', userController.createUser);           // POST /users
router.get('/', userController.getAllUsers);            // GET /users
router.get('/:id', userController.getUserById);        // GET /users/:id
router.put('/:id', userController.updateUser);         // PUT /users/:id
router.delete('/:id', userController.deleteUser);      // DELETE /users/:id

module.exports = router;

