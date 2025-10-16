import mongoose, { Schema } from "mongoose";

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  brand: { type: String },
  stock: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  images: [{ type: String }],
  // For recommender: store embedding or tags if needed
  tags: [{ type: String }]
});

const Product = mongoose.model('Product', productSchema);

export default Product;