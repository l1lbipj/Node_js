const express = require("express");
const router = express.Router();

const reviewController = require("../controllers/review.Controller");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// Tất cả Review API đều yêu cầu đăng nhập
router.use(authMiddleware);

// 1. Tạo đánh giá
router.post("/", reviewController.createReview);

// 2. Lấy danh sách đánh giá theo sách
router.get("/book/:bookId", reviewController.getReviewsByBook);

// ========================================
// ADMIN REVIEW MANAGEMENT
// ========================================

// Chỉ Admin được quản lý toàn bộ Review
router.get(
  "/admin",
  roleMiddleware("admin"),
  reviewController.getAllReviews
);

router.get(
  "/admin/:id",
  roleMiddleware("admin"),
  reviewController.getAdminReviewById
);

// ========================================
// REVIEW MANAGEMENT
// ========================================

// 3. Lấy chi tiết đánh giá
router.get("/:id", reviewController.getReviewById);

// 4. Cập nhật đánh giá
router.put("/:id", reviewController.updateReview);

// 5. Xóa đánh giá
router.delete("/:id", reviewController.deleteReview);

module.exports = router;