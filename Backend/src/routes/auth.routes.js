const express = require("express");
const router = express.Router();

const {
  register,
  login,
  logout,
  redirectToGoogle,
  googleCallback,
  getMe,
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
router.get("/me", authMiddleware, getMe);
router.post("/logout", authMiddleware, logout);

module.exports = router;
