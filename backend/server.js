// backend/server.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./src/config/database'); 
const authRoutes = require('./src/api/auth/authRoutes');
const db = require('./src/models');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());


app.use('/api/auth', authRoutes);

// Test Route
app.get('/', (req, res) => {
  res.send('Backend API is running!');
});


const PORT = process.env.PORT || 5000;

// Fungsi untuk memulai server
const startServer = async () => {
  try {
    // Coba autentikasi ke database
    await db.sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Jalankan server HANYA JIKA koneksi DB berhasil
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

// Panggil fungsi untuk memulai server
startServer();