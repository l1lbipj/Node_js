import { Alert, Card, Descriptions, Tag, Typography } from "antd";
import { LockOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const PublisherRestrictedManagement = ({ type }) => {
  const isReports = type === "reports";
  const title = isReports ? "Quản lý báo cáo" : "Quản lý bình luận";
  const endpoint = isReports ? "/api/reports" : "/api/comments/admin";
  const reason = isReports
    ? "Toàn bộ Report API hiện yêu cầu role admin."
    : "Các endpoint quản lý toàn bộ bình luận và xử lý báo cáo comment hiện yêu cầu role admin.";

  return (
    <div className="publisher-page">
      <div className="publisher-page-heading">
        <div>
          <Text className="publisher-eyebrow">PUBLISHER WORKSPACE</Text>
          <Title level={2}>{title}</Title>
          <Text type="secondary">Khu vực được hiển thị theo cấu trúc quản trị, nhưng chưa mở quyền xử lý cho Publisher.</Text>
        </div>
        <Tag icon={<LockOutlined />} color="default">Admin only</Tag>
      </div>
      <Card>
        <Alert
          type="warning"
          showIcon
          message="Tính năng đang bị giới hạn bởi Backend"
          description={reason}
        />
        <Descriptions bordered column={1} size="small" style={{ marginTop: 20 }}>
          <Descriptions.Item label="Endpoint liên quan"><Text code>{endpoint}</Text></Descriptions.Item>
          <Descriptions.Item label="Quyền hiện tại"><Tag color="red">Chỉ Admin</Tag></Descriptions.Item>
          <Descriptions.Item label="Publisher có thể làm gì">Chưa thể tải danh sách, xem chi tiết hoặc cập nhật trạng thái qua API hiện tại.</Descriptions.Item>
          <Descriptions.Item label="Muốn mở chức năng">Backend cần bổ sung endpoint và middleware kiểm tra Publisher theo các sách thuộc hồ sơ của mình.</Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default PublisherRestrictedManagement;
