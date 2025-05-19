const express = require("express");
const Submission = require("../models/Submission");
const Quest = require('../models/Quest');
const User = require('../models/User');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const { sendNotification } = require('../websocket/questWebSocket');

const router = express.Router();

const POINTS_FOR_SUBMISSION = 10;

// console.log("Loading submission routes...");

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

    // Get the seeker's profile and update coins
    const seeker = await User.findById(req.user.id);
    if (!seeker) {
      throw new Error('User not found');
    }

    // Update seeker's coins
    seeker.coins += POINTS_FOR_SUBMISSION;
    await seeker.save();

    // Create notification for the hirer about submission
    const hirerNotification = new Notification({
      user: quest.postedBy,
      type: 'quest',
      message: `${seeker.name} has submitted a solution for your quest "${quest.title}". Check their video demo and GitHub link for details.`,
      read: false
    });

    await hirerNotification.save();

    // Create notification for the seeker about coins earned
    const seekerNotification = new Notification({
      user: seeker._id,
      type: 'quest',
      message: `You earned ${POINTS_FOR_SUBMISSION} coins for submitting a solution to "${quest.title}"!`,
      coins: POINTS_FOR_SUBMISSION,
      read: false
    });

    await seekerNotification.save();

    // Send real-time notifications
    sendNotification(quest.postedBy, {
      ...hirerNotification.toObject(),
      submission: {
        videoDemo,
        githubLink,
        description,
        seekerName: seeker.name
      }
    });

    sendNotification(seeker._id, seekerNotification.toObject());

    res.status(201).json({
      submission: savedSubmission,
      coinsEarned: POINTS_FOR_SUBMISSION,
      newCoinBalance: seeker.coins
    });
  } catch (error) {
    console.error('Error in submission route:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get All Submissions
router.get("/", auth, async (req, res) => {
  try {
    // First get all quests posted by the current user
    const userQuests = await Quest.find({ postedBy: req.user.id });
    const questIds = userQuests.map(quest => quest._id);

    // Then get all submissions for those quests
    const submissions = await Submission.find({ questId: { $in: questIds } })
      .populate("questId", "title")
      .populate("userId", "name");

    // Transform the data to include quest title and submitter name
    const transformedSubmissions = submissions.map(submission => ({
      _id: submission._id,
      questTitle: submission.questId.title,
      submitterName: submission.userId.name,
      videoDemo: submission.videoDemo,
      githubLink: submission.githubLink,
      description: submission.description,
      submittedAt: submission.submittedAt,
      status: submission.status
    }));

    res.json(transformedSubmissions);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ error: error.message });
  }
});

// Handle invalid routes inside submissions
router.use((req, res) => {
  res.status(404).json({ error: "Submissions route not found" });
});

module.exports = router;
