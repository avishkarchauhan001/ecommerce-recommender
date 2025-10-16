import express from 'express';
import { getRecommendations } from '../utils/recommendations.js';
import Joi from 'joi';

const router = express.Router();

// Validation schema for userId (ObjectId format or string)
const userIdSchema = Joi.object({
  userId: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/) // MongoDB ObjectId pattern
});

// POST /api/recommend - Get personalized recommendations with explanations
router.post('/recommend', async (req, res) => {
  try {
    // Validate input
    const { error } = userIdSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: 'Invalid userId', details: error.details[0].message });
    }

    const { userId } = req.body;
    const recommendations = await getRecommendations(userId);

    if (recommendations.length === 0) {
      return res.status(404).json({ error: 'No recommendations available for this user' });
    }

    res.status(200).json({
      success: true,
      userId,
      recommendations,
      count: recommendations.length
    });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// GET /api/popular - Fallback popular products (no auth needed)
router.get('/popular', async (req, res) => {
  try {
    const { limit } = req.query; // Optional query param
    const recommendations = await getRecommendations(null, parseInt(limit) || 5); // Use fallback logic
    res.status(200).json({
      success: true,
      recommendations,
      count: recommendations.length
    });
  } catch (error) {
    console.error('Popular API error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

export default router;
