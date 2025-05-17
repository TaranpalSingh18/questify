const express = require("express");
const Quest = require("../models/Quest");
const WebSocket = require('ws');
const { getWebSocketServer } = require("../websocket/questWebSocket");
const auth = require('../middleware/auth');
const { notifyQuestUpdate } = require('../utils/questWebSocket');

const router = express.Router();
console.log("questRoutes.js is loaded"); 


router.post("/", auth, async (req, res) => {
  try {
    console.log('Received quest creation request:', req.body);
    console.log('User from auth:', req.user);

    const {
      title,
      company,
      companyLogo,
      description,
      requirements,
      skills,
      deadline,
      compensation,
      location,
      remote,
    } = req.body;

    // Validate required fields
    if (!title || !company || !description || !deadline || !location) {
      console.log('Missing required fields');
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const quest = new Quest({
      title,
      company,
      companyLogo,
      description,
      requirements: requirements || [],
      skills: skills || [],
      deadline,
      compensation,
      location,
      remote,
      postedBy: req.user.id,
    });

    console.log('Creating quest:', quest);

    const savedQuest = await quest.save();
    console.log('Quest saved successfully:', savedQuest);

    // Notify all connected clients about the new quest
    notifyQuestUpdate('create', savedQuest);

    res.status(201).json(savedQuest);
  } catch (error) {
    console.error('Error creating quest:', error);
    res.status(500).json({ message: error.message });
  }
});


// Get All Quests
router.get("/", async (req, res) => {
  try {
    console.log('Fetching all quests');
    const quests = await Quest.find().sort({ createdAt: -1 });
    console.log('Found quests:', quests);
    res.json(quests);
  } catch (error) {
    console.error('Error fetching quests:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get a specific quest
router.get('/:id', async (req, res) => {
  try {
    const quest = await Quest.findById(req.params.id);
    if (!quest) {
      return res.status(404).json({ message: 'Quest not found' });
    }
    res.json(quest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a quest
router.put('/:id', auth, async (req, res) => {
  try {
    const quest = await Quest.findById(req.params.id);
    if (!quest) {
      return res.status(404).json({ message: 'Quest not found' });
    }

    // Check if the user is the one who posted the quest
    if (quest.postedBy.toString() !== req.user._id) {
      return res.status(403).json({ message: 'Not authorized to update this quest' });
    }

    const updatedQuest = await Quest.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    // Notify all connected clients about the update
    notifyQuestUpdate('update', updatedQuest);

    res.json(updatedQuest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a quest
router.delete('/:id', auth, async (req, res) => {
  try {
    const quest = await Quest.findById(req.params.id);
    if (!quest) {
      return res.status(404).json({ message: 'Quest not found' });
    }

    // Check if the user is the one who posted the quest
    if (quest.postedBy.toString() !== req.user._id) {
      return res.status(403).json({ message: 'Not authorized to delete this quest' });
    }

    await Quest.findByIdAndDelete(req.params.id);

    // Notify all connected clients about the deletion
    notifyQuestUpdate('delete', { _id: req.params.id });

    res.json({ message: 'Quest deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
