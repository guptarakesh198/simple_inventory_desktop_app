import express from 'express';
import dotenv from 'dotenv';
import sequelize from './db.js';
import Product from './models/Product.js';
import app from './app.js';

dotenv.config();
const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Connected to SQLite");

    // Instead of alter: true
    await Product.sync({ force: true });
    console.log("✅ Products table recreated");

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error("❌ DB connection error:", err);
  }
})();
