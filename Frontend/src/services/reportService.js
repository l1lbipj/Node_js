import api from "./api";
const h=(token)=>({headers:{Authorization:`Bearer ${token}`}});
const reportService={
 getPublisherReports:async(token)=>{const r=await api.get("/reports/publisher",h(token));return r.data;},
 getAllReports:async(token,params={})=>{const r=await api.get("/reports",{...h(token),params});return r.data;},
 getReportById:async(token,id)=>{const r=await api.get(`/reports/${id}`,h(token));return r.data;},
 updateReportStatus:async(token,id,status)=>{const r=await api.put(`/reports/${id}`,{status},h(token));return r.data;},
}; export default reportService;
