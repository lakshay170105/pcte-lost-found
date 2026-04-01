import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (basic info)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('name email role isActive createdAt lastLogin');
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching users' });
  }
});

export default router;
