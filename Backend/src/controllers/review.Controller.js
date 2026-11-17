const mongoose = require("mongoose");
const Review = require("../models/review.model");
const Book = require("../models/book.model");
const Publisher = require("../models/publisher.model");
const { successResponse } = require("../utils/apiResponse");

const createReview = async (req, res, next) => {
  let session;

  try {
    const { bookId, rating, comment } = req.body;

    // 1. Kiểm tra bookId
    if (!bookId || !mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({
        success: false,
        message: "ID sách không hợp lệ",
        errors: [],
      });
    }

    // 2. Kiểm tra rating
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Điểm đánh giá phải là số nguyên từ 1 đến 5",
        errors: [],
      });
    }

    // 3. Kiểm tra comment
    if (
      typeof comment !== "string" ||
      !comment.trim() ||
      comment.trim().length > 2000
    ) {
      return res.status(400).json({
        success: false,
        message: "Nội dung đánh giá không hợp lệ",
        errors: [],
      });
    }

    // 4. Kiểm tra sách tồn tại
    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sách",
        errors: [],
      });
    }

    // 5. Kiểm tra Review trùng lặp
    const existingReview = await Review.findOne({
      userId: req.user._id,
      bookId,
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "Bạn đã đánh giá sách này",
        errors: [],
      });
    }

    let createdReview;

    // 6. Bắt đầu Transaction
    session = await mongoose.startSession();

    await session.withTransaction(async () => {
      // Tạo Review
      const review = new Review({
        userId: req.user._id,
        bookId,
        rating,
        comment: comment.trim(),
      });

      await review.save({ session });

      // Tính lại thống kê
      const reviews = await Review.find({ bookId }).session(session);

      const totalReview = reviews.length;

      const averageRating =
        reviews.reduce((sum, item) => sum + item.rating, 0) / totalReview;

      // Cập nhật thống kê Book
      const updatedBook = await Book.findByIdAndUpdate(
        bookId,
        {
          $set: {
            totalReview,
            averageRating: Number(averageRating.toFixed(2)),
          },
        },
        {
          session,
          runValidators: true,
        },
      );

      if (!updatedBook) {
        throw new Error("Không tìm thấy sách");
      }

      createdReview = review;
    });

    // 7. Trả kết quả
    return successResponse(res, "Tạo đánh giá thành công", createdReview, 201);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Bạn đã đánh giá sách này",
        errors: [],
      });
    }

    next(error);
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};

const getReviewsByBook = async (req, res, next) => {
  try {
    const { bookId } = req.params;

    // 1. Kiểm tra bookId
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({
        success: false,
        message: "ID sách không hợp lệ",
        errors: [],
      });
    }

    // 2. Kiểm tra sách tồn tại
    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sách",
        errors: [],
      });
    }

    // 3. Kiểm tra quyền xem của Publisher
    if (req.user.role === "publisher") {
      const publisher = await Publisher.findOne({
        userId: req.user._id,
      });

      if (!publisher) {
        return res.status(403).json({
          success: false,
          message: "Tài khoản chưa có hồ sơ Publisher",
          errors: [],
        });
      }

      if (book.publisherId.toString() !== publisher._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền xem đánh giá sách này",
          errors: [],
        });
      }
    }

    // 4. Lấy danh sách Review
    const reviews = await Review.find({ bookId })
      .populate("userId", "fullName avatar")
      .populate("bookId", "title coverImage")
      .sort({ createdAt: -1 });

    // 5. Trả kết quả
    return successResponse(res, "Lấy danh sách đánh giá thành công", {
      book: {
        id: book._id,
        title: book.title,
        averageRating: book.averageRating,
        totalReview: book.totalReview,
      },
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

const getReviewById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 1. Kiểm tra Review ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "ID đánh giá không hợp lệ",
        errors: [],
      });
    }

    // 2. Tìm Review
    const review = await Review.findById(id)
      .populate("userId", "fullName avatar")
      .populate("bookId", "title coverImage publisherId");

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đánh giá",
        errors: [],
      });
    }

    // 3. Kiểm tra quyền xem của Publisher
    if (req.user.role === "publisher") {
      const publisher = await Publisher.findOne({
        userId: req.user._id,
      });

      if (!publisher) {
        return res.status(403).json({
          success: false,
          message: "Tài khoản chưa có hồ sơ Publisher",
          errors: [],
        });
      }

      if (
        !review.bookId ||
        !review.bookId.publisherId ||
        review.bookId.publisherId.toString() !== publisher._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền xem đánh giá này",
          errors: [],
        });
      }
    }

    // 4. Trả kết quả
    return successResponse(res, "Lấy thông tin đánh giá thành công", review);
  } catch (error) {
    next(error);
  }
};

const updateReview = async (req, res, next) => {
  let session;

  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    // 1. Kiểm tra Review ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "ID đánh giá không hợp lệ",
        errors: [],
      });
    }

    // 2. Tìm Review
    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đánh giá",
        errors: [],
      });
    }

    // 3. Kiểm tra quyền cập nhật
    if (req.user.role !== "admin" && req.user.role !== "reader") {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền cập nhật đánh giá",
        errors: [],
      });
    }

    if (
      req.user.role === "reader" &&
      review.userId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Bạn chỉ được cập nhật đánh giá của mình",
        errors: [],
      });
    }

    // 4. Kiểm tra dữ liệu cập nhật
    const updateData = {};

    if (rating !== undefined) {
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: "Điểm đánh giá phải là số nguyên từ 1 đến 5",
          errors: [],
        });
      }

      updateData.rating = rating;
    }

    if (comment !== undefined) {
      if (
        typeof comment !== "string" ||
        !comment.trim() ||
        comment.trim().length > 2000
      ) {
        return res.status(400).json({
          success: false,
          message: "Nội dung đánh giá không hợp lệ",
          errors: [],
        });
      }

      updateData.comment = comment.trim();
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp dữ liệu cần cập nhật",
        errors: [],
      });
    }

    let updatedReview;

    // 5. Bắt đầu Transaction
    session = await mongoose.startSession();

    await session.withTransaction(async () => {
      // Cập nhật Review
      updatedReview = await Review.findByIdAndUpdate(
        id,
        { $set: updateData },
        {
          new: true,
          runValidators: true,
          session,
        },
      );

      if (!updatedReview) {
        throw new Error("Không tìm thấy đánh giá");
      }

      // Tính lại thống kê Book
      const reviews = await Review.find({
        bookId: review.bookId,
      }).session(session);

      const totalReview = reviews.length;

      const averageRating =
        reviews.reduce((sum, item) => sum + item.rating, 0) / totalReview;

      // Cập nhật Book
      const updatedBook = await Book.findByIdAndUpdate(
        review.bookId,
        {
          $set: {
            totalReview,
            averageRating: Number(averageRating.toFixed(2)),
          },
        },
        {
          session,
          runValidators: true,
        },
      );

      if (!updatedBook) {
        throw new Error("Không tìm thấy sách");
      }
    });

    // 6. Populate dữ liệu sau khi Transaction hoàn tất
    updatedReview = await Review.findById(id)
      .populate("userId", "fullName avatar")
      .populate("bookId", "title coverImage");

    if (!updatedReview) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đánh giá",
        errors: [],
      });
    }

    // 7. Trả kết quả
    return successResponse(res, "Cập nhật đánh giá thành công", updatedReview);
  } catch (error) {
    next(error);
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};

const deleteReview = async (req, res, next) => {
  let session;

  try {
    const { id } = req.params;

    // 1. Kiểm tra Review ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "ID đánh giá không hợp lệ",
        errors: [],
      });
    }

    // 2. Tìm Review
    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đánh giá",
        errors: [],
      });
    }

    // 3. Kiểm tra quyền xóa
    if (req.user.role !== "admin" && req.user.role !== "reader") {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xóa đánh giá",
        errors: [],
      });
    }

    if (
      req.user.role === "reader" &&
      review.userId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Bạn chỉ được xóa đánh giá của mình",
        errors: [],
      });
    }

    // 4. Bắt đầu Transaction
    session = await mongoose.startSession();

    await session.withTransaction(async () => {
      // Xóa Review
      const deletedReview = await Review.findByIdAndDelete(id).session(session);

      if (!deletedReview) {
        throw new Error("Không tìm thấy đánh giá");
      }

      // Tính lại thống kê Book
      const reviews = await Review.find({
        bookId: review.bookId,
      }).session(session);

      const totalReview = reviews.length;

      const averageRating =
        totalReview > 0
          ? reviews.reduce((sum, item) => sum + item.rating, 0) / totalReview
          : 0;

      // Cập nhật Book
      const updatedBook = await Book.findByIdAndUpdate(
        review.bookId,
        {
          $set: {
            totalReview,
            averageRating: Number(averageRating.toFixed(2)),
          },
        },
        {
          session,
          runValidators: true,
        },
      );

      if (!updatedBook) {
        throw new Error("Không tìm thấy sách");
      }
    });

    // 5. Trả kết quả
    return successResponse(res, "Xóa đánh giá thành công", { id });
  } catch (error) {
    next(error);
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};

module.exports = {
  createReview,
  getReviewsByBook,
  getReviewById,
  updateReview,
  deleteReview,
};
