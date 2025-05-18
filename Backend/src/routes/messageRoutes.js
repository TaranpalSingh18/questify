const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const auth = require('../middleware/auth');

// Get messages between current user and another user
router.get('/:userId', auth, async (req, res) => {
  try {
    console.log('Fetching messages between users:', {
      currentUser: req.user.id,
      otherUser: req.params.userId
    });

    if (!req.user.id || !req.params.userId) {
      console.error('Missing user IDs:', { currentUser: req.user.id, otherUser: req.params.userId });
      return res.status(400).json({ message: 'Missing user IDs' });
    }

    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user.id }
      ]
    }).sort({ timestamp: 1 });

    console.log('Found messages:', messages.length);
    
    // Mark messages as read
    await Message.updateMany(
      {
        sender: req.params.userId,
        receiver: req.user.id,
        read: false
      },
      { read: true }
    );

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ 
      message: 'Error fetching messages',
      error: error.message 
    });
  }
});

// Get users for chat (excluding current user)
router.get('/users/chat', auth, async (req, res) => {
  try {
    console.log('Fetching users for chat, current user:', req.user.id);
    
    if (!req.user.id) {
      console.error('Missing current user ID');
      return res.status(400).json({ message: 'Missing user ID' });
    }

    const users = await User.find({ _id: { $ne: req.user.id } })
      .select('name role profilePicture')
      .lean();

    console.log('Found users:', users.length);

    // Get last message and unread count for each user
    const usersWithMessages = await Promise.all(users.map(async (user) => {
      const lastMessage = await Message.findOne({
        $or: [
          { sender: req.user.id, receiver: user._id },
          { sender: user._id, receiver: req.user.id }
        ]
      }).sort({ timestamp: -1 });

      const unreadCount = await Message.countDocuments({
        sender: user._id,
        receiver: req.user.id,
        read: false
      });

      return {
        ...user,
        lastMessage: lastMessage || null,
        unreadCount
      };
    }));

    console.log('Processed users with messages:', usersWithMessages.length);
    res.json(usersWithMessages);
  } catch (error) {
    console.error('Error fetching users for chat:', error);
    res.status(500).json({ 
      message: 'Error fetching users',
      error: error.message 
    });
  }
});

// Get unread message count
router.get('/unread/count', protect, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user.id,
      read: false
    });
    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ message: 'Error fetching unread count' });
  }
});

// Save new message
router.post('/', auth, async (req, res) => {
  try {
    console.log('Saving new message:', req.body);
    
    const { sender, receiver, content, timestamp } = req.body;

    // Validate required fields
    if (!sender || !receiver || !content) {
      console.error('Missing required fields:', { sender, receiver, content });
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Create new message
    const newMessage = new Message({
      sender,
      receiver,
      content,
      timestamp: timestamp || new Date(),
      read: false
    });

    // Save message to database
    const savedMessage = await newMessage.save();
    console.log('Message saved successfully:', savedMessage);

    res.status(201).json(savedMessage);
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ 
      message: 'Error saving message',
      error: error.message 
    });
  }
});

module.exports = router; 