import Product from '../models/Product.js';

// Create Product
export const createProduct = async (req, res) => {
  try {
    const { ProductName, Category, SquCode, Quantity, ThresholdQuantity, Price } = req.body;

    if (!ProductName || !Category || !SquCode || Price == null) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (Quantity < 0 || Price < 0) {
      return res.status(400).json({ error: 'Quantity and Price must be non-negative' });
    }

    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Add multiple products
export const addMultipleProducts = async (req, res) => {
  try {
    const products = req.body; // Expecting an array of product objects
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'Provide an array of products' });
    }
    const created = await Product.bulkCreate(products);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all Products
export const getAllProducts = async (req, res) => {
  const products = await Product.findAll();
  res.json(products);
};

// Get one Product
export const getProductById = async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
};

// Update Product
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    await product.update(req.body);
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete Product
export const deleteProduct = async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  await product.destroy();
  res.json({ message: 'Product deleted' });
};

// Increase quantities for multiple products
export const increaseProductQuantity = async (req, res) => {
  try {
    const items = req.body; // Expecting [{ id, quantity }, ...]
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Provide an array of {id, quantity}' });
    }

    const results = [];
    for (const { id, quantity } of items) {
      if (!id || typeof quantity !== 'number' || quantity <= 0) {
        results.push({ id, error: 'Invalid id or quantity' });
        continue;
      }
      const product = await Product.findByPk(id);
      if (!product) {
        results.push({ id, error: 'Product not found' });
        continue;
      }
      product.Quantity += quantity;
      await product.save();
      results.push({ id, message: 'Quantity increased', product });
    }
    res.json(results);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Decrease quantities for multiple products
export const decreaseProductQuantity = async (req, res) => {
  try {
    const items = req.body; // Expecting [{ id, quantity }, ...]
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Provide an array of {id, quantity}' });
    }

    const results = [];
    for (const { id, quantity } of items) {
      if (!id || typeof quantity !== 'number' || quantity <= 0) {
        results.push({ id, error: 'Invalid id or quantity' });
        continue;
      }
      const product = await Product.findByPk(id);
      if (!product) {
        results.push({ id, error: 'Product not found' });
        continue;
      }
      if (product.Quantity < quantity) {
        results.push({ id, error: 'Not enough stock to remove' });
        continue;
      }
      product.Quantity -= quantity;
      await product.save();
      results.push({ id, message: 'Quantity decreased', product });
    }
    res.json(results);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};