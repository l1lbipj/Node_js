import { Avatar, Card, List, Tag, Typography } from "antd";
import { ShopOutlined, UserOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const PublisherProfile = ({ user }) => (
  <Card className="account-card" title={<span><ShopOutlined /> Hồ sơ tài khoản</span>}>
    <div className="account-profile">
      <Avatar size={72} src={user?.avatar || undefined} icon={<UserOutlined />} />
      <Title level={4}>{user?.fullName || "Publisher"}</Title>
      <Tag color="blue">PUBLISHER</Tag>
    </div>
    <List
      size="small"
      dataSource={[
        ["Email", user?.email || "Chưa cập nhật"],
        ["Trạng thái", "Đang hoạt động"],
        ["Vai trò", "Nhà xuất bản"],
      ]}
      renderItem={([label, value]) => (
        <List.Item><Text type="secondary">{label}</Text><Text strong>{value}</Text></List.Item>
      )}
    />
    <div className="account-tip">
      <Text strong>Gợi ý</Text>
      <Text type="secondary">Giữ ảnh bìa, mô tả và ngày xuất bản chính xác để trang sách luôn chuyên nghiệp.</Text>
    </div>
  </Card>
);

export default PublisherProfile;
