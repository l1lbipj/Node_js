
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input, Button } from 'antd';
import { BookOutlined, SearchOutlined, MenuOutlined, CloseOutlined, UserOutlined } from '@ant-design/icons';
import './Header.css';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const navigationItems = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Khám phá sách', href: '/#discover' },
    { label: 'Thể loại', href: '/#genres' },
    { label: 'Cộng đồng', href: '/#community' },
  ];

  const handleSearch = (value) => {
    const keyword = value.trim();

    if (!keyword) return;

    // Chức năng tìm kiếm sẽ được hoàn thiện ở bước sau.
    console.log('Từ khóa tìm kiếm:', keyword);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

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
            <Link key={item.label} to={item.href} className="navigation-link">
               {item.label}
            </Link>
          ))}
        </nav>

        {/* thanh Tim kiem */}
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

        {/* Tai Khoan */}
        <div className="header-actions">
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
        </div>

        {/* menu */}
        <button
          type="button"
          className="mobile-menu-button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <CloseOutlined /> : <MenuOutlined />}
        </button>
      </div>

      {/* Mobile navigation */}
      {menuOpen && (
        <div className="mobile-navigation">
          {navigationItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className="mobile-navigation-link"
              onClick={closeMenu}
            >
              {item.label}
            </Link>
          ))}

          <div className="mobile-auth-actions">
            <Link to="/login" onClick={closeMenu}>
              <UserOutlined /> Đăng nhập
            </Link>

            <Link to="/register" onClick={closeMenu}>
              Đăng ký
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
