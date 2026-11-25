import api from "./api";
const h=(token)=>({headers:{Authorization:`Bearer ${token}`}});
const commentService={
 getPublisherComments:async(token)=>{const r=await api.get("/comments/publisher",h(token));return r.data;},
 replyPublisherComment:async(token,id,content)=>{const r=await api.post(`/comments/${id}/reply`,{content},h(token));return r.data;},
 getAllComments:async(token,params={})=>{const r=await api.get("/comments/admin",{...h(token),params});return r.data;},
 getCommentById:async(token,id)=>{const r=await api.get(`/comments/admin/${id}`,h(token));return r.data;},
 deleteComment:async(token,id)=>{const r=await api.delete(`/comments/${id}`,h(token));return r.data;},
}; export default commentService;
