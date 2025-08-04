// backend/server.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./src/config/database'); 
const authRoutes = require('./src/api/auth/authRoutes');
const db = require('./src/models');
const testRoutes = require('./src/api/test/testRoutes');
const transactionRoutes = require('./src/api/transactions/transactionRoutes');
const budgetsRoutes = require('./src/api/budgets/budgetsRoutes');

const whiteList = [
  'https://personal-finance-tracker-taupe.vercel.app',
];

const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || origin.endsWith('-canandras-projects.vercel.app') || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

const app = express();

app.options('*', cors(corsOptions));

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());


app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/test', testRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/budgets', budgetsRoutes );

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