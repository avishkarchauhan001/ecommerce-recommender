import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Import models
import Product from './models/Product.js';
import UserInteraction from './models/UserInteraction.js';
import { getRecommendations } from './utils/recommendations.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Root route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Test route to fetch products
/*
app.get('/test', async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products', details: error.message });
  }
});
*/
// Add after your other routes, before MongoDB connection


app.get('/recommend/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const recs = await getRecommendations(userId);
    res.json({ recommendations: recs });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get recommendations', details: error.message });
  }
});

// MongoDB connection (remove deprecated options)
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
