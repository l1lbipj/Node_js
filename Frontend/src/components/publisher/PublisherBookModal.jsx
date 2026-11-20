import { Col, Form, Input, Modal, Row, Select } from "antd";

const { TextArea } = Input;

const PublisherBookModal = ({ open, editingBook, form, saving, onCancel, onSubmit }) => (
  <Modal
    title={editingBook ? "Chỉnh sửa thông tin sách" : "Thêm sách mới"}
    open={open}
    onCancel={onCancel}
    onOk={onSubmit}
    okText={editingBook ? "Lưu thay đổi" : "Tạo sách"}
    cancelText="Hủy"
    confirmLoading={saving}
    width={720}
    destroyOnHidden
  >
    <Form form={form} layout="vertical" className="book-form">
      <Row gutter={16}>
        <Col xs={24} md={16}>
          <Form.Item name="title" label="Tên sách" rules={[{ required: true, whitespace: true, message: "Vui lòng nhập tên sách" }]}>
            <Input placeholder="Ví dụ: Nhà giả kim" />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name="publishDate" label="Ngày xuất bản" rules={[{ required: true, message: "Vui lòng chọn ngày xuất bản" }]}>
            <Input type="date" />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item name="author" label="Tác giả" rules={[{ required: true, type: "array", min: 1, message: "Vui lòng thêm ít nhất một tác giả" }]}>
        <Select mode="tags" tokenSeparators={[","]} placeholder="Nhập tên tác giả rồi nhấn Enter" />
      </Form.Item>
      <Form.Item name="category" label="Thể loại" rules={[{ required: true, type: "array", min: 1, message: "Vui lòng thêm ít nhất một thể loại" }]}>
        <Select mode="tags" tokenSeparators={[","]} placeholder="Ví dụ: Tiểu thuyết, Kỹ năng sống" />
      </Form.Item>
      <Form.Item name="coverImage" label="URL ảnh bìa" rules={[{ required: true, message: "Vui lòng nhập URL ảnh bìa" }, { type: "url", message: "URL ảnh bìa không hợp lệ" }]}>
        <Input placeholder="https://example.com/cover.jpg" />
      </Form.Item>
      <Form.Item name="description" label="Mô tả" rules={[{ required: true, whitespace: true, message: "Vui lòng nhập mô tả sách" }]}>
        <TextArea rows={5} showCount maxLength={2000} placeholder="Giới thiệu ngắn gọn về nội dung sách" />
      </Form.Item>
    </Form>
  </Modal>
);

export default PublisherBookModal;
