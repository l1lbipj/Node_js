const mongoose = require("mongoose");
const Report = require("../models/report.model");
const Publisher = require("../models/publisher.model");
const Book = require("../models/book.model");
const Review = require("../models/review.model");
const Comment = require("../models/comment.model");
const { successResponse, errorResponse } = require("../utils/apiResponse");


// Publisher xem các báo cáo liên quan tới review/bình luận trên sách của mình.
const getPublisherReports = async (req, res, next) => {
  try {
    const publisher = await Publisher.findOne({ userId: req.user._id });
    if (!publisher) return errorResponse(res, "Tài khoản chưa có hồ sơ Publisher", 404);
    const books = await Book.find({ publisherId: publisher._id }).select("_id");
    const bookIds = books.map((book) => book._id);
    const reviews = await Review.find({ bookId: { $in: bookIds } }).select("_id");
    const reviewIds = reviews.map((review) => review._id);
    const comments = await Comment.find({ targetType: "Review", targetId: { $in: reviewIds } }).select("_id");
    const commentIds = comments.map((comment) => comment._id);
    const reports = await Report.find({ $or: [
      { targetType: "Review", targetId: { $in: reviewIds } },
      { targetType: "Comment", targetId: { $in: commentIds } },
    ]})
      .populate("userId", "fullName email avatar role")
      .populate("adminId", "fullName email role")
      .populate("targetId")
      .sort({ createdAt: -1 });
    return successResponse(res, "Lấy báo cáo liên quan đến sách thành công", { reports, totalReports: reports.length });
  } catch (error) { next(error); }
};

// ========================================
// ADMIN REPORT MANAGEMENT
// ========================================

// Admin lấy danh sách Report
const getAllReports = async (req, res, next) => {
  try {
    const {
      search,
      status,
      targetType,
      userId,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};

    // Tìm kiếm theo lý do báo cáo
    if (search) {
      filter.reason = {
        $regex: search.trim(),
        $options: "i",
      };
    }

    // Lọc theo trạng thái
    if (status) {
      if (!["pending", "resolved", "rejected"].includes(status)) {
        return errorResponse(
          res,
          "Trạng thái Report không hợp lệ",
          400,
        );
      }

      filter.status = status;
    }

    // Lọc theo loại nội dung
    if (targetType) {
      if (!["Review", "ForumTopic", "Comment"].includes(targetType)) {
        return errorResponse(
          res,
          "Loại nội dung Report không hợp lệ",
          400,
        );
      }

      filter.targetType = targetType;
    }

    // Lọc theo người gửi báo cáo
    if (userId) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return errorResponse(res, "userId không hợp lệ", 400);
      }

      filter.userId = userId;
    }

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);

    const limitNumber = Math.min(
      Math.max(parseInt(limit, 10) || 10, 1),
      100,
    );

    const skip = (pageNumber - 1) * limitNumber;

    const [reports, totalReports] = await Promise.all([
      Report.find(filter)
        .populate("userId", "fullName email avatar")
        .populate("adminId", "fullName email")
        .populate("targetId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber),

      Report.countDocuments(filter),
    ]);

    return successResponse(
      res,
      "Lấy danh sách Report thành công",
      {
        reports,
        pagination: {
          totalReports,
          currentPage: pageNumber,
          totalPages: Math.ceil(totalReports / limitNumber),
          limit: limitNumber,
        },
      },
    );
  } catch (error) {
    next(error);
  }
};

// Admin xem chi tiết Report
const getReportById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, "Report ID không hợp lệ", 400);
    }

    const report = await Report.findById(id)
      .populate("userId", "fullName email avatar role")
      .populate("adminId", "fullName email role")
      .populate("targetId");

    if (!report) {
      return errorResponse(res, "Không tìm thấy Report", 404);
    }

    return successResponse(
      res,
      "Lấy thông tin Report thành công",
      report,
    );
  } catch (error) {
    next(error);
  }
};

// Admin cập nhật trạng thái Report
const updateReportStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, "Report ID không hợp lệ", 400);
    }

    if (!["resolved", "rejected"].includes(status)) {
      return errorResponse(
        res,
        "Trạng thái xử lý Report không hợp lệ",
        400,
      );
    }

    const report = await Report.findById(id);

    if (!report) {
      return errorResponse(res, "Không tìm thấy Report", 404);
    }

    // Không cho xử lý Report đã được xử lý trước đó
    if (report.status !== "pending") {
      return errorResponse(
        res,
        "Report này đã được xử lý",
        400,
      );
    }

    report.status = status;
    report.adminId = req.user._id;

    await report.save();

    await report.populate([
      { path: "userId", select: "fullName email avatar" },
      { path: "adminId", select: "fullName email" },
      { path: "targetId" },
    ]);

    return successResponse(
      res,
      status === "resolved"
        ? "Đã xác nhận Report"
        : "Đã từ chối Report",
      report,
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublisherReports,
  getAllReports,
  getReportById,
  updateReportStatus,
};