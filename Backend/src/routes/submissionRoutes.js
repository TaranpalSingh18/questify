const express = require("express");
const Submission = require("../models/Submission");

const router = express.Router();

// Submit a Solution
router.post("/", async (req, res) => {
  try {
    const submission = new Submission(req.body);
    await submission.save();
    res.status(201).json(submission);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get All Submissions
router.get("/", async (req, res) => {
  const submissions = await Submission.find().populate("questId userId");
  res.json(submissions);
});

module.exports = router;
