// what happens when a route is called

const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");




//  FORGOT PASSWORD 
const nodemailer = require("nodemailer");
const crypto = require("crypto");

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No account found with that email" });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 1000 * 60 * 60; // 1 hour from now

    // Save token to user (you need these fields in your User model)
    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    // Send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,   // your Gmail
        pass: process.env.EMAIL_PASS,   // your Gmail app password
      },
    });

    const resetLink = `http://localhost:3000/reset-password/${resetToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      html: `
        <h2>Password Reset</h2>
        <p>Click the link below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetLink}">${resetLink}</a>
      `,
    });

    res.json({ message: "Reset email sent successfully" });

  } catch (err) {
    console.log("FORGOT PASSWORD ERROR:", err.message);
    res.status(500).json({ message: "Failed to send reset email" });
  }
};





//  REGISTER 
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: "user",
      isVerified: true
    });

    res.json({
      message: "Registration successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.log("REGISTER ERROR:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};


// RESET PASSWORD 
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Find user with valid token
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }, // token not expired
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset link" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });

  } catch (err) {
    console.log("RESET PASSWORD ERROR:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};


//  LOGIN 
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ message: "User not found" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ message: "Wrong password" });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      "secret123"
    );

    //  IMPORTANT FIX: SEND userId
    res.json({
      message: "Login successful",
      token,
      role: user.role,
      username: user.username,
      userId: user._id   
    });

  } catch (err) {
    console.log("LOGIN ERROR:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};