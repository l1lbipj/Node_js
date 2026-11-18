import api from "./api";

const publisherService = {
  // Lấy danh sách Publisher
  getAllPublishers: async (token, params = {}) => {
    const response = await api.get("/publishers", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params,
    });

    return response.data;
  },

  // Lấy chi tiết Publisher
  getPublisherById: async (token, publisherId) => {
    const response = await api.get(`/publishers/${publisherId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  },

  // Tạo Publisher
  createPublisher: async (token, publisherData) => {
    const response = await api.post("/publishers", publisherData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  },

  // Cập nhật Publisher
  updatePublisher: async (token, publisherId, publisherData) => {
    const response = await api.put(
      `/publishers/${publisherId}`,
      publisherData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  },

  // Xóa Publisher
  deletePublisher: async (token, publisherId) => {
    const response = await api.delete(`/publishers/${publisherId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  },
};

export default publisherService;