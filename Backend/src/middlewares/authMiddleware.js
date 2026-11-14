const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const crypto = require('crypto');
const TokenBlacklist = require('../models/tokenBlacklist.model');
const User = require('../models/user.model');
const { errorResponse } = require('../utils/apiResponse');

const authMiddleware = async (req, res, next) => {
    try {
        // 1. Lấy token từ Authorization Header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return errorResponse(
                res,
                'Bạn chưa đăng nhập',
                401
            );
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return errorResponse(
                res,
                'Token không hợp lệ',
                401
            );
        }

        // 2. Kiểm tra JWT_SECRET
        if (!process.env.JWT_SECRET) {
            return next(new Error('JWT_SECRET chưa được cấu hình'));
        }

        // 3. Xác minh JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const tokenHash = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        const blacklistedToken = await TokenBlacklist.findOne({
            tokenHash
        });

        if (blacklistedToken) {
            return errorResponse(
            res,
            'Phiên đăng nhập đã kết thúc. Vui lòng đăng nhập lại',
            401
        );
}
        // 4. Kiểm tra userId trong JWT
        if (
            !decoded.userId ||
            !mongoose.Types.ObjectId.isValid(decoded.userId)
        ) {
            return errorResponse(
                res,
                'Token không hợp lệ',
                401
            );
        }

        // 5. Tìm người dùng trong Database
        const user = await User.findById(decoded.userId);

        if (!user) {
            return errorResponse(
                res,
                'Tài khoản không tồn tại',
                401
            );
        }

        // 6. Kiểm tra trạng thái tài khoản
        if (user.status !== 'active') {
            return errorResponse(
                res,
                'Tài khoản hiện không hoạt động',
                403
            );
        }

        // 7. Gắn thông tin người dùng vào Request
        req.user = user;

        // 8. Cho phép chạy Middleware hoặc Controller tiếp theo
        return next();

    } catch (error) {
        if (
            error.name === 'JsonWebTokenError' ||
            error.name === 'TokenExpiredError'
        ) {
            return errorResponse(
                res,
                'Token không hợp lệ hoặc đã hết hạn',
                401
            );
        }

        next(error);
    }
};

module.exports = authMiddleware;
