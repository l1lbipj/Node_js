import api from "./api";

const bookService = {
  // Lấy danh sách sách
  getAllBooks: async () => {
    const response = await api.get("/books");
    return response.data;
  },
  // Lấy publisher's book
    getMyBooks: async (token) => {
    const response = await api.get("/books/mine", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  },

  // Lấy chi tiết sách
  getBookById: async (bookId) => {
    const response = await api.get(`/books/${bookId}`);
    return response.data;
  },

  // Tạo sách mới
  createBook: async (token, bookData) => {
    const response = await api.post("/books", bookData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  },

  // Cập nhật sách
  updateBook: async (token, bookId, bookData) => {
    const response = await api.put(`/books/${bookId}`, bookData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  },

  // Xóa sách
  deleteBook: async (token, bookId) => {
    const response = await api.delete(`/books/${bookId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  },
};

export default bookService;