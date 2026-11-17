const express = require("express");
const router = express.Router();
const commentController = require("../controllers/comment.controller");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// Tất cả Comment API đều yêu cầu đăng nhập
router.use(authMiddleware);

// 1. Tạo Comment / Reply
router.post("/", commentController.createComment);

// 2. Lấy danh sách Comment theo nội dung
router.get(
  "/target/:targetType/:targetId",
  commentController.getCommentsByTarget,
);

// 3. Báo cáo Comment
router.post("/:id/report", commentController.createCommentReport);

// 4. Admin xử lý báo cáo
router.put(
  "/reports/:reportId",
  roleMiddleware("admin"),
  commentController.resolveCommentReport,
);

// 5. Lấy chi tiết Comment
router.get("/:id", commentController.getCommentById);

// 6. Cập nhật Comment
router.put("/:id", commentController.updateComment);

// 7. Xóa Comment
router.delete("/:id", commentController.deleteComment);

module.exports = router;
