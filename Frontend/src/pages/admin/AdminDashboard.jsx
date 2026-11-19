
import { useCallback, useEffect, useState } from "react";
import {
  Card,
  Col,
  Row,
  Statistic,
  Typography,
  Progress,
  Table,
  Tag,
  Spin,
  Alert,
  Button,
  Space,
  Empty,
} from "antd";

import {
  UserOutlined,
  BookOutlined,
  StarOutlined,
  CommentOutlined,
  ShopOutlined,
  FileTextOutlined,
  FlagOutlined,
  RiseOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

import useAuth from "../../hooks/useAuth";
import dashboardService from "../../services/dashboardService";

const { Title, Text } = Typography;

const AdminDashboard = () => {
  const { token } = useAuth();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lấy dữ liệu Dashboard
  const fetchDashboardStats = useCallback(async () => {
    if (!token) {
      setError("Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await dashboardService.getDashboardStats(token);

      if (!result?.success || !result?.data) {
        throw new Error(
          result?.message || "Không thể lấy dữ liệu Dashboard"
        );
      }

      setStats(result.data);
    } catch (err) {
      console.error("Dashboard Error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Không thể kết nối đến máy chủ"
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  // Loading
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 400,
        }}
      >
        <Spin size="large" tip="Đang tải dữ liệu Dashboard..." />
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <Alert
          message="Không thể tải dữ liệu Dashboard"
          description={error}
          type="error"
          showIcon
          action={
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchDashboardStats}
            >
              Thử lại
            </Button>
          }
        />
      </div>
    );
  }

  // Dữ liệu
  const overview = stats?.overview || {};
  const users = stats?.users || {};
  const reports = stats?.reports || {};

  const recentActivityLogs = Array.isArray(stats?.recentActivityLogs)
    ? stats.recentActivityLogs
    : [];

  // Thống kê tổng quan
  const statisticCards = [
    {
      title: "Tổng người dùng",
      value: overview.totalUsers ?? 0,
      icon: <UserOutlined />,
      color: "#1677ff",
    },
    {
      title: "Tổng sách",
      value: overview.totalBooks ?? 0,
      icon: <BookOutlined />,
      color: "#52c41a",
    },
    {
      title: "Tổng đánh giá",
      value: overview.totalReviews ?? 0,
      icon: <StarOutlined />,
      color: "#faad14",
    },
    {
      title: "Tổng bình luận",
      value: overview.totalComments ?? 0,
      icon: <CommentOutlined />,
      color: "#722ed1",
    },
    {
      title: "Nhà xuất bản",
      value: overview.totalPublishers ?? 0,
      icon: <ShopOutlined />,
      color: "#13c2c2",
    },
    {
      title: "Chủ đề diễn đàn",
      value: overview.totalForumTopics ?? 0,
      icon: <FileTextOutlined />,
      color: "#eb2f96",
    },
    {
      title: "Tổng báo cáo",
      value: overview.totalReports ?? 0,
      icon: <FlagOutlined />,
      color: "#f5222d",
    },
    {
      title: "Rating trung bình",
      value: overview.averageRating ?? 0,
      precision: 2,
      suffix: "/ 5",
      icon: <RiseOutlined />,
      color: "#fa8c16",
    },
  ];

  // Thống kê người dùng
  const userRoleStats = users.byRole || {};
  const totalUsers = users.total ?? overview.totalUsers ?? 0;

  const getUserPercentage = (role) => {
    if (!totalUsers) return 0;

    return Math.min(
      100,
      Math.round(((userRoleStats[role] || 0) / totalUsers) * 100)
    );
  };

  // Thống kê báo cáo
  const reportStatusStats = reports.byStatus || {};
  const totalReports = reports.total ?? overview.totalReports ?? 0;

  const getReportPercentage = (status) => {
    if (!totalReports) return 0;

    return Math.min(
      100,
      Math.round(((reportStatusStats[status] || 0) / totalReports) * 100)
    );
  };

  // Bảng hoạt động gần đây
  const activityColumns = [
    {
      title: "Người dùng",
      key: "user",
      render: (_, record) => (
        <Space>
          <UserOutlined />
          {record.userId?.fullName || "Không xác định"}
        </Space>
      ),
    },
    {
      title: "Hoạt động",
      dataIndex: "action",
      key: "action",
      render: (action) => action || "N/A",
    },
    {
      title: "Loại đối tượng",
      dataIndex: "entityType",
      key: "entityType",
      render: (entityType) => (
        <Tag color="blue">{entityType || "N/A"}</Tag>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      render: (description) => description || "Không có mô tả",
    },
    {
      title: "Thời gian",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) =>
        date && !Number.isNaN(new Date(date).getTime())
          ? new Date(date).toLocaleString("vi-VN")
          : "Không xác định",
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* HEADER */}
      <Row
        justify="space-between"
        align="middle"
        gutter={[16, 16]}
        style={{ marginBottom: 24 }}
      >
        <Col>
          <Title level={2} style={{ marginBottom: 8 }}>
            Admin Dashboard
          </Title>

          <Text type="secondary">
            Tổng quan hoạt động của hệ thống Book Review & Publisher Portal
          </Text>
        </Col>

        <Col>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchDashboardStats}
            loading={loading}
          >
            Làm mới
          </Button>
        </Col>
      </Row>

      {/* STATISTICS CARDS */}
      <Row gutter={[16, 16]}>
        {statisticCards.map((item) => (
          <Col xs={24} sm={12} lg={6} key={item.title}>
            <Card
              bordered={false}
              style={{
                height: "100%",
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              }}
            >
              <Statistic
                title={item.title}
                value={item.value}
                precision={item.precision}
                suffix={item.suffix}
                prefix={
                  <span style={{ color: item.color }}>
                    {item.icon}
                  </span>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* STATISTICS DETAILS */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        {/* USERS */}
        <Col xs={24} lg={12}>
          <Card
            title="Thống kê người dùng"
            bordered={false}
            style={{ borderRadius: 12 }}
          >
            {["admin", "reader", "publisher"].map((role) => {
              const roleLabels = {
                admin: "Admin",
                reader: "Reader",
                publisher: "Publisher",
              };

              const roleColors = {
                admin: "#1677ff",
                reader: "#52c41a",
                publisher: "#faad14",
              };

              return (
                <div key={role} style={{ marginBottom: 24 }}>
                  <Text strong>
                    {roleLabels[role]} ({userRoleStats[role] || 0})
                  </Text>

                  <Progress
                    percent={getUserPercentage(role)}
                    strokeColor={roleColors[role]}
                  />
                </div>
              );
            })}
          </Card>
        </Col>

        {/* REPORTS */}
        <Col xs={24} lg={12}>
          <Card
            title="Trạng thái báo cáo"
            bordered={false}
            style={{ borderRadius: 12 }}
          >
            {["pending", "resolved", "rejected"].map((status) => {
              const statusLabels = {
                pending: "Đang chờ xử lý",
                resolved: "Đã giải quyết",
                rejected: "Đã từ chối",
              };

              const statusColors = {
                pending: "#faad14",
                resolved: "#52c41a",
                rejected: "#ff4d4f",
              };

              return (
                <div key={status} style={{ marginBottom: 24 }}>
                  <Text strong>
                    {statusLabels[status]} ({reportStatusStats[status] || 0})
                  </Text>

                  <Progress
                    percent={getReportPercentage(status)}
                    strokeColor={statusColors[status]}
                  />
                </div>
              );
            })}
          </Card>
        </Col>
      </Row>

      {/* RECENT ACTIVITIES */}
      <Card
        title="Hoạt động gần đây"
        bordered={false}
        style={{
          marginTop: 24,
          borderRadius: 12,
        }}
      >
        <Table
          columns={activityColumns}
          dataSource={recentActivityLogs}
          rowKey="_id"
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
          }}
          scroll={{ x: 800 }}
          locale={{
            emptyText: (
              <Empty description="Chưa có hoạt động nào" />
            ),
          }}
        />
      </Card>
    </div>
  );
};

export default AdminDashboard;
