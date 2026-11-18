
import { BrowserRouter, Routes, Route } from "react-router-dom";

import ProtectedRoute from "../components/protected/ProtectedRoute";
import RoleRoute from "../components/protected/RoleRoute";
import MainLayout from "../components/layout/MainLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import UserManagement from "../pages/admin/UserManagement";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import GoogleCallback from "../pages/auth/GoogleCallback";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Các trang công khai */}
        <Route path="/" element={<div>Trang chủ</div>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/google/callback" element={<GoogleCallback />} />

        {/* Các trang yêu cầu đăng nhập */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            {/* Các trang dành cho Admin */}
            <Route element={<RoleRoute allowedRoles={["admin"]} />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/books" element={<div>Quản lý sách</div>} />
              <Route
                path="/admin/publishers"
                element={<div>Quản lý nhà xuất bản</div>}
              />
              <Route
                path="/admin/reviews"
                element={<div>Quản lý đánh giá</div>}
              />
              <Route
                path="/admin/comments"
                element={<div>Quản lý bình luận</div>}
              />
              <Route
                path="/admin/reports"
                element={<div>Quản lý báo cáo</div>}
              />
            </Route>

            {/* Trang dành cho Publisher */}
            <Route element={<RoleRoute allowedRoles={["publisher"]} />}>
              <Route
                path="/publisher"
                element={<div>Trang quản lý Publisher</div>}
              />
            </Route>

            {/* Trang dành cho Reader */}
            <Route element={<RoleRoute allowedRoles={["reader"]} />}>
              <Route
                path="/reader"
                element={<div>Trang dành cho Reader</div>}
              />
            </Route>
          </Route>
        </Route>

        {/* Trang không tìm thấy */}
        <Route path="*" element={<div>404 - Không tìm thấy trang</div>} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
