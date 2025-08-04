require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./src/models');

const authRoutes = require('./src/api/auth/authRoutes');
const testRoutes = require('./src/api/test/testRoutes');
const transactionRoutes = require('./src/api/transactions/transactionRoutes');
const budgetRoutes = require('./src/api/budgets/budgetsRoutes');

const whitelist = [
  'https://personal-finance-tracker-taupe.vercel.app',
];

const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || (origin && origin.endsWith('-canandras-projects.vercel.app')) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

const app = express();

app.options('*', cors(corsOptions));
app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/test', testRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/budgets', budgetRoutes);

app.get('/', (req, res) => {
  res.send('Backend API is running!');
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await db.sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

startServer();