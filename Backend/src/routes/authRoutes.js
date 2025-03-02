const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

const router = express.Router();

// Signup Route
router.post("/signup", async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        console.log("🔍 Received in backend:", { name, email, password, role });

        if (!role || !["hirer", "job-seeker"].includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }
        let user = await User.findOne({ email });

        if (user) return res.status(400).json({ message: "User already exists" });

        

        // Save user
        user = new User({ name, email, password, role }); 
        await user.save();

        // Generate JWT Token
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.status(201).json({ token, user });

    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});

// Login Route
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ message: "Invalid Credentials" });

        // Compare hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid Credentials" });

        // Generate JWT Token
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.status(200).json({ token, user });

    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
