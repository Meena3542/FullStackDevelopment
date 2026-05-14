//Models define the structure of data stored in MongoDB.

const mongoose = require("mongoose");

const captionSchema = new mongoose.Schema({
  userId: String,
  image: String,
  caption: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Caption", captionSchema);