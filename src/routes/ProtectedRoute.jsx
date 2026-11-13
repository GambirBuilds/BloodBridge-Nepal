import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Button, Surface } from '../components/common/ui';
import { useAuth } from '../hooks/useAuth';
import { usePlatformData } from '../hooks/usePlatformData';

export default function ProtectedRoute({ allowedRole, children }) {
  const { currentUser, isAuthenticated, loginWithDemoRole, getDashboardPathForRole } = useAuth();
  const { users } = usePlatformData();
  const location = useLocation();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRole && currentUser?.role !== allowedRole) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background p-6">
        <Surface className="max-w-md space-y-4 p-6">
          <h1 className="text-lg font-semibold text-foreground">
            Role workspace mismatch
          </h1>
          <p className="text-sm text-muted">
            You are currently signed in as <strong>{currentUser.name}</strong> ({currentUser.roleLabel}).
            Switch to the demonstration <strong>{allowedRole}</strong> account to inspect this dashboard.
          </p>
          <div className="flex flex-wrap gap-2.5 pt-2">
            <Button
              onClick={() => {
                loginWithDemoRole(allowedRole, users);
              }}
            >
              Switch to {allowedRole} demo role
            </Button>
            <Button
              tone="quiet"
              onClick={() => navigate(getDashboardPathForRole(currentUser.role))}
            >
              Back to my workspace
            </Button>
          </div>
        </Surface>
      </div>
    );
  }

  return children;
}
