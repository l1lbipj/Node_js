
import api from "./api";

const reviewService = {
  // Lấy danh sách đánh giá của một cuốn sách
  getReviewsByBook: async (bookId) => {
    const response = await api.get(`/reviews/book/${bookId}`);
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

  // Lấy chi tiết một đánh giá
  getReviewById: async (token, reviewId) => {
    const response = await api.get(`/reviews/${reviewId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  },

  // Cập nhật đánh giá
  updateReview: async (token, reviewId, reviewData) => {
    const response = await api.put(`/reviews/${reviewId}`, reviewData, {
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
