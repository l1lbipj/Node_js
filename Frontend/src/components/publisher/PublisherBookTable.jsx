import {
  Button,
  Card,
  Empty,
  Input,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import {
  BookOutlined,
  DeleteOutlined,
  EditOutlined,
  ReloadOutlined,
  SearchOutlined,
  StarFilled,
} from "@ant-design/icons";

const { Text } = Typography;

const normalizeArray = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return [];
};

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
};

const PublisherBookTable = ({
  books,
  loading,
  search,
  category,
  categories,
  onSearch,
  onCategoryChange,
  onRefresh,
  onEdit,
  onDelete,
}) => {
  const columns = [
    {
      title: "Sách",
      key: "book",
      width: 280,
      render: (_, book) => (
        <Space align="start" size={12}>
          <div className="book-cover">
            {book.coverImage ? <img src={book.coverImage} alt={book.title} /> : <BookOutlined />}
          </div>
          <div className="book-cell">
            <Text strong>{book.title}</Text>
            <Text type="secondary" className="book-author">
              {normalizeArray(book.author).join(", ") || "Chưa cập nhật tác giả"}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Thể loại",
      key: "category",
      render: (_, book) => (
        <Space wrap size={[4, 4]}>
          {normalizeArray(book.category).slice(0, 2).map((item) => <Tag key={item} color="blue">{item}</Tag>)}
        </Space>
      ),
    },
    {
      title: "Đánh giá",
      key: "rating",
      render: (_, book) => (
        <span className="rating-cell">
          <StarFilled /> {Number(book.averageRating || 0).toFixed(1)} <Text type="secondary">({book.totalReview || 0})</Text>
        </span>
      ),
    },
    { title: "Ngày xuất bản", dataIndex: "publishDate", key: "publishDate", render: formatDate },
    {
      title: "Thao tác",
      key: "actions",
      align: "right",
      render: (_, book) => (
        <Space>
          <Tooltip title="Chỉnh sửa"><Button aria-label={`Chỉnh sửa ${book.title}`} icon={<EditOutlined />} onClick={() => onEdit(book)} /></Tooltip>
          <Popconfirm
            title="Xóa sách này?"
            description="Thao tác này không thể hoàn tác."
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
            onConfirm={() => onDelete(book._id)}
          >
            <Tooltip title="Xóa"><Button danger aria-label={`Xóa ${book.title}`} icon={<DeleteOutlined />} /></Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      className="books-card"
      title={<span><BookOutlined /> Kho sách</span>}
      extra={<Button icon={<ReloadOutlined />} onClick={onRefresh} loading={loading}>Làm mới</Button>}
    >
      <div className="table-toolbar">
        <Input allowClear value={search} prefix={<SearchOutlined />} placeholder="Tìm theo tên sách hoặc tác giả" onChange={(event) => onSearch(event.target.value)} />
        <Select allowClear value={category} placeholder="Lọc theo thể loại" options={categories.map((item) => ({ value: item, label: item }))} onChange={onCategoryChange} />
      </div>
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={books}
        loading={loading}
        locale={{ emptyText: <Empty description="Chưa có sách phù hợp" /> }}
        pagination={{ pageSize: 6, showSizeChanger: false, hideOnSinglePage: true }}
        scroll={{ x: 850 }}
      />
    </Card>
  );
};

export default PublisherBookTable;
