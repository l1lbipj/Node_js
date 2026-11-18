const express = require("express");
const router = express.Router();

const forumTopicController = require("../controllers/forumTopic.controller");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// Tất cả ForumTopic API đều yêu cầu đăng nhập
router.use(authMiddleware);

// Chỉ Admin được quản lý ForumTopic
router.use(roleMiddleware("admin"));

// ========================================
// ADMIN FORUM TOPIC MANAGEMENT
// ========================================

// 1. Lấy danh sách ForumTopic
router.get("/", forumTopicController.getAllForumTopics);

// 2. Lấy chi tiết ForumTopic
router.get("/:id", forumTopicController.getForumTopicById);

// 3. Xóa ForumTopic
router.delete("/:id", forumTopicController.deleteForumTopic);

module.exports = router;