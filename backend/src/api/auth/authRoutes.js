// src/api/auth/auth.routes.js
const express = require('express');
const router = express.Router();
const controller = require('./authController');

router.post('/register', controller.register);
router.post('/login', controller.login);

module.exports = router;