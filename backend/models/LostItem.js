import mongoose from 'mongoose';

const lostItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    minlength: [10, 'Description must be at least 10 characters']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  category: {
    type: String,
    enum: ['Electronics', 'Documents', 'Accessories', 'Clothing', 'Books', 'Other'],
    default: 'Other'
  },
  reporterName: {
    type: String,
    required: [true, 'Reporter name is required']
  },
  contact: {
    type: String,
    required: [true, 'Email is required']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^\d{10}$/, 'Phone number must be 10 digits']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'found', 'closed'],
    default: 'active'
  },
  matchedWith: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoundItem'
  }
}, {
  timestamps: true
});

// Index for search
lostItemSchema.index({ name: 'text', description: 'text' });

export default mongoose.model('LostItem', lostItemSchema);
