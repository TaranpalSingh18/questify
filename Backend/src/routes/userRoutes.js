const express = require("express");
const router = express.Router();
const auth = require('../middleware/auth');
const userController = require('../controllers/userController');
const { uploadCertificate, uploadProfilePicture } = require('../middleware/upload');
const User = require('../models/User');
require("dotenv").config();

// Get all users
router.get('/', auth, async (req, res) => {
  try {
    console.log('Fetching all users...');
    const users = await User.find().select('name role profilePicture');
    console.log(`Found ${users.length} users`);
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Profile routes
router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, userController.updateProfile);
router.post('/profile-picture', auth, uploadProfilePicture.single('profilePicture'), userController.uploadProfilePicture);

// Certificate routes
router.post('/certificates', auth, uploadCertificate.single('certificate'), userController.uploadCertificate);
router.get('/certificates', auth, userController.getUserCertificates);
router.delete('/certificates/:id', auth, userController.deleteCertificate);

// Leaderboard route - public access
router.get('/leaderboard', userController.getLeaderboard);

module.exports = router; 