
const mongoose = require("mongoose");
const ActivityLog = require("../models/activityLog.model");
const { successResponse, errorResponse } = require("../utils/apiResponse");

// ========================================
// HELPER: ESCAPE REGEX
// ========================================
const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// ========================================
// ADMIN: LẤY DANH SÁCH ACTIVITY LOG
// ========================================
const getAllActivityLogs = async (req, res, next) => {
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
    if (typeof search === "string" && search.trim()) {
      const keyword = escapeRegex(search.trim());

      filter.$or = [
        {
          description: {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          action: {
            $regex: keyword,
            $options: "i",
          },
        },
      ];
    }

    // Lọc theo action
    if (typeof action === "string" && action.trim()) {
      filter.action = {
        $regex: escapeRegex(action.trim()),
        $options: "i",
      };
    }

    // Lọc theo entityType
    if (typeof entityType === "string" && entityType.trim()) {
      filter.entityType = entityType.trim();
    }

    // Lọc theo userId
    if (userId) {
      if (
        typeof userId !== "string" ||
        !mongoose.Types.ObjectId.isValid(userId)
      ) {
        return errorResponse(
          res,
          "User ID không hợp lệ",
          400
        );
      }

      filter.userId = userId;
    }

    // Phân trang
    const currentPage = Math.max(
      parseInt(page, 10) || 1,
      1
    );

    const currentLimit = Math.min(
      Math.max(parseInt(limit, 10) || 20, 1),
      100
    );

    const skip = (currentPage - 1) * currentLimit;

    // Truy vấn danh sách và tổng số bản ghi
    const [activityLogs, total] = await Promise.all([
      ActivityLog.find(filter)
        .populate("userId", "fullName email avatar role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(currentLimit)
        .lean(),

      ActivityLog.countDocuments(filter),
    ]);

    return successResponse(
      res,
      "Lấy danh sách nhật ký hoạt động thành công",
      {
        activityLogs,
        pagination: {
          total,
          page: currentPage,
          limit: currentLimit,
          totalPages: Math.ceil(total / currentLimit),
        },
      }
    );
  } catch (error) {
    console.error("Get All Activity Logs Error:", error);
    next(error);
  }
};

// ========================================
// ADMIN: LẤY CHI TIẾT ACTIVITY LOG
// ========================================
const getActivityLogById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Kiểm tra ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(
        res,
        "Activity Log ID không hợp lệ",
        400
      );
    }

    // Tìm nhật ký
    const activityLog = await ActivityLog.findById(id)
      .populate("userId", "fullName email avatar role")
      .lean();

    if (!activityLog) {
      return errorResponse(
        res,
        "Không tìm thấy nhật ký hoạt động",
        404
      );
    }

    return successResponse(
      res,
      "Lấy chi tiết nhật ký hoạt động thành công",
      activityLog
    );
  } catch (error) {
    console.error("Get Activity Log By ID Error:", error);
    next(error);
  }
};

module.exports = {
  getAllActivityLogs,
  getActivityLogById,
};
