require("dotenv").config({ path: "./.env" });
const mongoose = require("mongoose");


const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("❌ MONGO_URI is undefined! Check your .env file.");
    }

    console.log("✅ Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);


    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
