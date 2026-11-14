
const mongoose = require('mongoose');

const Comment = require('../models/Comment');
const Review = require('../models/Review');
const ForumTopic = require('../models/ForumTopic');

const { successResponse, errorResponse } = require('../utils/apiResponse');
const countCharacters = require('../utils/countCharacters');

const createComment = async (req, res, next) => {
    try {
        const { targetType, targetId, content, parentCommentId } = req.body;

        // 1. Lấy userId từ người dùng đã đăng nhập
        const userId = req.user._id;

        // 2. Kiểm tra targetType
        if (!['Review', 'ForumTopic'].includes(targetType)) {
            return errorResponse(res, 'Loại nội dung không hợp lệ', 400);
        }

        // 3. Kiểm tra ObjectId
        if (!mongoose.Types.ObjectId.isValid(targetId)) {
            return errorResponse(res, 'targetId không hợp lệ', 400);
        }

        // 4. Kiểm tra nội dung
        if (typeof content !== 'string') {
            return errorResponse(res, 'Nội dung bình luận phải là chuỗi', 400);
        }

        const trimmedContent = content.trim();

        if (!trimmedContent) {
            return errorResponse(
                res,
                'Nội dung bình luận không được để trống',
                400
            );
        }

        if (countCharacters(trimmedContent) > 2000) {
            return errorResponse(
                res,
                'Nội dung bình luận không được vượt quá 2000 ký tự',
                400
            );
        }

        // 5. Xác định Model mục tiêu
        const TargetModel = targetType === 'Review'
            ? Review
            : ForumTopic;

        // 6. Kiểm tra Review hoặc ForumTopic tồn tại
        const targetExists = await TargetModel.exists({
            _id: targetId
        });

        if (!targetExists) {
            return errorResponse(
                res,
                'Nội dung được bình luận không tồn tại',
                404
            );
        }

        // 7. Kiểm tra Comment cha nếu đây là Reply
        if (parentCommentId !== null && parentCommentId !== undefined) {
            if (!mongoose.Types.ObjectId.isValid(parentCommentId)) {
                return errorResponse(
                    res,
                    'parentCommentId không hợp lệ',
                    400
                );
            }

            const parentComment = await Comment.findById(parentCommentId);

            if (!parentComment) {
                return errorResponse(
                    res,
                    'Comment cha không tồn tại',
                    404
                );
            }

            // Comment cha phải thuộc cùng nội dung mục tiêu
            if (
                parentComment.targetType !== targetType ||
                parentComment.targetId.toString() !== targetId.toString()
            ) {
                return errorResponse(
                    res,
                    'Comment cha không thuộc cùng nội dung',
                    400
                );
            }
        }

        // 8. Tạo Comment hoặc Reply
        const newComment = await Comment.create({
            userId,
            targetType,
            targetId,
            parentCommentId: parentCommentId ?? null,
            content: trimmedContent
        });

        // 9. Trả kết quả
        return successResponse(
            res,
            'Tạo bình luận thành công',
            newComment,
            201
        );

    } catch (error) {
        next(error);
    }
};

module.exports = { createComment };
