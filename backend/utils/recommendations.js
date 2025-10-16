import UserInteraction from '../models/UserInteraction.js';
import Product from '../models/Product.js';
import cosineSimilarity from 'cosine-similarity'; // For vector similarity
import { generateExplanations } from '../services/llm.js';
import { pipeline } from '@xenova/transformers'; // For embeddings

// Initialize embedding model (run once)
let embedder;
async function initEmbedder() {
  if (!embedder) {
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return embedder;
}

// Function to generate embeddings for a text (e.g., product description + tags)
async function getEmbedding(text) {
  const embedder = await initEmbedder();
  const output = await embedder(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data); // Return as array for similarity calc
}

// Simple content-based filtering: Recommend similar products based on user's viewed items
export async function contentBasedRecommendations(userId, limit = 3) {
  try {
    // Get user's viewed products
    const userViews = await UserInteraction.find({ userId, actionType: 'view' }).populate('productId');
    if (userViews.length === 0) return []; // No views, no recs

    const viewedProductIds = userViews.map(interaction => interaction.productId._id);
    // Get viewed products' embeddings (cache if possible in production)
    const viewedEmbeddings = [];
    const viewedCategories = new Set();
    for (const interaction of userViews) {
      const product = interaction.productId;
      const text = `${product.description} ${product.tags.join(' ')}`;
      const embedding = await getEmbedding(text);
      viewedEmbeddings.push({ id: product._id, embedding, category: product.category });
      viewedCategories.add(product.category);
    }

    // Find candidate products (not viewed by user, same categories)
    const candidates = await Product.find({
      _id: { $nin: viewedProductIds },
      category: { $in: Array.from(viewedCategories) }
    });

    if (candidates.length === 0) return [];

    // Compute similarities and rank
    const recommendations = [];
    for (const candidate of candidates) {
      const candidateText = `${candidate.description} ${candidate.tags.join(' ')}`;
      const candidateEmbedding = await getEmbedding(candidateText);
      let maxSimilarity = 0;
      for (const viewed of viewedEmbeddings) {
        const similarity = cosineSimilarity(candidateEmbedding, viewed.embedding);
        if (similarity > maxSimilarity) maxSimilarity = similarity;
      }
      if (maxSimilarity > 0.5) { // Threshold for relevance
        recommendations.push({ product: candidate, score: maxSimilarity });
      }
    }

    // Sort by score and limit
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(rec => rec.product);
  } catch (error) {
    console.error('Content-based rec error:', error);
    return [];
  }
}

// Simple collaborative filtering: Recommend based on similar users' actions
export async function collaborativeRecommendations(userId, limit = 3) {
  try {
    // Get user's actions
    const userActions = await UserInteraction.find({ userId }).populate('productId');

    // Get all users who interacted with similar products
    const similarUserActions = await UserInteraction.aggregate([
      { $match: { productId: { $in: userActions.map(a => a.productId._id) } } },
      { $group: { _id: '$userId', products: { $push: '$productId' } } },
      { $match: { _id: { $ne: userId } } } // Exclude self
    ]);

    if (similarUserActions.length === 0) return [];

    // Find products liked/purchased by similar users, not by current user
    const userProductIds = userActions.map(a => a.productId._id);
    const recProductIds = new Set();
    similarUserActions.forEach(sua => {
      sua.products.forEach(pId => {
        if (!userProductIds.includes(pId) && recProductIds.size < 20) { // Limit candidates
          recProductIds.add(pId);
        }
      });
    });

    const recommendations = await Product.find({
      _id: { $in: Array.from(recProductIds) }
    }).sort({ rating: -1 }); // Sort by popularity

    return recommendations.slice(0, limit);
  } catch (error) {
    console.error('Collaborative rec error:', error);
    return [];
  }
}

// Hybrid recommendation: Combine both, with fallback to popular products
export async function getRecommendations(userId, limit = 3) {
  const contentRecs = await contentBasedRecommendations(userId, limit);
  const collabRecs = await collaborativeRecommendations(userId, limit);

  // Merge and dedupe (prioritize content-based)
  const allRecs = [...new Map([...contentRecs, ...collabRecs].map(p => [p._id, p])).values()];

  let recommendations;
  if (allRecs.length > 0) {
    recommendations = allRecs.slice(0, limit);
  } else {
    // Fallback: Most popular products
    recommendations = await Product.find({}).sort({ rating: -1, numReviews: -1 }).limit(limit);
  }

  // Get detailed user behavior summary for LLM prompts (improved for personalization)
  const userInteractions = await UserInteraction.find({ userId }).populate('productId');
  let behaviorSummary = 'New user - based on popular items with high ratings and reviews.';
  if (userInteractions.length > 0) {
    // Group by action type for richer context
    const views = userInteractions.filter(i => i.actionType === 'view');
    const purchases = userInteractions.filter(i => i.actionType === 'purchase');
    const likes = userInteractions.filter(i => i.actionType === 'like');

    // Summarize views: List categories and key products
    const viewSummary = views.length > 0 
      ? `${views.length} views in categories: ${[...new Set(views.map(i => i.productId.category))].join(', ')}. Key items: ${views.slice(0, 3).map(i => `${i.productId.name} (${i.productId.category})`).join(', ')}`
      : '';

    // Summarize purchases: Emphasize commitments
    const purchaseSummary = purchases.length > 0 
      ? `Purchased ${purchases.length} item(s): ${purchases.map(i => i.productId.name).join(', ')} in ${[...new Set(purchases.map(i => i.productId.category))].join(', ')} category.`
      : '';

    // Summarize likes: For preferences
    const likeSummary = likes.length > 0 
      ? `Liked ${likes.length} item(s): ${likes.slice(0, 2).map(i => i.productId.name).join(', ')} - shows interest in ${[...new Set(likes.map(i => i.productId.category))].join(', ')}`
      : '';

    // Combine into a narrative summary
    behaviorSummary = [viewSummary, purchaseSummary, likeSummary]
      .filter(s => s.trim()) // Remove empty
      .join('. ') || 'Limited history available - focusing on trending items.';

    // Add overall pattern if multiple interactions
    if (userInteractions.length > 3) {
      const topCategory = [...new Map(userInteractions.map(i => [i.productId.category, 0])).entries()]
        .map(([cat, count]) => ({ cat, count: userInteractions.filter(i => i.productId.category === cat).length }))
        .sort((a, b) => b.count - a.count)[0];
      behaviorSummary += ` Overall pattern: Strong interest in ${topCategory.cat} category.`;
    }
  }

  // Generate explanations with the detailed summary
  const enrichedRecommendations = await generateExplanations(recommendations, behaviorSummary);

  return enrichedRecommendations;
}
