const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  issuer: {
    type: String,
    required: true
  },
  dateIssued: {
    type: Date,
    required: true
  },
  skills: [{
    type: String
  }],
  fileUrl: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Certificate', certificateSchema); 