const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();
const authorization = require('../middleware/authMiddleware')
router.route('/').post(userController.registerUser).get(authorization.authorizeUser, userController.allUsers);
router.post('/login',userController.authUser);

module.exports = router;