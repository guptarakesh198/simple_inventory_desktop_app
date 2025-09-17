import express from 'express';
import dotenv from 'dotenv';
import sequelize from './db.js';
import Product from './models/Product.js';

dotenv.config();
const app = express();

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Connected to SQLite");

    // Instead of alter: true
    await Product.sync({ force: true });
    console.log("✅ Products table recreated");

    app.listen(5000, () => console.log("🚀 Server running on port 5000"));
  } catch (err) {
    console.error("❌ DB connection error:", err);
  }
})();
