
import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

const { Content } = Layout;

const MainLayout = () => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header />

      <Layout>
        <Sidebar />

        <Content
          style={{
            padding: 24,
            background: "#f5f7fa",
            minHeight: "calc(100vh - 64px)",
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
