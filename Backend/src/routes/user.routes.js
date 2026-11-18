
const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// Tất cả User API đều yêu cầu đăng nhập
router.use(authMiddleware);

// Chỉ Admin được quản lý User
router.use(roleMiddleware("admin"));

// 1. Lấy danh sách User
router.get("/", userController.getAllUsers);

// 2. Lấy chi tiết User
router.get("/:id", userController.getUserById);

// 3. Cập nhật User
router.put("/:id", userController.updateUser);

module.exports = router;
