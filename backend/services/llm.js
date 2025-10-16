import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to generate explanation for a single recommendation
export async function generateExplanation(product, userBehavior, actionType = 'general') {
  if (!product || !userBehavior) return 'No specific reason available.';

  const prompt = `
    Explain why this product is recommended to the user in 1-2 concise, engaging sentences.
    
    Product: ${product.name} - ${product.description} (Category: ${product.category}, Price: $${product.price})
    Tags: ${product.tags.join(', ')}
    
    User behavior: ${userBehavior || 'No specific history; based on popularity.'}
    
    Keep it personalized and positive. End with why they'd like it.
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // Cost-effective; change to 'gpt-4o-mini' if available
      messages: [
        { role: 'system', content: 'You are a helpful e-commerce assistant explaining recommendations clearly.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 100,
      temperature: 0.7, // Balanced creativity
    });

    return completion.choices[0]?.message?.content?.trim() || 'Recommendation based on your interests.';
  } catch (error) {
    console.error('OpenAI API error:', error);
    return 'This product matches your browsing patterns.';
  }
}

// Batch generate explanations for multiple recommendations
export async function generateExplanations(recommendations, userBehavior) {
  const enrichedRecs = [];
  for (const product of recommendations) {
    const explanation = await generateExplanation(product, userBehavior);
    enrichedRecs.push({
      ...product._doc, // Preserve Mongoose data
      explanation
    });
  }
  return enrichedRecs;
}
