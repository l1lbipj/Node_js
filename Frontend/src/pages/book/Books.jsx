
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  Input,
  Select,
  Pagination,
  Spin,
  Empty,
  Alert,
  Rate,
  Button,
} from "antd";

import {
  SearchOutlined,
  BookOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

import bookService from "../../services/bookService";
import Header from "../../components/layout/Header";

import "../../styles/book.css";

const PAGE_SIZE = 12;
const FALLBACK_COVER = "https://placehold.co/300x420?text=No+Cover";

const Books = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [keyword, setKeyword] = useState(
  searchParams.get("keyword") || ""
);

  const [category, setCategory] = useState(
    searchParams.get("category") || "all"
  );

  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);

  // Lấy danh sách sách từ API
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await bookService.getAllBooks();

        setBooks(
          Array.isArray(result.data) ? result.data : []
        );
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Không thể tải danh sách sách."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  // Lấy danh sách thể loại từ dữ liệu sách
  const categories = useMemo(() => {
    const categorySet = new Set();

    books.forEach((book) => {
      const items = Array.isArray(book.category)
        ? book.category
        : [book.category];

      items.forEach((item) => {
        if (typeof item === "string" && item.trim()) {
          categorySet.add(item.trim());
        }
      });
    });

    return Array.from(categorySet).sort();
  }, [books]);

  // Tìm kiếm, lọc và sắp xếp sách
  const filteredBooks = useMemo(() => {
    let result = [...books];

    const normalizedKeyword = keyword
      .trim()
      .toLowerCase();

    // Tìm theo tên sách hoặc tác giả
    if (normalizedKeyword) {
      result = result.filter((book) => {
        const title = (book.title || "").toLowerCase();

        const author = Array.isArray(book.author)
          ? book.author.join(" ").toLowerCase()
          : (book.author || "").toLowerCase();

        return (
          title.includes(normalizedKeyword) ||
          author.includes(normalizedKeyword)
        );
      });
    }

    // Lọc theo thể loại
    if (category !== "all") {
      result = result.filter((book) => {
        const items = Array.isArray(book.category)
          ? book.category
          : [book.category];

        return items.some(
          (item) =>
            typeof item === "string" &&
            item.trim() === category
        );
      });
    }

    // Sắp xếp sách
    result.sort((a, b) => {
      if (sortBy === "rating") {
        return (
          Number(b.averageRating || 0) -
          Number(a.averageRating || 0)
        );
      }

      if (sortBy === "reviews") {
        return (
          Number(b.totalReview || 0) -
          Number(a.totalReview || 0)
        );
      }

      return (
        new Date(b.createdAt || 0) -
        new Date(a.createdAt || 0)
      );
    });

    return result;
  }, [books, keyword, category, sortBy]);

  // Phân trang
  const paginatedBooks = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;

    return filteredBooks.slice(start, start + PAGE_SIZE);
  }, [filteredBooks, currentPage]);

  // Xử lý chọn thể loại
  const handleCategoryChange = (value) => {
    setCategory(value);
    setCurrentPage(1);

    if (value === "all") {
      setSearchParams({});
    } else {
      setSearchParams({ category: value });
    }
  };

  // Đặt lại bộ lọc
  const resetFilters = () => {
    setKeyword("");
    setCategory("all");
    setSortBy("newest");
    setSearchParams({});
    setCurrentPage(1);
  };

  // Chuyển đến trang chi tiết sách
  const handleViewBook = (id) => {
    navigate(`/books/${id}`);
  };

  // Lấy tên tác giả
  const getAuthor = (author) => {
    if (Array.isArray(author)) {
      return author.join(", ");
    }

    return author || "Đang cập nhật";
  };

  return (
    <>
      <Header />

      <main className="books-page">
        {/* Banner */}
        <section className="books-banner">
          <div className="books-banner-content">
            <span>
              <BookOutlined /> BOOK NEST LIBRARY
            </span>

            <h1>Khám phá thế giới sách</h1>

            <p>
              Tìm kiếm những cuốn sách yêu thích và khám phá
              kho tàng tri thức cùng Book Nest.
            </p>
          </div>
        </section>

        <div className="books-container">
          {/* Tiêu đề */}
          <div className="books-heading">
            <div>
              <h2>Tất cả sách</h2>

              <p>
                Hiện có {filteredBooks.length} cuốn sách
              </p>
            </div>
          </div>

          {/* Thanh tìm kiếm và bộ lọc */}
          <div className="books-toolbar">
            <Input
              allowClear
              size="large"
              prefix={<SearchOutlined />}
              placeholder="Tìm theo tên sách hoặc tác giả..."
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setCurrentPage(1);
              }}
            />

            <Select
              size="large"
              value={category}
              onChange={handleCategoryChange}
              options={[
                {
                  label: "Tất cả thể loại",
                  value: "all",
                },
                ...categories.map((item) => ({
                  label: item,
                  value: item,
                })),
              ]}
            />

            <Select
              size="large"
              value={sortBy}
              onChange={(value) => {
                setSortBy(value);
                setCurrentPage(1);
              }}
              options={[
                { label: "Mới nhất", value: "newest" },
                { label: "Đánh giá cao", value: "rating" },
                { label: "Nhiều đánh giá", value: "reviews" },
              ]}
            />

            <Button
              size="large"
              icon={<ReloadOutlined />}
              onClick={resetFilters}
            >
              Đặt lại
            </Button>
          </div>

          {/* Loading */}
          {loading && (
            <div className="books-loading">
              <Spin size="large" />
              <p>Đang tải danh sách sách...</p>
            </div>
          )}

          {/* Lỗi API */}
          {!loading && error && (
            <Alert
              type="error"
              showIcon
              message="Có lỗi xảy ra"
              description={error}
            />
          )}

          {/* Không tìm thấy sách */}
          {!loading &&
            !error &&
            filteredBooks.length === 0 && (
              <div className="books-empty">
                <Empty description="Không tìm thấy sách phù hợp" />

                <Button onClick={resetFilters}>
                  Xóa bộ lọc
                </Button>
              </div>
            )}

          {/* Danh sách sách */}
          {!loading &&
            !error &&
            filteredBooks.length > 0 && (
              <>
                <div className="books-grid">
                  {paginatedBooks.map((book) => (
                    <article
                      key={book._id}
                      className="books-card"
                      role="button"
                      tabIndex={0}
                      onClick={() =>
                        handleViewBook(book._id)
                      }
                      onKeyDown={(event) => {
                        if (
                          event.key === "Enter" ||
                          event.key === " "
                        ) {
                          event.preventDefault();
                          handleViewBook(book._id);
                        }
                      }}
                    >
                      {/* Ảnh bìa */}
                      <div className="books-cover">
                        <img
                          src={
                            book.coverImage || FALLBACK_COVER
                          }
                          alt={book.title || "Bìa sách"}
                          loading="lazy"
                          onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src =
                              FALLBACK_COVER;
                          }}
                        />
                      </div>

                      {/* Thông tin sách */}
                      <div className="books-card-info">
                        <h3 title={book.title}>
                          {book.title}
                        </h3>

                        <p>
                          {getAuthor(book.author)}
                        </p>

                        {/* Đánh giá */}
                        <div className="books-rating">
                          <Rate
                            disabled
                            allowHalf
                            value={Math.min(
                              5,
                              Math.max(
                                0,
                                Number(book.averageRating || 0)
                              )
                            )}
                          />

                          <strong>
                            {Number(
                              book.averageRating || 0
                            ).toFixed(1)}
                          </strong>
                        </div>

                        {/* Tổng lượt đánh giá */}
                        <span className="books-review-count">
                          {book.totalReview || 0} đánh giá
                        </span>
                      </div>
                    </article>
                  ))}
                </div>

                {/* Phân trang */}
                <div className="books-pagination">
                  <Pagination
                    current={currentPage}
                    pageSize={PAGE_SIZE}
                    total={filteredBooks.length}
                    onChange={setCurrentPage}
                    showSizeChanger={false}
                    showTotal={(total) =>
                      `Tổng ${total} cuốn sách`
                    }
                  />
                </div>
              </>
            )}
        </div>
      </main>
    </>
  );
};

export default Books;
