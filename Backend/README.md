# Book Review & Publisher Portal

## 1. Giới thiệu dự án

**Book Review & Publisher Portal** là hệ thống quản lý và đánh giá sách, hỗ trợ người đọc, nhà xuất bản và quản trị viên.

### Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| Runtime | Node.js |
| Backend Framework | Express.js |
| Database | MongoDB |
| ODM | Mongoose |
| Authentication | JSON Web Token (JWT) |
| Password Hashing | bcryptjs |
| Ngôn ngữ | JavaScript (ES6+) |
| Package Manager | npm |

> **Lưu ý:** Dự án sử dụng JavaScript, không sử dụng TypeScript.

---

## 2. Yêu cầu môi trường

Trước khi cài đặt, cần chuẩn bị:

- Windows 10 hoặc Windows 11.
- Node.js phiên bản LTS.
- npm (được cài kèm Node.js).
- Visual Studio Code.
- Git (nếu làm việc thông qua GitHub).

### 2.1. Cài đặt Node.js

Truy cập:

https://nodejs.org/

Tải phiên bản **LTS** dành cho Windows và tiến hành cài đặt theo hướng dẫn.

Kiểm tra cài đặt:

```bash
node -v
npm -v
```

Nếu cả hai lệnh đều hiển thị phiên bản thì đã cài đặt thành công.

### 2.2. Cài đặt Visual Studio Code

Tải tại:

https://code.visualstudio.com/

Các Extension được khuyến nghị:

- Prettier - Code formatter
- ESLint
- MongoDB for VS Code

---

## 3. Cấu trúc dự án

Cấu trúc thư mục dự kiến:

```text
Book-Review-Portal/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── models/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   ├── validators/
│   │   ├── utils/
│   │   ├── constants/
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── tests/
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── package-lock.json
│
└── README.md
```

Các thư mục và file chức năng sẽ được xây dựng dần trong quá trình phát triển.

---

## 4. Cài đặt dự án lần đầu

### Bước 1. Clone repository

Nếu dự án đã được đưa lên GitHub:

```bash
git clone <REPOSITORY_URL>
```

Di chuyển vào thư mục dự án:

```bash
cd Book-Review-Portal
```

Di chuyển vào Backend:

```bash
cd backend
```

### Bước 2. Cài đặt dependencies

Nếu repository đã có `package-lock.json`, chạy:

```bash
npm ci
```

Nếu chưa có `package-lock.json`, chạy:

```bash
npm install
```

Không cần cài đặt từng thư viện riêng lẻ khi các dependencies đã được khai báo trong `package.json`.

### Bước 3. Tạo file môi trường

Tạo file `.env` trong thư mục `backend`.

Nội dung mẫu:

```env
PORT=5000

NODE_ENV=development

MONGODB_URI=

JWT_SECRET=
JWT_EXPIRES_IN=1d
```

Các biến môi trường sẽ được cấu hình đầy đủ khi triển khai kết nối MongoDB Atlas và Authentication.

**Không chia sẻ file `.env` và không commit file này lên GitHub.**

---

## 5. Cài đặt dependencies

Nếu đang khởi tạo dự án từ đầu, sử dụng các lệnh sau trong thư mục `backend`.

### 5.1. Dependencies

```bash
npm install express mongoose dotenv cors helmet morgan bcryptjs jsonwebtoken express-validator cookie-parser
```

| Package | Mục đích |
|---|---|
| express | Xây dựng Backend Server và REST API |
| mongoose | Kết nối và quản lý dữ liệu MongoDB |
| dotenv | Quản lý biến môi trường |
| cors | Cấu hình Cross-Origin Resource Sharing |
| helmet | Thiết lập HTTP security headers |
| morgan | Ghi log HTTP requests |
| bcryptjs | Hash mật khẩu |
| jsonwebtoken | Xác thực bằng JWT |
| express-validator | Validate dữ liệu đầu vào |
| cookie-parser | Đọc Cookie từ request |

### 5.2. Development dependencies

```bash
npm install -D nodemon
```

`nodemon` hỗ trợ tự động khởi động lại Server khi mã nguồn thay đổi.

---

## 6. Cấu hình package.json

Trong file `package.json`, cấu hình:

```json
{
  "type": "module",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  }
}
```

Giữ nguyên các thông tin dependencies do npm tạo ra.

```javascript
const express = require('express');
```

**Quy ước:** Backend sử dụng `const/export` thống nhất trong toàn dự án.

---

## 7. Chạy Backend

Sau khi đã cài đặt dependencies và chuẩn bị file môi trường:

### Chạy môi trường development

```bash
npm run dev
```

### Chạy môi trường production

```bash
npm start
```

Hiện tại, hai lệnh trên yêu cầu file `src/server.js` đã được tạo. Nếu file chưa tồn tại, Node.js sẽ báo lỗi không tìm thấy module. File này sẽ được xây dựng trong bước khởi tạo Server.

---

## 8. Quy tắc làm việc nhóm

Để tránh xung đột trong quá trình phát triển:

1. Không commit thư mục `node_modules`.
2. Không commit file `.env`.
3. Không tự ý thay đổi phiên bản dependencies nếu chưa thống nhất với team.
4. Khi thêm thư viện mới, sử dụng npm để cập nhật `package.json` và `package-lock.json`.
5. Commit cả `package.json` và `package-lock.json`.
6. Mỗi thành viên cần pull code mới nhất trước khi bắt đầu làm việc.
7. Không sửa trực tiếp code của thành viên khác nếu chưa trao đổi.

### Các file cần commit lên GitHub

```text
backend/
├── src/
├── tests/
├── .env.example
├── .gitignore
├── package.json
└── package-lock.json
```

### Các file không được commit

```text
node_modules/
.env
```

---

## 9. Git workflow đề xuất

Tạo nhánh làm việc:

```bash
git checkout -b feature/backend-setup
```

Sau khi hoàn thành công việc:

```bash
git add .
git commit -m "chore: initialize backend project"
git push origin feature/backend-setup
```

Sau đó tạo Pull Request để review và merge vào nhánh chính.

---

## 10. Tiến độ thiết lập

| Hạng mục | Trạng thái |
|---|---|
| Node.js và npm | Đã hoàn thành |
| Visual Studio Code | Đã chuẩn bị |
| Khởi tạo Backend | Đã hoàn thành |
| Cài đặt dependencies | Đã hoàn thành |
| Cấu hình MongoDB Atlas | Chưa thực hiện |
| Kết nối MongoDB | Chưa thực hiện |
| Khởi tạo Express Server | Chưa thực hiện |
| Xây dựng REST API | Chưa thực hiện |

---

## 11. Kế hoạch triển khai tiếp theo

Các bước tiếp theo của dự án:

1. Tạo và cấu hình MongoDB Atlas.
2. Thiết lập kết nối MongoDB bằng Mongoose.
3. Khởi tạo Express Server.
4. Thiết kế MongoDB Schema và Models.
5. Xây dựng Controllers, Services và Routes.
6. Xây dựng Authentication và Authorization.
7. Kiểm thử REST API bằng Postman.

---

**Book Review & Publisher Portal**

Backend: Node.js + Express.js + MongoDB

Language: JavaScript (ES6+)

## 12.Hướng dẫn cách chạy test kết nối database với Mongo

npm run test:db