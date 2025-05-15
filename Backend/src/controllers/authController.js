const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.signup = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      skills,
      interests,
      profilePicture,
      title,
      company,
    } = req.body;

    // Basic validation
    if (!name || !email || !password || !role) {
      return res
        .status(400)
        .json({ message: "name, email, password & role are required." });
    }

    // Check for existing user
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: "User already exists." });
    }

    // Create user — let schema hook hash the password
    const newUser = new User({
      name,
      email,
      password,                // plain-text goes here
      role,
      profilePicture,
      title,
      company,
      skills: role === "job-seeker" ? skills || [] : [],
      interests: role === "job-seeker" ? interests || [] : [],
    });

    await newUser.save();

    // Issue JWT
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Remove password hash before sending back
    const userToReturn = newUser.toObject();
    delete userToReturn.password;

    res.status(201).json({
      message: "User registered successfully.",
      token,
      user: userToReturn,
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const userToReturn = user.toObject();
    delete userToReturn.password;

    res.status(200).json({
      message: "Login successful",
      token,
      user: userToReturn,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};
