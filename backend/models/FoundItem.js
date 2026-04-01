import mongoose from 'mongoose';

const foundItemSchema = new mongoose.Schema({
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
  dropLocation: {
    type: String,
    required: [true, 'Drop location is required'],
    trim: true
  },
  image: {
    url: String,
    publicId: String
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'claimed', 'returned'],
    default: 'available'
  },
  matchedWith: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LostItem'
  },
  // Verification question set by finder (answer stored hashed)
  verificationQuestion: {
    type: String,
    default: ''
  },
  verificationAnswer: {
    type: String,  // stored as lowercase trimmed (compared case-insensitively)
    default: '',
    select: false  // never sent to frontend
  }
}, {
  timestamps: true
});

// Index for search
foundItemSchema.index({ name: 'text', description: 'text' });

export default mongoose.model('FoundItem', foundItemSchema);
