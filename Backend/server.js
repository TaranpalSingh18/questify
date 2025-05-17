require("dotenv").config({ path: "./.env" });
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db"); // Import database connection
const { initializeWebSocket } = require('./src/utils/chatWebSocket');
const http = require('http');
const jwt = require('jsonwebtoken');

// Initialize Express App
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Connect to MongoDB
connectDB();
console.log("✅ MONGO_URI:", process.env.MONGO_URI); // Debugging

// Routes
app.use("/api/users", require("./src/routes/userRoutes"));
app.use("/api/quests", require("./src/routes/questRoutes"));
app.use("/api/submissions", require("./src/routes/submissionRoutes"));
app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api/coins", require("./src/routes/coinRoutes"));
app.use("/api/messages", require("./src/routes/messageRoutes"));

const notificationRoutes = require('./routes/notifications');
app.use('/api/notifications', notificationRoutes);

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket server
console.log('Setting up WebSocket server...');
initializeWebSocket(server);

// WebSocket server setup
const WebSocket = require('ws');
const wss = new WebSocket.Server({ server });

// Store active connections
const clients = new Map();

wss.on('connection', (ws) => {
  console.log('New WebSocket connection');

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);

      if (data.type === 'auth') {
        // Verify token and store connection
        const decoded = jwt.verify(data.token, process.env.JWT_SECRET);
        clients.set(decoded.id, ws);
        ws.userId = decoded.id;
      } else if (data.type === 'message') {
        // Handle chat messages
        // ... existing chat message handling code ...
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });

  ws.on('close', () => {
    if (ws.userId) {
      clients.delete(ws.userId);
    }
  });
});

// Function to send notification to a specific user
const sendNotification = async (userId, notification) => {
  const client = clients.get(userId);
  if (client && client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify({
      type: 'notification',
      notification
    }));
  }
};

// Export the sendNotification function
module.exports = { sendNotification };

// Start Server
const PORT = process.env.PORT || 5002;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log('WebSocket server should be initialized');
});
