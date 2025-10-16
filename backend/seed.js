import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

import Product from './models/Product.js';
import UserInteraction from './models/UserInteraction.js';

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB connected for seeding');

    // Clear existing data
    await Product.deleteMany({});
    await UserInteraction.deleteMany({});
    console.log('Cleared existing data');

    // Expanded Sample Products (7 total, balanced across categories for better matching)
    const sampleProductsData = [
      // Electronics
      {
        name: 'Wireless Headphones',
        description: 'High-quality noise-cancelling headphones with 20-hour battery',
        price: 199.99,
        category: 'electronics',
        brand: 'AudioPro',
        stock: 50,
        rating: 4.5,
        numReviews: 120,
        images: ['headphones1.jpg'],
        tags: ['wireless', 'audio', 'headphones', 'noise-cancelling']
      },
      {
        name: 'Smartphone',
        description: 'Latest model with 128GB storage and advanced camera',
        price: 699.99,
        category: 'electronics',
        brand: 'TechStar',
        stock: 30,
        rating: 4.7,
        numReviews: 200,
        images: ['smartphone1.jpg'],
        tags: ['mobile', 'smartphone', 'tech', 'camera']
      },
      {
        name: 'Wireless Earbuds',
        description: 'Compact true wireless earbuds for workouts and calls',
        price: 79.99,
        category: 'electronics',
        brand: 'SoundBud',
        stock: 80,
        rating: 4.3,
        numReviews: 90,
        images: ['earbuds1.jpg'],
        tags: ['wireless', 'earbuds', 'portable', 'sports']
      },
      // Clothing
      {
        name: 'Cotton T-Shirt',
        description: 'Comfortable 100% cotton t-shirt in classic fit',
        price: 29.99,
        category: 'clothing',
        brand: 'UrbanWear',
        stock: 100,
        rating: 4.2,
        numReviews: 80,
        images: ['tshirt1.jpg'],
        tags: ['casual', 'cotton', 'tshirt', 'everyday']
      },
      {
        name: 'Denim Jacket',
        description: 'Stylish denim jacket for casual outings',
        price: 59.99,
        category: 'clothing',
        brand: 'UrbanWear',
        stock: 40,
        rating: 4.4,
        numReviews: 110,
        images: ['jacket1.jpg'],
        tags: ['casual', 'denim', 'jacket', 'outerwear']
      },
      // Footwear
      {
        name: 'Running Shoes',
        description: 'Lightweight running shoes for marathon training with cushioning',
        price: 89.99,
        category: 'footwear',
        brand: 'RunFast',
        stock: 75,
        rating: 4.4,
        numReviews: 150,
        images: ['shoes1.jpg'],
        tags: ['running', 'sports', 'shoes', 'cushioned']
      },
      {
        name: 'Casual Sneakers',
        description: 'Versatile sneakers for daily wear and light activities',
        price: 49.99,
        category: 'footwear',
        brand: 'StepEasy',
        stock: 60,
        rating: 4.1,
        numReviews: 70,
        images: ['sneakers1.jpg'],
        tags: ['casual', 'sneakers', 'comfort', 'daily']
      }
    ];

    // Insert products FIRST and get the saved docs with _ids
    const insertedProducts = await Product.insertMany(sampleProductsData);
    console.log('Inserted', insertedProducts.length, 'sample products');

    // User IDs for consistency
    const user1Id = new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'); // Electronics focus
    const user2Id = new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'); // Clothing/Footwear focus
    const user3Id = new mongoose.Types.ObjectId('507f1f77bcf86cd799439013'); // Mixed

    // Now create interactions using insertedProducts[index]._id (valid ObjectIds)
    const sampleInteractions = [
      // User 1: Electronics heavy
      {
        userId: user1Id,
        productId: insertedProducts[0]._id, // Headphones
        actionType: 'view',
        timestamp: new Date('2025-10-15T10:00:00Z')
      },
      {
        userId: user1Id,
        productId: insertedProducts[2]._id, // Earbuds
        actionType: 'view',
        timestamp: new Date('2025-10-15T11:00:00Z')
      },
      {
        userId: user1Id,
        productId: insertedProducts[1]._id, // Smartphone
        actionType: 'purchase',
        timestamp: new Date('2025-10-15T12:00:00Z')
      },
      {
        userId: user1Id,
        productId: insertedProducts[0]._id, // Headphones
        actionType: 'like',
        timestamp: new Date('2025-10-15T13:00:00Z')
      },
      {
        userId: user1Id,
        productId: insertedProducts[2]._id, // Earbuds
        actionType: 'view',
        timestamp: new Date('2025-10-15T14:00:00Z')
      },
      // User 2: Clothing/Footwear focus
      {
        userId: user2Id,
        productId: insertedProducts[3]._id, // T-Shirt
        actionType: 'like',
        timestamp: new Date('2025-10-15T10:30:00Z')
      },
      {
        userId: user2Id,
        productId: insertedProducts[5]._id, // Running Shoes
        actionType: 'view',
        timestamp: new Date('2025-10-15T11:30:00Z')
      },
      {
        userId: user2Id,
        productId: insertedProducts[3]._id, // T-Shirt
        actionType: 'purchase',
        timestamp: new Date('2025-10-15T12:30:00Z')
      },
      {
        userId: user2Id,
        productId: insertedProducts[4]._id, // Denim Jacket
        actionType: 'like',
        timestamp: new Date('2025-10-15T13:30:00Z')
      },
      {
        userId: user2Id,
        productId: insertedProducts[6]._id, // Casual Sneakers
        actionType: 'view',
        timestamp: new Date('2025-10-15T14:30:00Z')
      },
      // User 3: Mixed
      {
        userId: user3Id,
        productId: insertedProducts[0]._id, // Headphones
        actionType: 'view',
        timestamp: new Date('2025-10-15T10:45:00Z')
      },
      {
        userId: user3Id,
        productId: insertedProducts[3]._id, // T-Shirt
        actionType: 'view',
        timestamp: new Date('2025-10-15T11:45:00Z')
      },
      {
        userId: user3Id,
        productId: insertedProducts[5]._id, // Running Shoes
        actionType: 'purchase',
        timestamp: new Date('2025-10-15T12:45:00Z')
      },
      {
        userId: user3Id,
        productId: insertedProducts[4]._id, // Denim Jacket
        actionType: 'like',
        timestamp: new Date('2025-10-15T13:45:00Z')
      },
      {
        userId: user3Id,
        productId: insertedProducts[1]._id, // Smartphone
        actionType: 'view',
        timestamp: new Date('2025-10-15T14:45:00Z')
      }
    ];

    await UserInteraction.insertMany(sampleInteractions);
    console.log('Inserted', sampleInteractions.length, 'sample user interactions');

    // Log summary for verification
    console.log('User 1 interactions:', sampleInteractions.filter(i => i.userId.toString() === user1Id.toString()).length);
    console.log('User 2 interactions:', sampleInteractions.filter(i => i.userId.toString() === user2Id.toString()).length);
    console.log('User 3 interactions:', sampleInteractions.filter(i => i.userId.toString() === user3Id.toString()).length);

    console.log('Seeding complete! Test with User IDs:');
    console.log('- User 1 (Electronics):', user1Id.toString());
    console.log('- User 2 (Clothing/Footwear):', user2Id.toString());
    console.log('- User 3 (Mixed):', user3Id.toString());

    process.exit(0);
  })
  .catch((err) => {
    console.error('Error during seeding:', err);
    process.exit(1);
  });
