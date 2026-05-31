import { Navigate, useLocation } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Loader2 } from "lucide-react";

const ProtectedRoute = ({ children, requireAdmin = false }: { children: React.ReactNode, requireAdmin?: boolean }) => {
  const { session, authLoading, isAdmin } = useApp();
  const location = useLocation();

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If no session, go to login
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Se for uma rota admin/master mas o usuário não é master, redireciona para dashboard normal
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
