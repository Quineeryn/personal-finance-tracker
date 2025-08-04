const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../middlewares/authMiddleware');
const controller = require('./transactionController');

router.use(verifyToken);
router.post('/', controller.createTransaction);
router.get('/', controller.getTransactions);
router.put('/:id', controller.updateTransaction);
router.delete('/:id', controller.deleteTransaction);

module.exports = router;