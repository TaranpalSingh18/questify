const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const WebSocket = require('ws');
const User = require("../models/User");
const Notification = require("../models/Notification");
const { body, validationResult } = require("express-validator");
const { getWebSocketServer } = require("../utils/chatWebSocket");
require("dotenv").config();

const router = express.Router();

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

// Signup route
router.post(
  "/signup",
  [
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    body("role").isIn(["job-seeker", "hirer"]).withMessage("Invalid role"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, password, role } = req.body;

      // Check if user already exists
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Create new user with signup bonus
      user = new User({
        name,
        email,
        password,
        role,
        coins: 20, // Signup bonus
      });

      // Password will be hashed by the User model's pre-save hook
      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          coins: user.coins,
        },
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Error in signup" });
    }
  }
);

// Login route
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("password").exists().withMessage("Password is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      // Create login notification
      const notification = new Notification({
        user: user._id,
        type: "login",
        message: "Welcome back! You earned 1 coin for logging in.",
        coins: 1
      });
      await notification.save();

      // Send real-time notification
      sendNotification(user._id, notification);

      // Add login bonus
      user.coins += 1;
      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profilePicture: user.profilePicture,
          coins: user.coins,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
