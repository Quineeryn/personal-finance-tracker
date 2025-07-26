// src/api/auth/auth.controller.js
const db = require('../../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email: email } });
    const isPasswordValid = user ? bcrypt.compareSync(password, user.password) : false;

    if (!user || !isPasswordValid) {
      // Selalu kirim pesan yang sama
      return res.status(401).send({ message: 'Invalid email or password.' });
    }

    // 3. Buat JSON Web Token (JWT)
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Token kadaluarsa dalam 1 jam
    );

    // 4. Kirim token sebagai respons
    res.status(200).send({
      message: 'Login successful!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      accessToken: token
    });

  } catch (error) {
    res.status(500).send({ message: 'Error logging in', error: error.message });
  }
};