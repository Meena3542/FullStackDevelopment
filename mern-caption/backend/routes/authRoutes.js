//Routes decide which function to call based on the URL

const express = require("express");
const router = express.Router();
const auth = require("../controllers/authController");
router.post("/reset-password/:token", auth.resetPassword);

// routes
router.post("/register", auth.register);
router.post("/login", auth.login);      // → calls login function
router.post("/forgot-password", auth.forgotPassword);

module.exports = router;