
import api from "./api";

const authService = {
  // Đăng ký
  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  // Đăng nhập
  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  // Đăng xuất
  logout: async (token) => {
    const response = await api.post(
      "/auth/logout",
      null,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  },

  // Đăng nhập Google
  googleLogin: () => {
    window.location.href = `${
      import.meta.env.VITE_API_BASE_URL
    }/auth/google`;
  },
};

export default authService;
