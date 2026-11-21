
import { BrowserRouter, Routes, Route } from "react-router-dom";

import ProtectedRoute from "../components/protected/ProtectedRoute";
import RoleRoute from "../components/protected/RoleRoute";
import MainLayout from "../components/layout/MainLayout";

// ==============================
// ADMIN PAGES
// ==============================

import AdminDashboard from "../pages/admin/AdminDashboard";
import UserManagement from "../pages/admin/UserManagement";
import BookManagement from "../pages/admin/BookManagement";
import PublisherManagement from "../pages/admin/PublisherManagement";
import ReviewManagement from "../pages/admin/ReviewManagement";
import CommentManagement from "../pages/admin/CommentManagement";
import ReportManagement from "../pages/admin/ReportManagement";
import LogManagement from "../pages/admin/LogManagement";

// ==============================
// READER PAGES
// ==============================

import ReaderDashboard from "../pages/reader/ReaderDashboard";
import ReaderProfile from "../pages/reader/ReaderProfile";

// ==============================
// AUTH PAGES
// ==============================

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import GoogleCallback from "../pages/auth/GoogleCallback";
import PublisherDashboard from "../pages/publisher/PublisherDashboard";
import PublisherReviews from "../pages/publisher/PublisherReviews";
import PublisherRestrictedManagement from "../pages/publisher/PublisherRestrictedManagement";

// ==============================
// PUBLIC PAGES
// ==============================

import Home from "../pages/home";
import Books from "../pages/book/Books";
import BookDetail from "../pages/book/BookDetail";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* ==============================
            CÁC TRANG CÔNG KHAI
        ============================== */}

        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/auth/google/callback"
          element={<GoogleCallback />}
        />

        <Route path="/books" element={<Books />} />

        <Route
          path="/books/:id"
          element={<BookDetail />}
        />

        {/* ==============================
            CÁC TRANG YÊU CẦU ĐĂNG NHẬP
        ============================== */}

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>

            {/* ==============================
                ADMIN
            ============================== */}

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

            {/* ==============================
                PUBLISHER
            ============================== */}

            <Route element={<RoleRoute allowedRoles={["publisher"]} />}>
              <Route path="/publisher" element={<PublisherDashboard />} />
              <Route path="/publisher/books" element={<PublisherDashboard />} />
              <Route path="/publisher/reviews" element={<PublisherReviews />} />
              <Route path="/publisher/comments" element={<PublisherRestrictedManagement type="comments" />} />
              <Route path="/publisher/reports" element={<PublisherRestrictedManagement type="reports" />} />
            </Route>

            {/* ==============================
                READER
            ============================== */}

            <Route element={<RoleRoute allowedRoles={["reader"]} />}>

              <Route
                path="/reader"
                element={<ReaderDashboard />}
              />

              <Route
                path="/reader/home"
                element={<Home />}
              />

              <Route
                path="/reader/profile"
                element={<ReaderProfile />}
              />

              <Route
                path="/reader/books"
                element={<div>Khám phá sách</div>}
              />

              <Route
                path="/reader/reviews"
                element={<div>Đánh giá của tôi</div>}
              />

              <Route
                path="/reader/comments"
                element={<div>Bình luận của tôi</div>}
              />

              <Route
                path="/reader/topics"
                element={<div>Diễn đàn của tôi</div>}
              />

            </Route>

          </Route>
        </Route>

        {/* ==============================
            TRANG KHÔNG TÌM THẤY
        ============================== */}

        <Route
          path="*"
          element={<div>404 - Không tìm thấy trang</div>}
        />

      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
