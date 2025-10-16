import mongoose from 'mongoose';

const userInteractionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' },
  actionType: { type: String, enum: ['view', 'purchase', 'like'], required: true },
  timestamp: { type: Date, default: Date.now }
});

const UserInteraction = mongoose.model('UserInteraction', userInteractionSchema);

export default UserInteraction;
