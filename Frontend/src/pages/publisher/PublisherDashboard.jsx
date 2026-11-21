import { useEffect, useMemo, useState } from "react";
import { Alert, Col, Form, Row, message } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import bookService from "../../services/bookService";
import useAuth from "../../hooks/useAuth";
import PublisherHeader from "../../components/publisher/PublisherHeader";
import PublisherStats from "../../components/publisher/PublisherStats";
import PublisherBooks from "./PublisherBooks";
import PublisherBookForm from "./PublisherBookForm";
import PublisherProfile from "./PublisherProfile";
import "./PublisherDashboard.css";

const emptyBook = { title: "", author: [], category: [], description: "", coverImage: "", publishDate: "" };

const unwrapBooks = (payload) => {
  const data = payload?.data ?? payload;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.books)) return data.books;
  return [];
};

const normalizeArray = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return [];
};

const matchesCurrentPublisher = (book, user) => {
  const publisher = book?.publisherId;
  if (!publisher || typeof publisher !== "object") return false;
  const userId = user?.id || user?._id;
  const publisherUserId = publisher.userId?._id || publisher.userId;
  if (userId && publisherUserId && String(userId) === String(publisherUserId)) return true;
  return Boolean(user?.email && publisher.email && user.email.toLowerCase() === publisher.email.toLowerCase());
};

const PublisherDashboard = () => {
  const { user, token } = useAuth();
  const [allBooks, setAllBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await bookService.getAllBooks();
      setAllBooks(unwrapBooks(response));
    } catch (error) {
      message.error(error.response?.data?.message || "Không thể tải danh sách sách");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(fetchBooks, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const publisherBooks = useMemo(() => {
    const matched = allBooks.filter((book) => matchesCurrentPublisher(book, user));
    // Backend hiện populate publisher name/email nhưng chưa luôn trả userId.
    return matched.length > 0 || allBooks.length === 0 ? matched : allBooks;
  }, [allBooks, user]);

  const categories = useMemo(
    () => [...new Set(publisherBooks.flatMap((book) => normalizeArray(book.category)))].sort(),
    [publisherBooks],
  );

  const filteredBooks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return publisherBooks.filter((book) => {
      const searchable = [book.title, ...normalizeArray(book.author), ...normalizeArray(book.category)].join(" ").toLowerCase();
      return (!query || searchable.includes(query)) && (!category || normalizeArray(book.category).includes(category));
    });
  }, [category, publisherBooks, search]);

  const averageRating = publisherBooks.length
    ? publisherBooks.reduce((sum, book) => sum + Number(book.averageRating || 0), 0) / publisherBooks.length
    : 0;
  const totalReviews = publisherBooks.reduce((sum, book) => sum + Number(book.totalReview || 0), 0);

  const openCreate = () => {
    setEditingBook(null);
    form.setFieldsValue(emptyBook);
    setModalOpen(true);
  };

  const openEdit = (book) => {
    setEditingBook(book);
    form.setFieldsValue({
      title: book.title,
      author: normalizeArray(book.author),
      category: normalizeArray(book.category),
      description: book.description || "",
      coverImage: book.coverImage || "",
      publishDate: book.publishDate?.slice?.(0, 10) || "",
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingBook(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = { ...values, author: normalizeArray(values.author), category: normalizeArray(values.category) };
      setSaving(true);
      if (editingBook) {
        await bookService.updateBook(token, editingBook._id, payload);
        message.success("Cập nhật sách thành công");
      } else {
        await bookService.createBook(token, payload);
        message.success("Thêm sách mới thành công");
      }
      closeModal();
      await fetchBooks();
    } catch (error) {
      if (error.errorFields) return;
      message.error(error.response?.data?.message || "Không thể lưu thông tin sách");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (bookId) => {
    try {
      await bookService.deleteBook(token, bookId);
      message.success("Đã xóa sách");
      await fetchBooks();
    } catch (error) {
      message.error(error.response?.data?.message || "Không thể xóa sách này");
    }
  };

  return (
    <div className="publisher-page">
      <PublisherHeader user={user} onCreate={openCreate} />
      <Alert
        className="publisher-notice"
        type="info"
        showIcon
        icon={<CheckCircleOutlined />}
        message="Bạn đang ở không gian quản lý Publisher"
        description="Bạn chỉ có thể chỉnh sửa hoặc xóa sách thuộc tài khoản Publisher của mình. Backend sẽ kiểm tra quyền sở hữu ở mỗi thao tác."
      />
      <PublisherStats totalBooks={publisherBooks.length} averageRating={averageRating} totalReviews={totalReviews} email={user?.email} />
      <Row gutter={[16, 16]} align="stretch">
        <Col xs={24} xl={17}>
          <PublisherBooks
            books={filteredBooks}
            loading={loading}
            search={search}
            category={category}
            categories={categories}
            onSearch={setSearch}
            onCategoryChange={setCategory}
            onRefresh={fetchBooks}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        </Col>
        <Col xs={24} xl={7}>
          <PublisherProfile user={user} />
        </Col>
      </Row>
      <PublisherBookForm open={modalOpen} editingBook={editingBook} form={form} saving={saving} onCancel={closeModal} onSubmit={handleSubmit} />
    </div>
  );
};

export default PublisherDashboard;
