import { Avatar, Button, Dropdown, Layout, Space, Typography } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const { Header: AntHeader } = Layout;
const { Text, Title } = Typography;

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
    } finally {
      navigate("/login", { replace: true });
    }
  };

  const roleLabels = {
    admin: "Quản trị viên",
    publisher: "Nhà xuất bản",
    reader: "Độc giả",
  };

  const menuItems = [
    {
      key: "logout",
      label: "Đăng xuất",
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <AntHeader
      style={{
        background: "#ffffff",
        padding: "0 24px",
        height: 64,
        lineHeight: "normal",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid #e8e8e8",
      }}
    >
      {/* Tên hệ thống */}
      <Title
        level={4}
        style={{
          margin: 0,
          color: "#1677ff",
          lineHeight: 1.4,
        }}
      >
        Book Review & Publisher Portal
      </Title>

      {/* Thông tin người dùng */}
      <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
        <Button
          type="text"
          style={{
            height: 48,
            padding: "4px 8px",
            display: "flex",
            alignItems: "center",
            lineHeight: "normal",
          }}
        >
          <Space size={10} align="center">
            <Avatar
              src={user?.avatar || undefined}
              icon={<UserOutlined />}
              size={40}
            />

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "flex-start",
                gap: 3,
              }}
            >
              <Text strong style={{ lineHeight: 1.4 }}>
                {user?.fullName || "Người dùng"}
              </Text>

              <Text
                type="secondary"
                style={{ fontSize: 12, lineHeight: 1.4 }}
              >
                {roleLabels[user?.role] || user?.role || ""}
              </Text>
            </div>

            <DownOutlined style={{ fontSize: 12 }} />
          </Space>
        </Button>
      </Dropdown>
    </AntHeader>
  );
};

export default Header;