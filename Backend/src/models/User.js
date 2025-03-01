const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  role: { type: String, enum: ["hirer", "job-seeker"], required: true },
  profilePicture: String,
  title: String,
  company: String,
  skills: [String],
  interests: [String],
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
