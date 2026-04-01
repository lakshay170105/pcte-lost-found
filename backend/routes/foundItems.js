import express from 'express';
import { body, validationResult } from 'express-validator';
import FoundItem from '../models/FoundItem.js';
import { protect } from '../middleware/auth.js';
import { upload, uploadToCloudinary, deleteFromCloudinary } from '../middleware/upload.js';
import { io } from '../server.js';

const router = express.Router();

// @route   POST /api/found-items
// @desc    Create found item report with image
// @access  Private
router.post('/', protect, upload.single('image'), [
  body('name').trim().notEmpty().withMessage('Item name is required'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('location').trim().notEmpty().withMessage('Found location is required'),
  body('dropLocation').trim().notEmpty().withMessage('Drop location is required'),
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

    let imageData = {};
    
    // Upload image to Cloudinary if configured, otherwise store as base64
    if (req.file) {
      const cloudinaryConfigured =
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_CLOUD_NAME !== 'your-cloud-name-here';

      if (cloudinaryConfigured) {
        const result = await uploadToCloudinary(req.file.buffer);
        imageData = { url: result.secure_url, publicId: result.public_id };
      } else {
        // Fallback: store as base64 data URL
        const b64 = req.file.buffer.toString('base64');
        const mime = req.file.mimetype;
        imageData = { url: `data:${mime};base64,${b64}`, publicId: '' };
      }
    }

    const foundItem = await FoundItem.create({
      ...req.body,
      image: imageData,
      user: req.user._id,
      verificationQuestion: req.body.verificationQuestion || '',
      verificationAnswer: req.body.verificationAnswer ? req.body.verificationAnswer.trim().toLowerCase() : '',
    });

    // Check for matches and send notifications (async, don't wait)
    try {
      const { findMatchesForFoundItem, sendMatchNotifications } = await import('../utils/matchingService.js');
      findMatchesForFoundItem(foundItem).then(matches => {
        if (matches.length > 0 && matches[0].score >= 60) {
          // Send notification for best match
          const bestMatch = matches[0];
          sendMatchNotifications(bestMatch.lostItem, foundItem, bestMatch.score)
            .catch(err => console.log('Notification error:', err.message));
        }
      });
    } catch (err) {
      console.log('Matching service error:', err.message);
    }

    // Emit real-time event to all connected clients
    io.emit('foundItem:new', foundItem);

    res.status(201).json({
      success: true,
      message: 'Found item reported successfully. We will notify the owner if we find a match!',
      data: foundItem
    });
  } catch (error) {
    console.error('Found item POST error:', error.message);
    res.status(500).json({ success: false, message: 'Error creating found item', error: error.message });
  }
});

// @route   GET /api/found-items
// @desc    Get all found items
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};
    
    if (status) query.status = status;
    if (search) query.$text = { $search: search };

    const foundItems = await FoundItem.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: foundItems.length, data: foundItems });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching found items' });
  }
});

// @route   GET /api/found-items/my-items
// @desc    Get current user's found items
// @access  Private
router.get('/my-items', protect, async (req, res) => {
  try {
    const foundItems = await FoundItem.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: foundItems.length, data: foundItems });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching your found items' });
  }
});

// @route   GET /api/found-items/:id
// @desc    Get single found item
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const foundItem = await FoundItem.findById(req.params.id).populate('user', 'name email');
    if (!foundItem) {
      return res.status(404).json({ success: false, message: 'Found item not found' });
    }
    res.json({ success: true, data: foundItem });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching found item' });
  }
});

// @route   DELETE /api/found-items/:id
// @desc    Delete found item
// @access  Private (Owner only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const foundItem = await FoundItem.findById(req.params.id);
    
    if (!foundItem) {
      return res.status(404).json({ success: false, message: 'Found item not found' });
    }

    if (foundItem.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this item' });
    }

    // Delete image from Cloudinary if exists
    if (foundItem.image && foundItem.image.publicId) {
      await deleteFromCloudinary(foundItem.image.publicId);
    }

    await foundItem.deleteOne();

    io.emit('foundItem:deleted', { id: req.params.id });
    res.json({ success: true, message: 'Found item deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting found item' });
  }
});

export default router;
