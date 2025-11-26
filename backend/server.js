// backend/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');
const transactionsRoutes = require('./routes/transactions'); // keep if you have it
const dashboardRoutes = require('./routes/dashboard'); // optional if present
const mlRoutes = require('./routes/ml'); // optional if present
const categoriesRoutes = require('./routes/categories'); // categories route

const app = express();

// Read environment variables
const {
  MONGO_URI,
  FRONTEND_ORIGIN
} = process.env;

if (!MONGO_URI) {
  console.error('MONGO_URI not set in .env. Exiting.');
  process.exit(1);
}

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);

    // Allow localhost on any port for development
    if (origin.match(/^http:\/\/localhost:\d+$/)) {
      return callback(null, true);
    }

    // Allow the configured frontend origin
    const allowedFrontendOrigin = FRONTEND_ORIGIN || 'http://localhost:5173';
    if (origin === allowedFrontendOrigin) {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// Routes
app.use('/api/auth', authRoutes);

// mount other routes if they exist (keep existing structure)
try {
  if (transactionsRoutes) app.use('/api/transactions', transactionsRoutes);
} catch (e) {
  // ignore if file not present
}
try {
  if (dashboardRoutes) app.use('/api/dashboard', dashboardRoutes);
} catch (e) {
  // ignore if file not present
}
try {
  if (mlRoutes) app.use('/api/ml', mlRoutes);
} catch (e) {
  // ignore if file not present
}
try {
  if (categoriesRoutes) app.use('/api/categories', categoriesRoutes);
} catch (e) {
  // ignore if file not present
}


const PORT = process.env.PORT || 5000;

// Connect to Mongo and start server
mongoose.connect(MONGO_URI, {
})
  .then(() => {
    console.log('Mongo connected');
    app.listen(PORT, () => {
      console.log(`Server listening on ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Mongo connection error', err);
    process.exit(1);
  });
