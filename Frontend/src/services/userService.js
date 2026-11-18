import api from "./api";

const userService = {
  // Lấy danh sách người dùng
  getAllUsers: async (token, params = {}) => {
    const response = await api.get("/users", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params,
    });

    return response.data;
  },

  // Lấy thông tin chi tiết người dùng
  getUserById: async (token, userId) => {
    const response = await api.get(`/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  },

  // Cập nhật thông tin người dùng
  updateUser: async (token, userId, userData) => {
    const response = await api.put(`/users/${userId}`, userData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  },
};

export default userService;