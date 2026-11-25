const express = require("express");
const router = express.Router();

const reportController = require("../controllers/report.controller");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// Tất cả Report API đều yêu cầu đăng nhập
router.use(authMiddleware);

// Publisher chỉ được xem các báo cáo liên quan đến sách của mình.
router.get("/publisher", roleMiddleware("publisher"), reportController.getPublisherReports);

// Chỉ Admin được quản lý Report
router.use(roleMiddleware("admin"));

// ========================================
// ADMIN REPORT MANAGEMENT
// ========================================

// 1. Lấy danh sách Report
router.get("/", reportController.getAllReports);

// 2. Lấy chi tiết Report
router.get("/:id", reportController.getReportById);

// 3. Cập nhật trạng thái Report
router.put("/:id", reportController.updateReportStatus);

module.exports = router;
