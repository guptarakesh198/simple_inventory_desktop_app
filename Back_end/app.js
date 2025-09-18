import express from 'express';
import cors from 'cors';
import productRoutes from './routes/ProductRoutes.js';

const app = express();
app.use(cors()); // Enable CORS for all routes
app.use(express.json());

// ✅ Health check
app.get('/', (req, res) => {
  res.send('API is working 🚀');
});

// Product routes
app.use('/products', productRoutes);

export default app;
