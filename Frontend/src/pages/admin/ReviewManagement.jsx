
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
  Rate,
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
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  SearchOutlined,
  StarOutlined,
  CommentOutlined,
} from "@ant-design/icons";

import useAuth from "../../hooks/useAuth";
import reviewService from "../../services/reviewService";

const { Title, Text, Paragraph } = Typography;

const ReviewManagement = () => {
  const { token } = useAuth();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState(undefined);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [selectedReview, setSelectedReview] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);

  // Lấy danh sách đánh giá
  const fetchReviews = useCallback(
    async (page = 1, pageSize = 10, filters = {}) => {
      if (!token) {
        setReviews([]);
        return;
      }

      setLoading(true);

      try {
        const params = {
          page,
          limit: pageSize,
          search: filters.search ?? search,
        };

        const selectedRating =
          filters.rating !== undefined
            ? filters.rating
            : ratingFilter;

        if (selectedRating !== undefined && selectedRating !== null) {
          params.rating = selectedRating;
        }

        const response = await reviewService.getAllReviews(
          token,
          params
        );

        const data = response?.data;

        if (!data || !Array.isArray(data.reviews)) {
          throw new Error("Dữ liệu đánh giá không hợp lệ");
        }

        setReviews(data.reviews);

        setPagination({
          current: data.pagination?.currentPage ?? page,
          pageSize: data.pagination?.limit ?? pageSize,
          total: data.pagination?.totalReviews ?? 0,
        });
      } catch (error) {
        console.error("Lỗi lấy danh sách đánh giá:", error);
        message.error(
          error.response?.data?.message ||
            error.message ||
            "Không thể tải danh sách đánh giá"
        );
      } finally {
        setLoading(false);
      }
    },
    [token, search, ratingFilter]
  );

  useEffect(() => {
    fetchReviews(1, pagination.pageSize);
  }, [fetchReviews]);

  // Tìm kiếm
  const handleSearch = () => {
    fetchReviews(1, pagination.pageSize, {
      search,
      rating: ratingFilter,
    });
  };

  // Lọc theo số sao
  const handleRatingChange = (value) => {
    setRatingFilter(value);
    fetchReviews(1, pagination.pageSize, {
      search,
      rating: value,
    });
  };

  // Xem chi tiết đánh giá
  const handleViewDetail = async (reviewId) => {
    setDetailVisible(true);
    setDetailLoading(true);
    setSelectedReview(null);

    try {
      const response = await reviewService.getReviewById(
        token,
        reviewId
      );

      setSelectedReview(response?.data || null);
    } catch (error) {
      console.error("Lỗi lấy chi tiết đánh giá:", error);
      message.error(
        error.response?.data?.message ||
          "Không thể tải chi tiết đánh giá"
      );
      setDetailVisible(false);
    } finally {
      setDetailLoading(false);
    }
  };

  // Đóng modal chi tiết
  const closeDetail = () => {
    setDetailVisible(false);
    setSelectedReview(null);
  };

  // Xóa đánh giá
  const handleDelete = async (reviewId) => {
    if (!token) {
      message.error("Phiên đăng nhập không hợp lệ");
      return;
    }

    try {
      await reviewService.deleteReview(token, reviewId);

      message.success("Xóa đánh giá thành công");

      const nextPage =
        reviews.length === 1 && pagination.current > 1
          ? pagination.current - 1
          : pagination.current;

      await fetchReviews(nextPage, pagination.pageSize);
    } catch (error) {
      console.error("Lỗi xóa đánh giá:", error);
      message.error(
        error.response?.data?.message ||
          "Không thể xóa đánh giá"
      );
    }
  };

  // Định dạng ngày
  const formatDate = (date) => {
    if (!date || !dayjs(date).isValid()) {
      return "Không xác định";
    }

    return dayjs(date).format("DD/MM/YYYY HH:mm");
  };

  // Các cột bảng
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
      title: "Người đánh giá",
      key: "user",
      width: 190,
      render: (_, record) => (
        <Space>
          <Avatar src={record.userId?.avatar}>
            {record.userId?.fullName?.charAt(0) || "U"}
          </Avatar>
          <div>
            <Text strong>
              {record.userId?.fullName || "Người dùng đã xóa"}
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.userId?.email || "Không có email"}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Sách",
      key: "book",
      width: 180,
      render: (_, record) => (
        <Space>
          <Avatar
            shape="square"
            size={42}
            src={record.bookId?.coverImage}
          >
            S
          </Avatar>
          <Text>
            {record.bookId?.title || "Sách đã bị xóa"}
          </Text>
        </Space>
      ),
    },
    {
      title: "Đánh giá",
      dataIndex: "rating",
      key: "rating",
      width: 145,
      align: "center",
      render: (rating) => (
        <Space direction="vertical" size={0}>
          <Rate disabled value={Number(rating) || 0} />
          <Text type="secondary">{rating || 0}/5 sao</Text>
        </Space>
      ),
    },
    {
      title: "Nội dung",
      dataIndex: "comment",
      key: "comment",
      ellipsis: {
        showTitle: false,
      },
      render: (comment) => (
        <Tooltip title={comment}>
          <Text>{comment || "Không có nội dung"}</Text>
        </Tooltip>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      render: (date) => formatDate(date),
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
            title="Xóa đánh giá"
            description="Bạn có chắc chắn muốn xóa đánh giá này?"
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(record._id)}
          >
            <Tooltip title="Xóa đánh giá">
              <Button
                danger
                icon={<DeleteOutlined />}
              />
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
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <div>
          <Title level={3} style={{ margin: 0 }}>
            Quản lý đánh giá
          </Title>
          <Text type="secondary">
            Quản lý và kiểm duyệt đánh giá sách của người dùng
          </Text>
        </div>

        <Button
          icon={<ReloadOutlined />}
          onClick={() =>
            fetchReviews(pagination.current, pagination.pageSize)
          }
          loading={loading}
        >
          Làm mới
        </Button>
      </div>

      {/* Thống kê */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title="Tổng số đánh giá"
              value={pagination.total}
              prefix={<CommentOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title="Điểm đánh giá trung bình trên trang"
              value={
                reviews.length > 0
                  ? Number(
                      (
                        reviews.reduce(
                          (sum, item) =>
                            sum + (Number(item.rating) || 0),
                          0
                        ) / reviews.length
                      ).toFixed(2)
                    )
                  : 0
              }
              suffix="/ 5"
              prefix={<StarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Bộ lọc */}
      <Card style={{ marginBottom: 20 }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} md={12} lg={14}>
            <Input
              placeholder="Tìm kiếm nội dung đánh giá..."
              prefix={<SearchOutlined />}
              value={search}
              allowClear
              onChange={(event) => setSearch(event.target.value)}
              onPressEnter={handleSearch}
            />
          </Col>

          <Col xs={24} md={7} lg={6}>
            <Select
              style={{ width: "100%" }}
              placeholder="Lọc theo số sao"
              allowClear
              value={ratingFilter}
              onChange={handleRatingChange}
              options={[
                { label: "5 sao", value: 5 },
                { label: "4 sao", value: 4 },
                { label: "3 sao", value: 3 },
                { label: "2 sao", value: 2 },
                { label: "1 sao", value: 1 },
              ]}
            />
          </Col>

          <Col xs={24} md={5} lg={4}>
            <Button
              type="primary"
              block
              icon={<SearchOutlined />}
              onClick={handleSearch}
            >
              Tìm kiếm
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Danh sách đánh giá */}
      <Card title="Danh sách đánh giá">
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={reviews}
          loading={loading}
          scroll={{ x: 1100 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            pageSizeOptions: ["5", "10", "20", "50"],
            showTotal: (total) => `Tổng ${total} đánh giá`,
            onChange: (page, pageSize) => {
              fetchReviews(page, pageSize);
            },
          }}
          locale={{
            emptyText: (
              <Empty description="Chưa có đánh giá nào" />
            ),
          }}
        />
      </Card>

      {/* Modal chi tiết */}
      <Modal
        title="Chi tiết đánh giá"
        open={detailVisible}
        onCancel={closeDetail}
        footer={[
          <Button key="close" onClick={closeDetail}>
            Đóng
          </Button>,
        ]}
        width={650}
        destroyOnHidden
      >
        <Spin spinning={detailLoading}>
          {selectedReview && (
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Người đánh giá">
                <Space>
                  <Avatar src={selectedReview.userId?.avatar}>
                    {selectedReview.userId?.fullName?.charAt(0) || "U"}
                  </Avatar>
                  <div>
                    <Text strong>
                      {selectedReview.userId?.fullName ||
                        "Người dùng đã xóa"}
                    </Text>
                    <br />
                    <Text type="secondary">
                      {selectedReview.userId?.email || "Không có email"}
                    </Text>
                  </div>
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label="Sách">
                <Space>
                  <Avatar
                    shape="square"
                    size={48}
                    src={selectedReview.bookId?.coverImage}
                  >
                    S
                  </Avatar>
                  {selectedReview.bookId?.title || "Sách đã bị xóa"}
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label="Điểm đánh giá">
                <Rate
                  disabled
                  value={Number(selectedReview.rating) || 0}
                />
                <Text style={{ marginLeft: 8 }}>
                  {selectedReview.rating}/5
                </Text>
              </Descriptions.Item>

              <Descriptions.Item label="Nội dung">
                <Paragraph style={{ marginBottom: 0 }}>
                  {selectedReview.comment}
                </Paragraph>
              </Descriptions.Item>

              <Descriptions.Item label="Ngày tạo">
                {formatDate(selectedReview.createdAt)}
              </Descriptions.Item>

              <Descriptions.Item label="Cập nhật lần cuối">
                {formatDate(selectedReview.updatedAt)}
              </Descriptions.Item>

              <Descriptions.Item label="Mã đánh giá">
                <Text copyable>{selectedReview._id}</Text>
              </Descriptions.Item>
            </Descriptions>
          )}
        </Spin>
      </Modal>
    </div>
  );
};

export default ReviewManagement;
