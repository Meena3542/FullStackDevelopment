//Models define the structure of data stored in MongoDB.

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: "user" },
  isVerified: { type: Boolean, default: true },
  verificationToken: String,
  resetToken: { type: String },
  resetTokenExpiry: { type: Date },
});

module.exports = mongoose.model("User", userSchema);

