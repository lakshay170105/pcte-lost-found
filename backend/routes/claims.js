import express from 'express';
import Claim from '../models/Claim.js';
import FoundItem from '../models/FoundItem.js';
import { protect } from '../middleware/auth.js';
import { io } from '../server.js';

const router = express.Router();

// GET /api/claims/my-claims
router.get('/my-claims', protect, async (req, res) => {
  try {
    const claims = await Claim.find({ claimant: req.user._id })
      .populate('foundItem', 'name description location date image verificationQuestion status')
      .populate('finder', 'name email')
      .sort({ updatedAt: -1 });
    res.json({ success: true, data: claims });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/claims/incoming
router.get('/incoming', protect, async (req, res) => {
  try {
    const claims = await Claim.find({ finder: req.user._id })
      .populate('foundItem', 'name description location date image status')
      .populate('claimant', 'name email')
      .sort({ updatedAt: -1 });
    res.json({ success: true, data: claims });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/claims/:claimId
router.get('/:claimId', protect, async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.claimId)
      .populate('foundItem', 'name description location date image verificationQuestion status dropLocation')
      .populate('claimant', 'name email phone')
      .populate('finder', 'name email phone')
      .populate('messages.sender', 'name');

    if (!claim) return res.status(404).json({ success: false, message: 'Claim not found' });

    const userId = req.user._id.toString();
    const isParticipant =
      claim.claimant._id.toString() === userId ||
      claim.finder._id.toString() === userId;
    if (!isParticipant && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Mark unread messages as read for this user
    let updated = false;
    claim.messages.forEach(msg => {
      if (msg.sender._id.toString() !== userId && msg.status !== 'read') {
        msg.status = 'read';
        msg.readAt = new Date();
        updated = true;
      }
    });
    if (updated) {
      await claim.save();
      // Notify sender their messages were read
      io.to(`claim:${claim._id}`).emit('chat:read', {
        claimId: claim._id,
        readBy: userId,
        readAt: new Date()
      });
    }

    res.json({ success: true, data: claim });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/claims — initiate claim
router.post('/', protect, async (req, res) => {
  try {
    const { foundItemId } = req.body;
    if (!foundItemId) return res.status(400).json({ success: false, message: 'foundItemId required' });

    const foundItem = await FoundItem.findById(foundItemId);
    if (!foundItem) return res.status(404).json({ success: false, message: 'Found item not found' });
    if (foundItem.status !== 'available') return res.status(400).json({ success: false, message: 'Item is no longer available' });
    if (foundItem.user.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot claim your own item' });
    }

    const existing = await Claim.findOne({ foundItem: foundItemId, claimant: req.user._id });
    if (existing) return res.json({ success: true, data: existing });

    const claim = await Claim.create({
      foundItem: foundItemId,
      claimant: req.user._id,
      finder: foundItem.user,
    });

    io.to(`user:${foundItem.user.toString()}`).emit('claim:new', {
      claimId: claim._id,
      itemName: foundItem.name,
      claimantName: req.user.name,
    });

    res.status(201).json({ success: true, data: claim });
  } catch (err) {
    if (err.code === 11000) {
      const existing = await Claim.findOne({ foundItem: req.body.foundItemId, claimant: req.user._id });
      return res.json({ success: true, data: existing });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/claims/:claimId/verify
router.post('/:claimId/verify', protect, async (req, res) => {
  try {
    const { answer } = req.body;
    const claim = await Claim.findById(req.params.claimId);
    if (!claim) return res.status(404).json({ success: false, message: 'Claim not found' });
    if (claim.claimant.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Not your claim' });
    if (claim.verificationStatus === 'verified') return res.json({ success: true, verified: true });
    if (claim.verificationStatus === 'rejected') return res.status(400).json({ success: false, message: 'Claim rejected — too many wrong attempts' });

    const foundItem = await FoundItem.findById(claim.foundItem).select('+verificationAnswer');
    if (!foundItem) return res.status(404).json({ success: false, message: 'Item not found' });

    // Get finder info for the auto-message
    const User = (await import('../models/User.js')).default;
    const finder = await User.findById(claim.finder).select('name');

    const doVerify = async () => {
      claim.verificationStatus = 'verified';

      // Auto system message FROM FINDER TO OWNER — sent as finder's identity
      const systemMsg = {
        sender: claim.finder,
        senderName: finder?.name || 'Finder',
        senderRole: 'finder',
        isSystem: true,
        text: `Hi! I found your item "${foundItem.name}" at ${foundItem.location}. You can collect it from: ${foundItem.dropLocation || foundItem.location}. Please reply to arrange pickup. 📦`,
        status: 'sent',
        createdAt: new Date(),
      };
      claim.messages.push(systemMsg);
      await claim.save();

      const room = `claim:${claim._id}`;
      const savedMsg = claim.messages[claim.messages.length - 1];

      // Notify finder
      io.to(`user:${claim.finder.toString()}`).emit('claim:verified', {
        claimId: claim._id,
        claimantName: req.user.name,
        itemName: foundItem.name,
      });

      // Push the auto-message to both users in real-time
      io.to(room).emit('chat:message', {
        claimId: claim._id,
        message: { ...savedMsg.toObject(), senderName: finder?.name || 'Finder', senderRole: 'finder', isSystem: true },
      });

      return res.json({ success: true, verified: true, claimId: claim._id });
    };

    // No verification question — auto verify
    if (!foundItem.verificationAnswer) {
      return await doVerify();
    }

    claim.attempts += 1;
    const correct = (answer || '').trim().toLowerCase() === foundItem.verificationAnswer.trim().toLowerCase();

    if (correct) {
      return await doVerify();
    } else {
      if (claim.attempts >= claim.maxAttempts) {
        claim.verificationStatus = 'rejected';
        await claim.save();
        return res.status(400).json({ success: false, verified: false, message: 'Too many wrong attempts. Claim rejected.' });
      }
      await claim.save();
      return res.json({
        success: true, verified: false,
        attemptsLeft: claim.maxAttempts - claim.attempts,
        message: `Wrong answer. ${claim.maxAttempts - claim.attempts} attempt(s) left.`,
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/claims/:claimId/messages — send message with delivered status
router.post('/:claimId/messages', protect, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ success: false, message: 'Message required' });

    const claim = await Claim.findById(req.params.claimId);
    if (!claim) return res.status(404).json({ success: false, message: 'Claim not found' });

    const userId = req.user._id.toString();
    const isFinder = claim.finder.toString() === userId;
    const isClaimant = claim.claimant.toString() === userId;
    if (!isFinder && !isClaimant) return res.status(403).json({ success: false, message: 'Not a participant' });
    if (claim.verificationStatus !== 'verified') return res.status(403).json({ success: false, message: 'Verification required' });

    const senderRole = isFinder ? 'finder' : 'claimant';
    const message = {
      sender: req.user._id,
      senderName: req.user.name,
      senderRole,
      text: text.trim(),
      status: 'sent',
    };
    claim.messages.push(message);
    await claim.save();

    const savedMsg = claim.messages[claim.messages.length - 1];
    const msgObj = { ...savedMsg.toObject(), senderName: req.user.name, senderRole };

    // Emit to room — if other user is in room, mark as delivered
    const room = `claim:${claim._id}`;
    io.to(room).emit('chat:message', { claimId: claim._id, message: msgObj });

    // Mark as delivered if other user is connected to room
    const roomSockets = await io.in(room).fetchSockets();
    if (roomSockets.length > 1) {
      savedMsg.status = 'delivered';
      await claim.save();
      io.to(room).emit('chat:delivered', { claimId: claim._id, messageId: savedMsg._id });
    }

    res.json({ success: true, data: msgObj });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/claims/:claimId/messages/read — mark all messages as read
router.put('/:claimId/messages/read', protect, async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.claimId);
    if (!claim) return res.status(404).json({ success: false, message: 'Claim not found' });

    const userId = req.user._id.toString();
    let updated = false;
    claim.messages.forEach(msg => {
      if (msg.sender.toString() !== userId && msg.status !== 'read') {
        msg.status = 'read';
        msg.readAt = new Date();
        updated = true;
      }
    });
    if (updated) {
      await claim.save();
      io.to(`claim:${claim._id}`).emit('chat:read', { claimId: claim._id, readBy: userId, readAt: new Date() });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/claims/:claimId/resolve
router.put('/:claimId/resolve', protect, async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.claimId);
    if (!claim) return res.status(404).json({ success: false, message: 'Claim not found' });
    if (claim.finder.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Only finder can resolve' });

    claim.status = 'collected';
    await claim.save();
    await FoundItem.findByIdAndUpdate(claim.foundItem, { status: 'returned' });

    io.to(`claim:${claim._id}`).emit('claim:resolved', { claimId: claim._id });
    io.emit('foundItem:updated', { id: claim.foundItem.toString(), status: 'returned' });

    res.json({ success: true, message: 'Item marked as collected' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
