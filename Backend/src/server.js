const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const questRoutes = require("./routes/questRoutes"); 

require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

console.log("MONGO_URI:", process.env.MONGO_URI);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));
// Routes (To be created)

app.use("/api/users", require("./routes/userRoutes"));
console.log("Loading quest routes...");
app.use("/api/quests", questRoutes);
  
app.use("/api/submissions", require("./routes/submissionRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
