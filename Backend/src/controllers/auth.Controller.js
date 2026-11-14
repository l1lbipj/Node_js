const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { generateToken } = require('../configs/jwt');
const TokenBlacklist = require('../models/tokenBlacklist.model');

// REGISTER
const register = async (req, res, next) => {
    try {
        const { fullName, email, password } = req.body;

        // 1. Kiểm tra dữ liệu đầu vào
        if (
            typeof fullName !== 'string' ||
            typeof email !== 'string' ||
            typeof password !== 'string'
        ) {
            return errorResponse(
                res,
                'Thông tin đăng ký không hợp lệ',
                400
            );
        }

        const trimmedFullName = fullName.trim();
        const normalizedEmail = email.trim().toLowerCase();

        if (!trimmedFullName || !normalizedEmail || !password) {
            return errorResponse(
                res,
                'Vui lòng nhập đầy đủ thông tin',
                400
            );
        }

        if (trimmedFullName.length > 100) {
            return errorResponse(
            res,
            'Họ tên không được vượt quá 100 ký tự',
            400
        );
}

        if (password.length < 8) {
            return errorResponse(
                res,
                'Mật khẩu phải có ít nhất 8 ký tự',
                400
            );
        }

        // 2. Kiểm tra email hợp lệ
        const emailRegex = /^\S+@\S+\.\S+$/;

        if (!emailRegex.test(normalizedEmail)) {
            return errorResponse(
                res,
                'Email không hợp lệ',
                400
            );
        }

        // 3. Kiểm tra email đã tồn tại
        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return errorResponse(
                res,
                'Email đã được sử dụng',
                409
            );
        }

        // 4. Hash mật khẩu
        if (Buffer.byteLength(password, 'utf8') > 72) {
            return errorResponse(
                res,
                'Mật khẩu không được vượt quá 72 byte',
                400
            );
        }
        
        const hashedPassword = await bcrypt.hash(password, 12);

        // 5. Tạo User mới
        // Không nhận role từ req.body
        const newUser = await User.create({
            fullName: trimmedFullName,
            email: normalizedEmail,
            password: hashedPassword
        });

        // 6. Trả kết quả
        const userData = {
            id: newUser._id,
            fullName: newUser.fullName,
            email: newUser.email,
            role: newUser.role,
            avatar: newUser.avatar
        };

        return successResponse(
            res,
            'Đăng ký tài khoản thành công',
            userData,
            201
        );

    } catch (error) {
        // Xử lý trường hợp hai request đăng ký trùng email đồng thời
        if (error.code === 11000) {
            return errorResponse(
                res,
                'Email đã được sử dụng',
                409
            );
        }

        next(error);
    }
};

// LOGIN
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // 1. Kiểm tra dữ liệu đầu vào
        if (
            typeof email !== 'string' ||
            typeof password !== 'string' ||
            !email.trim() ||
            !password
        ) {
            return errorResponse(
                res,
                'Vui lòng nhập email và mật khẩu',
                400
            );
        }

        if (Buffer.byteLength(password, 'utf8') > 72) {
            return errorResponse(
            res,
            'Mật khẩu không được vượt quá 72 byte',
            400
        );
}

        const normalizedEmail = email.trim().toLowerCase();

        // 2. Tìm User và lấy password
        const user = await User.findOne({
            email: normalizedEmail
        }).select('+password');

        if (!user) {
            return errorResponse(
                res,
                'Email hoặc mật khẩu không chính xác',
                401
            );
        }

        // 3. Kiểm tra trạng thái tài khoản
        if (user.status !== 'active') {
            return errorResponse(
                res,
                'Tài khoản hiện không hoạt động',
                403
            );
        }

        // 4. So sánh mật khẩu
        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return errorResponse(
                res,
                'Email hoặc mật khẩu không chính xác',
                401
            );
        }

        // 5. Tạo JWT
        const token = generateToken(user._id.toString());

        // 6. Trả kết quả
        const userData = {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            avatar: user.avatar
        };

        return successResponse(
            res,
            'Đăng nhập thành công',
            {
                user: userData,
                token
            },
            200
        );

    } catch (error) {
        next(error);
    }
};

// LOGOUT
const logout = async (req, res, next) => {
    try {
        // 1. Lấy JWT từ Authorization Header
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

        // 2. Xác minh JWT và lấy thời điểm hết hạn
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        if (!decoded.exp) {
            return errorResponse(
                res,
                'Token không hợp lệ',
                401
            );
        }

        // 3. Tạo SHA-256 hash của JWT
        const tokenHash = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // 4. Tính thời điểm hết hạn của JWT
        const expiresAt = new Date(decoded.exp * 1000);

        // 5. Lưu token hash vào Blacklist
        await TokenBlacklist.create({
            tokenHash,
            expiresAt
        });

        // 6. Trả kết quả
        return successResponse(
            res,
            'Đăng xuất thành công',
            null,
            200
        );

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

module.exports = { register, login, logout };
