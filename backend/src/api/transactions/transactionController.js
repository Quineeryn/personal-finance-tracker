const db = require('../../models');
const Transaction = db.Transaction;

// Membuat transaksi baru
exports.createTransaction = async (req, res) => {
  try {
    const { type, amount, category, description, date } = req.body;
    const newTransaction = await Transaction.create({
      type, amount, category, description, date,
      userId: req.userId // Diambil dari token JWT
    });
    res.status(201).send(newTransaction);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Mendapatkan semua transaksi milik user
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.findAll({ where: { userId: req.userId } });
    res.status(200).send(transactions);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Mengupdate transaksi
exports.updateTransaction = async (req, res) => {
  try {
    const transactionId = req.params.id;
    const transaction = await Transaction.findOne({ where: { id: transactionId, userId: req.userId } });

    if (!transaction) {
      return res.status(404).send({ message: "Transaction not found." });
    }

    await transaction.update(req.body);
    res.status(200).send(transaction);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Menghapus transaksi
exports.deleteTransaction = async (req, res) => {
  try {
    const transactionId = req.params.id;
    const deleted = await Transaction.destroy({ where: { id: transactionId, userId: req.userId } });

    if (!deleted) {
      return res.status(404).send({ message: "Transaction not found." });
    }

    res.status(200).send({ message: "Transaction deleted successfully." });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};