const express = require('express');
const cors = require('cors');
const productRoutes = require('./routes/productRoutes');

const app = express();
app.use(cors()); // Enable CORS for all routes
app.use(express.json());

// ✅ Health check
app.get('/', (req, res) => {
  res.send('API is working 🚀');
});

// Product routes
app.use('/products', productRoutes);

module.exports = app;
