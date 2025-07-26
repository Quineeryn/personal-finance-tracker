// src/api/auth/auth.controller.js
const db = require('../../models');
const User = db.User;

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validasi sederhana
    if (!name || !email || !password) {
      return res.status(400).send({ message: 'Name, email, and password are required.' });
    }

    // Cek jika email sudah terdaftar
    const existingUser = await User.findOne({ where: { email: email } });
    if (existingUser) {
      return res.status(400).send({ message: 'Email is already in use.' });
    }

    // Buat user baru (password akan di-hash oleh hook di model)
    const newUser = await User.create({ name, email, password });

    // Jangan kirim password kembali di response
    newUser.password = undefined;

    res.status(201).send({ message: 'User registered successfully!', user: newUser });
  } catch (error) {
    res.status(500).send({ message: 'Error registering user', error: error.message });
  }
};