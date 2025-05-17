const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { initializeWebSocket } = require('./websocket/questWebSocket');
const questRoutes = require('./routes/questRoutes');

const app = express();
const server = http.createServer(app);

// Initialize WebSocket
initializeWebSocket(server);

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/questify', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/quests', questRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 