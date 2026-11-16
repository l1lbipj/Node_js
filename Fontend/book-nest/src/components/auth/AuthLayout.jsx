
import { Link } from 'react-router-dom';
import { Button } from 'antd';
import { BookOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import './AuthLayout.css';

const AuthLayout = ({ children, title, description }) => (
  <div className="auth-page">
    <div className="auth-brand">
      <Link to="/" className="auth-brand-link">
        <span className="auth-brand-icon">
          <BookOutlined />
        </span>
        <span>Book <strong>Nest</strong></span>
      </Link>
    </div>

    <main className="auth-main">
      <div className="auth-card">
        <div className="auth-back">
          <Link to="/">
            <Button
              type="default"
              icon={<ArrowLeftOutlined />}
            >
              Back
            </Button>
          </Link>
        </div>

        <div className="auth-heading">
          <h1>{title}</h1>
          <p>{description}</p>
        </div>

        {children}
      </div>
    </main>

    <footer className="auth-footer">
      © {new Date().getFullYear()} Book Nest. All rights reserved.
    </footer>
  </div>
);

export default AuthLayout;
