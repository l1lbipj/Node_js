
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Alert,
  Avatar,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Empty,
  Form,
  Input,
  Modal,
  Popconfirm,
  Rate,
  Row,
  Skeleton,
  Space,
  Spin,
  Tag,
  Typography,
  message,
} from "antd";

import {
  ArrowLeftOutlined,
  BookOutlined,
  CalendarOutlined,
  DeleteOutlined,
  EditOutlined,
  MessageOutlined,
  SendOutlined,
  UserOutlined,
} from "@ant-design/icons";

import bookService from "../../services/bookService";
import reviewService from "../../services/reviewService";
import useAuth from "../../hooks/useAuth";
import Header from "../../components/layout/Header";

import "../../styles/bookDetail.css";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const DEFAULT_COVER =
  "https://placehold.co/400x560/ececec/777777?text=Book+Cover";

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    user,
    token,
    isAuthenticated,
    loading: authLoading,
  } = useAuth();

  // ==============================
  // STATES
  // ==============================

  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);

  const [bookLoading, setBookLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(true);

  const [bookError, setBookError] = useState("");
  const [reviewError, setReviewError] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [form] = Form.useForm();

  // ==============================
  // LẤY THÔNG TIN CHI TIẾT SÁCH
  // ==============================

  const fetchBook = useCallback(async () => {
    if (!id) return;

    try {
      const result = await bookService.getBookById(id);

      if (!result?.success || !result.data) {
        throw new Error(
          result?.message || "Không thể tải thông tin sách."
        );
      }

      setBook(result.data);
      setBookError("");
    } catch (error) {
      setBook(null);

      setBookError(
        error.response?.data?.message ||
          error.message ||
          "Đã xảy ra lỗi khi tải thông tin sách."
      );
    } finally {
      setBookLoading(false);
    }
  }, [id]);

  // ==============================
  // LẤY DANH SÁCH ĐÁNH GIÁ
  // ==============================

  const fetchReviews = useCallback(async () => {
    if (!id || authLoading) return;

    try {
      const result = await reviewService.getReviewsByBook(
        token,
        id
      );

      if (!result?.success) {
        throw new Error(
          result?.message || "Không thể tải danh sách đánh giá."
        );
      }

      setReviews(result.data?.reviews || []);
      setReviewError("");
    } catch (error) {
      setReviews([]);

      setReviewError(
        error.response?.data?.message ||
          error.message ||
          "Không thể tải danh sách đánh giá."
      );
    } finally {
      setReviewLoading(false);
    }
  }, [id, token, authLoading]);

  // ==============================
  // EFFECT
  // ==============================

  useEffect(() => {
    fetchBook();
  }, [fetchBook]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // ==============================
  // KIỂM TRA NGƯỜI ĐĂNG ĐÁNH GIÁ
  // ==============================

  const getReviewUserId = (review) => {
    const reviewUser = review?.userId;

    if (typeof reviewUser === "object" && reviewUser !== null) {
      return String(reviewUser._id || reviewUser.id || "");
    }

    return String(reviewUser || "");
  };

  const currentUserId = String(user?._id || user?.id || "");

  // Kiểm tra quyền sửa và xóa đánh giá
  const canManageReview = (review) => {
    if (!isAuthenticated || !user) return false;

    const isAdmin = user.role === "admin";
    const isOwner = getReviewUserId(review) === currentUserId;

    return isAdmin || isOwner;
  };

  // ==============================
  // MỞ FORM THÊM ĐÁNH GIÁ
  // ==============================

  const openCreateReview = () => {
    if (!isAuthenticated) {
      message.warning("Vui lòng đăng nhập để viết đánh giá.");

      navigate("/login", {
        state: {
          from: {
            pathname: `/books/${id}`,
          },
        },
      });

      return;
    }

    setEditingReview(null);

    form.resetFields();

    form.setFieldsValue({
      rating: 5,
      comment: "",
    });

    setModalOpen(true);
  };

  // ==============================
  // MỞ FORM SỬA ĐÁNH GIÁ
  // ==============================

  const openEditReview = (review) => {
    setEditingReview(review);

    form.setFieldsValue({
      rating: review.rating,
      comment: review.comment,
    });

    setModalOpen(true);
  };

  // ==============================
  // ĐÓNG MODAL
  // ==============================

  const closeReviewModal = () => {
    setModalOpen(false);
    setEditingReview(null);
    form.resetFields();
  };

  // ==============================
  // THÊM / CẬP NHẬT ĐÁNH GIÁ
  // ==============================

  const handleSubmitReview = async (values) => {
    if (!token) {
      message.warning("Phiên đăng nhập không hợp lệ.");
      return;
    }

    try {
      setSubmitting(true);

      const reviewData = {
        rating: values.rating,
        comment: values.comment.trim(),
      };

      if (editingReview) {
        await reviewService.updateReview(
          token,
          editingReview._id,
          reviewData
        );

        message.success("Cập nhật đánh giá thành công.");
      } else {
        await reviewService.createReview(token, {
          bookId: id,
          ...reviewData,
        });

        message.success("Thêm đánh giá thành công.");
      }

      closeReviewModal();

      await fetchReviews();
      await fetchBook();
    } catch (error) {
      message.error(
        error.response?.data?.message ||
          "Không thể lưu đánh giá. Vui lòng thử lại."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==============================
  // XÓA ĐÁNH GIÁ
  // ==============================

  const handleDeleteReview = async (reviewId) => {
    if (!token) {
      message.warning("Vui lòng đăng nhập lại.");
      return;
    }

    try {
      await reviewService.deleteReview(token, reviewId);

      message.success("Xóa đánh giá thành công.");

      await fetchReviews();
      await fetchBook();
    } catch (error) {
      message.error(
        error.response?.data?.message ||
          "Không thể xóa đánh giá."
      );
    }
  };

  // ==============================
  // ĐỊNH DẠNG NGÀY
  // ==============================

  const formatDate = (date) => {
    if (!date) return "Chưa cập nhật";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Chưa cập nhật";
    }

    return parsedDate.toLocaleDateString("vi-VN");
  };

  // ==============================
  // THÔNG TIN NHÀ XUẤT BẢN
  // ==============================

  const publisherName =
    typeof book?.publisherId === "object"
      ? book.publisherId?.name
      : null;

  // ==============================
  // LOADING SÁCH
  // ==============================

  if (bookLoading) {
    return (
      <>
        <Header />

        <main className="book-detail-page">
          <div className="book-detail-container">
            <Skeleton active paragraph={{ rows: 8 }} />
          </div>
        </main>
      </>
    );
  }

  // ==============================
  // LỖI TẢI SÁCH
  // ==============================

  if (bookError || !book) {
    return (
      <>
        <Header />

        <main className="book-detail-page">
          <div className="book-detail-container">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
              className="back-button"
            >
              Quay lại
            </Button>

            <Alert
              type="error"
              showIcon
              message="Không thể tải thông tin sách"
              description={bookError || "Sách không tồn tại."}
            />
          </div>
        </main>
      </>
    );
  }

  // ==============================
  // GIAO DIỆN CHÍNH
  // ==============================

  return (
    <>
      <Header />

      <main className="book-detail-page">
        <div className="book-detail-container">

          {/* NÚT QUAY LẠI */}

          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            className="back-button"
          >
            Quay lại
          </Button>

          {/* THÔNG TIN CHÍNH CỦA SÁCH */}

          <Card
            className="book-detail-card"
            bordered={false}
          >
            <Row gutter={[36, 28]}>
              <Col xs={24} sm={10} md={8} lg={7}>
                <div className="book-detail-cover-wrapper">
                  <img
                    src={book.coverImage || DEFAULT_COVER}
                    alt={book.title}
                    className="book-detail-cover"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = DEFAULT_COVER;
                    }}
                  />
                </div>
              </Col>

              <Col xs={24} sm={14} md={16} lg={17}>
                <div className="book-detail-information">

                  <Title
                    level={2}
                    className="book-detail-title"
                  >
                    {book.title}
                  </Title>

                  {/* TÁC GIẢ */}

                  <div className="book-detail-authors">
                    <UserOutlined />

                    <Text>
                      {Array.isArray(book.author)
                        ? book.author.join(", ")
                        : book.author || "Chưa cập nhật tác giả"}
                    </Text>
                  </div>

                  {/* ĐÁNH GIÁ TRUNG BÌNH */}

                  <div className="book-detail-rating">
                    <Rate
                      disabled
                      allowHalf
                      value={Number(book.averageRating) || 0}
                    />

                    <Text strong>
                      {(Number(book.averageRating) || 0).toFixed(1)}/5
                    </Text>

                    <Text type="secondary">
                      ({book.totalReview || 0} đánh giá)
                    </Text>
                  </div>

                  <Divider />

                  {/* THÔNG TIN SÁCH */}

                  <Descriptions
                    column={1}
                    size="middle"
                    className="book-detail-descriptions"
                  >
                    <Descriptions.Item label="Nhà xuất bản">
                      {publisherName || "Chưa cập nhật"}
                    </Descriptions.Item>

                    <Descriptions.Item label="Thể loại">
                      <Space wrap>
                        {Array.isArray(book.category) &&
                        book.category.length > 0 ? (
                          book.category.map((category, index) => (
                            <Tag
                              color="blue"
                              key={`${category}-${index}`}
                            >
                              {category}
                            </Tag>
                          ))
                        ) : (
                          <Text type="secondary">
                            Chưa phân loại
                          </Text>
                        )}
                      </Space>
                    </Descriptions.Item>

                    <Descriptions.Item label="Ngày xuất bản">
                      <CalendarOutlined />{" "}
                      {formatDate(book.publishDate)}
                    </Descriptions.Item>
                  </Descriptions>

                  {/* NÚT VIẾT ĐÁNH GIÁ */}

                  <div className="book-detail-actions">
                    <Button
                      type="primary"
                      size="large"
                      icon={<MessageOutlined />}
                      onClick={openCreateReview}
                    >
                      Viết đánh giá
                    </Button>
                  </div>

                </div>
              </Col>
            </Row>
          </Card>

          {/* MÔ TẢ SÁCH */}

          <Card
            title={
              <Space>
                <BookOutlined />
                <span>Giới thiệu sách</span>
              </Space>
            }
            className="book-detail-section"
            bordered={false}
          >
            <Paragraph className="book-description">
              {book.description ||
                "Chưa có mô tả cho cuốn sách này."}
            </Paragraph>
          </Card>

          {/* DANH SÁCH ĐÁNH GIÁ */}

          <Card
            title={
              <Space>
                <MessageOutlined />
                <span>Đánh giá của độc giả</span>

                <Tag color="blue">
                  {reviews.length}
                </Tag>
              </Space>
            }
            className="book-detail-section"
            bordered={false}
            extra={
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={openCreateReview}
              >
                Viết đánh giá
              </Button>
            }
          >
            {reviewLoading ? (
              <div className="review-loading">
                <Spin tip="Đang tải đánh giá..." />
              </div>
            ) : reviewError ? (
              <Alert
                type="warning"
                showIcon
                message="Không thể tải đánh giá"
                description={
                  <>
                    {reviewError}

                    {!isAuthenticated && (
                      <div className="review-login-hint">
                        <Button
                          type="link"
                          onClick={() =>
                            navigate("/login", {
                              state: {
                                from: {
                                  pathname: `/books/${id}`,
                                },
                              },
                            })
                          }
                        >
                          Đăng nhập để xem đánh giá
                        </Button>
                      </div>
                    )}
                  </>
                }
              />
            ) : reviews.length === 0 ? (
              <Empty
                description="Chưa có đánh giá nào cho cuốn sách này"
              >
                <Button
                  type="primary"
                  onClick={openCreateReview}
                >
                  Viết đánh giá đầu tiên
                </Button>
              </Empty>
            ) : (
              <div className="review-list">
                {reviews.map((review) => {
                  const reviewUser =
                    typeof review.userId === "object"
                      ? review.userId
                      : null;

                  const reviewerName =
                    reviewUser?.fullName || "Độc giả";

                  return (
                    <div
                      className="review-item"
                      key={review._id}
                    >

                      {/* THÔNG TIN NGƯỜI ĐÁNH GIÁ */}

                      <div className="review-header">
                        <div className="review-user">
                          <Avatar
                            src={reviewUser?.avatar}
                            icon={<UserOutlined />}
                            size={44}
                          />

                          <div className="review-user-info">
                            <Text strong>
                              {reviewerName}
                            </Text>

                            <Text
                              type="secondary"
                              className="review-date"
                            >
                              {formatDate(review.createdAt)}
                            </Text>
                          </div>
                        </div>

                        <Rate
                          disabled
                          value={Number(review.rating) || 0}
                        />
                      </div>

                      {/* NỘI DUNG ĐÁNH GIÁ */}

                      <Paragraph className="review-comment">
                        {review.comment}
                      </Paragraph>

                      {/* NÚT SỬA / XÓA */}

                      {canManageReview(review) && (
                        <div className="review-actions">
                          <Button
                            type="link"
                            icon={<EditOutlined />}
                            onClick={() =>
                              openEditReview(review)
                            }
                          >
                            Chỉnh sửa
                          </Button>

                          <Popconfirm
                            title="Xóa đánh giá"
                            description="Bạn có chắc chắn muốn xóa đánh giá này?"
                            okText="Xóa"
                            cancelText="Hủy"
                            okButtonProps={{
                              danger: true,
                            }}
                            onConfirm={() =>
                              handleDeleteReview(review._id)
                            }
                          >
                            <Button
                              type="link"
                              danger
                              icon={<DeleteOutlined />}
                            >
                              Xóa
                            </Button>
                          </Popconfirm>
                        </div>
                      )}

                      <Divider />
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

        </div>
      </main>

      {/* MODAL THÊM / SỬA ĐÁNH GIÁ */}

      <Modal
        title={
          editingReview
            ? "Chỉnh sửa đánh giá"
            : "Viết đánh giá sách"
        }
        open={modalOpen}
        onCancel={closeReviewModal}
        footer={null}
        destroyOnHidden
        centered
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitReview}
        >

          {/* SỐ SAO */}

          <Form.Item
            label="Đánh giá của bạn"
            name="rating"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn số sao.",
              },
            ]}
          >
            <Rate />
          </Form.Item>

          {/* NỘI DUNG */}

          <Form.Item
            label="Nội dung đánh giá"
            name="comment"
            rules={[
              {
                required: true,
                whitespace: true,
                message: "Vui lòng nhập nội dung đánh giá.",
              },
              {
                max: 2000,
                message:
                  "Đánh giá không được vượt quá 2000 ký tự.",
              },
            ]}
          >
            <TextArea
              rows={5}
              maxLength={2000}
              showCount
              placeholder="Chia sẻ cảm nhận của bạn về cuốn sách..."
            />
          </Form.Item>

          {/* NÚT THAO TÁC */}

          <Form.Item className="review-form-actions">
            <Space>
              <Button onClick={closeReviewModal}>
                Hủy
              </Button>

              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
              >
                {editingReview
                  ? "Cập nhật"
                  : "Gửi đánh giá"}
              </Button>
            </Space>
          </Form.Item>

        </Form>
      </Modal>
    </>
  );
};

export default BookDetail;
