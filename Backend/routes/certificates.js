const Notification = require('../models/Notification');
const { sendNotification } = require('../server');

// Upload certificate route
router.post('/', auth, upload.single('certificate'), async (req, res) => {
  try {
    // ... existing certificate upload logic ...

    // Create certificate notification
    const notification = new Notification({
      user: req.user.id,
      type: 'certificate',
      message: `You earned 20 coins for uploading a new certificate: ${req.body.name}`,
      coins: 20
    });
    await notification.save();

    // Send real-time notification
    sendNotification(req.user.id, notification);

    // ... rest of the certificate upload logic ...
  } catch (error) {
    console.error('Certificate upload error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}); 