
import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import {
  Avatar,
  Button,
  Card,
  Col,
  Descriptions,
  Empty,
  Input,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Spin,
  Statistic,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";

import {
  CommentOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";

import useAuth from "../../hooks/useAuth";
import commentService from "../../services/commentService";

const { Title, Text, Paragraph } = Typography;

const CommentManagement = () => {
  const { token } = useAuth();

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [targetType, setTargetType] = useState(undefined);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [selectedComment, setSelectedComment] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);

  // Lấy danh sách bình luận
  const fetchComments = useCallback(
    async (
      page = 1,
      pageSize = pagination.pageSize,
      filters = {},
    ) => {
      if (!token) return;

      try {
        setLoading(true);

        const selectedSearch = Object.prototype.hasOwnProperty.call(
          filters,
          "search",
        )
          ? filters.search
          : search;

        const selectedTargetType = Object.prototype.hasOwnProperty.call(
          filters,
          "targetType",
        )
          ? filters.targetType
          : targetType;

        const params = {
          page,
          limit: pageSize,
        };

        if (selectedSearch?.trim()) {
          params.search = selectedSearch.trim();
        }

        if (selectedTargetType) {
          params.targetType = selectedTargetType;
        }

        const response = await commentService.getAllComments(
          token,
          params,
        );

        const data = response.data;

        setComments(data?.comments || []);

        setPagination({
          current: data?.pagination?.currentPage || page,
          pageSize: data?.pagination?.limit || pageSize,
          total: data?.pagination?.totalComments || 0,
        });
      } catch (error) {
        message.error(
          error.response?.data?.message ||
            "Không thể tải danh sách bình luận",
        );
      } finally {
        setLoading(false);
      }
    },
    [token, search, targetType, pagination.pageSize],
  );

  useEffect(() => {
    fetchComments(1, 10);
  }, [fetchComments]);

  // Tìm kiếm
  const handleSearch = () => {
    fetchComments(1, pagination.pageSize);
  };

  // Lọc theo loại nội dung
  const handleTargetTypeChange = (value) => {
    setTargetType(value);
    fetchComments(1, pagination.pageSize, {
      targetType: value,
    });
  };

  // Xem chi tiết bình luận
  const handleViewDetail = async (commentId) => {
    try {
      setDetailVisible(true);
      setDetailLoading(true);
      setSelectedComment(null);

      const response = await commentService.getCommentById(
        token,
        commentId,
      );

      setSelectedComment(response.data);
    } catch (error) {
      message.error(
        error.response?.data?.message ||
          "Không thể tải chi tiết bình luận",
      );

      setDetailVisible(false);
    } finally {
      setDetailLoading(false);
    }
  };

  // Xóa bình luận
  const handleDelete = async (commentId) => {
    try {
      await commentService.deleteComment(token, commentId);

      message.success("Xóa bình luận và các phản hồi thành công");

      const nextPage =
        comments.length === 1 && pagination.current > 1
          ? pagination.current - 1
          : pagination.current;

      fetchComments(nextPage, pagination.pageSize);
    } catch (error) {
      message.error(
        error.response?.data?.message || "Không thể xóa bình luận",
      );
    }
  };

  // Đóng Modal chi tiết
  const handleCloseDetail = () => {
    setDetailVisible(false);
    setSelectedComment(null);
  };

  // Hiển thị loại nội dung
  const renderTargetType = (type) => {
    if (type === "Review") {
      return <Tag color="blue">Đánh giá</Tag>;
    }

    if (type === "ForumTopic") {
      return <Tag color="purple">Chủ đề diễn đàn</Tag>;
    }

    return <Tag>{type || "Không xác định"}</Tag>;
  };

  // Cột bảng
  const columns = [
    {
      title: "STT",
      key: "index",
      width: 70,
      align: "center",
      render: (_, __, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "Người bình luận",
      key: "user",
      width: 190,
      render: (_, record) => {
        const user = record.userId;

        return (
          <Space>
            <Avatar src={user?.avatar}>
              {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
            </Avatar>

            <div>
              <Text strong>{user?.fullName || "Người dùng không tồn tại"}</Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {user?.email || ""}
              </Text>
            </div>
          </Space>
        );
      },
    },
    {
      title: "Nội dung bình luận",
      dataIndex: "content",
      key: "content",
      ellipsis: true,
      render: (content) => (
        <Tooltip title={content}>
          <Text>{content}</Text>
        </Tooltip>
      ),
    },
    {
      title: "Loại nội dung",
      dataIndex: "targetType",
      key: "targetType",
      width: 160,
      render: renderTargetType,
    },
    {
      title: "Loại bình luận",
      key: "parent",
      width: 130,
      render: (_, record) =>
        record.parentCommentId ? (
          <Tag color="cyan">Phản hồi</Tag>
        ) : (
          <Tag color="green">Bình luận gốc</Tag>
        ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 160,
      render: (date) =>
        date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "—",
    },
    {
      title: "Thao tác",
      key: "action",
      width: 130,
      fixed: "right",
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

          <Popconfirm
            title="Xóa bình luận?"
            description="Bình luận và toàn bộ phản hồi bên dưới sẽ bị xóa."
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(record._id)}
          >
            <Tooltip title="Xóa bình luận">
              <Button danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <Title level={2} style={{ marginBottom: 4 }}>
            Quản lý bình luận
          </Title>

          <Text type="secondary">
            Quản lý và kiểm duyệt bình luận trong hệ thống
          </Text>
        </div>

        <Button
          icon={<ReloadOutlined />}
          onClick={() =>
            fetchComments(1, pagination.pageSize)
          }
          loading={loading}
        >
          Làm mới
        </Button>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Tổng số bình luận"
              value={pagination.total}
              prefix={<CommentOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Space
          wrap
          style={{
            width: "100%",
            marginBottom: 20,
          }}
        >
          <Input
            placeholder="Tìm kiếm nội dung bình luận..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onPressEnter={handleSearch}
            allowClear
            style={{ width: 300 }}
          />

          <Select
            placeholder="Lọc theo loại nội dung"
            allowClear
            value={targetType}
            onChange={handleTargetTypeChange}
            style={{ width: 200 }}
            options={[
              { label: "Đánh giá", value: "Review" },
              { label: "Chủ đề diễn đàn", value: "ForumTopic" },
            ]}
          />

          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleSearch}
          >
            Tìm kiếm
          </Button>
        </Space>

        <Table
          rowKey="_id"
          columns={columns}
          dataSource={comments}
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100"],
            showTotal: (total) => `Tổng ${total} bình luận`,
            onChange: (page, pageSize) =>
              fetchComments(page, pageSize),
          }}
          locale={{
            emptyText: (
              <Empty description="Chưa có bình luận nào" />
            ),
          }}
        />
      </Card>

      <Modal
        title="Chi tiết bình luận"
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
            <Spin size="large" />
          </div>
        ) : selectedComment ? (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Mã bình luận">
              {selectedComment._id}
            </Descriptions.Item>

            <Descriptions.Item label="Người bình luận">
              {selectedComment.userId?.fullName || "Không xác định"}
            </Descriptions.Item>

            <Descriptions.Item label="Email">
              {selectedComment.userId?.email || "—"}
            </Descriptions.Item>

            <Descriptions.Item label="Vai trò">
              {selectedComment.userId?.role || "—"}
            </Descriptions.Item>

            <Descriptions.Item label="Loại nội dung">
              {renderTargetType(selectedComment.targetType)}
            </Descriptions.Item>

            <Descriptions.Item label="ID nội dung">
              {typeof selectedComment.targetId === "object"
                ? selectedComment.targetId?._id
                : selectedComment.targetId}
            </Descriptions.Item>

            <Descriptions.Item label="Bình luận cha">
              {selectedComment.parentCommentId?.content || "Không có"}
            </Descriptions.Item>

            <Descriptions.Item label="Nội dung">
              <Paragraph style={{ whiteSpace: "pre-wrap", marginBottom: 0 }}>
                {selectedComment.content}
              </Paragraph>
            </Descriptions.Item>

            <Descriptions.Item label="Ngày tạo">
              {selectedComment.createdAt
                ? dayjs(selectedComment.createdAt).format("DD/MM/YYYY HH:mm:ss")
                : "—"}
            </Descriptions.Item>

            <Descriptions.Item label="Cập nhật lần cuối">
              {selectedComment.updatedAt
                ? dayjs(selectedComment.updatedAt).format("DD/MM/YYYY HH:mm:ss")
                : "—"}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <Empty description="Không có dữ liệu bình luận" />
        )}
      </Modal>
    </div>
  );
};

export default CommentManagement;
