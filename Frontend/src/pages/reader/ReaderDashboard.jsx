import { Typography, Card } from "antd";

const { Title } = Typography;

const ReaderDashboard = () => {
  return (
    <Card>
      <Title level={3}>Dashboard Reader</Title>
      <p>Đây là khu vực thống kê và theo dõi hoạt động cá nhân.</p>
      <h1>Xin chao</h1>
    </Card>
  );
};

export default ReaderDashboard;