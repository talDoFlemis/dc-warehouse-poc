import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/auth-context';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'writer' | 'viewer';
}

export function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole === 'admin' && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  if (
    requiredRole === 'writer' &&
    user.role !== 'admin' &&
    user.role !== 'writer'
  ) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
