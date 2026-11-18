
const mongoose = require("mongoose");
const User = require("../models/user.model");
const { successResponse, errorResponse } = require("../utils/apiResponse");

// Escape ký tự đặc biệt trong Regular Expression
const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// 1. Lấy danh sách User
const getAllUsers = async (req, res, next) => {
  try {
    const {
      search = "",
      role,
      status,
      page = 1,
      limit = 10,
    } = req.query;

    // Kiểm tra page và limit
    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    if (
      !Number.isInteger(pageNumber) ||
      pageNumber < 1 ||
      !Number.isInteger(limitNumber) ||
      limitNumber < 1 ||
      limitNumber > 100
    ) {
      return errorResponse(res, "Page hoặc limit không hợp lệ", 400);
    }

    // Kiểm tra role
    const allowedRoles = ["admin", "reader", "publisher"];

    if (role && !allowedRoles.includes(role)) {
      return errorResponse(res, "Role không hợp lệ", 400);
    }

    // Kiểm tra status
    const allowedStatuses = ["active", "inactive"];

    if (status && !allowedStatuses.includes(status)) {
      return errorResponse(res, "Status không hợp lệ", 400);
    }

    // Xây dựng điều kiện tìm kiếm
    const filter = {};

    if (search.trim()) {
      const searchRegex = new RegExp(
        escapeRegex(search.trim()),
        "i",
      );

      filter.$or = [
        { fullName: searchRegex },
        { email: searchRegex },
      ];
    }

    if (role) {
      filter.role = role;
    }

    if (status) {
      filter.status = status;
    }

    // Tính toán phân trang
    const skip = (pageNumber - 1) * limitNumber;

    // Lấy danh sách User
    const [users, totalUsers] = await Promise.all([
      User.find(filter)
        .select("-password -googleId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber),

      User.countDocuments(filter),
    ]);

    return successResponse(
      res,
      "Lấy danh sách người dùng thành công",
      {
        users,
        pagination: {
          totalUsers,
          currentPage: pageNumber,
          totalPages: Math.ceil(totalUsers / limitNumber),
          limit: limitNumber,
        },
      },
    );
  } catch (error) {
    next(error);
  }
};

// 2. Lấy chi tiết User
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Kiểm tra ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, "User ID không hợp lệ", 400);
    }

    const user = await User.findById(id).select("-password -googleId");

    if (!user) {
      return errorResponse(res, "Không tìm thấy người dùng", 404);
    }

    return successResponse(
      res,
      "Lấy thông tin người dùng thành công",
      user,
    );
  } catch (error) {
    next(error);
  }
};

// 3. Cập nhật User

const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { fullName, role, status, avatar } = req.body;

    // Kiểm tra ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, "User ID không hợp lệ", 400);
    }

    const user = await User.findById(id);

    if (!user) {
      return errorResponse(res, "Không tìm thấy người dùng", 404);
    }

    const isSelf = user._id.toString() === req.user._id.toString();

    // Lưu trạng thái ban đầu
    const wasActiveAdmin =
      user.role === "admin" && user.status === "active";

    // Admin không được tự thay đổi role hoặc status
    if (isSelf && (role !== undefined || status !== undefined)) {
      return errorResponse(
        res,
        "Bạn không được tự thay đổi Role hoặc Status của mình",
        403,
      );
    }

    // Kiểm tra fullName
    if (fullName !== undefined) {
      if (typeof fullName !== "string" || !fullName.trim()) {
        return errorResponse(
          res,
          "FullName không được để trống",
          400,
        );
      }

      user.fullName = fullName.trim();
    }

    // Kiểm tra role
    if (role !== undefined) {
      const allowedRoles = ["admin", "reader", "publisher"];

      if (!allowedRoles.includes(role)) {
        return errorResponse(res, "Role không hợp lệ", 400);
      }

      user.role = role;
    }

    // Kiểm tra status
    if (status !== undefined) {
      const allowedStatuses = ["active", "inactive"];

      if (!allowedStatuses.includes(status)) {
        return errorResponse(res, "Status không hợp lệ", 400);
      }

      user.status = status;
    }

    // Kiểm tra avatar
    if (avatar !== undefined) {
      if (avatar !== null && typeof avatar !== "string") {
        return errorResponse(res, "Avatar không hợp lệ", 400);
      }

      user.avatar = avatar;
    }

    // Bảo vệ Admin cuối cùng đang hoạt động
    const isRemovingAdmin =
      role !== undefined && role !== "admin";

    const isDeactivatingAdmin =
      status !== undefined && status !== "active";

    if (
      wasActiveAdmin &&
      (isRemovingAdmin || isDeactivatingAdmin)
    ) {
      const activeAdminCount = await User.countDocuments({
        role: "admin",
        status: "active",
      });

      if (activeAdminCount <= 1) {
        return errorResponse(
          res,
          "Không thể vô hiệu hóa hoặc hạ quyền Admin cuối cùng",
          400,
        );
      }
    }

    await user.save();

    const userData = user.toObject();

    delete userData.password;
    delete userData.googleId;

    return successResponse(
      res,
      "Cập nhật người dùng thành công",
      userData,
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
};
