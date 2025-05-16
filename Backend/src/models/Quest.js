const mongoose = require("mongoose");

const QuestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  companyLogo: String,
  description: { type: String, required: true },
  requirements: [String],
  skills: [String],
  deadline: { type: Date, required: true },
  compensation: String,
  location: { type: String, required: true },
  remote: { type: Boolean, required: true },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  postedAt: { type: Date, default: Date.now },
  applicants: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model("Quest", QuestSchema);
