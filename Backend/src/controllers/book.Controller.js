const mongoose = require('mongoose');
const Book = require('../models/book.model');
const Publisher = require('../models/publisher.model');
const { successResponse } = require('../utils/apiResponse');

const isValidCoverImage = (value) => {
    if (typeof value !== 'string' || !value.trim()) {
        return false;
    }

    const imagePath = value.trim();

    // URL ảnh bên ngoài
    try {
        const url = new URL(imagePath);

        if (
            (url.protocol === 'http:' || url.protocol === 'https:') &&
            url.hostname.includes('.')
        ) {
            return true;
        }
    } catch (error) {
        // Không phải URL, tiếp tục kiểm tra đường dẫn nội bộ
    }

    // Đường dẫn ảnh nội bộ
    return /^\/uploads\/books\/[a-zA-Z0-9._-]+\.(jpg|jpeg|png|webp)$/i.test(imagePath);
};
const getAllBooks = async (req, res, next) => {
    try {
        const books = await Book.find()
            .populate('publisherId', 'name email')
            .sort({ createdAt: -1 });

        return successResponse(
            res,
            'Lấy danh sách sách thành công',
            books
        );
    } catch (error) {
        next(error);
    }
};
const getBookById = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID sách không hợp lệ',
                errors: []
            });
        }

        const book = await Book.findById(id)
            .populate('publisherId', 'name email');

        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sách',
                errors: []
            });
        }

        return successResponse(
            res,
            'Lấy thông tin sách thành công',
            book
        );
    } catch (error) {
        next(error);
    }
};
const createBook = async (req, res, next) => {
    try {
        const {
            title,
            author,
            category,
            description,
            coverImage,
            publishDate
        } = req.body;

        // 1. Kiểm tra định dạng ảnh bìa
        if (!isValidCoverImage(coverImage)) {
            return res.status(400).json({
                success: false,
                message: 'Đường dẫn ảnh bìa không hợp lệ',
                errors: []
            });
        }
        let publisherId;

        // 1. Xác định Publisher sở hữu sách
        if (req.user.role === 'publisher') {
            const publisher = await Publisher.findOne({
                userId: req.user._id
            });

            if (!publisher) {
                return res.status(403).json({
                    success: false,
                    message: 'Tài khoản chưa có hồ sơ Publisher',
                    errors: []
                });
            }

            // Publisher chỉ được tạo sách cho chính mình
            publisherId = publisher._id;
        }

        // 2. Admin được chỉ định Publisher sở hữu sách
        else if (req.user.role === 'admin') {
            if (
                !req.body.publisherId
            ) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng cung cấp publisherId',
                    errors: []
                });
            }

            if (
                !mongoose.Types.ObjectId.isValid(
                    req.body.publisherId
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message: 'publisherId không hợp lệ',
                    errors: []
                });
            }

            const publisher = await Publisher.findById(
                req.body.publisherId
            );

            if (!publisher) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy Publisher',
                    errors: []
                });
            }

            publisherId = publisher._id;
        }

        // 3. Tạo sách
        const book = await Book.create({
            title,
            author,
            publisherId,
            category,
            description,
            coverImage,
            publishDate
        });

        // 4. Trả kết quả
        return successResponse(
            res,
            'Tạo sách thành công',
            book,
            201
        );

    } catch (error) {
        next(error);
    }
};
const updateBook = async (req, res, next) => {
    try {
        const { id } = req.params;

        // 1. Kiểm tra ID sách
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID sách không hợp lệ',
                errors: []
            });
        }

        // 2. Tìm sách
        const book = await Book.findById(id);

        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sách',
                errors: []
            });
        }

        // 3. Kiểm tra quyền sở hữu của Publisher
        if (req.user.role === 'publisher') {
            const publisher = await Publisher.findOne({
                userId: req.user._id
            });

            if (!publisher) {
                return res.status(403).json({
                    success: false,
                    message: 'Tài khoản chưa có hồ sơ Publisher',
                    errors: []
                });
            }

            if (book.publisherId.toString() !== publisher._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Bạn không có quyền cập nhật sách này',
                    errors: []
                });
            }
        }

        // 4. Những trường được phép cập nhật
        const allowedFields = [
            'title',
            'author',
            'category',
            'description',
            'coverImage',
            'publishDate'
        ];

        const updateData = {};

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });

        // 5. Cập nhật sách
        const updatedBook = await Book.findByIdAndUpdate(
            id,
            { $set: updateData },
            {
                new: true,
                runValidators: true
            }
        ).populate('publisherId', 'name email');

        return successResponse(
            res,
            'Cập nhật sách thành công',
            updatedBook
        );

    } catch (error) {
        next(error);
    }
};
const deleteBook = async (req, res, next) => {
    try {
        const { id } = req.params;

        // 1. Kiểm tra ID sách
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID sách không hợp lệ',
                errors: []
            });
        }

        // 2. Tìm sách
        const book = await Book.findById(id);

        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sách',
                errors: []
            });
        }

        // 3. Kiểm tra quyền sở hữu của Publisher
        if (req.user.role === 'publisher') {
            const publisher = await Publisher.findOne({
                userId: req.user._id
            });

            if (!publisher) {
                return res.status(403).json({
                    success: false,
                    message: 'Tài khoản chưa có hồ sơ Publisher',
                    errors: []
                });
            }

            if (book.publisherId.toString() !== publisher._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Bạn không có quyền xóa sách này',
                    errors: []
                });
            }
        }

        // 4. Xóa sách
        await Book.findByIdAndDelete(id);

        return successResponse(
            res,
            'Xóa sách thành công',
            { id }
        );

    } catch (error) {
        next(error);
    }
};

module.exports = { getAllBooks, getBookById, createBook, updateBook, deleteBook };