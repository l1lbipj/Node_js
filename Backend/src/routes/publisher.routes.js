const express = require("express");
const router = express.Router();

const publisherController = require("../controllers/publisher.controller");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// Tất cả Publisher API đều yêu cầu đăng nhập
router.use(authMiddleware);

// Chỉ Admin được quản lý Publisher
router.use(roleMiddleware("admin"));

// 1. Lấy danh sách Publisher
router.get("/", publisherController.getAllPublishers);

// 2. Lấy chi tiết Publisher
router.get("/:id", publisherController.getPublisherById);

// 3. Tạo Publisher
router.post("/", publisherController.createPublisher);

// 4. Cập nhật Publisher
router.put("/:id", publisherController.updatePublisher);

// 5. Xóa Publisher
router.delete("/:id", publisherController.deletePublisher);

module.exports = router;