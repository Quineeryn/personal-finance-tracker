const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../middlewares/authMiddleware');
const controller = require('./testController');

// Tempatkan middleware 'verifyToken' sebelum controller
router.get('/user', [verifyToken], controller.userBoard);

module.exports = router;