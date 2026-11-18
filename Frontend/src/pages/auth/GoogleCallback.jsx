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
        const params = new URLSearchParams(window.location.hash.substring(1));

        const token = params.get("token");

        if (!token) {
          throw new Error("Không tìm thấy Google authentication token");
        }

        // Xóa token khỏi URL sau khi đọc
        window.history.replaceState(null, "", window.location.pathname);

        await googleLoginCallback(token);

        navigate("/", { replace: true });
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
        <Spin size="large" tip="Đang xác thực tài khoản Google..." />
      ) : error ? (
        <Alert
          type="error"
          showIcon
          message="Đăng nhập Google thất bại"
          description={error}
          action={<a href="/login">Quay lại đăng nhập</a>}
        />
      ) : null}
    </div>
  );
};

export default GoogleCallback;
