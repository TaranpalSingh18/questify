const express = require("express");
const Submission = require("../models/Submission");

const router = express.Router();

console.log("Loading submission routes...");

// Submit a Solution
router.post("/", async (req, res) => {
  try {
    const { questId, userId, videoDemo, githubLink, description } = req.body;

    if (!questId || !userId || !videoDemo || !githubLink || !description) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const submission = new Submission({ questId, userId, videoDemo, githubLink, description });
    await submission.save();

    res.status(201).json(submission);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get All Submissions
router.get("/", async (req, res) => {
  try {
    const submissions = await Submission.find().populate("questId userId");
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Handle invalid routes inside submissions
router.use((req, res) => {
  res.status(404).json({ error: "Submissions route not found" });
});

module.exports = router;
