const Notification = require('../models/Notification');
const { sendNotification } = require('../server');

// Login route
router.post('/login', async (req, res) => {
  try {
    // ... existing login logic ...

    // Create login notification
    const notification = new Notification({
      user: user._id,
      type: 'login',
      message: 'Welcome back! You earned 1 coin for logging in.',
      coins: 1
    });
    await notification.save();

    // Send real-time notification
    sendNotification(user._id, notification);

    // ... rest of the login logic ...
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ... rest of the existing code ... 