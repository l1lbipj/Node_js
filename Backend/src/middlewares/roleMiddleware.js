
const { errorResponse } = require('../utils/apiResponse');

// ROLE MIDDLEWARE
const roleMiddleware = (...allowedRoles) => {
    return (req, res, next) => {
        // 1. Kiểm tra người dùng đã đăng nhập
        if (!req.user) {
            return errorResponse(
                res,
                'Bạn chưa đăng nhập',
                401
            );
        }

        // 2. Kiểm tra vai trò người dùng
        if (!allowedRoles.includes(req.user.role)) {
            return errorResponse(
                res,
                'Bạn không có quyền thực hiện chức năng này',
                403
            );
        }

        // 3. Cho phép tiếp tục
        return next();
    };
};

module.exports = roleMiddleware;
