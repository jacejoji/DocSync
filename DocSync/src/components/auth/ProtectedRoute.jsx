import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import ForbiddenPage from "@/pages/ForbiddenPage"; // <--- Import the new page

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // 1. Loading State
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // 2. Not Logged In -> Redirect to Login
  if (!user) {
    // Check if user was trying to access admin or doctor area to send them to correct login
    const target = location.pathname.includes("admin") ? "/admin/login" : "/doctor/login";
    return <Navigate to={target} state={{ from: location }} replace />;
  }

  // 3. Logged In, But Wrong Role -> Show Forbidden Page
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Instead of <Navigate to="/" />, we render the Forbidden component
    return <ForbiddenPage />;
  }

  // 4. Access Granted
  return children;
}