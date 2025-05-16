// src/routes/coinRoutes.js
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const User = require("../models/User");

// GET endpoint to retrieve coin balance for a user using the DB
// Usage: GET /api/coins/getCoins?userId=USER_ID
router.get("/getCoins", async (req, res) => {
  const userId = req.query.userId;
  console.log("Received userId:", userId); // Debug log
  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }
  
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: "Invalid userId" });
  }
  
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ coins: user.coins });
  } catch (err) {
    console.error("Error in /getCoins:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// POST endpoint to add coins to a user's account using the DB
// Expects JSON: { userId: "USER_ID", amount: NUMBER }
router.post("/addCoins", async (req, res) => {
  const { userId, amount } = req.body;
  if (!userId || typeof amount !== "number") {
    return res.status(400).json({ error: "Invalid userId or amount" });
  }

  // Validate the provided userId is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: "Invalid userId" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    user.coins += amount;
    await user.save();
    res.json({ success: true, newBalance: user.coins });
  } catch (err) {
    console.error("Error in /addCoins:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
