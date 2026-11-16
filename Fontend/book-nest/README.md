# 📚 BOOK NEST -- FRONTEND

**Book Nest** là nền tảng đọc sách và kết nối cộng đồng yêu sách. Dự án
hướng đến việc xây dựng một không gian để độc giả khám phá sách, chia sẻ
đánh giá, bình luận và giao lưu; đồng thời hỗ trợ Nhà xuất bản quản lý
sách và Admin quản lý hệ thống.

> Repository này phụ trách phần Frontend của dự án Book Nest.

------------------------------------------------------------------------

## 1. Công nghệ sử dụng

  Công nghệ            Mục đích
  -------------------- -----------------------------------
  React 19             Xây dựng giao diện người dùng
  JavaScript           Ngôn ngữ lập trình
  Vite 8               Khởi tạo và chạy dự án
  Ant Design 6         Thư viện giao diện UI
  CSS3                 Tùy chỉnh giao diện và responsive
  React Router DOM 7   Điều hướng giữa các trang
  React Hook Form      Quản lý biểu mẫu
  Zod                  Kiểm tra dữ liệu
  Axios                Chuẩn bị cho việc gọi API
  TanStack Query       Quản lý dữ liệu từ API
  Day.js               Xử lý ngày tháng
  @ant-design/icons    Thư viện biểu tượng

### Quy ước giao diện

-   Sử dụng Ant Design cho các thành phần UI như Button, Input, Form,
    Modal, Table...
-   Sử dụng CSS thuần để tùy chỉnh giao diện theo thiết kế Stitch.
-   Không sử dụng Tailwind CSS trong dự án hiện tại.
-   Ưu tiên giao diện responsive trên Desktop, Tablet và Mobile.

------------------------------------------------------------------------

## 2. Cấu trúc thư mục

``` text
book-nest/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── books/
│   │   ├── comments/
│   │   ├── common/
│   │   ├── forum/
│   │   ├── reviews/
│   │   └── auth/
│   ├── hooks/
│   ├── layouts/
│   ├── pages/
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── publisher/
│   │   ├── reader/
│   │   └── Home.jsx
│   ├── routes/
│   ├── services/
│   ├── stores/
│   ├── utils/
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
└── README.md
```

> Đây là cấu trúc tổ chức dự án. Một số thư mục hiện vẫn đang trong quá
> trình phát triển và có thể chưa có đầy đủ file hoặc chức năng.

------------------------------------------------------------------------

## 3. Các vai trò trong hệ thống

### Reader (Độc giả)

-   Đăng ký và đăng nhập tài khoản.
-   Quản lý thông tin cá nhân.
-   Khám phá và tìm kiếm sách.
-   Xem chi tiết sách.
-   Viết đánh giá và chấm điểm sách.
-   Bình luận và trả lời bình luận nhiều cấp.
-   Tham gia diễn đàn cộng đồng.

### Publisher (Nhà xuất bản)

-   Đăng nhập tài khoản.
-   Quản lý thông tin nhà xuất bản.
-   Quản lý danh sách sách.
-   Thêm, chỉnh sửa và cập nhật thông tin sách.
-   Theo dõi đánh giá và phản hồi từ độc giả.

Publisher không được tự đăng ký công khai. Tài khoản được cấp hoặc phê
duyệt theo quy trình quản lý.

### Admin (Quản trị viên)

-   Quản lý người dùng.
-   Quản lý nhà xuất bản.
-   Quản lý sách.
-   Quản lý đánh giá và bình luận.
-   Quản lý diễn đàn.
-   Kiểm duyệt nội dung.
-   Quản lý và giám sát hệ thống.

Admin không được đăng ký công khai.

------------------------------------------------------------------------

## 4. Các chức năng Frontend hiện tại

### Design System

Đã thiết lập bảng màu và kiểu chữ thống nhất.

  Thành phần       Mã màu
  ---------------- -----------
  Primary Navy     `#1e293b`
  Dark Navy        `#091426`
  Accent Amber     `#d97706`
  Success Green    `#059669`
  Background       `#f8f9ff`
  Surface          `#ffffff`
  Secondary Text   `#64748b`

Font chữ: - Inter: nội dung và giao diện. - Merriweather: tiêu đề.

### Header

Đã có code cho Header gồm logo Book Nest, điều hướng, tìm kiếm, nút đăng
nhập/đăng ký và menu responsive.

### Home

Đã có phiên bản khung trang chủ gồm Header, Hero Section và các khu vực
khám phá sách, thể loại, cộng đồng. Trang chủ vẫn đang được hoàn thiện
theo thiết kế Stitch.

### Login

Đã có giao diện đăng nhập với email, mật khẩu, hiện/ẩn mật khẩu, ghi nhớ
đăng nhập (giao diện), validation và điều hướng. Thông báo đăng nhập
thành công hiện chỉ là mô phỏng Frontend.

### Register

Đã có giao diện đăng ký Reader gồm họ tên, email, mật khẩu, xác nhận mật
khẩu và đồng ý điều khoản. Form sử dụng validation và hiện thông báo khi
dữ liệu hợp lệ.

### Validation

Sử dụng React Hook Form kết hợp Zod: - Email phải đúng định dạng. - Họ
tên tối thiểu 2 ký tự. - Mật khẩu tối thiểu 8 ký tự. - Mật khẩu phải có
chữ hoa, chữ thường và chữ số. - Mật khẩu xác nhận phải trùng khớp. -
Người dùng phải đồng ý với điều khoản.

------------------------------------------------------------------------

## 5. Cài đặt và chạy dự án

### Yêu cầu môi trường

-   Node.js (khuyến nghị phiên bản LTS tương thích với Vite).
-   npm.
-   Visual Studio Code hoặc IDE tương đương.
-   Git.

### Bước 1: Clone repository

``` bash
git clone <REPOSITORY_URL>
```

### Bước 2: Di chuyển vào thư mục dự án

``` bash
cd book-nest
```

### Bước 3: Cài đặt dependencies

``` bash
npm install
```

### Bước 4: Khởi chạy Frontend

``` bash
npm run dev
```

Vite sẽ hiển thị địa chỉ truy cập, thường là:

``` text
http://localhost:5173
```

### Các lệnh hữu ích

``` bash
# Chạy môi trường development
npm run dev

# Build dự án
npm run build

# Kiểm tra lỗi ESLint
npm run lint

# Xem thử bản build
npm run preview
```

**Lưu ý:** Luôn chạy các lệnh npm bên trong thư mục `book-nest`, nơi
chứa file `package.json`.

------------------------------------------------------------------------

## 6. Quy ước phát triển

### Quy tắc đặt tên

  Thành phần   Quy tắc                         Ví dụ
  ------------ ------------------------------- ------------------
  Component    PascalCase                      `BookCard.jsx`
  Page         PascalCase                      `Login.jsx`
  CSS          Tên component + `.css`          `BookCard.css`
  Hook         camelCase, bắt đầu bằng `use`   `useAuth.js`
  Utility      camelCase                       `formatDate.js`
  Service      camelCase                       `bookService.js`

### Quy tắc viết Component

-   Mỗi component nên đảm nhiệm một chức năng cụ thể.
-   Ưu tiên tái sử dụng component.
-   Không viết toàn bộ giao diện vào một file quá lớn.
-   Tách CSS riêng cho từng component hoặc page.
-   Sử dụng React Hooks đúng quy tắc.
-   Hạn chế hard-code dữ liệu khi có thể tổ chức thành dữ liệu mẫu
    riêng.

### Quy tắc Git

Khuyến nghị sử dụng Git Flow đơn giản:

``` text
main
└── develop
    ├── feature/home-page
    ├── feature/login-register
    ├── feature/book-management
    ├── feature/review
    └── feature/forum
```

-   `main`: phiên bản ổn định.
-   `develop`: nhánh tích hợp chức năng.
-   `feature/*`: nhánh phát triển chức năng riêng.
-   Không commit trực tiếp lên `main`.
-   Trước khi tạo Pull Request, cần kiểm tra ứng dụng và xử lý lỗi.
-   Không commit thư mục `node_modules`.

Ví dụ commit message:

``` text
feat: add login page
feat: implement book listing
fix: resolve register validation
style: improve header responsive
refactor: organize common components
docs: update README
```

------------------------------------------------------------------------

## 7. Thiết kế giao diện

Dự án sử dụng thiết kế tham khảo từ Stitch với các màn hình:

1.  Trang chủ khám phá sách.
2.  Trang chi tiết sách và đánh giá.
3.  Trang quản lý dành cho Publisher.
4.  Trang quản trị Admin.

Nguyên tắc triển khai: - Giữ phong cách thiết kế thống nhất. - Chuyển
đổi HTML từ Stitch sang React JSX. - Tách component hợp lý. - Không sao
chép nguyên HTML vào React. - Tối ưu responsive và trải nghiệm người
dùng.

------------------------------------------------------------------------

## 8. Kế hoạch phát triển

  Giai đoạn   Công việc                            Trạng thái
  ----------- ------------------------------------ -----------------
  1           Khởi tạo dự án và cài đặt thư viện   Hoàn thành
  2           Xây dựng Design System               Hoàn thành
  3           Xây dựng Header                      Đã có code
  4           Xây dựng Home                        Đang phát triển
  5           Xây dựng Login                       Đã có code
  6           Xây dựng Register                    Đã có code
  7           Hoàn thiện trạng thái đăng nhập      Chưa hoàn thành
  8           Xây dựng chức năng Reader            Chưa thực hiện
  9           Xây dựng chức năng Publisher         Chưa thực hiện
  10          Xây dựng chức năng Admin             Chưa thực hiện
  11          Responsive và kiểm thử               Chưa hoàn thành
  12          Kết nối Backend/API                  Chưa thực hiện

------------------------------------------------------------------------

## 9. Lưu ý về Backend

**Hiện tại repository này tập trung phát triển Frontend.**

Các chức năng đăng nhập và đăng ký mới chỉ kiểm tra dữ liệu ở phía trình
duyệt:

-   Chưa xác thực tài khoản với máy chủ.
-   Chưa lưu tài khoản vào MongoDB.
-   Chưa sử dụng JWT hoặc cơ chế xác thực thực tế.
-   Chưa kết nối API.
-   Thông báo đăng nhập thành công hiện tại chỉ là mô phỏng.

Khi Frontend hoàn thiện, nhóm sẽ tiến hành tích hợp với Backend Node.js,
Express và MongoDB Atlas.

Không sử dụng dữ liệu demo như một cơ chế xác thực thực tế.

------------------------------------------------------------------------

## 10. Định hướng chung của nhóm

Mục tiêu của nhóm là xây dựng Book Nest thành một nền tảng có giao diện
thân thiện, dễ sử dụng, có khả năng mở rộng và hỗ trợ đầy đủ ba vai trò
Reader, Publisher và Admin.

Nguyên tắc làm việc:

1.  Phân chia chức năng rõ ràng cho từng thành viên.
2.  Thống nhất cấu trúc thư mục và quy tắc đặt tên.
3.  Tái sử dụng component để hạn chế trùng lặp code.
4.  Kiểm tra giao diện trước khi tích hợp.
5.  Sử dụng Git để quản lý phiên bản.
6.  Thường xuyên cập nhật tiến độ và đồng bộ code.
7.  Đảm bảo Frontend và Backend thống nhất về dữ liệu, API và quyền truy
    cập.

------------------------------------------------------------------------

**BOOK NEST -- Discover Books, Share Knowledge, Connect Readers.** 📚
