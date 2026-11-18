const mongoose = require("mongoose");
const ForumTopic = require("../models/forumTopic.model");
const Comment = require("../models/comment.model");
const { successResponse, errorResponse } = require("../utils/apiResponse");

// ========================================
// ADMIN FORUM TOPIC MANAGEMENT
// ========================================

// Admin lấy danh sách ForumTopic
const getAllForumTopics = async (req, res, next) => {
  try {
    const {
      search,
      category,
      userId,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};

    // Tìm kiếm theo tiêu đề hoặc nội dung
    if (search) {
      filter.$or = [
        {
          title: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          content: {
            $regex: search.trim(),
            $options: "i",
          },
        },
      ];
    }

    // Lọc theo danh mục
    if (category) {
      const validCategories = [
        "Discussion",
        "Recommendation",
        "Question",
        "Other",
      ];

      if (!validCategories.includes(category)) {
        return errorResponse(
          res,
          "Danh mục ForumTopic không hợp lệ",
          400,
        );
      }

      filter.category = category;
    }

    // Lọc theo người tạo
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

    const [forumTopics, totalForumTopics] = await Promise.all([
      ForumTopic.find(filter)
        .populate("userId", "fullName email avatar role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber),

      ForumTopic.countDocuments(filter),
    ]);

    return successResponse(
      res,
      "Lấy danh sách ForumTopic thành công",
      {
        forumTopics,
        pagination: {
          totalForumTopics,
          currentPage: pageNumber,
          totalPages: Math.ceil(totalForumTopics / limitNumber),
          limit: limitNumber,
        },
      },
    );
  } catch (error) {
    next(error);
  }
};

// Admin xem chi tiết ForumTopic
const getForumTopicById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, "ForumTopic ID không hợp lệ", 400);
    }

    const forumTopic = await ForumTopic.findById(id).populate(
      "userId",
      "fullName email avatar role",
    );

    if (!forumTopic) {
      return errorResponse(res, "Không tìm thấy ForumTopic", 404);
    }

    return successResponse(
      res,
      "Lấy thông tin ForumTopic thành công",
      forumTopic,
    );
  } catch (error) {
    next(error);
  }
};

// Admin xóa ForumTopic
const deleteForumTopic = async (req, res, next) => {
  let session;

  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, "ForumTopic ID không hợp lệ", 400);
    }

    const forumTopic = await ForumTopic.findById(id);

    if (!forumTopic) {
      return errorResponse(res, "Không tìm thấy ForumTopic", 404);
    }

    session = await mongoose.startSession();

    await session.withTransaction(async () => {
      // Xóa toàn bộ Comment thuộc ForumTopic
      await Comment.deleteMany(
        {
          targetType: "ForumTopic",
          targetId: forumTopic._id,
        },
        { session },
      );

      // Xóa ForumTopic
      await ForumTopic.deleteOne(
        {
          _id: forumTopic._id,
        },
        { session },
      );
    });

    return successResponse(
      res,
      "Xóa ForumTopic và toàn bộ Comment thành công",
      {
        id,
      },
    );
  } catch (error) {
    next(error);
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};

module.exports = {
  getAllForumTopics,
  getForumTopicById,
  deleteForumTopic,
};