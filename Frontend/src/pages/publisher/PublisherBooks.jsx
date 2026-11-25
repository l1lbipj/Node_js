import { useEffect, useMemo, useState } from "react";
import { Alert, Col, Form, Row, message } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import bookService from "../../services/bookService";
import useAuth from "../../hooks/useAuth";
import PublisherHeader from "../../components/publisher/PublisherHeader";
import PublisherBooksTable from "../../components/publisher/PublisherBookTable";
import PublisherBookForm from "./PublisherBookForm";

const emptyBook = { title: "", author: [], category: [], description: "", coverImage: "", publishDate: "" };
const unwrap = (p) => Array.isArray(p?.data) ? p.data : (p?.data?.books || []);
const arr = (v) => Array.isArray(v) ? v : (typeof v === "string" && v.trim() ? [v.trim()] : []);

const PublisherBooks = () => {
  const { user, token } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const fetchBooks = async () => {
    if (!token) return;
    setLoading(true);
    try {
      setBooks(unwrap(await bookService.getMyBooks(token)));
    } catch (error) {
      if (error.response?.status !== 401 && error.response?.status !== 403) {
        message.error("Không thể tải danh sách sách");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBooks(); }, [token]);

  const categories = useMemo(() => [...new Set(books.flatMap((book) => arr(book.category)))].sort(), [books]);
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return books.filter((book) => (
      (!query || [book.title, ...arr(book.author), ...arr(book.category)].join(" ").toLowerCase().includes(query))
      && (!category || arr(book.category).includes(category))
    ));
  }, [books, search, category]);

  const openCreate = () => { setEditing(null); form.setFieldsValue(emptyBook); setOpen(true); };
  const openEdit = (book) => {
    setEditing(book);
    form.setFieldsValue({ ...book, author: arr(book.author), category: arr(book.category), publishDate: book.publishDate?.slice?.(0, 10) || "" });
    setOpen(true);
  };
  const close = () => { setOpen(false); setEditing(null); form.resetFields(); };
  const submit = async () => {
    try {
      const values = await form.validateFields();
      const payload = { ...values, author: arr(values.author), category: arr(values.category) };
      setSaving(true);
      if (editing) await bookService.updateBook(token, editing._id, payload);
      else await bookService.createBook(token, payload);
      message.success(editing ? "Cập nhật sách thành công" : "Thêm sách mới thành công");
      close();
      fetchBooks();
    } catch (error) {
      if (!error.errorFields && error.response?.status !== 401 && error.response?.status !== 403) {
        message.error(error.response?.data?.message || "Không thể lưu sách");
      }
    } finally { setSaving(false); }
  };
  const remove = async (id) => {
    try { await bookService.deleteBook(token, id); message.success("Đã xóa sách"); fetchBooks(); }
    catch (error) { if (error.response?.status !== 401 && error.response?.status !== 403) message.error("Không thể xóa sách"); }
  };

  return (
    <div className="publisher-page">
      <PublisherHeader user={user} onCreate={openCreate} />
      <Alert className="publisher-notice" type="info" showIcon icon={<CheckCircleOutlined />} message="Quản lý sách của Publisher" description="Chỉ hiển thị sách thuộc hồ sơ của bạn. Bạn có thể thêm, sửa, xóa sách và xem đánh giá." />
      <Row gutter={[16, 16]}>
        <Col xs={24}><PublisherBooksTable books={filtered} loading={loading} search={search} category={category} categories={categories} onSearch={setSearch} onCategoryChange={setCategory} onRefresh={fetchBooks} onEdit={openEdit} onDelete={remove} /></Col>
      </Row>
      <PublisherBookForm open={open} editingBook={editing} form={form} saving={saving} onCancel={close} onSubmit={submit} />
    </div>
  );
};
export default PublisherBooks;
