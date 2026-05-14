// It does 3 things:
// 1. Connects to MongoDB
// 2. Registers all routes
// 3. Starts listening on port 5000

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors"); //Which frontend can access your backend API

const authRoutes = require("./routes/authRoutes");
const captionRoutes = require("./routes/captionRoutes");

const app = express();

app.use(express.json());
app.use(cors());
require("dotenv").config();
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/caption", captionRoutes);

// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/mern-caption")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Test route
app.get("/", (req, res) => {
  res.send("API Running");
});

// Start server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});