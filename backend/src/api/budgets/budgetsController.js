const db = require('../../models');
const Budget = db.Budget;

// Membuat anggaran baru
exports.createBudget = async (req, res) => {
  try {
    const { category, amount, month } = req.body;

    // Validasi sederhana
    if (!category || !amount || !month) {
        return res.status(400).send({ message: "Category, amount, and month are required." });
    }

    const newBudget = await Budget.create({
      category,
      amount,
      month, // Format "YYYY-MM"
      userId: req.userId // Diambil dari token JWTT
    });

    res.status(201).send(newBudget);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Mendapatkan semua anggaran milik user
exports.getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.findAll({ where: { userId: req.userId } });
    res.status(200).send(budgets);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Mengupdate anggaran
exports.updateBudget = async (req, res) => {
  try {
    const budgetId = req.params.id;
    // Pastikan user hanya bisa mengupdate budget miliknya sendiri
    const budget = await Budget.findOne({ where: { id: budgetId, userId: req.userId } });

    if (!budget) {
      return res.status(404).send({ message: "Budget not found." });
    }

    // Lakukan update
    await budget.update(req.body);
    res.status(200).send(budget);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Menghapus anggaran
exports.deleteBudget = async (req, res) => {
  try {
    const budgetId = req.params.id;
    // Pastikan user hanya bisa menghapus budget miliknya sendiri
    const deleted = await Budget.destroy({ where: { id: budgetId, userId: req.userId } });

    if (!deleted) {
      return res.status(404).send({ message: "Budget not found." });
    }

    res.status(200).send({ message: "Budget deleted successfully." });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};