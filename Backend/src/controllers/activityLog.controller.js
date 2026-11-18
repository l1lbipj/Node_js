const mongoose = require("mongoose");
const ActivityLog = require("../models/activityLog.model");
const { successResponse, errorResponse } = require("../utils/apiResponse");

// ========================================
// ADMIN: LẤY DANH SÁCH ACTIVITY LOG
// ========================================
const getAllActivityLogs = async (req, res) => {
  try {
    const {
      search,
      action,
      entityType,
      userId,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};

    // Tìm kiếm theo description hoặc action
    if (search) {
      filter.$or = [
        { description: { $regex: search, $options: "i" } },
        { action: { $regex: search, $options: "i" } },
      ];
    }

    // Lọc theo action
    if (action) {
      filter.action = { $regex: action, $options: "i" };
    }

    // Lọc theo entityType
    if (entityType) {
      filter.entityType = entityType;
    }

    // Lọc theo userId
    if (userId) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return errorResponse(res, "User ID không hợp lệ", 400);
      }

      filter.userId = userId;
    }

    const currentPage = Math.max(1, Number(page));
    const currentLimit = Math.min(100, Math.max(1, Number(limit)));
    const skip = (currentPage - 1) * currentLimit;

    const [activityLogs, total] = await Promise.all([
      ActivityLog.find(filter)
        .populate("userId", "fullName email avatar role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(currentLimit),

      ActivityLog.countDocuments(filter),
    ]);

    return successResponse(res, "Lấy danh sách nhật ký hoạt động thành công", {
      activityLogs,
      pagination: {
        total,
        page: currentPage,
        limit: currentLimit,
        totalPages: Math.ceil(total / currentLimit),
      },
    });
  } catch (error) {
    console.error("Get All Activity Logs Error:", error);

    return errorResponse(
      res,
      "Không thể lấy danh sách nhật ký hoạt động",
      500
    );
  }
};

// ========================================
// ADMIN: LẤY CHI TIẾT ACTIVITY LOG
// ========================================
const getActivityLogById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, "Activity Log ID không hợp lệ", 400);
    }

    const activityLog = await ActivityLog.findById(id).populate(
      "userId",
      "fullName email avatar role"
    );

    if (!activityLog) {
      return errorResponse(res, "Không tìm thấy nhật ký hoạt động", 404);
    }

    return successResponse(
      res,
      "Lấy chi tiết nhật ký hoạt động thành công",
      activityLog
    );
  } catch (error) {
    console.error("Get Activity Log By ID Error:", error);

    return errorResponse(
      res,
      "Không thể lấy chi tiết nhật ký hoạt động",
      500
    );
  }
};

module.exports = {
  getAllActivityLogs,
  getActivityLogById,
};