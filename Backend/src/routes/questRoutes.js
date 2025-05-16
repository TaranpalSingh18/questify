const express = require("express");
const Quest = require("../models/Quest");

const router = express.Router();
console.log("questRoutes.js is loaded"); 


router.post("/", async (req, res) => {
  try {
    console.log("Incoming Data:", req.body);  // Debugging

    // Validate required fields
    const { title, company, description, deadline, location, remote, postedBy } = req.body;
    if (!title || !company || !description || !deadline || !location || remote === undefined || !postedBy) {
      return res.status(400).json({ error: "All required fields must be provided." });
    }

    const quest = new Quest(req.body);
    await quest.save();
    res.status(201).json(quest);
  } catch (error) {
    console.error("Error Saving Quest:", error.message);  // Debugging
    res.status(500).json({ error: error.message });
  }
});


// Get All Quests
router.get("/", async (req, res) => {
  const quests = await Quest.find();
  res.json(quests);
});

module.exports = router;
