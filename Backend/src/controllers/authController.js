const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

exports.signup = async (req, res) => {
  try {
    const { name, email, password, role, skills, domainsOfInterest } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user object
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      skills: role === "job_seeker" ? skills : [],
      domainsOfInterest: role === "job_seeker" ? domainsOfInterest : [],
    });

    // Save to database
    await newUser.save();

    // Generate JWT token
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({ message: "User registered successfully.", token, user: newUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
