const express = require("express");
const Quest = require("../models/Quest");

const router = express.Router();

// Create a Quest
router.post("/", async (req, res) => {
  try {
    const quest = new Quest(req.body);
    await quest.save();
    res.status(201).json(quest);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get All Quests
router.get("/", async (req, res) => {
  const quests = await Quest.find();
  res.json(quests);
});

module.exports = router;
