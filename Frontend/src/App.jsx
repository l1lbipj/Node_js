
import { useEffect, useState } from "react";
import { Spin, Alert } from "antd";
import api from "./services/api";

function App() {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await api.get("/health");
        setResult(response.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
          err.message ||
          "Không thể kết nối Backend"
        );
      } finally {
        setLoading(false);
      }
    };

    checkBackend();
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>Book Review & Publisher Portal</h1>

      {loading && <Spin tip="Đang kết nối Backend..." />}

      {result && (
        <Alert
          type="success"
          showIcon
          message="Kết nối Backend thành công"
          description={result.message}
        />
      )}

      {error && (
        <Alert
          type="error"
          showIcon
          message="Kết nối Backend thất bại"
          description={error}
        />
      )}
    </div>
  );
}

export default App;
