
import { useState } from "react";
import {
  Avatar,
  Button,
  Dropdown,
  Input,
  Space,
  Typography,
} from "antd";

import {
  BookOutlined,
  SearchOutlined,
  MenuOutlined,
  CloseOutlined,
  UserOutlined,
  LogoutOutlined,
  DownOutlined,
} from "@ant-design/icons";

import {
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";

import useAuth from "../../hooks/useAuth";
import "../../styles/header.css";


const { Text } = Typography;

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    user,
    logout,
    isAuthenticated,
  } = useAuth();

  const [searchValue, setSearchValue] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  // ==============================
  // MENU ĐIỀU HƯỚNG
  // ==============================

  const navigationItems = [
    { label: "Trang chủ", href: "/" },
    { label: "Khám phá sách", href: "/books" },
    { label: "Thể loại", href: "/#genres" },
    { label: "Cộng đồng", href: "/#community" },
  ];

  // Kiểm tra đường dẫn đang được chọn
  const isActiveLink = (href) => {
    if (href === "/") {
      return location.pathname === "/" && !location.hash;
    }

    if (href.startsWith("/#")) {
      return (
        location.pathname === "/" &&
        location.hash === href.substring(1)
      );
    }

    return location.pathname === href;
  };

  // Đóng menu mobile
  const closeMenu = () => {
    setMenuOpen(false);
  };

  // ==============================
  // ĐIỀU HƯỚNG DASHBOARD
  // ==============================

  const dashboardByRole = {
    admin: "/admin",
    publisher: "/publisher",
    reader: "/reader",
  };

  const handleGoToDashboard = () => {
    const destination = dashboardByRole[user?.role];

    if (destination) {
      closeMenu();
      navigate(destination);
    }
  };

  // ==============================
  // TÌM KIẾM SÁCH
  // ==============================

  const handleSearch = (value = searchValue) => {
    const keyword = value.trim();

    if (!keyword) {
      return;
    }

    closeMenu();

    navigate(`/books?search=${encodeURIComponent(keyword)}`);

    setSearchValue("");
  };

  // ==============================
  // ĐĂNG XUẤT
  // ==============================

  const handleLogout = async () => {
    try {
      await logout();

      closeMenu();
      navigate("/");
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
    }
  };

  // ==============================
  // MENU TÀI KHOẢN
  // ==============================

  const accountMenuItems = [
    {
      key: "dashboard",
      label: "Trang quản lý",
      icon: <UserOutlined />,
      onClick: handleGoToDashboard,
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      label: "Đăng xuất",
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout,
    },
  ];

  // ==============================
  // GIAO DIỆN
  // ==============================

  return (
    <header className="site-header">
      <div className="header-container">

        {/* LOGO */}

        <Link
          to="/"
          className="header-logo"
          onClick={closeMenu}
        >
          <span className="logo-icon">
            <BookOutlined />
          </span>

          <span className="logo-text">
            Book <strong>Nest</strong>
          </span>
        </Link>

        {/* DESKTOP NAVIGATION */}

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

        {/* SEARCH */}

        <div className="header-search">
          <Input
            placeholder="Tìm kiếm sách, tác giả..."
            prefix={<SearchOutlined />}
            value={searchValue}
            onChange={(event) =>
              setSearchValue(event.target.value)
            }
            onPressEnter={() => handleSearch()}
            allowClear
          />
        </div>

        {/* AUTHENTICATION */}

        <div className="header-actions">
          {isAuthenticated && user ? (
            <Dropdown
              menu={{
                items: accountMenuItems,
              }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <Button
                type="text"
                className="user-profile-button"
              >
                <Space size={10} align="center">
                  <Avatar
                    src={user?.avatar || undefined}
                    icon={<UserOutlined />}
                    size={40}
                  />

                  <div className="user-info">
                    <Text
                      strong
                      className="user-fullname"
                    >
                      {user?.fullName || "Người dùng"}
                    </Text>

                    <Text
                      type="secondary"
                      style={{
                        fontSize: 12,
                        lineHeight: 1.4,
                      }}
                    >
                      {user?.role || ""}
                    </Text>
                  </div>

                  <DownOutlined
                    style={{ fontSize: 12 }}
                  />
                </Space>
              </Button>
            </Dropdown>
          ) : (
            <Space className="auth-buttons">
              <Button
                onClick={() => navigate("/login")}
              >
                Đăng nhập
              </Button>

              <Button
                type="primary"
                onClick={() => navigate("/register")}
              >
                Đăng ký
              </Button>
            </Space>
          )}
        </div>

        {/* MOBILE MENU BUTTON */}

        <Button
          type="text"
          className="mobile-menu-button"
          icon={
            menuOpen ? (
              <CloseOutlined />
            ) : (
              <MenuOutlined />
            )
          }
          onClick={() =>
            setMenuOpen((previous) => !previous)
          }
          aria-label={
            menuOpen ? "Đóng menu" : "Mở menu"
          }
        />

      </div>

      {/* MOBILE NAVIGATION */}

      {menuOpen && (
        <div className="mobile-navigation">

          <nav className="mobile-navigation-links">
            {navigationItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className={`navigation-link ${
                  isActiveLink(item.href) ? "active" : ""
                }`}
                onClick={closeMenu}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* MOBILE SEARCH */}

          <div className="mobile-search">
            <Input
              placeholder="Tìm kiếm sách, tác giả..."
              prefix={<SearchOutlined />}
              value={searchValue}
              onChange={(event) =>
                setSearchValue(event.target.value)
              }
              onPressEnter={() => handleSearch()}
              allowClear
            />
          </div>

          {/* MOBILE ACCOUNT */}

          {isAuthenticated && user ? (
            <div className="mobile-user-actions">
              <Button
                block
                icon={<UserOutlined />}
                onClick={handleGoToDashboard}
              >
                Trang quản lý
              </Button>

              <Button
                block
                danger
                icon={<LogoutOutlined />}
                onClick={handleLogout}
              >
                Đăng xuất
              </Button>
            </div>
          ) : (
            <div className="mobile-auth-actions">
              <Button
                block
                onClick={() => {
                  closeMenu();
                  navigate("/login");
                }}
              >
                Đăng nhập
              </Button>

              <Button
                block
                type="primary"
                onClick={() => {
                  closeMenu();
                  navigate("/register");
                }}
              >
                Đăng ký
              </Button>
            </div>
          )}

        </div>
      )}
    </header>
  );
};

export default Header;
