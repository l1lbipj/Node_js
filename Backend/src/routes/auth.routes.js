const express = require("express");
const router = express.Router();

const {
  register,
  login,
  logout,
  redirectToGoogle,
  googleCallback,
} = require("../controllers/auth.Controller");

const authMiddleware = require("../middlewares/authMiddleware");

// Public Routes
router.post("/register", register);
router.post("/login", login);

// Google OAuth Routes
router.get("/google", redirectToGoogle);
router.get("/google/callback", googleCallback);

// Protected Routes
router.post("/logout", authMiddleware, logout);

module.exports = router;
