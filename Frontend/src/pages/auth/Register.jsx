
import { useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Alert,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const { Title, Text } = Typography;

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (values) => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const result = await register({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
      });

      if (result.success) {
        setSuccess("Đăng ký tài khoản thành công!");

        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 1500);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Đăng ký thất bại"
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
      <Card style={{ width: "100%", maxWidth: 450 }}>
        <Title level={2} style={{ textAlign: "center" }}>
          Đăng ký tài khoản
        </Title>

        <Text type="secondary">
          Tạo tài khoản Book Review & Publisher Portal
        </Text>

        {error && (
          <Alert
            type="error"
            showIcon
            message={error}
            style={{ marginTop: 20 }}
          />
        )}

        {success && (
          <Alert
            type="success"
            showIcon
            message={success}
            style={{ marginTop: 20 }}
          />
        )}

        <Form
          layout="vertical"
          onFinish={handleRegister}
          style={{ marginTop: 24 }}
        >
          <Form.Item
            label="Họ và tên"
            name="fullName"
            rules={[
              { required: true, message: "Vui lòng nhập họ và tên" },
              { max: 100, message: "Họ tên tối đa 100 ký tự" },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Nhập họ và tên"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email" },
              { type: "email", message: "Email không hợp lệ" },
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
              { required: true, message: "Vui lòng nhập mật khẩu" },
              { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Nhập mật khẩu"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Xác nhận mật khẩu"
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              {
                required: true,
                message: "Vui lòng xác nhận mật khẩu",
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }

                  return Promise.reject(
                    new Error("Mật khẩu xác nhận không khớp")
                  );
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Nhập lại mật khẩu"
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
              disabled={Boolean(success)}
            >
              Đăng ký
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: "center" }}>
          <Text>Đã có tài khoản? </Text>
          <Link to="/login">Đăng nhập ngay</Link>
        </div>
      </Card>
    </div>
  );
};

export default Register;
