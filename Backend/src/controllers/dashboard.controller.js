const User = require("../models/user.model");
const Book = require("../models/book.model");
const Review = require("../models/review.model");
const Comment = require("../models/comment.model");
const Publisher = require("../models/publisher.model");
const ForumTopic = require("../models/forumTopic.model");
const Report = require("../models/report.model");
const ActivityLog = require("../models/activityLog.model");

const { successResponse, errorResponse } = require("../utils/apiResponse");

// ========================================
// ADMIN DASHBOARD STATISTICS
// ========================================
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalBooks,
      totalReviews,
      totalComments,
      totalPublishers,
      totalForumTopics,
      totalReports,
      averageRating,
      usersByRole,
      reportsByStatus,
      recentActivityLogs,
    ] = await Promise.all([
      // 1. Tổng số Users
      User.countDocuments(),

      // 2. Tổng số Books
      Book.countDocuments(),

      // 3. Tổng số Reviews
      Review.countDocuments(),

      // 4. Tổng số Comments
      Comment.countDocuments(),

      // 5. Tổng số Publishers
      Publisher.countDocuments(),

      // 6. Tổng số Forum Topics
      ForumTopic.countDocuments(),

      // 7. Tổng số Reports
      Report.countDocuments(),

      // 8. Rating trung bình của tất cả Reviews
      Review.aggregate([
        {
          $group: {
            _id: null,
            averageRating: { $avg: "$rating" },
          },
        },
      ]),

      // 9. Thống kê Users theo Role
      User.aggregate([
        {
          $group: {
            _id: "$role",
            total: { $sum: 1 },
          },
        },
      ]),

      // 10. Thống kê Reports theo Status
      Report.aggregate([
        {
          $group: {
            _id: "$status",
            total: { $sum: 1 },
          },
        },
      ]),

      // 11. 10 hoạt động gần nhất
      ActivityLog.find()
        .populate("userId", "fullName email avatar role")
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    // Chuyển Users theo Role thành Object
    const userRoleStats = {
      admin: 0,
      reader: 0,
      publisher: 0,
    };

    usersByRole.forEach((item) => {
      userRoleStats[item._id] = item.total;
    });

    // Chuyển Reports theo Status thành Object
    const reportStatusStats = {
      pending: 0,
      resolved: 0,
      rejected: 0,
    };

    reportsByStatus.forEach((item) => {
      reportStatusStats[item._id] = item.total;
    });

    // Rating trung bình
    const avgRating =
      averageRating.length > 0 && averageRating[0].averageRating != null
        ? Number(averageRating[0].averageRating.toFixed(2))
        : 0;
    const dashboardStats = {
      overview: {
        totalUsers,
        totalBooks,
        totalReviews,
        totalComments,
        totalPublishers,
        totalForumTopics,
        totalReports,
        averageRating: avgRating,
      },

      users: {
        total: totalUsers,
        byRole: userRoleStats,
      },

      reports: {
        total: totalReports,
        byStatus: reportStatusStats,
        pending: reportStatusStats.pending,
      },

      recentActivityLogs,
    };

    return successResponse(
      res,
      "Lấy thống kê Dashboard thành công",
      dashboardStats
    );
  } catch (error) {
    console.error("Get Dashboard Stats Error:", error);

    return errorResponse(
      res,
      "Không thể lấy dữ liệu thống kê Dashboard",
      500
    );
  }
};

module.exports = {
  getDashboardStats,
};