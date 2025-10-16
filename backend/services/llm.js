import { HfInference } from '@huggingface/inference';
import dotenv from 'dotenv';

dotenv.config();

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

// Flag: Set to true for HF (default), false for mock-only
const USE_HF = true;

// Full Mock Templates (expanded for variety and personalization)
const mockTemplates = {
  electronics: [
    'This {product} complements your interest in {category} gadgets—perfect for enhancing your tech setup with its {feature}.',
    'Based on your views of similar electronics, {product} stands out for its high rating and {brand} quality you\'ll appreciate.',
    'Your purchase history shows {category} affinity; {product} is a smart next buy for its innovative {feature} at this price.',
    'Connecting to your {behavior}, {product} offers seamless integration with your existing devices.',
    'From trending {category} items, {product} matches your exploratory style in tech.'
  ],
  clothing: [
    'Matching your casual style from {behavior}, this {product} adds versatility to your wardrobe with {feature} fabric.',
    'You liked items in {category}, so {product} is recommended for its comfortable fit and {brand} design.',
    'From your clothing views, {product} fits your everyday needs—love how it pairs with your recent {purchasedItem}.',
    'Building on your {category} interests, {product} provides stylish options for casual outings.',
    'This {product} aligns with your fashion preferences in {behavior}, featuring durable {feature}.'
  ],
  footwear: [
    'Your activity in {category} suggests {product} for active days, featuring {feature} for comfort.',
    'Based on shoe views, {product} is a great match with its durable {brand} build.',
    'Connecting to your {behavior}, try {product} to complete your sporty collection.',
    'For your footwear explorations, {product} offers lightweight support tailored to {purchasedItem} users.',
    'Popular among {category} enthusiasts like you, {product} enhances mobility with {feature}.'
  ],
  general: [
    'This popular {product} is tailored to users like you exploring {category}.',
    '{product} has top reviews in {category}—a reliable choice based on trends.',
    'Recommended from high-rated options; {product} suits your browsing in {behavior}.',
    'Based on overall user patterns, {product} is a versatile pick for {category} needs.',
    'This {product} stands out for its {feature}, matching general interests from your history.'
  ]
};

// Function to generate mock explanation (robust, no errors)
function generateMockExplanation(product, userBehavior) {
  const category = product.category?.toLowerCase() || 'general';
  const templates = mockTemplates[category] || mockTemplates.general;
  if (!templates || templates.length === 0) {
    return 'This recommendation aligns with your interests.'; // Safe fallback if templates missing
  }
  const template = templates[Math.floor(Math.random() * templates.length)];

  const feature = product.tags?.[0] || 'great features';
  const brand = product.brand || 'premium';
  let personalizedBehavior = userBehavior.includes('electronics') ? 'tech items' : 
                            userBehavior.includes('clothing') ? 'casual wear' : 
                            userBehavior.includes('footwear') ? 'active gear' : 'various interests';
  const purchasedItem = userBehavior.includes('Purchased') ? (userBehavior.match(/Purchased .*?([a-zA-Z\s]+)/)?.[1]?.trim() || 'recent buys') : 'your style';

  const explanation = template
    .replace(/\{product\}/g, product.name || 'item')
    .replace(/\{category\}/g, category)
    .replace(/\{feature\}/g, feature)
    .replace(/\{brand\}/g, brand)
    .replace(/\{behavior\}/g, personalizedBehavior)
    .replace(/\{purchasedItem\}/g, purchasedItem);

  console.log('Mock: Generated explanation:', explanation);
  return explanation;
}

// Function to generate explanation for a single recommendation
export async function generateExplanation(product, userBehavior, actionType = 'general') {
  if (!product || !userBehavior) {
    return 'No specific reason available.';
  }

  // Your existing prompt (unchanged)
  const prompt = `You are an e-commerce expert. Provide a personalized 1-2 sentence explanation for why this product is recommended, based on the user's behavior. Make it engaging and specific to the product details.

Product details:
- Name: ${product.name}
- Description: ${product.description.substring(0, 100)}... (Category: ${product.category}, Price: $${product.price}, Tags: ${product.tags.join(', ')})

User history: ${userBehavior}

Focus on connections between user actions and product features. End with why they'll love it. Keep under 80 words.`;

  if (USE_HF) {
    // Hugging Face Inference API call (switched to distilgpt2)
    console.log('HF: Calling Inference API for model distilgpt2');
    console.log('HF: Sample prompt:', prompt.substring(0, 150) + '...');

    try {
      const response = await hf.textGeneration({
        model: 'distilgpt2', // Reliable free model; alternatives: 'gpt2' if available, or 'EleutherAI/gpt-neo-125M'
        inputs: prompt,
        parameters: {
          max_new_tokens: 100,
          temperature: 0.7,
          top_p: 0.9,
          return_full_text: false
        }
      });

      const explanation = response.generated_text.trim();
      console.log('HF: Success! Generated explanation:', explanation);
      return explanation || 'This recommendation aligns with your interests.';
    } catch (error) {
      console.error('HF API error:', error.message);
      console.error('HF: Error details:', error.status, error.constructor.name);
      // Fallback to mock on any HF failure
      return generateMockExplanation(product, userBehavior);
    }
  }

  // Default to mock if not using HF
  return generateMockExplanation(product, userBehavior);
}

// Batch generate explanations (unchanged)
export async function generateExplanations(recommendations, userBehavior) {
  const enrichedRecs = [];
  for (const product of recommendations) {
    const explanation = await generateExplanation(product, userBehavior);
    enrichedRecs.push({
      ...product._doc,
      explanation
    });
  }
  return enrichedRecs;
}
