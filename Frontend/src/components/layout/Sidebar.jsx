
import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  BookOutlined,
  ShopOutlined,
  StarOutlined,
  CommentOutlined,
  FlagOutlined,
  ReadOutlined,
  ProfileOutlined,
  MessageOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const { Sider } = Layout;

const Sidebar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuByRole = {
    admin: [
      { key: "/admin", icon: <DashboardOutlined />, label: "Tổng quan" },
      { key: "/admin/users", icon: <UserOutlined />, label: "Quản lý người dùng" },
      { key: "/admin/books", icon: <BookOutlined />, label: "Quản lý sách" },
      { key: "/admin/publishers", icon: <ShopOutlined />, label: "Nhà xuất bản" },
      { key: "/admin/reviews", icon: <StarOutlined />, label: "Quản lý đánh giá" },
      { key: "/admin/comments", icon: <CommentOutlined />, label: "Quản lý bình luận" },
      { key: "/admin/reports", icon: <FlagOutlined />, label: "Quản lý báo cáo" },
      { key: "/admin/forum", icon: <MessageOutlined />, label: "Quản lý diễn đàn" },
      { key: "/admin/activity-logs", icon: <HistoryOutlined />, label: "Nhật ký hoạt động" },
    ],

    publisher: [
      { key: "/publisher", icon: <DashboardOutlined />, label: "Tổng quan" },
      { key: "/publisher/books", icon: <BookOutlined />, label: "Quản lý sách" },
      { key: "/publisher/reviews", icon: <StarOutlined />, label: "Đánh giá sách" },
      { key: "/publisher/comments", icon: <CommentOutlined />, label: "Bình luận" },
    ],

    reader: [
      { key: "/reader", icon: <DashboardOutlined />, label: "Tổng quan" },
      { key: "/reader/books", icon: <ReadOutlined />, label: "Khám phá sách" },
      { key: "/reader/reviews", icon: <StarOutlined />, label: "Đánh giá của tôi" },
      { key: "/reader/comments", icon: <CommentOutlined />, label: "Bình luận của tôi" },
      { key: "/reader/topics", icon: <MessageOutlined />, label: "Diễn đàn của tôi" },
      { key: "/reader/profile", icon: <ProfileOutlined />, label: "Hồ sơ cá nhân" },
    ],
  };

  const menuItems = menuByRole[user?.role] || [];

  const exactMatch = menuItems.find(
    (item) => location.pathname === item.key
  );

  const parentMatch = menuItems
    .filter((item) => location.pathname.startsWith(`${item.key}/`))
    .sort((a, b) => b.key.length - a.key.length)[0];

  const selectedKey =
    exactMatch?.key || parentMatch?.key || menuItems[0]?.key;

  return (
    <Sider
      width={250}
      theme="light"
      style={{
        minHeight: "calc(100vh - 64px)",
        borderRight: "1px solid #e8e8e8",
      }}
    >
      <Menu
        mode="inline"
        selectedKeys={selectedKey ? [selectedKey] : []}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
        style={{
          borderRight: 0,
          paddingTop: 12,
        }}
      />
    </Sider>
  );
};

export default Sidebar;
