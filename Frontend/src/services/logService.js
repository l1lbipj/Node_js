
import api from "./api";

const logService = {
  // Lấy danh sách nhật ký hoạt động
  getAllActivityLogs: async (token, params = {}) => {
    const response = await api.get("/activity-logs", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params,
    });

    return response.data;
  },

  // Lấy chi tiết nhật ký hoạt động
  getActivityLogById: async (token, logId) => {
    const response = await api.get(`/activity-logs/${logId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  },
};

export default logService;
