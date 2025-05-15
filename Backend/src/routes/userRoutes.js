const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
require("dotenv").config();

const router = express.Router();

// Configure multer for certificate uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'uploads/certificates';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and Word documents are allowed.'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, title, company, skills, interests } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user fields
    if (name) user.name = name;
    if (title) user.title = title;
    if (company) user.company = company;
    if (skills) user.skills = skills;
    if (interests) user.interests = interests;

    await user.save();
    res.json(user);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// Add certificate
router.post('/certificates', auth, upload.single('certificate'), async (req, res) => {
  try {
    const { name, issuer, dateIssued, skills } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const certificate = {
      name,
      issuer,
      dateIssued,
      fileUrl: `/uploads/certificates/${req.file.filename}`,
      skills: JSON.parse(skills || '[]'),
      verified: false
    };

    // Check if any skills match and award coins
    let coinsAdded = 0;
    const matchingSkills = certificate.skills.filter(skill => user.skills.includes(skill));
    if (matchingSkills.length > 0) {
      coinsAdded = 10;
      user.coins += coinsAdded;
    }

    user.certificates.push(certificate);
    await user.save();

    res.json({ 
      message: 'Certificate added successfully',
      coinsAdded
    });
  } catch (error) {
    console.error('Certificate upload error:', error);
    res.status(500).json({ message: 'Error uploading certificate' });
  }
});

// Get user certificates
router.get('/certificates', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.certificates);
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({ message: 'Error fetching certificates' });
  }
});

module.exports = router; 