import express from 'express';
import User from '../models/User.js';
import LostItem from '../models/LostItem.js';
import FoundItem from '../models/FoundItem.js';
import Feedback from '../models/Feedback.js';
import Contact from '../models/Contact.js';
import { protect, adminOnly, generateToken } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/admin/login
// @desc    Admin login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for admin credentials from env
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      // Create or get admin user
      let admin = await User.findOne({ email: process.env.ADMIN_EMAIL });
      
      if (!admin) {
        admin = await User.create({
          name: 'Admin',
          email: process.env.ADMIN_EMAIL,
          password: process.env.ADMIN_PASSWORD,
          role: 'admin'
        });
      }

      const token = generateToken(admin._id);

      return res.json({
        success: true,
        message: 'Admin login successful',
        token,
        user: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role
        }
      });
    }

    res.status(401).json({
      success: false,
      message: 'Invalid admin credentials'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error in admin login'
    });
  }
});

// Note: Temporarily public for local admin access
// TODO: Add proper admin authentication

// @route   GET /api/admin/stats
// @desc    Get dashboard statistics
// @access  Public (temporarily)
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      totalLostItems,
      totalFoundItems,
      activeLostItems,
      availableFoundItems,
      totalFeedbacks,
      totalContacts,
      recentUsers,
      recentLostItems,
      recentFoundItems
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      LostItem.countDocuments(),
      FoundItem.countDocuments(),
      LostItem.countDocuments({ status: 'active' }),
      FoundItem.countDocuments({ status: 'available' }),
      Feedback.countDocuments(),
      Contact.countDocuments(),
      User.find({ role: 'user' }).sort({ createdAt: -1 }).limit(5).select('name email createdAt'),
      LostItem.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email'),
      FoundItem.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email')
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalLostItems,
          totalFoundItems,
          activeLostItems,
          availableFoundItems,
          totalFeedbacks,
          totalContacts
        },
        recent: {
          users: recentUsers,
          lostItems: recentLostItems,
          foundItems: recentFoundItems
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching stats' });
  }
});

// @route   GET /api/admin/matches
// @desc    Get potential matches between lost and found items
// @access  Public (temporarily)
router.get('/matches', async (req, res) => {
  try {
    const lostItems = await LostItem.find({ status: 'active' });
    const foundItems = await FoundItem.find({ status: 'available' });

    const matches = [];

    lostItems.forEach(lost => {
      foundItems.forEach(found => {
        const nameMatch = lost.name.toLowerCase().includes(found.name.toLowerCase()) ||
                         found.name.toLowerCase().includes(lost.name.toLowerCase());
        const descMatch = lost.description.toLowerCase().includes(found.description.toLowerCase()) ||
                         found.description.toLowerCase().includes(lost.description.toLowerCase());

        if (nameMatch || descMatch) {
          matches.push({
            lost: lost,
            found: found,
            matchScore: (nameMatch ? 50 : 0) + (descMatch ? 50 : 0)
          });
        }
      });
    });

    // Sort by match score
    matches.sort((a, b) => b.matchScore - a.matchScore);

    res.json({ success: true, count: matches.length, data: matches });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error finding matches' });
  }
});

// @route   PUT /api/admin/users/:id/toggle-status
// @desc    Activate/Deactivate user
// @access  Public (temporarily)
router.put('/users/:id/toggle-status', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating user status' });
  }
});

export default router;
