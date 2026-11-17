const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const { generateToken } = require("../configs/jwt");
const TokenBlacklist = require("../models/tokenBlacklist.model");
const googleClient = require("../configs/google");

// Google OAuth cookie configuration
const GOOGLE_STATE_COOKIE = "google_oauth_state";

const googleCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/api/auth/google",
};

// REGISTER
const register = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;

    if (
      typeof fullName !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return errorResponse(res, "Thông tin đăng ký không hợp lệ", 400);
    }

    const trimmedFullName = fullName.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!trimmedFullName || !normalizedEmail || !password) {
      return errorResponse(res, "Vui lòng nhập đầy đủ thông tin", 400);
    }

    if (trimmedFullName.length > 100) {
      return errorResponse(res, "Họ tên không được vượt quá 100 ký tự", 400);
    }

    if (password.length < 8) {
      return errorResponse(res, "Mật khẩu phải có ít nhất 8 ký tự", 400);
    }

    const emailRegex = /^\S+@\S+\.\S+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return errorResponse(res, "Email không hợp lệ", 400);
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return errorResponse(res, "Email đã được sử dụng", 409);
    }

    if (Buffer.byteLength(password, "utf8") > 72) {
      return errorResponse(res, "Mật khẩu không được vượt quá 72 byte", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      fullName: trimmedFullName,
      email: normalizedEmail,
      password: hashedPassword,
    });

    const userData = {
      id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      role: newUser.role,
      avatar: newUser.avatar,
    };

    return successResponse(res, "Đăng ký tài khoản thành công", userData, 201);
  } catch (error) {
    if (error.code === 11000) {
      return errorResponse(res, "Email đã được sử dụng", 409);
    }

    next(error);
  }
};

// LOGIN
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return errorResponse(res, "Vui lòng nhập email và mật khẩu", 400);
    }

    if (Buffer.byteLength(password, "utf8") > 72) {
      return errorResponse(res, "Mật khẩu không được vượt quá 72 byte", 400);
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!user) {
      return errorResponse(res, "Email hoặc mật khẩu không chính xác", 401);
    }

    if (user.status !== "active") {
      return errorResponse(res, "Tài khoản hiện không hoạt động", 403);
    }

    // Tài khoản Google-only không có mật khẩu Local
    if (!user.password) {
      return errorResponse(res, "Tài khoản này sử dụng đăng nhập Google", 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return errorResponse(res, "Email hoặc mật khẩu không chính xác", 401);
    }

    const token = generateToken(user._id.toString());

    const userData = {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    };

    return successResponse(
      res,
      "Đăng nhập thành công",
      {
        user: userData,
        token,
      },
      200,
    );
  } catch (error) {
    next(error);
  }
};

// GOOGLE LOGIN - REDIRECT
const redirectToGoogle = async (req, res, next) => {
  try {
    if (
      !process.env.CLIENT_ID ||
      !process.env.CLIENT_SECRET ||
      !process.env.GOOGLE_CALLBACK_URL
    ) {
      return errorResponse(res, "Google OAuth chưa được cấu hình", 500);
    }

    // Tạo state ngẫu nhiên để chống CSRF
    const state = crypto.randomBytes(32).toString("hex");

    res.cookie(GOOGLE_STATE_COOKIE, state, {
      ...googleCookieOptions,
      maxAge: 5 * 60 * 1000,
    });

    const authorizationUrl = googleClient.generateAuthUrl({
      access_type: "online",
      scope: ["openid", "email", "profile"],
      state,
      prompt: "select_account",
    });

    return res.redirect(authorizationUrl);
  } catch (error) {
    next(error);
  }
};

// GOOGLE LOGIN - CALLBACK
const googleCallback = async (req, res, next) => {
  try {
    const { code, state, error: googleError } = req.query;
    const savedState = req.cookies?.[GOOGLE_STATE_COOKIE];

    // Xóa cookie state sau khi nhận callback
    res.clearCookie(GOOGLE_STATE_COOKIE, googleCookieOptions);

    if (googleError) {
      return errorResponse(res, "Bạn đã hủy đăng nhập Google", 400);
    }

    // Kiểm tra state
    if (typeof state !== "string" || typeof savedState !== "string" || !code) {
      return errorResponse(res, "Yêu cầu xác thực Google không hợp lệ", 400);
    }

    const stateBuffer = Buffer.from(state);
    const savedStateBuffer = Buffer.from(savedState);

    if (
      stateBuffer.length !== savedStateBuffer.length ||
      !crypto.timingSafeEqual(stateBuffer, savedStateBuffer)
    ) {
      return errorResponse(res, "Google OAuth state không hợp lệ", 400);
    }

    // Đổi Authorization Code lấy Token
    const { tokens } = await googleClient.getToken(code);

    if (!tokens.id_token) {
      return errorResponse(res, "Không nhận được Google ID Token", 401);
    }

    // Xác minh ID Token với Google
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (
      !payload ||
      !payload.sub ||
      !payload.email ||
      payload.email_verified !== true
    ) {
      return errorResponse(res, "Thông tin tài khoản Google không hợp lệ", 401);
    }

    const googleId = payload.sub;
    const normalizedEmail = payload.email.toLowerCase().trim();

    // Tìm tài khoản đã liên kết Google
    let user = await User.findOne({ googleId });

    if (!user) {
      // Không tự động liên kết tài khoản chỉ vì trùng email
      const existingUser = await User.findOne({
        email: normalizedEmail,
      });

      if (existingUser) {
        return errorResponse(
          res,
          "Email đã tồn tại. Vui lòng đăng nhập tài khoản hiện tại trước khi liên kết Google",
          409,
        );
      }

      // Tạo tài khoản Google mới
      user = await User.create({
        fullName: payload.name || normalizedEmail.split("@")[0],
        email: normalizedEmail,
        googleId,
        avatar: payload.picture || null,
        role: "reader",
        status: "active",
      });
    }

    if (user.status !== "active") {
      return errorResponse(res, "Tài khoản hiện không hoạt động", 403);
    }

    // Tạo JWT của hệ thống
    const token = generateToken(user._id.toString());

    // Chuyển kết quả về Frontend
    const frontendUrl =
      process.env.FRONTEND_URL ||
      `http://localhost:${process.env.PORT_FRONTEND || 5173}`;

    const redirectUrl = new URL("/auth/google/callback", frontendUrl);

    // Dùng URL fragment để token không được gửi trong HTTP request tiếp theo
    redirectUrl.hash = new URLSearchParams({ token }).toString();

    return res.redirect(redirectUrl.toString());
  } catch (error) {
    if (error.code === 11000) {
      return errorResponse(
        res,
        "Tài khoản Google hoặc email đã được sử dụng",
        409,
      );
    }

    next(error);
  }
};

// LOGOUT
const logout = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return errorResponse(res, "Bạn chưa đăng nhập", 401);
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return errorResponse(res, "Token không hợp lệ", 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.exp) {
      return errorResponse(res, "Token không hợp lệ", 401);
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const expiresAt = new Date(decoded.exp * 1000);

    await TokenBlacklist.create({
      tokenHash,
      expiresAt,
    });

    return successResponse(res, "Đăng xuất thành công", null, 200);
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return errorResponse(res, "Token không hợp lệ hoặc đã hết hạn", 401);
    }

    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  redirectToGoogle,
  googleCallback,
};
