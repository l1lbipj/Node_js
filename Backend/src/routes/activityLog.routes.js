const express = require("express");
const router = express.Router();

const activityLogController = require("../controllers/activityLog.controller");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// Tất cả ActivityLog API đều yêu cầu đăng nhập
router.use(authMiddleware);

// Chỉ Admin được xem ActivityLog
router.use(roleMiddleware("admin"));

// ========================================
// ADMIN ACTIVITY LOG MANAGEMENT
// ========================================

// 1. Lấy danh sách nhật ký hoạt động
router.get("/", activityLogController.getAllActivityLogs);

// 2. Lấy chi tiết nhật ký hoạt động
router.get("/:id", activityLogController.getActivityLogById);

module.exports = router;