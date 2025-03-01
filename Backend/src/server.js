const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const questRoutes = require("./routes/questRoutes"); 
const userRoutes = require("./routes/userRoutes");
const submissionRoutes = require("./routes/submissionRoutes");


require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

console.log("MONGO_URI:", process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

  app.use((req, res, next) => {
    res.setHeader("Content-Type", "application/json");
    next();
  });
  

app.use("/api/users", require("./routes/userRoutes"));
// console.log("Loading quest routes...");
app.use("/api/quests", questRoutes);
  
app.use("/api/submissions", submissionRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
