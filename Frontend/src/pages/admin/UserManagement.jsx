import { useEffect, useState } from "react";
import {
  Table,
  Card,
  Input,
  Select,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  message,
  Typography,
  Avatar,
  Descriptions,
  Spin,
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  EditOutlined,
  EyeOutlined,
  UserOutlined,
} from "@ant-design/icons";
import useAuth from "../../hooks/useAuth";
import userService from "../../services/userService";

const { Title } = Typography;

const UserManagement = () => {
  const { user, token } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Tìm kiếm và bộ lọc
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState(undefined);
  const [statusFilter, setStatusFilter] = useState(undefined);

  // Phân trang
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Modal chi tiết
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Modal chỉnh sửa
  const [editVisible, setEditVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();

  // Lấy danh sách User
  const fetchUsers = async (page = 1, pageSize = 10) => {
    setLoading(true);

    try {
      const response = await userService.getAllUsers(token, {
        search,
        role: roleFilter,
        status: statusFilter,
        page,
        limit: pageSize,
      });

      const data = response.data;

      setUsers(data.users || []);

      setPagination({
        current: data.pagination.currentPage,
        pageSize: data.pagination.limit,
        total: data.pagination.totalUsers,
      });
    } catch (error) {
      message.error(
        error.response?.data?.message ||
          "Không thể lấy danh sách người dùng"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsers(1, pagination.pageSize);
    }
  }, [token, roleFilter, statusFilter]);

  // Tìm kiếm
  const handleSearch = () => {
    fetchUsers(1, pagination.pageSize);
  };

  // Làm mới
  const handleRefresh = () => {
    setSearch("");
    setRoleFilter(undefined);
    setStatusFilter(undefined);
    fetchUsers(1, pagination.pageSize);
  };

  // Thay đổi trang
  const handleTableChange = (paginationInfo) => {
    fetchUsers(paginationInfo.current, paginationInfo.pageSize);
  };

  // Xem chi tiết User
  const handleViewUser = async (userId) => {
    setDetailVisible(true);
    setDetailLoading(true);
    setSelectedUser(null);

    try {
      const response = await userService.getUserById(token, userId);
      setSelectedUser(response.data);
    } catch (error) {
      message.error(
        error.response?.data?.message ||
          "Không thể lấy thông tin người dùng"
      );
      setDetailVisible(false);
    } finally {
      setDetailLoading(false);
    }
  };

  // Mở Modal chỉnh sửa
  const handleEditUser = (record) => {
    setEditingUser(record);

    form.setFieldsValue({
      fullName: record.fullName,
      role: record.role,
      status: record.status,
      avatar: record.avatar || "",
    });

    setEditVisible(true);
  };

  // Cập nhật User
  const handleUpdateUser = async () => {
    try {
      const values = await form.validateFields();

      // Admin không được tự thay đổi role/status
      if (editingUser?._id === user?._id) {
        delete values.role;
        delete values.status;
      }

      await userService.updateUser(token, editingUser._id, values);

      message.success("Cập nhật người dùng thành công");

      setEditVisible(false);
      setEditingUser(null);
      form.resetFields();

      fetchUsers(pagination.current, pagination.pageSize);
    } catch (error) {
      if (error.response) {
        message.error(
          error.response.data?.message || "Cập nhật người dùng thất bại",
        );
      }
    }
  };

  // Chuyển đổi Role
  const getRoleTag = (role) => {
    const roleConfig = {
      admin: {
        color: "red",
        label: "Admin",
      },
      reader: {
        color: "blue",
        label: "Reader",
      },
      publisher: {
        color: "purple",
        label: "Publisher",
      },
    };

    const config = roleConfig[role] || {
      color: "default",
      label: role,
    };

    return <Tag color={config.color}>{config.label}</Tag>;
  };

  // Chuyển đổi Status
  const getStatusTag = (status) => {
    return status === "active" ? (
      <Tag color="success">Hoạt động</Tag>
    ) : (
      <Tag color="default">Vô hiệu hóa</Tag>
    );
  };

  // Cấu hình Table
  const columns = [
    {
      title: "Người dùng",
      key: "user",
      render: (_, record) => (
        <Space>
          <Avatar
            src={record.avatar}
            icon={<UserOutlined />}
          />

          <div>
            <div style={{ fontWeight: 500 }}>
              {record.fullName}
            </div>

            <Typography.Text type="secondary">
              {record.email}
            </Typography.Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role) => getRoleTag(role),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusTag(status),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) =>
        date
          ? new Date(date).toLocaleDateString("vi-VN")
          : "—",
    },
    {
      title: "Thao tác",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleViewUser(record._id)}
          >
            Chi tiết
          </Button>

          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEditUser(record)}
          >
            Sửa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>Quản lý người dùng</Title>

      <Card style={{ marginBottom: 24 }} bordered={false}>
        <Space
          wrap
          style={{
            width: "100%",
            marginBottom: 16,
          }}
        >
          <Input
            placeholder="Tìm kiếm tên hoặc email..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 280 }}
            allowClear
          />

          <Select
            placeholder="Lọc theo vai trò"
            allowClear
            value={roleFilter}
            onChange={setRoleFilter}
            style={{ width: 160 }}
            options={[
              { value: "admin", label: "Admin" },
              { value: "reader", label: "Reader" },
              { value: "publisher", label: "Publisher" },
            ]}
          />

          <Select
            placeholder="Lọc trạng thái"
            allowClear
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 160 }}
            options={[
              { value: "active", label: "Hoạt động" },
              { value: "inactive", label: "Vô hiệu hóa" },
            ]}
          />

          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleSearch}
          >
            Tìm kiếm
          </Button>

          <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
            Làm mới
          </Button>
        </Space>

        <Table
          columns={columns}
          dataSource={users}
          rowKey="_id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50"],
            showTotal: (total) => `Tổng ${total} người dùng`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 900 }}
        />
      </Card>

      {/* Modal chi tiết người dùng */}
      <Modal
        title="Thông tin người dùng"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            Đóng
          </Button>,
        ]}
      >
        {detailLoading ? (
          <div style={{ textAlign: "center", padding: 30 }}>
            <Spin />
          </div>
        ) : selectedUser ? (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Avatar">
              <Avatar
                size={64}
                src={selectedUser.avatar}
                icon={<UserOutlined />}
              />
            </Descriptions.Item>

            <Descriptions.Item label="ID">{selectedUser._id}</Descriptions.Item>

            <Descriptions.Item label="Họ và tên">
              {selectedUser.fullName}
            </Descriptions.Item>

            <Descriptions.Item label="Email">
              {selectedUser.email}
            </Descriptions.Item>

            <Descriptions.Item label="Vai trò">
              {getRoleTag(selectedUser.role)}
            </Descriptions.Item>

            <Descriptions.Item label="Trạng thái">
              {getStatusTag(selectedUser.status)}
            </Descriptions.Item>

            <Descriptions.Item label="Ngày tạo">
              {selectedUser.createdAt
                ? new Date(selectedUser.createdAt).toLocaleString("vi-VN")
                : "—"}
            </Descriptions.Item>

            <Descriptions.Item label="Ngày cập nhật">
              {selectedUser.updatedAt
                ? new Date(selectedUser.updatedAt).toLocaleString("vi-VN")
                : "—"}
            </Descriptions.Item>
          </Descriptions>
        ) : null}
      </Modal>

      {/* Modal chỉnh sửa người dùng */}
      <Modal
        title="Chỉnh sửa người dùng"
        open={editVisible}
        onCancel={() => {
          setEditVisible(false);
          setEditingUser(null);
          form.resetFields();
        }}
        onOk={handleUpdateUser}
        okText="Lưu thay đổi"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="fullName"
            label="Họ và tên"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập họ và tên",
              },
            ]}
          >
            <Input placeholder="Nhập họ và tên" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Vai trò"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn vai trò",
              },
            ]}
          >
            <Select
              disabled={editingUser?._id === user?._id}
              options={[
                { value: "admin", label: "Admin" },
                { value: "reader", label: "Reader" },
                { value: "publisher", label: "Publisher" },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn trạng thái",
              },
            ]}
          >
            <Select
              disabled={editingUser?._id === user?._id}
              options={[
                { value: "active", label: "Hoạt động" },
                { value: "inactive", label: "Vô hiệu hóa" },
              ]}
            />
          </Form.Item>

          <Form.Item name="avatar" label="Avatar URL">
            <Input placeholder="Nhập đường dẫn ảnh avatar" />
          </Form.Item>
        </Form>

        {editingUser?._id === user?._id && (
          <Typography.Text type="warning">
            Bạn không thể tự thay đổi vai trò hoặc trạng thái tài khoản của
            mình.
          </Typography.Text>
        )}
      </Modal>
    </div>
  );
};

export default UserManagement;