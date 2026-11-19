import { useState } from "react";
import { Form, Input, Button, Card, Typography, Alert } from "antd";
import { MailOutlined, LockOutlined, GoogleOutlined } from "@ant-design/icons";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import authService from "../../services/auth.service";

const { Title, Text } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (values) => {
    try {
      setLoading(true);
      setError("");

      const result = await login(values);

      if (!result?.success) {
        setError(result?.message || "Đăng nhập thất bại");
        return;
      }

      // Ưu tiên quay lại trang người dùng đã yêu cầu
      const previousPath = location.state?.from?.pathname;

      // Nếu không có trang trước, điều hướng theo Role
      const role = result.data?.user?.role;

      let destination = "/";

      if (previousPath) {
        destination = previousPath;
      } else {
        switch (role) {
          case "admin":
            destination = "/admin";
            break;

          case "publisher":
            destination = "/publisher";
            break;

          case "reader":
            destination = "/reader";
            break;

          default:
            destination = "/";
        }
      }

      navigate(destination, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Đăng nhập thất bại",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        background: "#f5f7fa",
      }}
    >
      <Card style={{ width: "100%", maxWidth: 420 }}>
        <Title level={2} style={{ textAlign: "center" }}>
          Đăng nhập
        </Title>

        <Text type="secondary">
          Chào mừng bạn đến với Book Review & Publisher Portal
        </Text>

        {error && (
          <Alert
            type="error"
            showIcon
            message={error}
            style={{
              marginTop: 20,
              marginBottom: 20,
            }}
          />
        )}

        <Form
          layout="vertical"
          onFinish={handleLogin}
          style={{ marginTop: 24 }}
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập email",
              },
              {
                type: "email",
                message: "Email không hợp lệ",
              },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Nhập email"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập mật khẩu",
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Nhập mật khẩu"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loading}
            >
              Đăng nhập
            </Button>
          </Form.Item>

          {/* Google Login */}
          <div style={{ marginTop: 16 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: "#e8e8e8",
                }}
              />

              <Text type="secondary">Hoặc</Text>

              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: "#e8e8e8",
                }}
              />
            </div>

            <Button
              block
              size="large"
              icon={<GoogleOutlined />}
              onClick={authService.googleLogin}
            >
              Đăng nhập bằng Google
            </Button>
          </div>
        </Form>

        <div style={{ textAlign: "center", marginTop: 24 }}>
          <Text>Chưa có tài khoản? </Text>
          <Link to="/register">Đăng ký ngay</Link>
        </div>
      </Card>
    </div>
  );
};

export default Login;