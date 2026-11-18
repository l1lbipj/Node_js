import api from "./api";

const dashboardService = {
  getDashboardStats: async (token) => {
    const response = await api.get("/dashboard/stats", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  },
};

export default dashboardService;