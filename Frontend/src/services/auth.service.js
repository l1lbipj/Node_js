
import api from "./api";

const authService = {
  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  getMe: async (token) => {
    const response = await api.get("/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  logout: async (token) => {
    const response = await api.post("/auth/logout", null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  googleLogin: () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/google`;
  },
};

export default authService;
