const express = require("express");
const Submission = require("../models/Submission");
const Quest = require('../models/Quest');
const User = require('../models/User');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const { sendNotification } = require('../websocket/questWebSocket');

const router = express.Router();

console.log("Loading submission routes...");

// Submit a Solution
router.post("/", auth, async (req, res) => {
  try {
    const { questId, videoDemo, githubLink, description } = req.body;
    
    // Create the submission
    const submission = new Submission({
      questId,
      userId: req.user.id,
      videoDemo,
      githubLink,
      description,
      status: 'pending'
    });

    const savedSubmission = await submission.save();

    // Get the quest details to find the hirer
    const quest = await Quest.findById(questId);
    if (!quest) {
      throw new Error('Quest not found');
    }

    // Get the seeker's profile name
    const seeker = await User.findById(req.user.id);
    if (!seeker) {
      throw new Error('User not found');
    }

    // Create notification for the hirer
    const notification = new Notification({
      user: quest.postedBy,
      type: 'quest',
      message: `${seeker.name} has submitted a solution for your quest "${quest.title}". Check their video demo and GitHub link for details.`,
      read: false
    });

    await notification.save();

    // Send real-time notification
    sendNotification(quest.postedBy, {
      ...notification.toObject(),
      submission: {
        videoDemo,
        githubLink,
        description,
        seekerName: seeker.name
      }
    });

    res.status(201).json(savedSubmission);
  } catch (error) {
    console.error('Error in submission route:', error);
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
