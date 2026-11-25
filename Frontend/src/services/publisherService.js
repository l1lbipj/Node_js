import api from "./api";

const auth = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

const publisherService = {
  // Publisher lấy hồ sơ và thống kê của chính mình.
  getMyPublisher: async (token) => {
    const response = await api.get("/publishers/me", auth(token));
    return response.data;
  },

  // Admin lấy danh sách Publisher.
  getAllPublishers: async (token, params = {}) => {
    const response = await api.get("/publishers", { ...auth(token), params });
    return response.data;
  },

  // Admin xem chi tiết Publisher.
  getPublisherById: async (token, publisherId) => {
    const response = await api.get(`/publishers/${publisherId}`, auth(token));
    return response.data;
  },

  // Admin tạo Publisher.
  createPublisher: async (token, publisherData) => {
    const response = await api.post("/publishers", publisherData, auth(token));
    return response.data;
  },

  // Admin cập nhật Publisher.
  updatePublisher: async (token, publisherId, publisherData) => {
    const response = await api.put(
      `/publishers/${publisherId}`,
      publisherData,
      auth(token),
    );
    return response.data;
  },

  // Admin xóa Publisher.
  deletePublisher: async (token, publisherId) => {
    const response = await api.delete(`/publishers/${publisherId}`, auth(token));
    return response.data;
  },
};

export default publisherService;
