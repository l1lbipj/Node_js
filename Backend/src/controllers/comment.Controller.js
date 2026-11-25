const mongoose = require("mongoose");
const Comment = require("../models/comment.model");
const Review = require("../models/review.model");
const ForumTopic = require("../models/forumTopic.model");
const Report = require("../models/report.model");
const Publisher = require("../models/publisher.model");
const Book = require("../models/book.model");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const countCharacters = require("../utils/countCharacters");
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Tạo lỗi HTTP để xử lý trong try/catch
const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// Kiểm tra nội dung mục tiêu tồn tại
const getTargetModel = (targetType) => {
  if (targetType === "Review") {
    return Review;
  }

  if (targetType === "ForumTopic") {
    return ForumTopic;
  }

  return null;
};

// Xóa Comment và toàn bộ Reply ở mọi cấp
const deleteCommentTree = async (comment, session) => {
  const comments = await Comment.find({
    targetType: comment.targetType,
    targetId: comment.targetId,
  })
    .select("_id parentCommentId")
    .session(session);

  // Tạo danh sách các Comment con theo parentCommentId
  const childrenMap = new Map();

  comments.forEach((item) => {
    if (item.parentCommentId) {
      const parentId = item.parentCommentId.toString();

      if (!childrenMap.has(parentId)) {
        childrenMap.set(parentId, []);
      }

      childrenMap.get(parentId).push(item._id.toString());
    }
  });

  // Duyệt cây Comment bằng Stack
  const idsToDelete = [];
  const stack = [comment._id.toString()];

  while (stack.length > 0) {
    const currentId = stack.pop();

    idsToDelete.push(currentId);

    const children = childrenMap.get(currentId) || [];

    children.forEach((childId) => {
      stack.push(childId);
    });
  }

  // Xóa toàn bộ Comment thuộc cây
  const result = await Comment.deleteMany(
    {
      _id: {
        $in: idsToDelete,
      },
    },
    { session },
  );

  return result.deletedCount;
};


const getPublisherContext = async (userId) => {
  const publisher = await Publisher.findOne({ userId });
  if (!publisher) return null;
  const books = await Book.find({ publisherId: publisher._id }).select("_id title");
  const bookIds = books.map((book) => book._id);
  const reviews = await Review.find({ bookId: { $in: bookIds } }).select("_id bookId");
  return { publisher, books, bookIds, reviewIds: reviews.map((review) => review._id) };
};

// Publisher xem mọi bình luận trên các review thuộc sách của mình.
const getPublisherComments = async (req, res, next) => {
  try {
    const context = await getPublisherContext(req.user._id);
    if (!context) return errorResponse(res, "Tài khoản chưa có hồ sơ Publisher", 404);
    const comments = await Comment.find({ targetType: "Review", targetId: { $in: context.reviewIds } })
      .populate("userId", "fullName avatar role")
      .populate("parentCommentId", "content userId createdAt")
      .populate({ path: "targetId", select: "bookId rating comment", populate: { path: "bookId", select: "title coverImage" } })
      .sort({ createdAt: -1 });
    return successResponse(res, "Lấy bình luận của Publisher thành công", { comments, totalComments: comments.length });
  } catch (error) { next(error); }
};

// Publisher trả lời một bình luận thuộc review của sách mình sở hữu.
const createPublisherReply = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) return errorResponse(res, "Comment ID không hợp lệ", 400);
    if (typeof content !== "string" || !content.trim()) return errorResponse(res, "Nội dung trả lời không được để trống", 400);
    const trimmedContent = content.trim();
    if (countCharacters(trimmedContent) > 2000) return errorResponse(res, "Nội dung trả lời không được vượt quá 2000 ký tự", 400);
    const parent = await Comment.findById(id);
    if (!parent) return errorResponse(res, "Không tìm thấy bình luận", 404);
    const context = await getPublisherContext(req.user._id);
    if (!context) return errorResponse(res, "Tài khoản chưa có hồ sơ Publisher", 404);
    if (parent.targetType !== "Review" || !context.reviewIds.some((reviewId) => reviewId.toString() === parent.targetId.toString())) {
      return errorResponse(res, "Bạn chỉ được trả lời bình luận trên sách của mình", 403);
    }
    const reply = await Comment.create({ userId: req.user._id, targetType: parent.targetType, targetId: parent.targetId, parentCommentId: parent._id, content: trimmedContent });
    await reply.populate("userId", "fullName avatar role");
    return successResponse(res, "Trả lời bình luận thành công", reply, 201);
  } catch (error) { next(error); }
};

const createComment = async (req, res, next) => {
  try {
    const { targetType, targetId, content, parentCommentId } = req.body;

    const userId = req.user._id;

    // Kiểm tra targetType
    const TargetModel = getTargetModel(targetType);

    if (!TargetModel) {
      return errorResponse(res, "Loại nội dung không hợp lệ", 400);
    }

    // Kiểm tra targetId
    if (!targetId || !mongoose.Types.ObjectId.isValid(targetId)) {
      return errorResponse(res, "targetId không hợp lệ", 400);
    }

    // Kiểm tra content
    if (typeof content !== "string") {
      return errorResponse(res, "Nội dung bình luận phải là chuỗi", 400);
    }

    const trimmedContent = content.trim();

    if (!trimmedContent) {
      return errorResponse(res, "Nội dung bình luận không được để trống", 400);
    }

    if (countCharacters(trimmedContent) > 2000) {
      return errorResponse(
        res,
        "Nội dung bình luận không được vượt quá 2000 ký tự",
        400,
      );
    }

    // Kiểm tra nội dung mục tiêu tồn tại
    const targetExists = await TargetModel.exists({
      _id: targetId,
    });

    if (!targetExists) {
      return errorResponse(res, "Nội dung được bình luận không tồn tại", 404);
    }

    // Kiểm tra Comment cha nếu đây là Reply
    let parentId = null;

    if (
      parentCommentId !== null &&
      parentCommentId !== undefined &&
      parentCommentId !== ""
    ) {
      if (!mongoose.Types.ObjectId.isValid(parentCommentId)) {
        return errorResponse(res, "parentCommentId không hợp lệ", 400);
      }

      const parentComment = await Comment.findById(parentCommentId);

      if (!parentComment) {
        return errorResponse(res, "Comment cha không tồn tại", 404);
      }

      // Comment cha phải thuộc cùng nội dung mục tiêu
      if (
        parentComment.targetType !== targetType ||
        parentComment.targetId.toString() !== targetId.toString()
      ) {
        return errorResponse(res, "Comment cha không thuộc cùng nội dung", 400);
      }

      parentId = parentComment._id;
    }

    // Tạo Comment hoặc Reply
    const newComment = await Comment.create({
      userId,
      targetType,
      targetId,
      parentCommentId: parentId,
      content: trimmedContent,
    });

    return successResponse(res, "Tạo bình luận thành công", newComment, 201);
  } catch (error) {
    next(error);
  }
};

const getCommentsByTarget = async (req, res, next) => {
  try {
    const { targetType, targetId } = req.params;

    const TargetModel = getTargetModel(targetType);

    if (!TargetModel) {
      return errorResponse(res, "Loại nội dung không hợp lệ", 400);
    }

    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      return errorResponse(res, "targetId không hợp lệ", 400);
    }

    // Kiểm tra nội dung mục tiêu tồn tại
    const targetExists = await TargetModel.exists({
      _id: targetId,
    });

    if (!targetExists) {
      return errorResponse(res, "Nội dung không tồn tại", 404);
    }

    // Lấy toàn bộ Comment thuộc nội dung mục tiêu
    const comments = await Comment.find({
      targetType,
      targetId,
    })
      .populate("userId", "fullName avatar")
      .sort({ createdAt: 1 });

    // Chuyển dữ liệu thành cây Comment nhiều cấp
    const commentMap = new Map();

    comments.forEach((comment) => {
      const commentObject = comment.toObject();

      commentObject.replies = [];

      commentMap.set(comment._id.toString(), commentObject);
    });

    const rootComments = [];

    comments.forEach((comment) => {
      const commentObject = commentMap.get(comment._id.toString());

      if (comment.parentCommentId) {
        const parentId = comment.parentCommentId.toString();

        const parentComment = commentMap.get(parentId);

        if (parentComment) {
          parentComment.replies.push(commentObject);
        } else {
          rootComments.push(commentObject);
        }
      } else {
        rootComments.push(commentObject);
      }
    });

    return successResponse(res, "Lấy danh sách bình luận thành công", {
      targetType,
      targetId,
      totalComments: comments.length,
      comments: rootComments,
    });
  } catch (error) {
    next(error);
  }
};

const getCommentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, "Comment ID không hợp lệ", 400);
    }

    const comment = await Comment.findById(id)
      .populate("userId", "fullName avatar")
      .populate("targetId")
      .populate("parentCommentId", "userId content createdAt");

    if (!comment) {
      return errorResponse(res, "Không tìm thấy bình luận", 404);
    }

    return successResponse(res, "Lấy thông tin bình luận thành công", comment);
  } catch (error) {
    next(error);
  }
};

const updateComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, "Comment ID không hợp lệ", 400);
    }

    if (typeof content !== "string") {
      return errorResponse(res, "Nội dung bình luận phải là chuỗi", 400);
    }

    const trimmedContent = content.trim();

    if (!trimmedContent) {
      return errorResponse(res, "Nội dung bình luận không được để trống", 400);
    }

    if (countCharacters(trimmedContent) > 2000) {
      return errorResponse(
        res,
        "Nội dung bình luận không được vượt quá 2000 ký tự",
        400,
      );
    }

    const comment = await Comment.findById(id);

    if (!comment) {
      return errorResponse(res, "Không tìm thấy bình luận", 404);
    }

    // Chỉ người tạo Comment mới được chỉnh sửa
    // Admin được xóa mọi Comment.
// Người dùng khác chỉ được xóa Comment do mình tạo.
    const isAdmin = req.user.role === "admin";
    const isOwner = comment.userId.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return errorResponse(
        res,
        "Bạn không có quyền xóa bình luận này",
        403,
      );
    }

    comment.content = trimmedContent;

    await comment.save();

    return successResponse(res, "Cập nhật bình luận thành công", comment);
  } catch (error) {
    next(error);
  }
};

const deleteComment = async (req, res, next) => {
  let session;

  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, "Comment ID không hợp lệ", 400);
    }

    const comment = await Comment.findById(id);

    if (!comment) {
      return errorResponse(res, "Không tìm thấy bình luận", 404);
    }

    // Chỉ người tạo Comment mới được xóa
    if (comment.userId.toString() !== req.user._id.toString()) {
      return errorResponse(res, "Bạn chỉ được xóa bình luận do mình tạo", 403);
    }

    session = await mongoose.startSession();

    await session.withTransaction(async () => {
      await deleteCommentTree(comment, session);
    });

    return successResponse(
      res,
      "Xóa bình luận và toàn bộ phản hồi thành công",
      {
        id,
        message: "Đã xóa toàn bộ Comment cấp con",
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

const createCommentReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, "Comment ID không hợp lệ", 400);
    }

    if (typeof reason !== "string") {
      return errorResponse(res, "Lý do báo cáo phải là chuỗi", 400);
    }

    const trimmedReason = reason.trim();

    if (!trimmedReason) {
      return errorResponse(res, "Lý do báo cáo không được để trống", 400);
    }

    if (countCharacters(trimmedReason) > 2000) {
      return errorResponse(
        res,
        "Lý do báo cáo không được vượt quá 2000 ký tự",
        400,
      );
    }

    const comment = await Comment.findById(id);

    if (!comment) {
      return errorResponse(res, "Không tìm thấy bình luận cần báo cáo", 404);
    }

    const report = await Report.create({
      userId: req.user._id,
      targetType: "Comment",
      targetId: comment._id,
      reason: trimmedReason,
    });

    return successResponse(
      res,
      "Gửi báo cáo bình luận thành công",
      report,
      201,
    );
  } catch (error) {
    next(error);
  }
};

const resolveCommentReport = async (req, res, next) => {
  let session;

  try {
    const { reportId } = req.params;
    const { decision } = req.body;

    // Chỉ Admin được xử lý báo cáo
    if (req.user.role !== "admin") {
      return errorResponse(res, "Chỉ Admin mới được xử lý báo cáo", 403);
    }

    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      return errorResponse(res, "Report ID không hợp lệ", 400);
    }

    if (!["resolved", "rejected"].includes(decision)) {
      return errorResponse(res, "Quyết định xử lý không hợp lệ", 400);
    }

    session = await mongoose.startSession();

    let updatedReport;

    await session.withTransaction(async () => {
      const report = await Report.findOne({
        _id: reportId,
        targetType: "Comment",
      }).session(session);

      if (!report) {
        throw createHttpError(404, "Không tìm thấy báo cáo bình luận");
      }

      if (report.status !== "pending") {
        throw createHttpError(400, "Báo cáo này đã được xử lý");
      }

      // Kiểm tra Comment được báo cáo
      const comment = await Comment.findById(report.targetId).session(session);

      if (!comment) {
        throw createHttpError(404, "Comment được báo cáo không còn tồn tại");
      }

      // Nếu xác nhận vi phạm: xóa Comment và toàn bộ Reply
      if (decision === "resolved") {
        await deleteCommentTree(comment, session);
      }

      // Giữ lại Report để lưu lịch sử xử lý
      report.adminId = req.user._id;
      report.status = decision;

      await report.save({ session });

      updatedReport = report;
    });

    return successResponse(
      res,
      decision === "resolved"
        ? "Đã xác nhận vi phạm và xóa bình luận"
        : "Đã từ chối báo cáo bình luận",
      updatedReport,
    );
  } catch (error) {
    if (error.statusCode) {
      return errorResponse(res, error.message, error.statusCode);
    }

    next(error);
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};
// ========================================
// ADMIN COMMENT MANAGEMENT
// ========================================

// Admin lấy danh sách toàn bộ Comment
const getAllComments = async (req, res, next) => {
  try {
    const {
      search,
      targetType,
      targetId,
      userId,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};

    // Tìm kiếm theo nội dung Comment
    if (typeof search === "string" && search.trim()) {
      filter.content = {
        $regex: escapeRegex(search.trim()),
        $options: "i",
      };
    }

    // Lọc theo loại nội dung
    if (targetType) {
      if (!["Review", "ForumTopic"].includes(targetType)) {
        return errorResponse(res, "Loại nội dung không hợp lệ", 400);
      }

      filter.targetType = targetType;
    }

    // Lọc theo nội dung mục tiêu
    if (targetId) {
      if (!mongoose.Types.ObjectId.isValid(targetId)) {
        return errorResponse(res, "targetId không hợp lệ", 400);
      }

      filter.targetId = targetId;
    }

    // Lọc theo người tạo Comment
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

    const [comments, totalComments] = await Promise.all([
      Comment.find(filter)
        .populate("userId", "fullName email avatar role")
        .populate("parentCommentId", "content userId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber),

      Comment.countDocuments(filter),
    ]);

    return successResponse(
      res,
      "Lấy danh sách Comment thành công",
      {
        comments,
        pagination: {
          totalComments,
          currentPage: pageNumber,
          totalPages: Math.ceil(totalComments / limitNumber),
          limit: limitNumber,
        },
      },
    );
  } catch (error) {
    next(error);
  }
};

// Admin xem chi tiết Comment
const getAdminCommentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, "Comment ID không hợp lệ", 400);
    }

    const comment = await Comment.findById(id)
      .populate("userId", "fullName email avatar role")
      .populate("parentCommentId", "content userId createdAt")
      .populate("targetId");

    if (!comment) {
      return errorResponse(res, "Không tìm thấy Comment", 404);
    }

    return successResponse(
      res,
      "Lấy thông tin Comment thành công",
      comment,
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublisherComments,
  createPublisherReply,
  createComment,
  getCommentsByTarget,
  getCommentById,
  updateComment,
  deleteComment,
  createCommentReport,
  resolveCommentReport,
  getAllComments,
  getAdminCommentById,
};
