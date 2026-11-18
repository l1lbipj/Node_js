import { useEffect, useMemo, useState } from "react";
import {
  Table,
  Button,
  Input,
  Select,
  Space,
  Modal,
  Form,
  Input as AntInput,
  DatePicker,
  Upload,
  Image,
  Tag,
  Typography,
  Row,
  Col,
  Card,
  message,
  Popconfirm,
  Spin,
  Empty,
} from "antd";

import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  BookOutlined,
  ReloadOutlined,
  StarFilled,
} from "@ant-design/icons";

import dayjs from "dayjs";

import bookService from "../../services/bookService";
import api from "../../services/api";
import useAuth from "../../hooks/useAuth";

const { Text, Title } = Typography;
const { TextArea } = AntInput;

const BookManagement = () => {
  const { token } = useAuth();

  // =========================
  // STATE
  // =========================
  const [books, setBooks] = useState([]);
  const [publishers, setPublishers] = useState([]);

  const [loading, setLoading] = useState(false);
  const [publisherLoading, setPublisherLoading] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedPublisher, setSelectedPublisher] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [editingBook, setEditingBook] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);

  const [form] = Form.useForm();

  // =========================
  // FETCH BOOKS
  // =========================
  const fetchBooks = async () => {
    try {
      setLoading(true);

      const response = await bookService.getAllBooks();

      const bookData = response?.data;

      setBooks(Array.isArray(bookData) ? bookData : []);
    } catch (error) {
      message.error(
        error.response?.data?.message || "Không thể tải danh sách sách",
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // FETCH PUBLISHERS
  // =========================
  const fetchPublishers = async () => {
    try {
      setPublisherLoading(true);

      const response = await api.get("/publishers", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          page: 1,
          limit: 100,
        },
      });

      const publisherData = response?.data?.data?.publishers;

      setPublishers(
        Array.isArray(publisherData) ? publisherData : [],
      );
    } catch (error) {
      message.error(
        error.response?.data?.message ||
          "Không thể tải danh sách nhà xuất bản",
      );
    } finally {
      setPublisherLoading(false);
    }
  };

  // =========================
  // INITIAL LOAD
  // =========================
  useEffect(() => {
    fetchBooks();
    fetchPublishers();
  }, []);

  // =========================
  // CATEGORY OPTIONS
  // =========================
  const categoryOptions = useMemo(() => {
    const categories = books.flatMap((book) =>
      Array.isArray(book.category) ? book.category : [],
    );

    return [...new Set(categories)].map((category) => ({
      label: category,
      value: category,
    }));
  }, [books]);

  // =========================
  // FILTER BOOKS
  // =========================
  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const search = searchText.trim().toLowerCase();

      const titleMatch = book.title?.toLowerCase().includes(search);

      const authorMatch = Array.isArray(book.author)
        ? book.author.some((author) =>
            author.toLowerCase().includes(search),
          )
        : false;

      const searchMatch = !search || titleMatch || authorMatch;

      const categoryMatch =
        !selectedCategory ||
        book.category?.includes(selectedCategory);

      const publisherId =
        book.publisherId?._id || book.publisherId;

      const publisherMatch =
        !selectedPublisher ||
        publisherId === selectedPublisher;

      return searchMatch && categoryMatch && publisherMatch;
    });
  }, [books, searchText, selectedCategory, selectedPublisher]);

  // =========================
  // PAGINATION
  // =========================
  const paginatedBooks = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;

    return filteredBooks.slice(
      startIndex,
      startIndex + pageSize,
    );
  }, [filteredBooks, currentPage]);

  // =========================
  // OPEN CREATE MODAL
  // =========================
  const handleCreateBook = () => {
    setEditingBook(null);
    form.resetFields();

    form.setFieldsValue({
      title: "",
      author: "",
      category: "",
      description: "",
      coverImage: "",
      publisherId: undefined,
      publishDate: null,
    });

    setIsFormModalOpen(true);
  };

  // =========================
  // OPEN EDIT MODAL
  // =========================
  const handleEditBook = (book) => {
    setEditingBook(book);

    form.setFieldsValue({
      title: book.title,
      author: Array.isArray(book.author)
        ? book.author.join(", ")
        : book.author,
      category: Array.isArray(book.category)
        ? book.category.join(", ")
        : book.category,
      description: book.description,
      coverImage: book.coverImage,
      publisherId:
        book.publisherId?._id || book.publisherId,
      publishDate: book.publishDate
        ? dayjs(book.publishDate)
        : null,
    });

    setIsFormModalOpen(true);
  };

  // =========================
  // CREATE / UPDATE BOOK
  // =========================
  const handleSubmitBook = async (values) => {
    try {
      const bookData = {
        title: values.title.trim(),

        author: values.author
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),

        category: values.category
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),

        description: values.description.trim(),

        coverImage: values.coverImage.trim(),

        publisherId: values.publisherId,

        publishDate: values.publishDate.toISOString(),
      };

      if (editingBook) {
        await bookService.updateBook(
          token,
          editingBook._id,
          bookData,
        );

        message.success("Cập nhật sách thành công");
      } else {
        await bookService.createBook(token, bookData);

        message.success("Thêm sách thành công");
      }

      setIsFormModalOpen(false);
      form.resetFields();

      await fetchBooks();
    } catch (error) {
      message.error(
        error.response?.data?.message ||
          "Có lỗi xảy ra khi lưu thông tin sách",
      );
    }
  };

  // =========================
  // DELETE BOOK
  // =========================
  const handleDeleteBook = async (bookId) => {
    try {
      await bookService.deleteBook(token, bookId);

      message.success("Xóa sách thành công");

      await fetchBooks();
    } catch (error) {
      message.error(
        error.response?.data?.message || "Không thể xóa sách",
      );
    }
  };

  // =========================
  // VIEW BOOK DETAIL
  // =========================
  const handleViewBook = async (book) => {
    try {
      const response = await bookService.getBookById(book._id);

      setSelectedBook(response?.data || book);
      setIsDetailModalOpen(true);
    } catch (error) {
      message.error(
        error.response?.data?.message ||
          "Không thể tải thông tin sách",
      );
    }
  };

  // =========================
  // TABLE COLUMNS
  // =========================
  const columns = [
    {
      title: "Ảnh bìa",
      dataIndex: "coverImage",
      key: "coverImage",
      width: 100,
      render: (coverImage) => (
        <Image
          src={coverImage}
          width={55}
          height={75}
          style={{
            objectFit: "cover",
            borderRadius: 6,
          }}
          fallback="https://placehold.co/55x75?text=Book"
        />
      ),
    },

    {
      title: "Tên sách",
      dataIndex: "title",
      key: "title",
      render: (title) => <Text strong>{title}</Text>,
    },

    {
      title: "Tác giả",
      dataIndex: "author",
      key: "author",
      render: (authors) => (
        <div>{Array.isArray(authors) ? authors.join(", ") : authors}</div>
      ),
    },

    {
      title: "Thể loại",
      dataIndex: "category",
      key: "category",
      render: (categories) => (
        <Space wrap>
          {Array.isArray(categories) &&
            categories.map((category, index) => (
              <Tag color="blue" key={index}>
                {category}
              </Tag>
            ))}
        </Space>
      ),
    },

    {
      title: "Nhà xuất bản",
      dataIndex: "publisherId",
      key: "publisher",
      render: (publisher) => <Text>{publisher?.name || "Không xác định"}</Text>,
    },

    {
      title: "Đánh giá",
      dataIndex: "averageRating",
      key: "rating",
      align: "center",
      render: (rating) => (
        <Tag color="gold">
          <StarFilled style={{ color: "#faad14" }} />{" "}
          {Number(selectedBook?.averageRating || 0).toFixed(1)} (
          {selectedBook?.totalReview || 0} đánh giá)
        </Tag>
      ),
    },

    {
      title: "Số Reviews",
      dataIndex: "totalReview",
      key: "totalReview",
      align: "center",
      render: (total) => total || 0,
    },

    {
      title: "Thao tác",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewBook(record)}
            title="Xem chi tiết"
          />

          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditBook(record)}
            title="Chỉnh sửa"
          />

          <Popconfirm
            title="Xóa sách"
            description={`Bạn có chắc chắn muốn xóa "${record.title}"?`}
            onConfirm={() => handleDeleteBook(record._id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{
              danger: true,
            }}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              title="Xóa sách"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // =========================
  // RENDER
  // =========================
  return (
    <div>
      {/* HEADER */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={3} style={{ margin: 0 }}>
            <BookOutlined /> Book Management
          </Title>

          <Text type="secondary">Quản lý danh sách sách trong hệ thống</Text>
        </Col>

        <Col>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchBooks}
              loading={loading}
            >
              Làm mới
            </Button>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreateBook}
            >
              Thêm sách
            </Button>
          </Space>
        </Col>
      </Row>

      {/* STATISTICS */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Text type="secondary">Tổng số sách</Text>

            <Title level={2} style={{ margin: "8px 0 0" }}>
              {books.length}
            </Title>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Text type="secondary">Số thể loại</Text>

            <Title level={2} style={{ margin: "8px 0 0" }}>
              {categoryOptions.length}
            </Title>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Text type="secondary">Nhà xuất bản</Text>

            <Title level={2} style={{ margin: "8px 0 0" }}>
              {publishers.length}
            </Title>
          </Card>
        </Col>
      </Row>

      {/* FILTERS */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Input
              placeholder="Tìm theo tên sách hoặc tác giả..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(event) => {
                setSearchText(event.target.value);
                setCurrentPage(1);
              }}
              allowClear
            />
          </Col>

          <Col xs={24} md={8}>
            <Select
              placeholder="Lọc theo thể loại"
              style={{ width: "100%" }}
              value={selectedCategory}
              options={categoryOptions}
              onChange={(value) => {
                setSelectedCategory(value);
                setCurrentPage(1);
              }}
              allowClear
            />
          </Col>

          <Col xs={24} md={8}>
            <Select
              placeholder="Lọc theo nhà xuất bản"
              style={{ width: "100%" }}
              value={selectedPublisher}
              loading={publisherLoading}
              options={publishers.map((publisher) => ({
                label: publisher.name,
                value: publisher._id,
              }))}
              onChange={(value) => {
                setSelectedPublisher(value);
                setCurrentPage(1);
              }}
              allowClear
            />
          </Col>
        </Row>
      </Card>

      {/* BOOK TABLE */}
      <Card>
        <Table
          columns={columns}
          dataSource={paginatedBooks}
          rowKey="_id"
          loading={loading}
          scroll={{ x: 1000 }}
          locale={{
            emptyText: <Empty description="Không có sách nào" />,
          }}
          pagination={{
            current: currentPage,
            pageSize,
            total: filteredBooks.length,
            showSizeChanger: false,
            showTotal: (total) => `Tổng cộng ${total} sách`,
            onChange: (page) => setCurrentPage(page),
          }}
        />
      </Card>

      {/* CREATE / EDIT MODAL */}
      <Modal
        title={editingBook ? "Chỉnh sửa sách" : "Thêm sách mới"}
        open={isFormModalOpen}
        onCancel={() => {
          setIsFormModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        width={800}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={handleSubmitBook}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Tên sách"
                name="title"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập tên sách",
                  },
                ]}
              >
                <Input placeholder="Nhập tên sách" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Tác giả"
                name="author"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập tác giả",
                  },
                ]}
              >
                <Input placeholder="Ví dụ: Nguyễn Nhật Ánh, Nam Cao" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Thể loại"
                name="category"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập thể loại",
                  },
                ]}
              >
                <Input placeholder="Ví dụ: Văn học, Tiểu thuyết" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Nhà xuất bản"
                name="publisherId"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn nhà xuất bản",
                  },
                ]}
              >
                <Select
                  placeholder="Chọn nhà xuất bản"
                  loading={publisherLoading}
                  options={publishers.map((publisher) => ({
                    label: publisher.name,
                    value: publisher._id,
                  }))}
                  showSearch
                  optionFilterProp="label"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Ngày xuất bản"
            name="publishDate"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn ngày xuất bản",
              },
            ]}
          >
            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item
            label="Ảnh bìa (URL)"
            name="coverImage"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập URL ảnh bìa",
              },
            ]}
          >
            <Input placeholder="https://example.com/book-cover.jpg" />
          </Form.Item>

          <Form.Item
            label="Mô tả"
            name="description"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập mô tả sách",
              },
            ]}
          >
            <TextArea rows={4} placeholder="Nhập mô tả sách..." />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Row justify="end">
              <Space>
                <Button
                  onClick={() => {
                    setIsFormModalOpen(false);
                    form.resetFields();
                  }}
                >
                  Hủy
                </Button>

                <Button type="primary" htmlType="submit">
                  {editingBook ? "Cập nhật" : "Thêm sách"}
                </Button>
              </Space>
            </Row>
          </Form.Item>
        </Form>
      </Modal>

      {/* BOOK DETAIL MODAL */}
      <Modal
        title="Chi tiết sách"
        open={isDetailModalOpen}
        onCancel={() => {
          setIsDetailModalOpen(false);
          setSelectedBook(null);
        }}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalOpen(false)}>
            Đóng
          </Button>,
        ]}
        width={750}
      >
        {selectedBook && (
          <Spin spinning={false}>
            <Row gutter={24}>
              <Col xs={24} md={8}>
                <Image
                  src={selectedBook.coverImage}
                  width="100%"
                  style={{
                    borderRadius: 8,
                    objectFit: "cover",
                  }}
                  fallback="https://placehold.co/300x400?text=Book"
                />
              </Col>

              <Col xs={24} md={16}>
                <Title level={4}>{selectedBook.title}</Title>

                <Text type="secondary">Tác giả: </Text>

                <Text>
                  {Array.isArray(selectedBook.author)
                    ? selectedBook.author.join(", ")
                    : selectedBook.author}
                </Text>

                <br />
                <br />

                <Text type="secondary">Nhà xuất bản: </Text>

                <Text>
                  {selectedBook.publisherId?.name || "Không xác định"}
                </Text>

                <br />
                <br />

                <Text type="secondary">Thể loại: </Text>

                <Space wrap>
                  {selectedBook.category?.map((category, index) => (
                    <Tag color="blue" key={index}>
                      {category}
                    </Tag>
                  ))}
                </Space>

                <br />
                <br />

                <Text type="secondary">Ngày xuất bản: </Text>

                <Text>
                  {selectedBook.publishDate
                    ? dayjs(selectedBook.publishDate).format("DD/MM/YYYY")
                    : "Không xác định"}
                </Text>

                <br />
                <br />

                <Text type="secondary">Điểm đánh giá: </Text>

                <Tag color="gold">
                  <StarFilled />{" "}
                  {Number(selectedBook.averageRating || 0).toFixed(1)}
                </Tag>

                <br />
                <br />

                <Text type="secondary">Tổng Reviews: </Text>

                <Text>{selectedBook.totalReview || 0}</Text>
              </Col>
            </Row>

            <Card size="small" title="Mô tả sách" style={{ marginTop: 24 }}>
              <Text>{selectedBook.description || "Chưa có mô tả"}</Text>
            </Card>
          </Spin>
        )}
      </Modal>
    </div>
  );
};

export default BookManagement;