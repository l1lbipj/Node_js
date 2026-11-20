import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Rate,
  Spin,
  Empty,
  Alert,
} from "antd";
import {
  SearchOutlined,
  ArrowRightOutlined,
  BookOutlined,
  FireOutlined,
  ClockCircleOutlined,
  RightOutlined,
} from "@ant-design/icons";

import bookService from "../services/bookService";
import "../styles/home.css";
import Header from "../components/layout/Header"

const FALLBACK_COVER = "https://placehold.co/300x420?text=No+Cover";

const Home = () => {
  const navigate = useNavigate();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await bookService.getAllBooks();
        const bookList = Array.isArray(result.data)
          ? result.data
          : [];

        setBooks(bookList);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Không thể tải danh sách sách. Vui lòng thử lại."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  // Sách được đánh giá cao
  const featuredBooks = useMemo(() => {
    return [...books]
      .sort((a, b) => {
        const ratingDifference =
          Number(b.averageRating || 0) -
          Number(a.averageRating || 0);

        if (ratingDifference !== 0) return ratingDifference;

        return (
          Number(b.totalReview || 0) -
          Number(a.totalReview || 0)
        );
      })
      .slice(0, 8);
  }, [books]);

  // Sách mới cập nhật
  const latestBooks = useMemo(() => {
    return [...books]
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0) -
          new Date(a.createdAt || 0)
      )
      .slice(0, 8);
  }, [books]);

  // Lấy danh sách thể loại từ dữ liệu sách
  const categories = useMemo(() => {
    const categorySet = new Set();

    books.forEach((book) => {
      if (Array.isArray(book.category)) {
        book.category.forEach((item) => {
          if (typeof item === "string" && item.trim()) {
            categorySet.add(item.trim());
          }
        });
      } else if (
        typeof book.category === "string" &&
        book.category.trim()
      ) {
        categorySet.add(book.category.trim());
      }
    });

    return Array.from(categorySet).slice(0, 8);
  }, [books]);

  const handleViewBook = (bookId) => {
    navigate(`/books/${bookId}`);
  };

  const handleViewAllBooks = () => {
    navigate("/books");
  };

  const handleViewCategory = (category) => {
    navigate(`/books?category=${encodeURIComponent(category)}`);
  };

  const getAuthorName = (author) => {
    if (Array.isArray(author)) {
      return author.join(", ");
    }

    return author || "Đang cập nhật tác giả";
  };

  const renderBookCard = (book) => (
    <article
      key={book._id}
      className="home-book-card"
      onClick={() => handleViewBook(book._id)}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          handleViewBook(book._id);
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="home-book-cover">
        <img
          src={book.coverImage || FALLBACK_COVER}
          alt={book.title || "Bìa sách"}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = FALLBACK_COVER;
          }}
        />

        {Number(book.averageRating || 0) >= 4 && (
          <span className="home-book-badge">
            <FireOutlined /> Nổi bật
          </span>
        )}
      </div>

      <div className="home-book-info">
        <h3 title={book.title}>
          {book.title || "Chưa có tên sách"}
        </h3>

        <p className="home-book-author">
          {getAuthorName(book.author)}
        </p>

        <div className="home-book-rating">
          <Rate
            disabled
            allowHalf
            value={Number(book.averageRating || 0)}
          />

          <span className="home-book-rating-number">
            {Number(book.averageRating || 0).toFixed(1)}
          </span>
        </div>

        <span className="home-book-review-count">
          {book.totalReview || 0} đánh giá
        </span>
      </div>
    </article>
  );

  const renderBookSection = ({
    label,
    title,
    description,
    data,
    icon,
  }) => (
    <section className="home-content-section">
      <div className="home-section-heading">
        <div className="home-section-title-group">
          <span className="home-section-label">
            {icon}
            {label}
          </span>

          <h2>{title}</h2>

          <p>{description}</p>
        </div>

        <button
          type="button"
          className="home-view-all"
          onClick={handleViewAllBooks}
        >
          Xem tất cả <RightOutlined />
        </button>
      </div>

      {data.length > 0 ? (
        <div className="home-books-grid">
          {data.map(renderBookCard)}
        </div>
      ) : (
        <Empty description="Chưa có sách trong mục này" />
      )}
    </section>
  );

  return (
    <main className="home-page">
      <Header />
      {/* Banner giới thiệu */}
      <section className="home-hero">
        <div className="home-hero-inner">
          <div className="home-hero-content">
            <span className="home-hero-label">
              <BookOutlined />
              KHÔNG GIAN DÀNH CHO NGƯỜI YÊU SÁCH
            </span>

            <h1>
              Mỗi cuốn sách
              <br />
              <span>Mở ra một thế giới</span>
            </h1>

            <p>
              Khám phá kho tàng tri thức, tìm đọc những cuốn sách
              yêu thích và chia sẻ cảm nhận của bạn cùng cộng đồng
              độc giả Book Nest.
            </p>

            <div className="home-hero-actions">
              <Button
                type="primary"
                size="large"
                icon={<SearchOutlined />}
                onClick={handleViewAllBooks}
              >
                Khám phá sách
              </Button>

              <Button
                size="large"
                onClick={() => navigate("/community")}
              >
                Tham gia cộng đồng
                <ArrowRightOutlined />
              </Button>
            </div>

            <div className="home-hero-stat">
              <div>
                <strong>{books.length}+</strong>
                <span>Đầu sách</span>
              </div>

              <div className="home-hero-stat-divider" />

              <div>
                <strong>{categories.length}+</strong>
                <span>Thể loại</span>
              </div>
            </div>
          </div>

          <div className="home-hero-visual">
            <div className="home-hero-image-main">
              <img
                src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1000"
                alt="Không gian thư viện sách"
              />
            </div>

            <div className="home-hero-floating-card">
              <BookOutlined />
              <div>
                <strong>Book Nest</strong>
                <span>Đọc sách mỗi ngày</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nội dung sách */}
      <div className="home-main-content">
        {loading && (
          <div className="home-loading">
            <Spin size="large" />
            <p>Đang tải những cuốn sách dành cho bạn...</p>
          </div>
        )}

        {!loading && error && (
          <Alert
            className="home-error"
            message="Không thể tải danh sách sách"
            description={error}
            type="error"
            showIcon
          />
        )}

        {!loading && !error && books.length === 0 && (
          <div className="home-empty">
            <Empty description="Hiện chưa có sách để giới thiệu" />
          </div>
        )}

        {!loading && !error && books.length > 0 && (
          <>
            {/* Sách nổi bật */}
            {renderBookSection({
              label: "ĐƯỢC ĐỘC GIẢ YÊU THÍCH",
              title: "Sách nổi bật",
              description:
                "Những cuốn sách được đánh giá cao bởi cộng đồng độc giả.",
              data: featuredBooks,
              icon: <FireOutlined />,
            })}

            {/* Danh mục */}
            {categories.length > 0 && (
              <section className="home-category-section">
                <div className="home-section-heading">
                  <div className="home-section-title-group">
                    <span className="home-section-label">
                      <BookOutlined />
                      KHÁM PHÁ THEO SỞ THÍCH
                    </span>

                    <h2>Thể loại sách</h2>

                    <p>
                      Chọn một thể loại để tìm cuốn sách phù hợp.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="home-view-all"
                    onClick={handleViewAllBooks}
                  >
                    Tất cả thể loại <RightOutlined />
                  </button>
                </div>

                <div className="home-category-list">
                  {categories.map((category) => (
                    <button
                      type="button"
                      className="home-category-item"
                      key={category}
                      onClick={() => handleViewCategory(category)}
                    >
                      <span className="home-category-icon">
                        <BookOutlined />
                      </span>

                      <span>{category}</span>

                      <ArrowRightOutlined className="home-category-arrow" />
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Sách mới */}
            {renderBookSection({
              label: "CẬP NHẬT MỚI NHẤT",
              title: "Sách mới cập nhật",
              description:
                "Khám phá những đầu sách vừa được thêm vào Book Nest.",
              data: latestBooks,
              icon: <ClockCircleOutlined />,
            })}
          </>
        )}
      </div>

      {/* Khu vực cộng đồng */}
      <section className="home-community">
        <div className="home-community-content">
          <span>BOOK NEST COMMUNITY</span>

          <h2>
            Đọc sách hay hơn
            <br />
            khi có bạn đồng hành
          </h2>

          <p>
            Chia sẻ đánh giá, trao đổi góc nhìn và kết nối
            với những người có cùng niềm đam mê đọc sách.
          </p>

          <Button
            type="primary"
            size="large"
            onClick={() => navigate("/community")}
          >
            Khám phá cộng đồng
            <ArrowRightOutlined />
          </Button>
        </div>
      </section>
    </main>
  );
};

export default Home;