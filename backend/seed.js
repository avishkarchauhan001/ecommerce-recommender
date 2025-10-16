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

    // Sample Products
    const sampleProducts = [
      {
        name: 'Wireless Headphones',
        description: 'High-quality noise-cancelling headphones',
        price: 199.99,
        category: 'electronics',
        brand: 'AudioPro',
        stock: 50,
        rating: 4.5,
        numReviews: 120,
        images: ['headphones1.jpg'],
        tags: ['wireless', 'audio', 'headphones']
      },
      {
        name: 'Cotton T-Shirt',
        description: 'Comfortable 100% cotton t-shirt',
        price: 29.99,
        category: 'clothing',
        brand: 'UrbanWear',
        stock: 100,
        rating: 4.2,
        numReviews: 80,
        images: ['tshirt1.jpg'],
        tags: ['casual', 'cotton', 'tshirt']
      },
      {
        name: 'Smartphone',
        description: 'Latest model with 128GB storage',
        price: 699.99,
        category: 'electronics',
        brand: 'TechStar',
        stock: 30,
        rating: 4.7,
        numReviews: 200,
        images: ['smartphone1.jpg'],
        tags: ['mobile', 'smartphone', 'tech']
      },
      {
        name: 'Running Shoes',
        description: 'Lightweight running shoes for marathon training',
        price: 89.99,
        category: 'footwear',
        brand: 'RunFast',
        stock: 75,
        rating: 4.4,
        numReviews: 150,
        images: ['shoes1.jpg'],
        tags: ['running', 'sports', 'shoes']
      }
    ];

    await Product.insertMany(sampleProducts);
    console.log('Sample products inserted');

    // Sample User Interactions (assuming userId as sample ObjectIds)
    const sampleInteractions = [
      {
        userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'), // Sample User 1
        productId: sampleProducts[0]._id, // Wireless Headphones
        actionType: 'view',
        timestamp: new Date('2025-10-15T10:00:00Z')
      },
      {
        userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'), // Same User 1
        productId: sampleProducts[2]._id, // Smartphone
        actionType: 'purchase',
        timestamp: new Date('2025-10-15T12:00:00Z')
      },
      {
        userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'), // Sample User 2
        productId: sampleProducts[1]._id, // Cotton T-Shirt
        actionType: 'like',
        timestamp: new Date('2025-10-15T14:00:00Z')
      },
      {
        userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'), // Same User 2
        productId: sampleProducts[3]._id, // Running Shoes
        actionType: 'view',
        timestamp: new Date('2025-10-15T15:00:00Z')
      },
      {
        userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439013'), // Sample User 3
        productId: sampleProducts[0]._id, // Wireless Headphones
        actionType: 'view',
        timestamp: new Date('2025-10-15T16:00:00Z')
      }
    ];

    await UserInteraction.insertMany(sampleInteractions);
    console.log('Sample user interactions inserted');

    console.log('Seeding complete!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error during seeding:', err);
    process.exit(1);
  });
