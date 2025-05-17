const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Certificate = require('../models/Certificate');
const Notification = require('../models/Notification');
const { getWebSocketServer } = require('../utils/chatWebSocket');
const WebSocket = require('ws');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/certificates';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|pdf/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only .png, .jpg, .jpeg and .pdf files are allowed!'));
  }
});

// Helper function to send notification
const sendNotification = (userId, notification) => {
  const wss = getWebSocketServer();
  wss.clients.forEach((client) => {
    if (client.userId === userId && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'notification',
        notification
      }));
    }
  });
};

// Upload certificate
router.post('/upload', auth, upload.single('certificate'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { title, issuer, date, skills } = req.body;
    const userId = req.user.id;

    // Create new certificate
    const certificate = new Certificate({
      user: userId,
      title,
      issuer,
      date,
      skills: skills ? JSON.parse(skills) : [],
      fileUrl: `/uploads/certificates/${req.file.filename}`
    });

    await certificate.save();

    // Update user's coins
    const user = await User.findById(userId);
    user.coins += 20; // Certificate upload bonus
    await user.save();

    // Create notification
    const notification = new Notification({
      user: userId,
      type: 'certificate',
      message: `You earned 20 coins for uploading your ${title} certificate!`,
      coins: 20
    });
    await notification.save();

    // Send real-time notification
    sendNotification(userId, notification);

    res.json({
      message: 'Certificate uploaded successfully',
      certificate,
      coinsEarned: 20
    });
  } catch (error) {
    console.error('Certificate upload error:', error);
    res.status(500).json({ message: 'Error uploading certificate' });
  }
});

// Get user's certificates
router.get('/user', auth, async (req, res) => {
  try {
    const certificates = await Certificate.find({ user: req.user.id })
      .sort({ date: -1 });
    res.json(certificates);
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({ message: 'Error fetching certificates' });
  }
});

module.exports = router; 