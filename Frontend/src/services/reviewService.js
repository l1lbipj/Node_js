
import api from "./api";

const reviewService = {
  // Lấy danh sách đánh giá dành cho Admin
  getAllReviews: async (token, params = {}) => {
    const response = await api.get("/reviews/admin", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params,
    });

    return response.data;
  },

  // Lấy chi tiết một đánh giá dành cho Admin
  getReviewById: async (token, reviewId) => {
    const response = await api.get(`/reviews/admin/${reviewId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  },

  // Xóa đánh giá
  deleteReview: async (token, reviewId) => {
    const response = await api.delete(`/reviews/${reviewId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  },
};

export default reviewService;
