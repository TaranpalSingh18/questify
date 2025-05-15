require("dotenv").config({ path: "./.env" });
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db"); // Import database connection


// Initialize Express App
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
connectDB();
console.log("✅ MONGO_URI:", process.env.MONGO_URI); // Debugging

// Routes
app.use("/api/users", require("./src/routes/userRoutes"));
app.use("/api/quests", require("./src/routes/questRoutes"));
app.use("/api/submissions", require("./src/routes/submissionRoutes"));
app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api/coins", require("./src/routes/coinRoutes"));
// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
