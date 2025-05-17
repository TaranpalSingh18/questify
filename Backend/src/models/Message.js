const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Sender ID is required'],
    index: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Receiver ID is required'],
    index: true
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  }
}, { 
  timestamps: true,
  collection: 'messages' // Explicitly set collection name
});

// Create compound index for faster queries
messageSchema.index({ sender: 1, receiver: 1, timestamp: -1 });

// Add a method to verify message data
messageSchema.methods.verifyData = function() {
  console.log('Verifying message data:', {
    sender: this.sender,
    receiver: this.receiver,
    content: this.content,
    timestamp: this.timestamp
  });
  return this.sender && this.receiver && this.content;
};

const Message = mongoose.model('Message', messageSchema);

// Log when the model is created
console.log('Message model initialized');

module.exports = Message; 