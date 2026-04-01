import express from 'express';
import { body, validationResult } from 'express-validator';
import LostItem from '../models/LostItem.js';
import { protect } from '../middleware/auth.js';
import { io } from '../server.js';

const router = express.Router();

// @route   POST /api/lost-items
// @desc    Create lost item report
// @access  Private
router.post('/', protect, [
  body('name').trim().notEmpty().withMessage('Item name is required'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('reporterName').trim().notEmpty().withMessage('Reporter name is required'),
  body('contact').isEmail().withMessage('Valid email is required'),
  body('phone').matches(/^\d{10}$/).withMessage('Phone number must be 10 digits')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const lostItem = await LostItem.create({
      ...req.body,
      user: req.user._id
    });

    // Check for matches and send notifications (async, don't wait)
    try {
      const { findMatchesForLostItem, sendMatchNotifications } = await import('../utils/matchingService.js');
      findMatchesForLostItem(lostItem).then(matches => {
        if (matches.length > 0 && matches[0].score >= 60) {
          // Send notification for best match
          const bestMatch = matches[0];
          sendMatchNotifications(lostItem, bestMatch.foundItem, bestMatch.score)
            .catch(err => console.log('Notification error:', err.message));
        }
      });
    } catch (err) {
      console.log('Matching service error:', err.message);
    }

    // Emit real-time event to all connected clients
    io.emit('lostItem:new', lostItem);

    res.status(201).json({
      success: true,
      message: 'Lost item reported successfully. We will notify you if we find a match!',
      data: lostItem
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating lost item', error: error.message });
  }
});

// @route   GET /api/lost-items
// @desc    Get all lost items
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};
    
    if (status) query.status = status;
    if (search) query.$text = { $search: search };

    const lostItems = await LostItem.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: lostItems.length, data: lostItems });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching lost items' });
  }
});

// @route   GET /api/lost-items/my-items
// @desc    Get current user's lost items
// @access  Private
router.get('/my-items', protect, async (req, res) => {
  try {
    const lostItems = await LostItem.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: lostItems.length, data: lostItems });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching your lost items' });
  }
});

// @route   GET /api/lost-items/:id
// @desc    Get single lost item
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const lostItem = await LostItem.findById(req.params.id).populate('user', 'name email');
    if (!lostItem) {
      return res.status(404).json({ success: false, message: 'Lost item not found' });
    }
    res.json({ success: true, data: lostItem });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching lost item' });
  }
});

// @route   PUT /api/lost-items/:id
// @desc    Update lost item
// @access  Private (Owner only)
router.put('/:id', protect, async (req, res) => {
  try {
    let lostItem = await LostItem.findById(req.params.id);
    
    if (!lostItem) {
      return res.status(404).json({ success: false, message: 'Lost item not found' });
    }

    if (lostItem.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this item' });
    }

    lostItem = await LostItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    io.emit('lostItem:updated', lostItem);
    res.json({ success: true, message: 'Lost item updated successfully', data: lostItem });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating lost item' });
  }
});

// @route   DELETE /api/lost-items/:id
// @desc    Delete lost item
// @access  Private (Owner only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const lostItem = await LostItem.findById(req.params.id);
    
    if (!lostItem) {
      return res.status(404).json({ success: false, message: 'Lost item not found' });
    }

    if (lostItem.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this item' });
    }

    await lostItem.deleteOne();

    io.emit('lostItem:deleted', { id: req.params.id });
    res.json({ success: true, message: 'Lost item deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting lost item' });
  }
});

export default router;
