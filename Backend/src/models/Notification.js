const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'NEW_SUBMISSION',
      'SUBMISSION_APPROVED',
      'SUBMISSION_REJECTED',
      'COINS_EARNED',
      'QUEST_COMPLETED',
      'LOGIN'
    ],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  coins: {
    type: Number,
    default: 0
  },
  read: {
    type: Boolean,
    default: false
  },
  data: {
    questId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quest'
    },
    submissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission'
    },
    seekerName: String,
    videoDemo: String,
    githubLink: String,
    description: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema); 