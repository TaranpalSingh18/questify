const mongoose = require("mongoose");

const SubmissionSchema = new mongoose.Schema({
  questId: { type: mongoose.Schema.Types.ObjectId, ref: "Quest", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  videoDemo: { type: String, required: true },
  githubLink: { type: String, required: true },
  description: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
}, { timestamps: true });

module.exports = mongoose.model("Submission", SubmissionSchema);
