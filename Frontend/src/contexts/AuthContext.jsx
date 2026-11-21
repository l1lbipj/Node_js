import { createContext, useState, useEffect } from "react";
import authService from "../services/auth.service";
import storage from "../utils/storage";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => storage.getUser());
  const [token, setToken] = useState(() => storage.getToken());
  const [loading, setLoading] = useState(true);

  // Khởi tạo và xác thực trạng thái đăng nhập
  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = storage.getToken();
      const savedUser = storage.getUser();

      if (!savedToken || !savedUser) {
        storage.clearAuth();
        setToken(null);
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        // Kiểm tra token với Backend
        const result = await authService.getMe(savedToken);

        if (result.success && result.data) {
          // Cập nhật thông tin user mới nhất
          storage.setUser(result.data);
          setUser(result.data);
          setToken(savedToken);
        } else {
          // Token không hợp lệ
          storage.clearAuth();
          setToken(null);
          setUser(null);
        }
      } catch (error) {
        // Token hết hạn hoặc không xác thực được
        storage.clearAuth();
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Đăng nhập
  const login = async (credentials) => {
    const result = await authService.login(credentials);

    if (result.success) {
      const { user, token } = result.data;

      storage.setToken(token);
      storage.setUser(user);

      setToken(token);
      setUser(user);
    }

    return result;
  };

  // Đăng nhập Google
  const googleLoginCallback = async (googleToken) => {
    const result = await authService.getMe(googleToken);

    if (result.success) {
      const userData = result.data;

      storage.setToken(googleToken);
      storage.setUser(userData);

      setToken(googleToken);
      setUser(userData);
    }

    return result;
  };

  // Đăng ký
  const register = async (userData) => {
    return await authService.register(userData);
  };

  // Đăng xuất
  const logout = async () => {
    try {
      if (token) {
        await authService.logout(token);
      }
    } finally {
      storage.clearAuth();
      setToken(null);
      setUser(null);
    }
  };

  // Cập nhật thông tin người dùng
  const updateUser = (userData) => {
    storage.setUser(userData);
    setUser(userData);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(token && user),
    login,
    googleLoginCallback,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};