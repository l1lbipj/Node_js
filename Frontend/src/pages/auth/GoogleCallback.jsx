import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Spin, Alert } from "antd";
import useAuth from "../../hooks/useAuth";

const GoogleCallback = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const { googleLoginCallback } = useAuth();
  const navigate = useNavigate();

  const isProcessing = useRef(false);

  useEffect(() => {
    const handleGoogleCallback = async () => {
      if (isProcessing.current) return;

      isProcessing.current = true;

      try {
        const params = new URLSearchParams(
          window.location.hash.substring(1),
        );

        const token = params.get("token");

        if (!token) {
          throw new Error(
            "Không tìm thấy Google authentication token",
          );
        }

        // Xóa Token khỏi URL
        window.history.replaceState(
          null,
          "",
          window.location.pathname,
        );

        // Xác thực Token và lấy thông tin User
        const result = await googleLoginCallback(token);

        if (!result?.success) {
          throw new Error(
            result?.message || "Đăng nhập Google thất bại",
          );
        }

        const user = result.data;

        if (!user?.role) {
          throw new Error(
            "Không thể xác định quyền tài khoản",
          );
        }

        // Chuyển hướng theo Role
        switch (user.role) {
          case "admin":
            navigate("/admin", { replace: true });
            break;

          case "publisher":
            navigate("/publisher", { replace: true });
            break;

          case "reader":
            navigate("/", { replace: true });
            break;

          default:
            navigate("/", { replace: true });
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Đăng nhập Google thất bại",
        );
      } finally {
        setLoading(false);
      }
    };

    handleGoogleCallback();
  }, [googleLoginCallback, navigate]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      {loading ? (
        <Spin
          size="large"
          tip="Đang xác thực tài khoản Google..."
        />
      ) : error ? (
        <Alert
          type="error"
          showIcon
          message="Đăng nhập Google thất bại"
          description={error}
          action={
            <a href="/login">
              Quay lại đăng nhập
            </a>
          }
        />
      ) : null}
    </div>
  );
};

export default GoogleCallback;