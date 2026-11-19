const TOKEN_KEY = "accessToken";
const USER_KEY = "user";

const storage = {
  // Lưu JWT
  setToken: (token) => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  // Lấy JWT
  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },

  // Lưu thông tin người dùng
  setUser: (user) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  // Lấy thông tin người dùng
  getUser: () => {
    try {
      const user = localStorage.getItem(USER_KEY);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      localStorage.removeItem(USER_KEY);
      return null;
    }
  },

  // Xóa thông tin xác thực
  clearAuth: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

export default storage;