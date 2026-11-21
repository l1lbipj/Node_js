
import api from "./api";

const reviewService = {
  // Lấy danh sách đánh giá của một cuốn sách
  getReviewsByBook: async (bookId, token) => {
    const response = await api.get(`/reviews/book/${bookId}`, {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
    });

    return response.data;
  },

  // Lấy danh sách tất cả đánh giá dành cho Admin
  getAllReviews: async (token, params = {}) => {
    const response = await api.get("/reviews/admin", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params,
    });

    return response.data;
  },

  // Lấy chi tiết một đánh giá
  getReviewById: async (token, reviewId) => {
    const response = await api.get(`/reviews/${reviewId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  },

  // Tạo đánh giá mới
  createReview: async (token, reviewData) => {
    const response = await api.post("/reviews", reviewData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  },

  // Cập nhật đánh giá
  updateReview: async (token, reviewId, reviewData) => {
    const response = await api.put(
      `/reviews/${reviewId}`,
      reviewData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

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
