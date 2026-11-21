
import { Layout } from "antd";
import { Outlet } from "react-router-dom";

import Header from "./Header";
import HeaderAdmin from "./HeaderAdmin";
import Sidebar from "./Sidebar";

import useAuth from "../../hooks/useAuth";

const { Content } = Layout;

const MainLayout = () => {
  const { user } = useAuth();

  const isAdmin = user?.role === "admin";

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Header riêng cho Admin, Header chung cho Reader và Publisher */}
      {isAdmin ? <HeaderAdmin /> : <Header />}

      <Layout>
        {/* Sidebar hiển thị cho cả 3 vai trò */}
        <Sidebar />

        <Content
          style={{
            padding: 24,
            background: "#f5f7fa",
            minHeight: "calc(100vh - 64px)",
            width: "100%",
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
