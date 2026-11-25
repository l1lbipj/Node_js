const mongoose = require("mongoose");
const Publisher = require("../models/publisher.model");
const User = require("../models/user.model");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const Book = require("../models/book.model");


// Publisher xem hồ sơ của chính mình và thống kê tối thiểu cho Dashboard.
const getMyPublisher = async (req, res, next) => {
  try {
    const publisher = await Publisher.findOne({ userId: req.user._id }).populate(
      "userId", "fullName email role avatar"
    );
    if (!publisher) return errorResponse(res, "Tài khoản chưa có hồ sơ Publisher", 404);
    const [totalBooks, ratingStats] = await Promise.all([
      Book.countDocuments({ publisherId: publisher._id }),
      Book.aggregate([
        { $match: { publisherId: publisher._id } },
        { $group: { _id: null, averageRating: { $avg: "$averageRating" }, totalReviews: { $sum: "$totalReview" } } },
      ]),
    ]);
    const stats = ratingStats[0] || { averageRating: 0, totalReviews: 0 };
    return successResponse(res, "Lấy thông tin Publisher thành công", {
      publisher,
      stats: { totalBooks, averageRating: Number((stats.averageRating || 0).toFixed(2)), totalReviews: stats.totalReviews || 0 },
    });
  } catch (error) { next(error); }
};

// 1. Lấy danh sách Publisher
const getAllPublishers = async (req, res, next) => {
  try {
    const { search = "", page = 1, limit = 10 } = req.query;

    const currentPage = Number(page);
    const pageLimit = Number(limit);

    // Kiểm tra phân trang
    if (
      !Number.isInteger(currentPage) ||
      currentPage < 1 ||
      !Number.isInteger(pageLimit) ||
      pageLimit < 1 ||
      pageLimit > 100
    ) {
      return errorResponse(res, "Thông tin phân trang không hợp lệ", 400);
    }

    // Tạo điều kiện tìm kiếm
    const filter = {};

    if (search.trim()) {
      const searchRegex = new RegExp(
        search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i",
      );

      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { address: searchRegex },
      ];
    }

    // Truy vấn dữ liệu
    const publishers = await Publisher.find(filter)
      .populate("userId", "fullName email role")
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * pageLimit)
      .limit(pageLimit);

    const totalPublishers = await Publisher.countDocuments(filter);

    return successResponse(res, "Lấy danh sách nhà xuất bản thành công", {
      publishers,
      pagination: {
        totalPublishers,
        currentPage,
        totalPages: Math.ceil(totalPublishers / pageLimit),
        limit: pageLimit,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 2. Lấy chi tiết Publisher
const getPublisherById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Kiểm tra ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, "ID nhà xuất bản không hợp lệ", 400);
    }

    const publisher = await Publisher.findById(id).populate(
      "userId",
      "fullName email role",
    );

    if (!publisher) {
      return errorResponse(res, "Không tìm thấy nhà xuất bản", 404);
    }

    return successResponse(
      res,
      "Lấy thông tin nhà xuất bản thành công",
      publisher,
    );
  } catch (error) {
    next(error);
  }
};

// 3. Tạo Publisher
const createPublisher = async (req, res, next) => {
  try {
    const { userId, name, description, email, phone, address } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!userId || !name || !description || !email || !phone || !address) {
      return errorResponse(
        res,
        "Vui lòng cung cấp đầy đủ thông tin nhà xuất bản",
        400,
      );
    }

    // Kiểm tra User ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return errorResponse(res, "User ID không hợp lệ", 400);
    }

    // Kiểm tra User tồn tại
    const user = await User.findById(userId);

    if (!user) {
      return errorResponse(res, "Không tìm thấy tài khoản User", 404);
    }

    // User phải có role Publisher
    if (user.role !== "publisher") {
      return errorResponse(res, "Tài khoản User phải có quyền Publisher", 400);
    }
    const existingPublisher = await Publisher.findOne({ userId });
    if (existingPublisher) {
      return errorResponse(
        res,
        "Tài khoản Publisher này đã được liên kết với nhà xuất bản khác",
        409,
      );
    }
    // Kiểm tra Email đã tồn tại
    const existingEmail = await Publisher.findOne({
      email: email.trim().toLowerCase(),
    });

    if (existingEmail) {
      return errorResponse(res, "Email nhà xuất bản đã tồn tại", 409);
    }

    // Kiểm tra Phone đã tồn tại
    const existingPhone = await Publisher.findOne({
      phone: phone.trim(),
    });

    if (existingPhone) {
      return errorResponse(res, "Số điện thoại nhà xuất bản đã tồn tại", 409);
    }

    // Tạo Publisher
    const publisher = await Publisher.create({
      userId,
      name,
      description,
      email,
      phone,
      address,
    });

    return successResponse(res, "Tạo nhà xuất bản thành công", publisher, 201);
  } catch (error) {
    next(error);
  }
};

// 4. Cập nhật Publisher
const updatePublisher = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { name, description, email, phone, address } = req.body;

    // Kiểm tra ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, "ID nhà xuất bản không hợp lệ", 400);
    }

    // Kiểm tra Publisher tồn tại
    const publisher = await Publisher.findById(id);

    if (!publisher) {
      return errorResponse(res, "Không tìm thấy nhà xuất bản", 404);
    }

    // Kiểm tra Email trùng
    if (email !== undefined) {
      const normalizedEmail = email.trim().toLowerCase();

      const existingEmail = await Publisher.findOne({
        email: normalizedEmail,
        _id: { $ne: id },
      });

      if (existingEmail) {
        return errorResponse(res, "Email nhà xuất bản đã tồn tại", 409);
      }

      publisher.email = normalizedEmail;
    }

    // Kiểm tra Phone trùng
    if (phone !== undefined) {
      const existingPhone = await Publisher.findOne({
        phone: phone.trim(),
        _id: { $ne: id },
      });

      if (existingPhone) {
        return errorResponse(res, "Số điện thoại nhà xuất bản đã tồn tại", 409);
      }

      publisher.phone = phone.trim();
    }

    // Cập nhật các trường
    if (name !== undefined) {
      publisher.name = name;
    }

    if (description !== undefined) {
      publisher.description = description;
    }

    if (address !== undefined) {
      publisher.address = address;
    }

    await publisher.save();

    return successResponse(res, "Cập nhật nhà xuất bản thành công", publisher);
  } catch (error) {
    next(error);
  }
};

// 5. Xóa Publisher
const deletePublisher = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Kiểm tra ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, "ID nhà xuất bản không hợp lệ", 400);
    }

    const publisher = await Publisher.findById(id);

    if (!publisher) {
      return errorResponse(res, "Không tìm thấy nhà xuất bản", 404);
    }

    await Publisher.findByIdAndDelete(id);

    return successResponse(res, "Xóa nhà xuất bản thành công", null);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyPublisher,
  getAllPublishers,
  getPublisherById,
  createPublisher,
  updatePublisher,
  deletePublisher,
};
