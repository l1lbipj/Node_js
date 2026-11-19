
import api from "./api";

const commentService = {
  // Admin lấy danh sách bình luận
  getAllComments: async (token, params = {}) => {
    const response = await api.get("/comments/admin", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params,
    });

    return response.data;
  },

  // Admin xem chi tiết bình luận
  getCommentById: async (token, commentId) => {
    const response = await api.get(`/comments/admin/${commentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  },

  // Xóa bình luận (Admin có thể xóa mọi bình luận)
  deleteComment: async (token, commentId) => {
    const response = await api.delete(`/comments/${commentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  },
};

export default commentService;
