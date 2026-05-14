const express = require("express");
const router = express.Router();
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const jwt = require("jsonwebtoken");

//  Import model
const Caption = require("../models/Caption");

const upload = multer({ dest: "uploads/" });

//  ADMIN MIDDLEWARE 
// Checks JWT token and verifies role is "admin"
function adminOnly(req, res, next) {
  try {
    const token = req.headers["authorization"];

    if (!token) {
      return res.status(403).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, "secret123");

    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    req.user = decoded; // attach user info to request
    next();

  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
}

// GENERATE + SAVE CAPTION 
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const formData = new FormData();
    formData.append("image", fs.createReadStream(req.file.path));

    const response = await axios.post(
      "http://localhost:8000/caption",
      formData,
      { headers: formData.getHeaders() }
    );

    const captionText = response.data.caption;

    const userId = req.body.userId;
    console.log("USER ID:", userId);

    //  Save only if user is logged in (not guest)
    if (userId) {
      await Caption.create({
        userId: userId,
        image: req.file.filename,
        caption: captionText
      });
    }

    res.json({ caption: captionText });

  } catch (error) {
    console.log("ERROR:", error.message);
    res.status(500).json({ message: "Error generating caption" });
  }
});

//  GET HISTORY 
router.get("/history/:userId", async (req, res) => {
  try {
    const captions = await Caption.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });

    res.json(captions);

  } catch (error) {
    console.log("ERROR:", error.message);
    res.status(500).json({ message: "Error fetching history" });
  }
});

//  GET ALL CAPTIONS (Admin only) 
router.get("/all", adminOnly, async (req, res) => {
  try {
    const captions = await Caption.find().sort({ createdAt: -1 });
    res.json(captions);
  } catch (error) {
    console.log("ERROR:", error.message);
    res.status(500).json({ message: "Error fetching all captions" });
  }
});

//  DELETE CAPTION (Admin only) 
router.delete("/:id", adminOnly, async (req, res) => {
  try {
    const caption = await Caption.findByIdAndDelete(req.params.id);

    if (!caption) {
      return res.status(404).json({ message: "Caption not found" });
    }

    res.json({ message: "Caption deleted successfully" });

  } catch (error) {
    console.log("ERROR:", error.message);
    res.status(500).json({ message: "Error deleting caption" });
  }
});

module.exports = router;