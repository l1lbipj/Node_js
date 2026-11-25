import api from "./api";
const auth=(token)=>({headers:{Authorization:`Bearer ${token}`}});
const publisherService={
  getMyPublisher: async(token)=>{const r=await api.get("/publishers/me",auth(token));return r.data;},
};
export default publisherService;
