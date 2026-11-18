const express = require("express");
const router = express.Router();

const commentController = require("../controllers/comment.Controller");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// Tất cả Comment API đều yêu cầu đăng nhập
router.use(authMiddleware);

// ========================================
// COMMENT MANAGEMENT
// ========================================

// 1. Tạo Comment / Reply
router.post("/", commentController.createComment);

// 2. Lấy danh sách Comment theo nội dung
router.get(
  "/target/:targetType/:targetId",
  commentController.getCommentsByTarget,
);

// 3. Báo cáo Comment
router.post("/:id/report", commentController.createCommentReport);

// ========================================
// ADMIN COMMENT MANAGEMENT
// ========================================

// 4. Admin lấy danh sách toàn bộ Comment
router.get(
  "/admin",
  roleMiddleware("admin"),
  commentController.getAllComments,
);

// 5. Admin xem chi tiết Comment
router.get(
  "/admin/:id",
  roleMiddleware("admin"),
  commentController.getAdminCommentById,
);

// 6. Admin xử lý báo cáo Comment
router.put(
  "/reports/:reportId",
  roleMiddleware("admin"),
  commentController.resolveCommentReport,
);

// ========================================
// COMMENT OPERATIONS
// ========================================

// 7. Lấy chi tiết Comment
router.get("/:id", commentController.getCommentById);

// 8. Cập nhật Comment
router.put("/:id", commentController.updateComment);

// 9. Xóa Comment
router.delete("/:id", commentController.deleteComment);

module.exports = router;