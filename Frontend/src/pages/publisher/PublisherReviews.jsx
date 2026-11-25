import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Avatar,
  Card,
  Empty,
  Rate,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import { StarOutlined } from "@ant-design/icons";
import useAuth from "../../hooks/useAuth";
import bookService from "../../services/bookService";
import reviewService from "../../services/reviewService";

const { Title, Text } = Typography;

const unwrapBooks = (payload) => {
  const data = payload?.data ?? payload;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.books)) return data.books;
  return [];
};

const belongsToPublisher = (book, user) => {
  const publisher = book?.publisherId;
  const userId = user?.id || user?._id;
  const publisherUserId = publisher?.userId?._id || publisher?.userId;
  if (userId && publisherUserId) return String(userId) === String(publisherUserId);
  return Boolean(
    user?.email && publisher?.email &&
      user.email.toLowerCase() === publisher.email.toLowerCase(),
  );
};

const PublisherReviews = () => {
  const { token } = useAuth();
  const [searchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState();
  const [reviews, setReviews] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    let active = true;
    const loadBooks = async () => {
      try {
        const response = await bookService.getMyBooks(token);
        const ownBooks = unwrapBooks(response);
        if (active) {
          setBooks(ownBooks);
          const requestedId = searchParams.get("bookId");
          setSelectedBookId(requestedId && ownBooks.some((book) => book._id === requestedId) ? requestedId : ownBooks[0]?._id);
        }
      } catch (error) {
        if (active && error.response?.status !== 401 && error.response?.status !== 403) {
          message.error("Không thể tải danh sách sách");
        }
      } finally {
        if (active) setLoadingBooks(false);
      }
    };
    if (token) loadBooks();
    return () => { active = false; };
  }, [token, searchParams]);

  useEffect(() => {
    if (!token || !selectedBookId) {
      return undefined;
    }
    let active = true;
    const loadReviews = async () => {
      setLoadingReviews(true);
      try {
        const response = await reviewService.getReviewsByBook(token, selectedBookId);
        const data = response?.data || {};
        if (active) setReviews(Array.isArray(data.reviews) ? data.reviews : []);
      } catch (error) {
        if (active && error.response?.status !== 401 && error.response?.status !== 403) message.error("Không thể tải đánh giá của sách");
      } finally {
        if (active) setLoadingReviews(false);
      }
    };
    loadReviews();
    return () => { active = false; };
  }, [selectedBookId, token]);

  const selectedBook = useMemo(
    () => books.find((book) => book._id === selectedBookId),
    [books, selectedBookId],
  );
  const average = reviews.length
    ? reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0) / reviews.length
    : 0;

  const columns = [
    {
      title: "Người đánh giá",
      key: "user",
      render: (_, record) => (
        <Space>
          <Avatar src={record.userId?.avatar}>{record.userId?.fullName?.charAt(0) || "U"}</Avatar>
          <Text>{record.userId?.fullName || "Người dùng"}</Text>
        </Space>
      ),
    },
    {
      title: "Điểm",
      dataIndex: "rating",
      key: "rating",
      render: (value) => <Rate disabled value={Number(value) || 0} />,
    },
    { title: "Nội dung", dataIndex: "comment", key: "comment", render: (value) => value || "Không có nội dung" },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (value) => value ? new Date(value).toLocaleString("vi-VN") : "—",
    },
  ];

  return (
    <div className="publisher-page">
      <div className="publisher-page-heading">
        <div>
          <Text className="publisher-eyebrow">PUBLISHER WORKSPACE</Text>
          <Title level={2}>Đánh giá sách</Title>
          <Text type="secondary">Theo dõi phản hồi của độc giả đối với những sách thuộc hồ sơ của bạn.</Text>
        </div>
        <Tag icon={<StarOutlined />} color="gold">Chỉ xem</Tag>
      </div>
      <Card style={{ marginBottom: 20 }}>
        <Text strong>Chọn sách cần xem đánh giá</Text>
        <Select
          showSearch
          allowClear
          loading={loadingBooks}
          value={selectedBookId}
          optionFilterProp="label"
          placeholder="Chọn một sách của bạn"
          options={books.map((book) => ({ label: book.title, value: book._id }))}
          onChange={setSelectedBookId}
          style={{ width: "100%", marginTop: 10 }}
        />
      </Card>
      <Card
        title={selectedBook ? `Đánh giá: ${selectedBook.title}` : "Danh sách đánh giá"}
        extra={selectedBook && <Tag color="blue">Điểm trung bình: {average.toFixed(1)}/5</Tag>}
      >
        {!selectedBookId ? (
          <Empty description="Chọn sách để xem đánh giá" />
        ) : (
          <Spin spinning={loadingReviews}>
            <Table
              rowKey="_id"
              columns={columns}
              dataSource={reviews}
              scroll={{ x: 800 }}
              pagination={{ pageSize: 8, hideOnSinglePage: true }}
              locale={{ emptyText: <Empty description="Sách này chưa có đánh giá" /> }}
            />
          </Spin>
        )}
      </Card>
      <Text type="secondary" className="publisher-permission-note">
        Publisher chỉ được xem đánh giá theo sách của mình; quyền sửa/xóa đánh giá vẫn thuộc Reader hoặc Admin theo Backend.
      </Text>
    </div>
  );
};

export default PublisherReviews;
