
import { useEffect, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  Col,
  Descriptions,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
  message,
  Popconfirm,
  Tooltip,
} from "antd";

import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ShopOutlined,
  UserOutlined,
  ReloadOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";

import publisherService from "../../services/publisherService";
import userService from "../../services/userService";
import useAuth from "../../hooks/useAuth";

const { Title, Text } = Typography;
const { TextArea } = Input;

const PublisherManagement = () => {
  const { token } = useAuth();

  const [publishers, setPublishers] = useState([]);
  const [publisherUsers, setPublisherUsers] = useState([]);
  const [publisherUserTotal, setPublisherUserTotal] = useState(0);

  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);

  const [search, setSearch] = useState("");

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  const [editingPublisher, setEditingPublisher] = useState(null);
  const [selectedPublisher, setSelectedPublisher] = useState(null);

  const [form] = Form.useForm();

  // Lấy danh sách Publisher
  const fetchPublishers = async (
    page = pagination.current,
    pageSize = pagination.pageSize,
    searchValue = search,
  ) => {
    if (!token) return;

    try {
      setLoading(true);

      const response = await publisherService.getAllPublishers(token, {
        page,
        limit: pageSize,
        search: searchValue,
      });

      const result = response?.data;

      setPublishers(result?.publishers || []);

      setPagination({
        current: result?.pagination?.currentPage || page,
        pageSize: result?.pagination?.limit || pageSize,
        total: result?.pagination?.totalPublishers || 0,
      });
    } catch (error) {
      message.error(
        error.response?.data?.message ||
          "Không thể tải danh sách nhà xuất bản",
      );
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh sách tài khoản Publisher
  const fetchPublisherUsers = async () => {
    if (!token) return;

    try {
      setUsersLoading(true);

      const response = await userService.getAllUsers(token, {
        page: 1,
        limit: 100,
        role: "publisher",
      });

      const result = response?.data;

      let users = [];

      if (Array.isArray(result)) {
        users = result;
      } else if (Array.isArray(result?.users)) {
        users = result.users;
      } else if (Array.isArray(result?.data?.users)) {
        users = result.data.users;
      }

      const filteredUsers = users.filter(
        (user) => user.role === "publisher",
      );

      setPublisherUsers(filteredUsers);

      // Lấy tổng số tài khoản từ Backend
      const totalUsers =
        result?.pagination?.totalUsers ??
        result?.data?.pagination?.totalUsers ??
        filteredUsers.length;

      setPublisherUserTotal(totalUsers);
    } catch (error) {
      message.error(
        error.response?.data?.message ||
          "Không thể tải danh sách tài khoản Publisher",
      );

      setPublisherUsers([]);
      setPublisherUserTotal(0);
    } finally {
      setUsersLoading(false);
    }
  };

  // Khởi tạo dữ liệu
  useEffect(() => {
    if (!token) return;

    fetchPublishers(1, 10, "");
    fetchPublisherUsers();
  }, [token]);

  // Làm mới dữ liệu
  const handleRefresh = () => {
    fetchPublishers(pagination.current, pagination.pageSize, search);
    fetchPublisherUsers();
  };

  // Tìm kiếm
  const handleSearch = (value) => {
    const searchValue = value.trim();

    setSearch(searchValue);
    fetchPublishers(1, pagination.pageSize, searchValue);
  };

  // Mở modal thêm Publisher
  const handleCreate = () => {
    setEditingPublisher(null);
    form.resetFields();
    setModalOpen(true);
  };

  // Mở modal chỉnh sửa
  const handleEdit = (publisher) => {
    setEditingPublisher(publisher);

    form.setFieldsValue({
      name: publisher.name,
      description: publisher.description,
      email: publisher.email,
      phone: publisher.phone,
      address: publisher.address,
    });

    setModalOpen(true);
  };

  // Xem chi tiết
  const handleView = (publisher) => {
    setSelectedPublisher(publisher);
    setDetailOpen(true);
  };

  // Lưu Publisher
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editingPublisher) {
        await publisherService.updatePublisher(
          token,
          editingPublisher._id,
          values,
        );

        message.success("Cập nhật nhà xuất bản thành công");

        setModalOpen(false);
        form.resetFields();
        setEditingPublisher(null);

        await fetchPublishers(
          pagination.current,
          pagination.pageSize,
          search,
        );
      } else {
        await publisherService.createPublisher(token, values);

        message.success("Thêm nhà xuất bản thành công");

        setModalOpen(false);
        form.resetFields();

        // Tải lại trang đầu vì Publisher mới được tạo
        await fetchPublishers(1, pagination.pageSize, search);
      }
    } catch (error) {
      if (error.errorFields) return;

      message.error(
        error.response?.data?.message ||
          "Không thể lưu thông tin nhà xuất bản",
      );
    }
  };

  // Xóa Publisher
  const handleDelete = async (publisherId) => {
    try {
      await publisherService.deletePublisher(token, publisherId);

      message.success("Xóa nhà xuất bản thành công");

      const currentPage =
        publishers.length === 1 && pagination.current > 1
          ? pagination.current - 1
          : pagination.current;

      await fetchPublishers(
        currentPage,
        pagination.pageSize,
        search,
      );
    } catch (error) {
      message.error(
        error.response?.data?.message ||
          "Không thể xóa nhà xuất bản",
      );
    }
  };

  // Phân trang
  const handleTableChange = (tablePagination) => {
    fetchPublishers(
      tablePagination.current,
      tablePagination.pageSize,
      search,
    );
  };

  // Đóng modal
  const handleModalClose = () => {
    setModalOpen(false);
    setEditingPublisher(null);
    form.resetFields();
  };

  // Tài khoản đã được liên kết trong danh sách đang tải
  const linkedUserIds = publishers.map((publisher) => {
    const userId = publisher.userId?._id || publisher.userId;
    return userId ? String(userId) : null;
  });

  // Chỉ hiển thị tài khoản chưa được liên kết
  const availableUsers = publisherUsers.filter(
    (user) => !linkedUserIds.includes(String(user._id)),
  );

  // Cột dữ liệu
  const columns = [
    {
      title: "Nhà xuất bản",
      key: "publisher",
      render: (_, record) => (
        <Space>
          <Avatar
            icon={<ShopOutlined />}
            style={{ backgroundColor: "#1677ff" }}
          />

          <div>
            <Text strong>{record.name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.description || "Không có mô tả"}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email) => (
        <Space>
          <MailOutlined />
          {email}
        </Space>
      ),
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      render: (phone) => (
        <Space>
          <PhoneOutlined />
          {phone}
        </Space>
      ),
    },
    {
      title: "Tài khoản liên kết",
      key: "user",
      render: (_, record) => {
        const user = record.userId;

        return user && typeof user === "object" ? (
          <Space>
            <Avatar icon={<UserOutlined />} size="small" />

            <div>
              <Text>{user.fullName || "Chưa có tên"}</Text>
              <br />
              <Tag color="blue">{user.role || "N/A"}</Tag>
            </div>
          </Space>
        ) : (
          <Tag color="red">Không có tài khoản</Tag>
        );
      },
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      ellipsis: true,
      render: (address) => (
        <Tooltip title={address}>
          <Space>
            <EnvironmentOutlined />
            {address}
          </Space>
        </Tooltip>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
            />
          </Tooltip>

          <Tooltip title="Chỉnh sửa">
            <Button
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>

          <Popconfirm
            title="Xóa nhà xuất bản"
            description={`Bạn có chắc muốn xóa "${record.name}"?`}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(record._id)}
          >
            <Tooltip title="Xóa">
              <Button danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={3} style={{ margin: 0 }}>
            Quản lý nhà xuất bản
          </Title>

          <Text type="secondary">
            Quản lý thông tin và tài khoản nhà xuất bản
          </Text>
        </Col>

        <Col>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              loading={loading || usersLoading}
              onClick={handleRefresh}
            >
              Làm mới
            </Button>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              Thêm nhà xuất bản
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Tổng nhà xuất bản"
              value={pagination.total}
              prefix={<ShopOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Tài khoản Publisher"
              value={publisherUserTotal}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Search */}
      <Card style={{ marginBottom: 16 }}>
        <Input
          value={search}
          placeholder="Tìm tên, email, số điện thoại hoặc địa chỉ..."
          prefix={<SearchOutlined />}
          allowClear
          onChange={(event) => {
            const value = event.target.value;
            setSearch(value);

            if (!value) {
              fetchPublishers(1, pagination.pageSize, "");
            }
          }}
          onPressEnter={(event) => handleSearch(event.target.value)}
        />
      </Card>

      {/* Table */}
      <Card>
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={publishers}
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50"],
            showTotal: (total) => `Tổng ${total} nhà xuất bản`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Create / Edit Modal */}
      <Modal
        title={
          editingPublisher
            ? "Chỉnh sửa nhà xuất bản"
            : "Thêm nhà xuất bản"
        }
        open={modalOpen}
        onCancel={handleModalClose}
        onOk={handleSubmit}
        okText={editingPublisher ? "Cập nhật" : "Thêm"}
        cancelText="Hủy"
        confirmLoading={loading}
        destroyOnHidden
        width={700}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          {!editingPublisher && (
            <Form.Item
              name="userId"
              label="Tài khoản Publisher"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn tài khoản Publisher",
                },
              ]}
            >
              <Select
                placeholder="Chọn tài khoản Publisher"
                loading={usersLoading}
                showSearch
                optionFilterProp="label"
                notFoundContent={
                  usersLoading
                    ? "Đang tải tài khoản..."
                    : "Không có tài khoản Publisher khả dụng"
                }
                options={availableUsers.map((user) => ({
                  value: user._id,
                  label: `${user.fullName} - ${user.email}`,
                }))}
              />
            </Form.Item>
          )}

          <Form.Item
            name="name"
            label="Tên nhà xuất bản"
            rules={[
              {
                required: true,
                whitespace: true,
                message: "Vui lòng nhập tên nhà xuất bản",
              },
            ]}
          >
            <Input placeholder="Nhập tên nhà xuất bản" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[
              {
                required: true,
                whitespace: true,
                message: "Vui lòng nhập mô tả",
              },
            ]}
          >
            <TextArea rows={4} placeholder="Nhập mô tả nhà xuất bản" />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập email",
                  },
                  {
                    type: "email",
                    message: "Email không hợp lệ",
                  },
                ]}
              >
                <Input placeholder="example@email.com" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập số điện thoại",
                  },
                  {
                    pattern: /^\d{10,11}$/,
                    message: "Số điện thoại phải có 10 hoặc 11 chữ số",
                  },
                ]}
              >
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="address"
            label="Địa chỉ"
            rules={[
              {
                required: true,
                whitespace: true,
                message: "Vui lòng nhập địa chỉ",
              },
            ]}
          >
            <Input placeholder="Nhập địa chỉ nhà xuất bản" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết nhà xuất bản"
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={[
          <Button key="close" onClick={() => setDetailOpen(false)}>
            Đóng
          </Button>,
        ]}
        width={700}
      >
        {selectedPublisher && (
          <Descriptions bordered column={1} style={{ marginTop: 16 }}>
            <Descriptions.Item label="Tên nhà xuất bản">
              {selectedPublisher.name}
            </Descriptions.Item>

            <Descriptions.Item label="Mô tả">
              {selectedPublisher.description}
            </Descriptions.Item>

            <Descriptions.Item label="Email">
              {selectedPublisher.email}
            </Descriptions.Item>

            <Descriptions.Item label="Số điện thoại">
              {selectedPublisher.phone}
            </Descriptions.Item>

            <Descriptions.Item label="Địa chỉ">
              {selectedPublisher.address}
            </Descriptions.Item>

            <Descriptions.Item label="Tài khoản liên kết">
              {selectedPublisher.userId?.fullName || "N/A"}
            </Descriptions.Item>

            <Descriptions.Item label="Email tài khoản">
              {selectedPublisher.userId?.email || "N/A"}
            </Descriptions.Item>

            <Descriptions.Item label="Role">
              <Tag color="blue">
                {selectedPublisher.userId?.role || "N/A"}
              </Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Ngày tạo">
              {selectedPublisher.createdAt
                ? new Date(selectedPublisher.createdAt).toLocaleString("vi-VN")
                : "N/A"}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default PublisherManagement;
