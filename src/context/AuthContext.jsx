import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService';
import { readStorage, removeStorage, writeStorage } from '../utils/storage';

export const AuthContext = createContext(null);

const ROLE_DEFAULT_PATHS = {
  donor: '/dashboard/donor',
  DONOR: '/dashboard/donor',
  requester: '/dashboard/requester',
  REQUESTER: '/dashboard/requester',
  hospital: '/dashboard/hospital',
  HOSPITAL: '/dashboard/hospital',
  admin: '/dashboard/admin',
  ADMIN: '/dashboard/admin',
};

const ROLE_LABELS = {
  donor: 'Voluntary Donor',
  DONOR: 'Voluntary Donor',
  requester: 'Patient / Requester',
  REQUESTER: 'Patient / Requester',
  hospital: 'Hospital / Blood Bank',
  HOSPITAL: 'Hospital / Blood Bank',
  admin: 'Platform Administrator',
  ADMIN: 'Platform Administrator',
};

export function getDashboardPathForRole(role) {
  return ROLE_DEFAULT_PATHS[role] || '/dashboard/donor';
}

function normalizeUserSession(rawUser, tokens = {}) {
  const roleLower = (rawUser.role || 'donor').toLowerCase();
  return {
    ...rawUser,
    role: roleLower,
    originalRole: rawUser.role,
    roleLabel: ROLE_LABELS[rawUser.role] || 'User',
    name: rawUser.fullName || rawUser.name,
    accessToken: tokens.accessToken || rawUser.accessToken,
    refreshToken: tokens.refreshToken || rawUser.refreshToken,
    token: tokens.accessToken || rawUser.accessToken,
  };
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => readStorage('auth_session', null));
  const [loading, setLoading] = useState(true);

  // Synchronize and verify session with backend /api/auth/me on mount
  useEffect(() => {
    async function initSession() {
      const stored = readStorage('auth_session', null);
      if (stored?.accessToken) {
        try {
          const res = await authService.getMe();
          if (res.success && res.data) {
            const normalized = normalizeUserSession(res.data, {
              accessToken: stored.accessToken,
              refreshToken: stored.refreshToken,
            });
            setCurrentUser(normalized);
            writeStorage('auth_session', normalized);
          }
        } catch {
          // If token expired, apiClient interceptor will try refresh, otherwise clear
        }
      }
      setLoading(false);
    }
    initSession();
  }, []);

  const loginWithCredentials = useCallback(async ({ email, password }) => {
    const res = await authService.login(email, password);
    if (res.success && res.data) {
      const normalized = normalizeUserSession(res.data.user, {
        accessToken: res.data.accessToken,
        refreshToken: res.data.refreshToken,
      });
      setCurrentUser(normalized);
      writeStorage('auth_session', normalized);
      return normalized;
    }
    throw new Error(res.message || 'Login failed.');
  }, []);

  const registerUser = useCallback(async (formData) => {
    const res = await authService.register(formData);
    if (res.success && res.data) {
      const normalized = normalizeUserSession(res.data.user, {
        accessToken: res.data.accessToken,
        refreshToken: res.data.refreshToken,
      });
      setCurrentUser(normalized);
      writeStorage('auth_session', normalized);
      return normalized;
    }
    throw new Error(res.message || 'Registration failed.');
  }, []);

  const loginWithDemoRole = useCallback(async (role) => {
    // Demo role switch: authenticates directly with seeded credentials in real backend
    const demoCredentials = {
      donor: { email: 'suman.thapa@demo.bloodbridge.np', password: 'demoPassword123' },
      requester: { email: 'ramesh.adhikari@demo.bloodbridge.np', password: 'demoPassword123' },
      hospital: { email: 'bloodbank@bagmatiteaching.demo.np', password: 'demoPassword123' },
      admin: { email: 'aarav.khadka@demo.bloodbridge.np', password: 'demoPassword123' },
    };

    const targetCred = demoCredentials[role.toLowerCase()] || demoCredentials.donor;
    const res = await authService.login(targetCred.email, targetCred.password);
    if (res.success && res.data) {
      const normalized = normalizeUserSession(res.data.user, {
        accessToken: res.data.accessToken,
        refreshToken: res.data.refreshToken,
      });
      setCurrentUser(normalized);
      writeStorage('auth_session', normalized);
      return normalized;
    }
  }, []);

  const setAuthenticatedUser = useCallback((userRecord) => {
    const normalized = normalizeUserSession(userRecord);
    setCurrentUser(normalized);
    writeStorage('auth_session', normalized);
    return normalized;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // ignore
    }
    setCurrentUser(null);
    removeStorage('auth_session');
  }, []);

  const value = useMemo(
    () => ({
      currentUser,
      isAuthenticated: Boolean(currentUser),
      loading,
      loginWithDemoRole,
      loginWithCredentials,
      registerUser,
      setAuthenticatedUser,
      logout,
      getDashboardPathForRole,
    }),
    [currentUser, loading, loginWithDemoRole, loginWithCredentials, registerUser, setAuthenticatedUser, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
