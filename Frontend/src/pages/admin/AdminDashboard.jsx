import React, { useEffect, useState } from "react";
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
} from "@ant-design/icons";

import useAuth from "../../hooks/useAuth";
import dashboardService from "../../services/dashboardService";

const { Title, Text } = Typography;

const AdminDashboard = () => {
  const { token } = useAuth();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ========================================
  // LẤY DỮ LIỆU DASHBOARD
  // ========================================
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await dashboardService.getDashboardStats(token);

        if (result.success) {
          setStats(result.data);
        } else {
          setError(result.message || "Không thể lấy dữ liệu Dashboard");
        }
      } catch (err) {
        console.error("Dashboard Error:", err);

        setError(
          err.response?.data?.message ||
            "Không thể kết nối đến máy chủ"
        );
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDashboardStats();
    }
  }, [token]);

  // ========================================
  // LOADING
  // ========================================
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

  // ========================================
  // ERROR
  // ========================================
  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <Alert
          message="Không thể tải dữ liệu Dashboard"
          description={error}
          type="error"
          showIcon
        />
      </div>
    );
  }

  // ========================================
  // DATA
  // ========================================
  const overview = stats?.overview || {};
  const users = stats?.users || {};
  const reports = stats?.reports || {};
  const recentActivityLogs = stats?.recentActivityLogs || [];

  // ========================================
  // STATISTICS CARDS
  // ========================================
  const statisticCards = [
    {
      title: "Tổng người dùng",
      value: overview.totalUsers || 0,
      icon: <UserOutlined />,
      color: "#1677ff",
    },
    {
      title: "Tổng sách",
      value: overview.totalBooks || 0,
      icon: <BookOutlined />,
      color: "#52c41a",
    },
    {
      title: "Tổng đánh giá",
      value: overview.totalReviews || 0,
      icon: <StarOutlined />,
      color: "#faad14",
    },
    {
      title: "Tổng bình luận",
      value: overview.totalComments || 0,
      icon: <CommentOutlined />,
      color: "#722ed1",
    },
    {
      title: "Nhà xuất bản",
      value: overview.totalPublishers || 0,
      icon: <ShopOutlined />,
      color: "#13c2c2",
    },
    {
      title: "Chủ đề diễn đàn",
      value: overview.totalForumTopics || 0,
      icon: <FileTextOutlined />,
      color: "#eb2f96",
    },
    {
      title: "Tổng báo cáo",
      value: overview.totalReports || 0,
      icon: <FlagOutlined />,
      color: "#f5222d",
    },
    {
      title: "Rating trung bình",
      value: overview.averageRating || 0,
      precision: 2,
      suffix: "/ 5",
      icon: <RiseOutlined />,
      color: "#fa8c16",
    },
  ];

  // ========================================
  // USER ROLE STATISTICS
  // ========================================
  const userRoleStats = users.byRole || {};

  const totalUsers = users.total || 0;

  const getUserPercentage = (role) => {
    if (!totalUsers) return 0;

    return Math.round(
      ((userRoleStats[role] || 0) / totalUsers) * 100
    );
  };

  // ========================================
  // REPORT STATISTICS
  // ========================================
  const reportStatusStats = reports.byStatus || {};

  const totalReports = reports.total || 0;

  const getReportPercentage = (status) => {
    if (!totalReports) return 0;

    return Math.round(
      ((reportStatusStats[status] || 0) / totalReports) * 100
    );
  };

  // ========================================
  // ACTIVITY LOG TABLE
  // ========================================
  const activityColumns = [
    {
      title: "Người dùng",
      key: "user",
      render: (_, record) => {
        return record.userId?.fullName || "Không xác định";
      },
    },
    {
      title: "Hoạt động",
      dataIndex: "action",
      key: "action",
    },
    {
      title: "Loại đối tượng",
      dataIndex: "entityType",
      key: "entityType",
      render: (entityType) => (
        <Tag color="blue">{entityType}</Tag>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Thời gian",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) =>
        date
          ? new Date(date).toLocaleString("vi-VN")
          : "Không xác định",
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* HEADER */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ marginBottom: 8 }}>
          Admin Dashboard
        </Title>

        <Text type="secondary">
          Tổng quan hoạt động của hệ thống Book Review & Publisher Portal
        </Text>
      </div>

      {/* STATISTICS CARDS */}
      <Row gutter={[16, 16]}>
        {statisticCards.map((item, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
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
            <div style={{ marginBottom: 24 }}>
              <Text strong>Admin ({userRoleStats.admin || 0})</Text>

              <Progress
                percent={getUserPercentage("admin")}
                strokeColor="#1677ff"
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <Text strong>Reader ({userRoleStats.reader || 0})</Text>

              <Progress
                percent={getUserPercentage("reader")}
                strokeColor="#52c41a"
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <Text strong>
                Publisher ({userRoleStats.publisher || 0})
              </Text>

              <Progress
                percent={getUserPercentage("publisher")}
                strokeColor="#faad14"
              />
            </div>
          </Card>
        </Col>

        {/* REPORTS */}
        <Col xs={24} lg={12}>
          <Card
            title="Trạng thái báo cáo"
            bordered={false}
            style={{ borderRadius: 12 }}
          >
            <div style={{ marginBottom: 24 }}>
              <Text strong>
                Pending ({reportStatusStats.pending || 0})
              </Text>

              <Progress
                percent={getReportPercentage("pending")}
                strokeColor="#faad14"
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <Text strong>
                Resolved ({reportStatusStats.resolved || 0})
              </Text>

              <Progress
                percent={getReportPercentage("resolved")}
                strokeColor="#52c41a"
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <Text strong>
                Rejected ({reportStatusStats.rejected || 0})
              </Text>

              <Progress
                percent={getReportPercentage("rejected")}
                strokeColor="#ff4d4f"
              />
            </div>
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
          pagination={false}
          scroll={{ x: 800 }}
          locale={{
            emptyText: "Chưa có hoạt động nào",
          }}
        />
      </Card>
    </div>
  );
};

export default AdminDashboard;