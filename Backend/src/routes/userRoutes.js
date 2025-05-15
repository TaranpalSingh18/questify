const express = require("express");
const router = express.Router();
const auth = require('../middleware/auth');
const userController = require('../controllers/userController');
const { uploadCertificate, uploadProfilePicture } = require('../middleware/upload');
require("dotenv").config();

// Profile routes
router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, userController.updateProfile);
router.post('/profile-picture', auth, uploadProfilePicture.single('profilePicture'), userController.uploadProfilePicture);

// Certificate routes
router.post('/certificates', auth, uploadCertificate.single('certificate'), userController.uploadCertificate);
router.get('/certificates', auth, userController.getUserCertificates);

module.exports = router; 