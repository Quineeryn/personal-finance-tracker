const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../middlewares/authMiddleware');
const controller = require('./budgetsController');

// Terapkan middleware untuk semua rute di file ini
router.use(verifyToken);

router.post('/', controller.createBudget);
router.get('/', controller.getBudgets);
router.put('/:id', controller.updateBudget);
router.delete('/:id', controller.deleteBudget);

module.exports = router;