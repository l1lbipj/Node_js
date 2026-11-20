import { Card, Col, Row, Statistic, Typography } from "antd";
import {
  ArrowUpOutlined,
  BookOutlined,
  FileTextOutlined,
  StarFilled,
  UserOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

const PublisherStats = ({ totalBooks, averageRating, totalReviews, email }) => (
  <Row gutter={[16, 16]} className="stats-row">
    <Col xs={24} sm={12} lg={6}>
      <Card className="stat-card stat-card-blue">
        <Statistic title="Tổng số sách" value={totalBooks} prefix={<BookOutlined />} />
        <Text type="secondary"><ArrowUpOutlined /> Kho sách đang theo dõi</Text>
      </Card>
    </Col>
    <Col xs={24} sm={12} lg={6}>
      <Card className="stat-card stat-card-purple">
        <Statistic title="Đánh giá trung bình" value={averageRating} precision={1} prefix={<StarFilled />} />
        <Text type="secondary">Trên thang điểm 5.0</Text>
      </Card>
    </Col>
    <Col xs={24} sm={12} lg={6}>
      <Card className="stat-card stat-card-green">
        <Statistic title="Lượt đánh giá" value={totalReviews} prefix={<FileTextOutlined />} />
        <Text type="secondary">Phản hồi từ độc giả</Text>
      </Card>
    </Col>
    <Col xs={24} sm={12} lg={6}>
      <Card className="stat-card stat-card-orange">
        <Statistic title="Tài khoản" value="Đang hoạt động" prefix={<UserOutlined />} />
        <Text type="secondary">{email || "Chưa cập nhật email"}</Text>
      </Card>
    </Col>
  </Row>
);

export default PublisherStats;
