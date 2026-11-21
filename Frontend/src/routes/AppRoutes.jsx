
import { BrowserRouter, Routes, Route } from "react-router-dom";

import ProtectedRoute from "../components/protected/ProtectedRoute";
import RoleRoute from "../components/protected/RoleRoute";
import MainLayout from "../components/layout/MainLayout";

// Admin Pages
import AdminDashboard from "../pages/admin/AdminDashboard";
import UserManagement from "../pages/admin/UserManagement";
import BookManagement from "../pages/admin/BookManagement";
import PublisherManagement from "../pages/admin/PublisherManagement";
import ReviewManagement from "../pages/admin/ReviewManagement";
import CommentManagement from "../pages/admin/CommentManagement";
import ReportManagement from "../pages/admin/ReportManagement";
import LogManagement from "../pages/admin/LogManagement";

// Auth Pages
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import GoogleCallback from "../pages/auth/GoogleCallback";
import PublisherDashboard from "../pages/publisher/PublisherDashboard";
import PublisherReviews from "../pages/publisher/PublisherReviews";
import PublisherRestrictedManagement from "../pages/publisher/PublisherRestrictedManagement";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Các trang công khai */}
        <Route path="/" element={<div>Trang chủ</div>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/auth/google/callback"
          element={<GoogleCallback />}
        />

        {/* Các trang yêu cầu đăng nhập */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            {/* Các trang dành cho Admin */}
            <Route element={<RoleRoute allowedRoles={["admin"]} />}>
              <Route
                path="/admin"
                element={<AdminDashboard />}
              />

              <Route
                path="/admin/users"
                element={<UserManagement />}
              />

              <Route
                path="/admin/books"
                element={<BookManagement />}
              />

              <Route
                path="/admin/publishers"
                element={<PublisherManagement />}
              />

              <Route
                path="/admin/reviews"
                element={<ReviewManagement />}
              />

              <Route
                path="/admin/comments"
                element={<CommentManagement />}
              />

              <Route
                path="/admin/reports"
                element={<ReportManagement />}
              />

              <Route
                path="/admin/logs"
                element={<LogManagement />}
              />
            </Route>

            {/* Trang dành cho Publisher */}
            <Route element={<RoleRoute allowedRoles={["publisher"]} />}>
              <Route path="/publisher" element={<PublisherDashboard />} />
              <Route path="/publisher/books" element={<PublisherDashboard />} />
              <Route path="/publisher/reviews" element={<PublisherReviews />} />
              <Route path="/publisher/comments" element={<PublisherRestrictedManagement type="comments" />} />
              <Route path="/publisher/reports" element={<PublisherRestrictedManagement type="reports" />} />
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
        <Route
          path="*"
          element={<div>404 - Không tìm thấy trang</div>}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
