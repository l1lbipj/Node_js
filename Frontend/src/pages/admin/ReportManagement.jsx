
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Button,
  Card,
  Descriptions,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";

import {
  SearchOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  ReloadOutlined,
  FlagOutlined,
} from "@ant-design/icons";

import useAuth from "../../hooks/useAuth";
import reportService from "../../services/reportService";

const { Text, Paragraph } = Typography;

const statusConfig = {
  pending: { text: "Chờ xử lý", color: "warning" },
  resolved: { text: "Đã xử lý", color: "success" },
  rejected: { text: "Đã từ chối", color: "error" },
};

const targetTypeConfig = {
  Review: "Đánh giá",
  ForumTopic: "Chủ đề diễn đàn",
  Comment: "Bình luận",
};

const ReportManagement = () => {
  const { token } = useAuth();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(undefined);
  const [targetType, setTargetType] = useState(undefined);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [selectedReport, setSelectedReport] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);

  const fetchReports = useCallback(
    async (page = 1, pageSize = pagination.pageSize) => {
      if (!token) return;

      try {
        setLoading(true);

        const response = await reportService.getAllReports(token, {
          search: search || undefined,
          status: status || undefined,
          targetType: targetType || undefined,
          page,
          limit: pageSize,
        });

        const data = response.data || {};

        setReports(data.reports || []);

        setPagination({
          current: data.pagination?.currentPage || page,
          pageSize: data.pagination?.limit || pageSize,
          total: data.pagination?.totalReports || 0,
        });
      } catch (error) {
        message.error(
          error.response?.data?.message ||
            "Không thể tải danh sách báo cáo"
        );
      } finally {
        setLoading(false);
      }
    },
    [token, search, status, targetType, pagination.pageSize]
  );

  useEffect(() => {
    fetchReports(1, pagination.pageSize);
  }, [fetchReports]);

  const handleSearch = () => {
    setSearch(searchInput.trim());
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleReset = () => {
    setSearchInput("");
    setSearch("");
    setStatus(undefined);
    setTargetType(undefined);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleTableChange = (newPagination) => {
    fetchReports(
      newPagination.current,
      newPagination.pageSize
    );
  };

  const handleViewDetail = async (reportId) => {
    try {
      setDetailLoading(true);
      setDetailVisible(true);
      setSelectedReport(null);

      const response = await reportService.getReportById(
        token,
        reportId
      );

      setSelectedReport(response.data);
    } catch (error) {
      message.error(
        error.response?.data?.message ||
          "Không thể tải chi tiết báo cáo"
      );
      setDetailVisible(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleUpdateStatus = async (report, newStatus) => {
    try {
      setUpdating(true);

      const response = await reportService.updateReportStatus(
        token,
        report._id,
        newStatus
      );

      const updatedReport = response.data;

      setReports((prev) =>
        prev.map((item) =>
          item._id === report._id
            ? { ...item, ...updatedReport }
            : item
        )
      );

      if (selectedReport?._id === report._id) {
        setSelectedReport(updatedReport);
      }

      message.success(
        newStatus === "resolved"
          ? "Đã xác nhận báo cáo"
          : "Đã từ chối báo cáo"
      );
    } catch (error) {
      message.error(
        error.response?.data?.message ||
          "Không thể cập nhật báo cáo"
      );
    } finally {
      setUpdating(false);
    }
  };

  const columns = [
    {
      title: "STT",
      key: "index",
      width: 65,
      align: "center",
      render: (_, __, index) =>
        (pagination.current - 1) * pagination.pageSize +
        index +
        1,
    },
    {
      title: "Người báo cáo",
      key: "user",
      render: (_, record) => (
        <Space>
          <Avatar src={record.userId?.avatar}>
            {record.userId?.fullName?.charAt(0)}
          </Avatar>
          <div>
            <div>
              <Text strong>
                {record.userId?.fullName || "Không xác định"}
              </Text>
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.userId?.email || ""}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Lý do báo cáo",
      dataIndex: "reason",
      key: "reason",
      ellipsis: true,
      render: (value) => (
        <Tooltip title={value}>
          {value}
        </Tooltip>
      ),
    },
    {
      title: "Loại nội dung",
      dataIndex: "targetType",
      key: "targetType",
      render: (value) => (
        <Tag color="blue">
          {targetTypeConfig[value] || value}
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (value) => (
        <Tag color={statusConfig[value]?.color}>
          {statusConfig[value]?.text || value}
        </Tag>
      ),
    },
    {
      title: "Ngày báo cáo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (value) =>
        value ? new Date(value).toLocaleString("vi-VN") : "-",
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="primary"
              ghost
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record._id)}
            />
          </Tooltip>

          {record.status === "pending" && (
            <>
              <Tooltip title="Xác nhận">
                <Popconfirm
                  title="Xác nhận báo cáo này?"
                  description="Báo cáo sẽ được đánh dấu đã xử lý."
                  onConfirm={() =>
                    handleUpdateStatus(record, "resolved")
                  }
                  okText="Xác nhận"
                  cancelText="Hủy"
                >
                  <Button
                    type="primary"
                    ghost
                    icon={<CheckOutlined />}
                    loading={updating}
                  />
                </Popconfirm>
              </Tooltip>

              <Tooltip title="Từ chối">
                <Popconfirm
                  title="Từ chối báo cáo này?"
                  onConfirm={() =>
                    handleUpdateStatus(record, "rejected")
                  }
                  okText="Từ chối"
                  cancelText="Hủy"
                >
                  <Button
                    danger
                    ghost
                    icon={<CloseOutlined />}
                    loading={updating}
                  />
                </Popconfirm>
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  const target = selectedReport?.targetId;

  const getTargetContent = () => {
    if (!target || typeof target !== "object") {
      return "Nội dung không còn tồn tại hoặc không thể tải";
    }

    return (
      target.content ||
      target.title ||
      target.text ||
      "Không có nội dung hiển thị"
    );
  };

  return (
    <div>
      <Space
        align="center"
        style={{ marginBottom: 20 }}
      >
        <FlagOutlined style={{ fontSize: 24 }} />
        <Typography.Title level={3} style={{ margin: 0 }}>
          Quản lý báo cáo
        </Typography.Title>
      </Space>

      <Card style={{ marginBottom: 16 }}>
        <Space wrap style={{ width: "100%" }}>
          <Input
            placeholder="Tìm kiếm lý do báo cáo..."
            prefix={<SearchOutlined />}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 260 }}
            allowClear
          />

          <Select
            placeholder="Lọc trạng thái"
            allowClear
            value={status}
            onChange={(value) => {
              setStatus(value);
              setPagination((prev) => ({
                ...prev,
                current: 1,
              }));
            }}
            options={[
              { label: "Chờ xử lý", value: "pending" },
              { label: "Đã xử lý", value: "resolved" },
              { label: "Đã từ chối", value: "rejected" },
            ]}
            style={{ width: 160 }}
          />

          <Select
            placeholder="Loại nội dung"
            allowClear
            value={targetType}
            onChange={(value) => {
              setTargetType(value);
              setPagination((prev) => ({
                ...prev,
                current: 1,
              }));
            }}
            options={[
              { label: "Đánh giá", value: "Review" },
              { label: "Chủ đề diễn đàn", value: "ForumTopic" },
              { label: "Bình luận", value: "Comment" },
            ]}
            style={{ width: 180 }}
          />

          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleSearch}
          >
            Tìm kiếm
          </Button>

          <Button
            icon={<ReloadOutlined />}
            onClick={handleReset}
          >
            Làm mới
          </Button>
        </Space>
      </Card>

      <Card>
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={reports}
          loading={loading}
          scroll={{ x: 1000 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} báo cáo`,
          }}
          onChange={handleTableChange}
        />
      </Card>

      <Modal
        title="Chi tiết báo cáo"
        open={detailVisible}
        onCancel={() => {
          setDetailVisible(false);
          setSelectedReport(null);
        }}
        footer={[
          <Button
            key="close"
            onClick={() => setDetailVisible(false)}
          >
            Đóng
          </Button>,
          ...(selectedReport?.status === "pending"
            ? [
                <Popconfirm
                  key="reject"
                  title="Từ chối báo cáo này?"
                  onConfirm={() =>
                    handleUpdateStatus(selectedReport, "rejected")
                  }
                  okText="Từ chối"
                  cancelText="Hủy"
                >
                  <Button danger loading={updating}>
                    Từ chối
                  </Button>
                </Popconfirm>,
                <Popconfirm
                  key="resolve"
                  title="Xác nhận báo cáo này?"
                  onConfirm={() =>
                    handleUpdateStatus(selectedReport, "resolved")
                  }
                  okText="Xác nhận"
                  cancelText="Hủy"
                >
                  <Button
                    type="primary"
                    loading={updating}
                  >
                    Xác nhận
                  </Button>
                </Popconfirm>,
              ]
            : []),
        ]}
        width={750}
        destroyOnHidden
      >
        {detailLoading ? (
          <Alert message="Đang tải chi tiết báo cáo..." type="info" />
        ) : selectedReport ? (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Người báo cáo">
              {selectedReport.userId?.fullName || "-"}
            </Descriptions.Item>

            <Descriptions.Item label="Email">
              {selectedReport.userId?.email || "-"}
            </Descriptions.Item>

            <Descriptions.Item label="Loại nội dung">
              {targetTypeConfig[selectedReport.targetType] ||
                selectedReport.targetType}
            </Descriptions.Item>

            <Descriptions.Item label="Trạng thái">
              <Tag color={statusConfig[selectedReport.status]?.color}>
                {statusConfig[selectedReport.status]?.text ||
                  selectedReport.status}
              </Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Lý do báo cáo">
              {selectedReport.reason}
            </Descriptions.Item>

            <Descriptions.Item label="Nội dung bị báo cáo">
              <Paragraph style={{ marginBottom: 0 }}>
                {getTargetContent()}
              </Paragraph>
            </Descriptions.Item>

            <Descriptions.Item label="ID nội dung">
              {typeof selectedReport.targetId === "object"
                ? selectedReport.targetId?._id
                : selectedReport.targetId}
            </Descriptions.Item>

            <Descriptions.Item label="Người xử lý">
              {selectedReport.adminId?.fullName || "Chưa xử lý"}
            </Descriptions.Item>

            <Descriptions.Item label="Ngày báo cáo">
              {selectedReport.createdAt
                ? new Date(selectedReport.createdAt).toLocaleString("vi-VN")
                : "-"}
            </Descriptions.Item>

            <Descriptions.Item label="Ngày cập nhật">
              {selectedReport.updatedAt
                ? new Date(selectedReport.updatedAt).toLocaleString("vi-VN")
                : "-"}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <Alert
            message="Không có dữ liệu báo cáo"
            type="warning"
          />
        )}
      </Modal>
    </div>
  );
};

export default ReportManagement;
