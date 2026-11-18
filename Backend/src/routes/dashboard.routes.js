const express = require("express");
const router = express.Router();

const dashboardController = require("../controllers/dashboard.controller");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// Tất cả Dashboard API đều yêu cầu đăng nhập
router.use(authMiddleware);

// Chỉ Admin được truy cập Dashboard
router.use(roleMiddleware("admin"));

// Lấy thống kê tổng quan Dashboard
router.get("/stats", dashboardController.getDashboardStats);

module.exports = router;