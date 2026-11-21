import { Button, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

const PublisherHeader = ({ user, onCreate }) => (
  <div className="publisher-hero">
    <div>
      <Text className="eyebrow">PUBLISHER WORKSPACE</Text>
      <Title level={2}>Xin chào, {user?.fullName || "Publisher"}</Title>
      <Paragraph>
        Theo dõi kho sách, cập nhật nội dung và đưa những tựa sách mới đến độc giả.
      </Paragraph>
    </div>
    <Button type="primary" size="large" icon={<PlusOutlined />} onClick={onCreate}>
      Thêm sách mới
    </Button>
  </div>
);

export default PublisherHeader;
