
import {
  Avatar,
  Button,
  Dropdown,
  Layout,
  Space,
  Typography,
} from "antd";

import {
  UserOutlined,
  LogoutOutlined,
  DownOutlined,
} from "@ant-design/icons";

import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const { Header: AntHeader } = Layout;
const { Text, Title } = Typography;

const HeaderAdmin = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Đăng xuất
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
    } finally {
      navigate("/login", { replace: true });
    }
  };

  // Menu tài khoản Admin
  const menuItems = [
  {
    key: "logout",
    icon: <LogoutOutlined />,
    label: "Đăng xuất",
    danger: true,
    onClick: handleLogout,
  },
];
  return (
    <AntHeader
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        background: "#001529",
        height: 64,
        lineHeight: "64px",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        width: "100%",
      }}
    >
      {/* Logo và tên hệ thống */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          cursor: "pointer",
        }}
        onClick={() => navigate("/admin")}
      >
        <Title
          level={4}
          style={{
            color: "#fff",
            margin: 0,
            fontWeight: 700,
          }}
        >
          BOOK NEST
        </Title>

        <Text
          style={{
            color: "#91caff",
            fontSize: 12,
            borderLeft: "1px solid #526477",
            paddingLeft: 12,
          }}
        >
          ADMIN PANEL
        </Text>
      </div>

      {/* Thông tin tài khoản */}
      <Dropdown
        menu={{ items: menuItems }}
        placement="bottomRight"
        trigger={["click"]}
      >
        <Button
          type="text"
          style={{
            height: 48,
            padding: "0 10px",
            color: "#fff",
          }}
        >
          <Space size={10}>
            <Avatar
              size={36}
              src={user?.avatar}
              icon={<UserOutlined />}
            />

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                lineHeight: 1.4,
              }}
            >
              <Text
                strong
                style={{
                  color: "#fff",
                  fontSize: 13,
                }}
              >
                {user?.fullName || user?.username || "Admin"}
              </Text>

              <Text
                style={{
                  color: "#91caff",
                  fontSize: 12,
                }}
              >
                Quản trị viên
              </Text>
            </div>

            <DownOutlined style={{ fontSize: 11 }} />
          </Space>
        </Button>
      </Dropdown>
    </AntHeader>
  );
};

export default HeaderAdmin;
