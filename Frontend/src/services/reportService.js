
import api from "./api";

const reportService = {
  // Lấy danh sách báo cáo
  getAllReports: async (token, params = {}) => {
    const response = await api.get("/reports", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params,
    });

    return response.data;
  },

  // Lấy chi tiết báo cáo
  getReportById: async (token, reportId) => {
    const response = await api.get(`/reports/${reportId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  },

  // Cập nhật trạng thái báo cáo
  updateReportStatus: async (token, reportId, status) => {
    const response = await api.put(
      `/reports/${reportId}`,
      { status },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  },
};

export default reportService;
