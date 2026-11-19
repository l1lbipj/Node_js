import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const RoleRoute = ({ allowedRoles }) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    const redirectPath = {
      admin: "/admin",
      publisher: "/publisher",
      reader: "/reader",
    };

    return <Navigate to={redirectPath[user?.role] || "/"} replace />;
  }

  return <Outlet />;
};

export default RoleRoute;
