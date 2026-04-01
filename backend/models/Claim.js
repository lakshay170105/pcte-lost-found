import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderName: String,
  senderRole: { type: String, enum: ['finder', 'claimant'] },
  text: { type: String, required: true },
  isSystem: { type: Boolean, default: false }, // auto-sent system messages
  status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' },
  readAt: Date,
  createdAt: { type: Date, default: Date.now }
});

const claimSchema = new mongoose.Schema({
  foundItem: { type: mongoose.Schema.Types.ObjectId, ref: 'FoundItem', required: true },
  claimant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  finder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  attempts: { type: Number, default: 0 },
  maxAttempts: { type: Number, default: 3 },
  messages: [messageSchema],
  status: { type: String, enum: ['open', 'collected', 'rejected'], default: 'open' },
  // Track who is online in this chat room
  onlineUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

claimSchema.index({ foundItem: 1, claimant: 1 }, { unique: true });

export default mongoose.model('Claim', claimSchema);
