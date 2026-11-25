import { useEffect, useState } from "react";
import { Alert, Card, Col, Row, Statistic, Typography, message } from "antd";
import { BookOutlined, CommentOutlined, FlagOutlined, StarFilled } from "@ant-design/icons";
import useAuth from "../../hooks/useAuth";
import PublisherHeader from "../../components/publisher/PublisherHeader";
import PublisherProfile from "../../components/publisher/PublisherProfile";
import publisherService from "../../services/publisherService";
import bookService from "../../services/bookService";
import "./PublisherDashboard.css";

const { Text } = Typography;

const PublisherDashboard = () => {
  const { user, token } = useAuth();
  const [stats, setStats] = useState({ totalBooks: 0, averageRating: 0, totalReviews: 0 });

  useEffect(() => {
    if (!token) return undefined;
    let active = true;

    const loadDashboard = async () => {
      try {
        const [publisherResponse, booksResponse] = await Promise.all([
          publisherService.getMyPublisher(token),
          bookService.getMyBooks(token),
        ]);
        const publisherStats = publisherResponse?.data?.stats || {};
        const booksData = booksResponse?.data;
        const books = Array.isArray(booksData)
          ? booksData
          : Array.isArray(booksData?.books)
            ? booksData.books
            : [];
        const totalBooks = books.length || Number(publisherStats.totalBooks || 0);
        const totalReviews = books.reduce(
          (sum, book) => sum + Number(book.totalReview || 0),
          Number(publisherStats.totalReviews || 0),
        );
        const averageRating = books.length
          ? books.reduce((sum, book) => sum + Number(book.averageRating || 0), 0) / books.length
          : Number(publisherStats.averageRating || 0);

        if (active) setStats({ totalBooks, totalReviews, averageRating });
      } catch (error) {
        // Không hiện thông báo "không có quyền" trong giao diện Publisher.
        if (error.response?.status !== 401 && error.response?.status !== 403) {
          message.error("Không thể tải Dashboard");
        }
      }
    };

    loadDashboard();
    return () => { active = false; };
  }, [token]);

  return (
    <div className="publisher-page">
      <PublisherHeader user={user} />
      <Alert
        className="publisher-notice"
        type="info"
        showIcon
        message="Tổng quan Publisher"
        description="Dashboard chỉ hiển thị số liệu tổng quan. Để thêm hoặc chỉnh sửa sách, hãy mở trang Quản lý sách."
      />
      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card stat-card-blue">
            <Statistic title="Tổng số sách" value={stats.totalBooks || 0} prefix={<BookOutlined />} />
            <Text type="secondary">Sách thuộc hồ sơ của bạn</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card stat-card-purple">
            <Statistic title="Đánh giá trung bình" value={stats.averageRating || 0} precision={1} prefix={<StarFilled />} />
            <Text type="secondary">Trên thang điểm 5.0</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card stat-card-green">
            <Statistic title="Lượt đánh giá" value={stats.totalReviews || 0} prefix={<CommentOutlined />} />
            <Text type="secondary">Phản hồi từ độc giả</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card stat-card-orange">
            <Statistic title="Báo cáo liên quan" value="Xem chi tiết" prefix={<FlagOutlined />} />
            <Text type="secondary">Trong mục Báo cáo</Text>
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={10}>
          <PublisherProfile user={user} />
        </Col>
      </Row>
    </div>
  );
};

export default PublisherDashboard;
