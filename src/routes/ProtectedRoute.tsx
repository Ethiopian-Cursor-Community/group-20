import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthProvider";
import type { AppRole } from "@/types/database";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  children: React.ReactNode;
  roles?: AppRole[];
};

export default function ProtectedRoute({ children, roles }: Props) {
  const { user, loading, hasRole, primaryRole } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <Skeleton className="h-10 w-48" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (roles && roles.length > 0 && !roles.some((r) => hasRole(r))) {
    const fallback =
      primaryRole === "admin"
        ? "/admin"
        : primaryRole === "advertiser"
          ? "/advertiser"
          : "/influencer";
    return <Navigate to={fallback} replace />;
  }

  return children;
}
