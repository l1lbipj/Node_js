
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Input, Button, Dropdown, Avatar, Space, Typography } from "antd";
import {
  BookOutlined,
  SearchOutlined,
  MenuOutlined,
  CloseOutlined,
  UserOutlined,
  LogoutOutlined,
  DownOutlined,
} from "@ant-design/icons";

import useAuth from "../../hooks/useAuth";
import "../../styles/header.css";

const { Text } = Typography;


const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const location = useLocation();
  
  const { user, isAuthenticated, logout } = useAuth();

  const navigate = useNavigate();

 const navigationItems = [
  { label: "Trang chủ", href: "/" },
  { label: "Khám phá sách", href: "/#discover" },
  { label: "Thể loại", href: "/#genres" },
  { label: "Cộng đồng", href: "/#community" },
];

const isActiveLink = (href) => {
  if (href === "/") {
    return location.pathname === "/" && !location.hash;
  }

  return `${location.pathname}${location.hash}` === href;
};

  // Điều hướng Dashboard theo vai trò
  const dashboardByRole = {
    admin: "/admin",
    publisher: "/publisher",
    reader: "/reader",
  };

  const handleGoToDashboard = () => {
    const destination = dashboardByRole[user?.role];

    if (destination) {
      setMenuOpen(false);
      navigate(destination);
    }
  };

  // Đăng xuất
  const handleLogout = async () => {
    try {
      await logout();
      setMenuOpen(false);
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Đăng xuất thất bại:", error);
    }
  };

  // Tìm kiếm
  const handleSearch = (value) => {
    const keyword = value.trim();

    if (!keyword) return;

    // Chức năng tìm kiếm sẽ được hoàn thiện ở bước sau.
    console.log("Từ khóa tìm kiếm:", keyword);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  // Menu đăng xuất trên Desktop
  const userMenuItems = [
    {
      key: "logout",
      label: "Đăng xuất",
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <header className="site-header">
      <div className="header-container">

        {/* Logo */}
        <Link to="/" className="header-logo" onClick={closeMenu}>
          <span className="logo-icon">
            <BookOutlined />
          </span>

          <span className="logo-text">
            Book <strong>Nest</strong>
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav className="desktop-navigation">
  {navigationItems.map((item) => (
    <Link
      key={item.label}
      to={item.href}
      className={`navigation-link ${
        isActiveLink(item.href) ? "active" : ""
      }`}
    >
      {item.label}
    </Link>
  ))}
</nav>

        {/* Search */}
        <div className="header-search">
          <Input
            placeholder="Tìm kiếm sách, tác giả..."
            prefix={<SearchOutlined />}
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            onPressEnter={() => handleSearch(searchValue)}
            allowClear
          />
        </div>

        {/* Authentication */}
        <div className="header-actions">
          {isAuthenticated && user ? (
            <>
              {/* Nhấn Avatar hoặc tên để vào Dashboard */}
              <Button
                type="text"
                className="user-profile-button"
                onClick={handleGoToDashboard}
              >
                <Space size={10} align="center">
                  <Avatar
                    src={user?.avatar || undefined}
                    icon={<UserOutlined />}
                    size={40}
                  />

                  <div className="user-info">
                    <Text strong className="user-fullname">
                      {user?.fullName || "Người dùng"}
                    </Text>

                    <Text type="secondary" className="user-role">
                      {user?.role || ""}
                    </Text>
                  </div>
                </Space>
              </Button>

              {/* Menu đăng xuất */}
              <Dropdown
                menu={{ items: userMenuItems }}
                trigger={["click"]}
                placement="bottomRight"
              >
                <Button
                  type="text"
                  className="user-dropdown-button"
                  aria-label="Mở menu tài khoản"
                >
                  <DownOutlined />
                </Button>
              </Dropdown>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button type="text" className="login-button">
                  Đăng nhập
                </Button>
              </Link>

              <Link to="/register">
                <Button type="primary" className="register-button">
                  Đăng ký
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="mobile-menu-button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Đóng menu" : "Mở menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <CloseOutlined /> : <MenuOutlined />}
        </button>
      </div>

      {/* Mobile navigation */}
      
{/* Mobile navigation */}
{menuOpen && (
  <div className="mobile-navigation">
    {navigationItems.map((item) => (
      <Link
        key={item.label}
        to={item.href}
        className={`mobile-navigation-link ${
          isActiveLink(item.href) ? "active" : ""
        }`}
        onClick={closeMenu}
      >
        {item.label}
      </Link>
    ))}

    {/* Mobile authentication */}
    <div className="mobile-auth-actions">
      {isAuthenticated && user ? (
        <>
          <button
            type="button"
            className="mobile-user-profile"
            onClick={handleGoToDashboard}
          >
            <Avatar
              src={user?.avatar || undefined}
              icon={<UserOutlined />}
              size={36}
            />

            <span>
              <strong>{user?.fullName || "Người dùng"}</strong>
              <small>{user?.role || ""}</small>
            </span>
          </button>

          <button
            type="button"
            className="mobile-logout-button"
            onClick={handleLogout}
          >
            <LogoutOutlined /> Đăng xuất
          </button>
        </>
      ) : (
        <>
          <Link to="/login" onClick={closeMenu}>
            <UserOutlined /> Đăng nhập
          </Link>

          <Link to="/register" onClick={closeMenu}>
            Đăng ký
          </Link>
        </>
      )}
    </div>
  </div>
)}

    </header>
  );
};

export default Header;
