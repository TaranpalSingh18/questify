require("dotenv").config({ path: "./.env" });
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db"); // Import database connection
const { initializeWebSocket, getWebSocketServer } = require('./src/utils/chatWebSocket');
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

// Import routes
const userRoutes = require("./src/routes/userRoutes");
const questRoutes = require("./src/routes/questRoutes");
const submissionRoutes = require("./src/routes/submissionRoutes");
const authRoutes = require("./src/routes/authRoutes");
const coinRoutes = require("./src/routes/coinRoutes");
const messageRoutes = require("./src/routes/messageRoutes");
const notificationRoutes = require("./src/routes/notifications");

// Use routes
app.use("/api/users", userRoutes);
app.use("/api/quests", questRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/coins", coinRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket server
console.log('Setting up WebSocket server...');
initializeWebSocket(server);

// Function to send notification to a specific user
const sendNotification = async (userId, notification) => {
  const wss = getWebSocketServer();
  wss.clients.forEach((client) => {
    if (client.userId === userId && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'notification',
        notification
      }));
    }
  });
};

// Export the sendNotification function
module.exports = { sendNotification };

// Start Server
const PORT = process.env.PORT || 5002;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log('WebSocket server should be initialized');
});
