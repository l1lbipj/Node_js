
import { useCallback, useEffect, useState } from "react";
import {
  Card,
  Table,
  Input,
  Select,
  Tag,
  Space,
  Button,
  Modal,
  Descriptions,
  Typography,
  Avatar,
  Tooltip,
  message,
  Spin,
  Empty,
} from "antd";

import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  HistoryOutlined,
  UserOutlined,
} from "@ant-design/icons";

import useAuth from "../../hooks/useAuth";
import logService from "../../services/logService";

const { Title, Text } = Typography;

const entityOptions = [
  { value: "user", label: "Người dùng" },
  { value: "book", label: "Sách" },
  { value: "review", label: "Đánh giá" },
  { value: "comment", label: "Bình luận" },
  { value: "forumTopic", label: "Chủ đề diễn đàn" },
  { value: "feedback", label: "Phản hồi" },
  { value: "report", label: "Báo cáo" },
  { value: "publisher", label: "Nhà xuất bản" },
  { value: "system", label: "Hệ thống" },
];

const entityColors = {
  user: "blue",
  book: "green",
  review: "gold",
  comment: "cyan",
  forumTopic: "purple",
  feedback: "geekblue",
  report: "red",
  publisher: "orange",
  system: "default",
};

const getEntityLabel = (value) => {
  return (
    entityOptions.find((item) => item.value === value)?.label ||
    value ||
    "Không xác định"
  );
};

const formatDate = (date) => {
  if (!date) return "Không có dữ liệu";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Không hợp lệ";
  }

  return parsedDate.toLocaleString("vi-VN", {
    hour12: false,
  });
};

const LogManagement = () => {
  const { token, loading: authLoading } = useAuth();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Bộ lọc
  const [search, setSearch] = useState("");
  const [entityType, setEntityType] = useState(undefined);

  // Phân trang
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  // Chi tiết nhật ký
  const [selectedLog, setSelectedLog] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  // Lấy danh sách nhật ký
  const fetchLogs = useCallback(
    async (page = 1, pageSize = 20, filters = {}) => {
      if (!token) return;

      try {
        setLoading(true);

        const params = {
          page,
          limit: pageSize,
        };

        if (filters.search?.trim()) {
          params.search = filters.search.trim();
        }

        if (filters.entityType) {
          params.entityType = filters.entityType;
        }

        const response = await logService.getAllActivityLogs(
          token,
          params
        );

        const result = response?.data;

        setLogs(result?.activityLogs || []);

        setPagination({
          current: result?.pagination?.page || page,
          pageSize: result?.pagination?.limit || pageSize,
          total: result?.pagination?.total || 0,
        });
      } catch (error) {
        console.error("Fetch Activity Logs Error:", error);

        message.error(
          error.response?.data?.message ||
            "Không thể tải danh sách nhật ký hoạt động"
        );
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  // Chờ AuthContext xác thực xong
  useEffect(() => {
    if (authLoading || !token) return;

    fetchLogs(1, 20, {
      search: "",
      entityType: undefined,
    });
  }, [authLoading, token, fetchLogs]);

  // Tìm kiếm và lọc
  const handleSearch = () => {
    fetchLogs(1, pagination.pageSize, {
      search,
      entityType,
    });
  };

  // Đặt lại bộ lọc
  const handleReset = () => {
    setSearch("");
    setEntityType(undefined);

    fetchLogs(1, pagination.pageSize, {
      search: "",
      entityType: undefined,
    });
  };

  // Làm mới danh sách
  const handleRefresh = () => {
    fetchLogs(pagination.current, pagination.pageSize, {
      search,
      entityType,
    });
  };

  // Xem chi tiết nhật ký
  const handleViewDetail = async (record) => {
    if (!token) {
      message.error("Vui lòng đăng nhập lại");
      return;
    }

    try {
      setDetailVisible(true);
      setDetailLoading(true);
      setSelectedLog(null);

      const response = await logService.getActivityLogById(
        token,
        record._id
      );

      setSelectedLog(response?.data || null);
    } catch (error) {
      console.error("Get Activity Log Detail Error:", error);

      message.error(
        error.response?.data?.message ||
          "Không thể tải chi tiết nhật ký"
      );

      setDetailVisible(false);
    } finally {
      setDetailLoading(false);
    }
  };

  // Đóng modal chi tiết
  const handleCloseDetail = () => {
    setDetailVisible(false);
    setSelectedLog(null);
  };

  // Cấu hình cột bảng
  const columns = [
    {
      title: "STT",
      key: "index",
      width: 65,
      align: "center",
      render: (_, __, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "Người thực hiện",
      dataIndex: "userId",
      key: "user",
      width: 210,
      render: (user) => (
        <Space>
          <Avatar
            src={user?.avatar}
            icon={<UserOutlined />}
          />

          <div>
            <Text strong>
              {user?.fullName || "Người dùng không tồn tại"}
            </Text>

            <br />

            <Text type="secondary" style={{ fontSize: 12 }}>
              {user?.email || "Không có email"}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Hành động",
      dataIndex: "action",
      key: "action",
      width: 150,
      render: (action) => (
        <Tag color="blue">
          {action || "Không xác định"}
        </Tag>
      ),
    },
    {
      title: "Loại đối tượng",
      dataIndex: "entityType",
      key: "entityType",
      width: 150,
      render: (value) => (
        <Tag color={entityColors[value] || "default"}>
          {getEntityLabel(value)}
        </Tag>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (description) => (
        <Tooltip title={description}>
          <span>{description || "Không có mô tả"}</span>
        </Tooltip>
      ),
    },
    {
      title: "Thời gian",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 185,
      render: (date) => formatDate(date),
    },
    {
      title: "Thao tác",
      key: "operations",
      width: 90,
      align: "center",
      render: (_, record) => (
        <Tooltip title="Xem chi tiết">
          <Button
            type="primary"
            ghost
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          />
        </Tooltip>
      ),
    },
  ];

  // Chờ xác thực đăng nhập
  if (authLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 400,
        }}
      >
        <Spin size="large" tip="Đang xác thực tài khoản..." />
      </div>
    );
  }

  if (!token) {
    return (
      <Card>
        <Empty description="Vui lòng đăng nhập để xem nhật ký hoạt động" />
      </Card>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Card>
        {/* Tiêu đề */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <Space>
            <HistoryOutlined style={{ fontSize: 26 }} />

            <Title level={3} style={{ margin: 0 }}>
              Quản lý nhật ký hoạt động
            </Title>
          </Space>

          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={loading}
          >
            Làm mới
          </Button>
        </div>

        {/* Bộ lọc */}
        <Space
          wrap
          style={{
            display: "flex",
            marginBottom: 20,
          }}
        >
          <Input
            placeholder="Tìm kiếm hành động hoặc mô tả..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onPressEnter={handleSearch}
            allowClear
            style={{ width: 300 }}
          />

          <Select
            placeholder="Lọc theo loại đối tượng"
            allowClear
            value={entityType}
            onChange={setEntityType}
            options={entityOptions}
            style={{ width: 210 }}
          />

          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleSearch}
          >
            Tìm kiếm
          </Button>

          <Button onClick={handleReset}>
            Đặt lại
          </Button>
        </Space>

        {/* Bảng nhật ký */}
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={logs}
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100"],
            showTotal: (total) => `Tổng cộng ${total} nhật ký`,
            onChange: (page, pageSize) => {
              fetchLogs(page, pageSize, {
                search,
                entityType,
              });
            },
          }}
          locale={{
            emptyText: "Chưa có nhật ký hoạt động",
          }}
        />
      </Card>

      {/* Modal chi tiết */}
      <Modal
        title={
          <Space>
            <HistoryOutlined />
            Chi tiết nhật ký hoạt động
          </Space>
        }
        open={detailVisible}
        onCancel={handleCloseDetail}
        footer={[
          <Button key="close" onClick={handleCloseDetail}>
            Đóng
          </Button>,
        ]}
        width={700}
        destroyOnHidden
      >
        {detailLoading ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <Spin tip="Đang tải chi tiết..." />
          </div>
        ) : selectedLog ? (
          <Descriptions bordered column={1} size="middle">
            <Descriptions.Item label="Mã nhật ký">
              {selectedLog._id}
            </Descriptions.Item>

            <Descriptions.Item label="Người thực hiện">
              <Space>
                <Avatar
                  src={selectedLog.userId?.avatar}
                  icon={<UserOutlined />}
                />

                <div>
                  <Text strong>
                    {selectedLog.userId?.fullName ||
                      "Người dùng không tồn tại"}
                  </Text>

                  <br />

                  <Text type="secondary">
                    {selectedLog.userId?.email || "Không có email"}
                  </Text>
                </div>
              </Space>
            </Descriptions.Item>

            <Descriptions.Item label="Vai trò">
              {selectedLog.userId?.role || "Không có dữ liệu"}
            </Descriptions.Item>

            <Descriptions.Item label="Hành động">
              <Tag color="blue">
                {selectedLog.action || "Không xác định"}
              </Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Loại đối tượng">
              <Tag
                color={
                  entityColors[selectedLog.entityType] || "default"
                }
              >
                {getEntityLabel(selectedLog.entityType)}
              </Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Mô tả">
              {selectedLog.description || "Không có mô tả"}
            </Descriptions.Item>

            <Descriptions.Item label="Địa chỉ IP">
              {selectedLog.ipAddress || "Không có dữ liệu"}
            </Descriptions.Item>

            <Descriptions.Item label="Thời gian tạo">
              {formatDate(selectedLog.createdAt)}
            </Descriptions.Item>

            <Descriptions.Item label="Cập nhật lần cuối">
              {formatDate(selectedLog.updatedAt)}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <Empty description="Không có dữ liệu nhật ký" />
        )}
      </Modal>
    </div>
  );
};

export default LogManagement;
