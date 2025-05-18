const User = require('../models/User');
const Certificate = require('../models/Certificate');
const path = require('path');
const fs = require('fs');

// Get leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await User.find({})
      .select('name profilePicture coins role')
      .sort({ coins: -1 })
      .limit(10);

    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Error fetching leaderboard' });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
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
};

// Upload profile picture
exports.uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete old profile picture if it exists
    if (user.profilePicture) {
      try {
        const oldPicturePath = path.join(__dirname, '../../../uploads/profile-pictures', path.basename(user.profilePicture));
        if (fs.existsSync(oldPicturePath)) {
          fs.unlinkSync(oldPicturePath);
        }
      } catch (deleteError) {
        console.error('Error deleting old picture:', deleteError);
      }
    }

    // Update user's profile picture
    const profilePictureUrl = `http://localhost:5000/uploads/profile-pictures/${req.file.filename}`;
    user.profilePicture = profilePictureUrl;
    await user.save();

    res.json({ 
      message: 'Profile picture updated successfully',
      profilePicture: profilePictureUrl
    });
  } catch (error) {
    console.error('Profile picture upload error:', error);
    res.status(500).json({ message: 'Error uploading profile picture' });
  }
};

// Get user certificates
exports.getUserCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({ user: req.user.id })
      .sort({ dateIssued: -1 }); // Sort by date, newest first
    
    res.json(certificates);
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({ message: 'Error fetching certificates' });
  }
};

// Upload certificate
exports.uploadCertificate = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { name, issuer, dateIssued, skills } = req.body;
    
    if (!name || !issuer || !dateIssued) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Create new certificate
    const certificate = new Certificate({
      user: req.user.id,
      name,
      issuer,
      dateIssued,
      skills: JSON.parse(skills || '[]'),
      fileUrl: `/uploads/certificates/${req.file.filename}`
    });

    await certificate.save();

    // Add coins to user's balance
    const COINS_PER_CERTIFICATE = 20;
    const user = await User.findById(req.user.id);
    user.coins = (user.coins || 0) + COINS_PER_CERTIFICATE;
    await user.save();

    res.status(201).json({
      message: 'Certificate uploaded successfully',
      certificate,
      coinsAdded: COINS_PER_CERTIFICATE
    });
  } catch (error) {
    console.error('Error uploading certificate:', error);
    res.status(500).json({ message: 'Error uploading certificate' });
  }
};

// Delete certificate
exports.deleteCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    // Delete the file from the server
    if (certificate.fileUrl) {
      try {
        const filePath = path.join(__dirname, '../../../', certificate.fileUrl);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (deleteError) {
        console.error('Error deleting certificate file:', deleteError);
      }
    }

    // Delete the certificate from the database
    await certificate.remove();

    res.json({ message: 'Certificate deleted successfully' });
  } catch (error) {
    console.error('Error deleting certificate:', error);
    res.status(500).json({ message: 'Error deleting certificate' });
  }
}; 