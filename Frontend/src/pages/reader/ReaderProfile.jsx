import { Typography, Card } from "antd";

const { Title } = Typography;

const ReaderProfile = () => {
  return (
    <Card>
      <Title level={3}>Hồ sơ cá nhân</Title>
      <p>Đây là khu vực quản lý thông tin tài khoản Reader.</p>
    </Card>
  );
};

export default ReaderProfile;