import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, authAPI, adminAPI } from './services/api';

interface User {
  id: number;
  name: string;
  email: string;
  data_sharing_consent?: boolean;
}

type OAuthProvider = 'google' | 'github';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithToken: (token: string) => Promise<void>;
  startOAuthLogin: (provider: OAuthProvider) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  isLoading: boolean;
  isAdmin: boolean;
  isAdminLoading: boolean;
  adminLogin: (username: string, password: string) => Promise<void>;
  adminLogout: () => void;
  refreshAdminAccess: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  loginWithToken: async () => {},
  startOAuthLogin: async () => {},
  logout: () => {},
  updateUser: () => {},
  isLoading: true,
  isAdmin: false,
  isAdminLoading: true,
  adminLogin: async () => {},
  adminLogout: () => {},
  refreshAdminAccess: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminLoading, setIsAdminLoading] = useState(true);
  const configuredIdleMinutes = Number(import.meta.env.VITE_ADMIN_IDLE_TIMEOUT_MINUTES ?? 5);
  const configuredWarningSeconds = Number(import.meta.env.VITE_ADMIN_IDLE_WARNING_SECONDS ?? 30);
  const ADMIN_IDLE_TIMEOUT_MS = Math.max(1, configuredIdleMinutes) * 60 * 1000;
  const ADMIN_IDLE_WARNING_SECONDS = Math.max(5, configuredWarningSeconds);
  const [showAdminIdleWarning, setShowAdminIdleWarning] = useState(false);
  const [adminIdleCountdown, setAdminIdleCountdown] = useState(ADMIN_IDLE_WARNING_SECONDS);

  const checkAdminAccess = async () => {
    setIsAdminLoading(true);
    try {
      await adminAPI.getSummary();
      setIsAdmin(true);
    } catch {
      setIsAdmin(false);
    } finally {
      setIsAdminLoading(false);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAdmin(false);
        setIsLoading(false);
      } else {
        try {
          const response = await api.get('/auth/me');
          setUser(response.data);
        } catch {
          localStorage.removeItem('token');
          setUser(null);
        } finally {
          setIsLoading(false);
        }
      }

      await checkAdminAccess();
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (!user) return;

    let intervalId: ReturnType<typeof setInterval> | null = null;
    let mounted = true;

    const sendHeartbeat = async () => {
      if (document.visibilityState !== 'visible') return;
      try {
        await authAPI.heartbeat();
      } catch {
        // Heartbeat failures should not disrupt user flow.
      }
    };

    const setupHeartbeat = () => {
      sendHeartbeat();
      intervalId = setInterval(sendHeartbeat, 60000);
    };

    const handleVisibility = () => {
      if (!mounted) return;
      if (document.visibilityState === 'visible') {
        sendHeartbeat();
      }
    };

    setupHeartbeat();
    window.addEventListener('focus', sendHeartbeat);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      mounted = false;
      if (intervalId) clearInterval(intervalId);
      window.removeEventListener('focus', sendHeartbeat);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [user]);

  useEffect(() => {
    if (!isAdmin) return;

    let logoutTimeoutId: ReturnType<typeof setTimeout> | null = null;
    let warningTimeoutId: ReturnType<typeof setTimeout> | null = null;
    let countdownIntervalId: ReturnType<typeof setInterval> | null = null;
    let warningStartAt = 0;

    const performAdminAutoLogout = () => {
      localStorage.removeItem('admin_token');
      setIsAdmin(false);
      setIsAdminLoading(false);
      setShowAdminIdleWarning(false);
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/login';
      }
    };

    const clearTimers = () => {
      if (logoutTimeoutId) clearTimeout(logoutTimeoutId);
      if (warningTimeoutId) clearTimeout(warningTimeoutId);
      if (countdownIntervalId) clearInterval(countdownIntervalId);
      logoutTimeoutId = null;
      warningTimeoutId = null;
      countdownIntervalId = null;
    };

    const resetTimer = () => {
      clearTimers();
      setShowAdminIdleWarning(false);
      setAdminIdleCountdown(ADMIN_IDLE_WARNING_SECONDS);

      const warningLeadMs = Math.min(
        ADMIN_IDLE_WARNING_SECONDS * 1000,
        Math.max(1000, ADMIN_IDLE_TIMEOUT_MS - 1000)
      );
      const warningDelayMs = Math.max(0, ADMIN_IDLE_TIMEOUT_MS - warningLeadMs);

      warningTimeoutId = setTimeout(() => {
        warningStartAt = Date.now();
        setShowAdminIdleWarning(true);
        setAdminIdleCountdown(Math.ceil(warningLeadMs / 1000));

        countdownIntervalId = setInterval(() => {
          const elapsedMs = Date.now() - warningStartAt;
          const remainingMs = Math.max(0, warningLeadMs - elapsedMs);
          const remainingSeconds = Math.ceil(remainingMs / 1000);
          setAdminIdleCountdown(remainingSeconds);
        }, 1000);
      }, warningDelayMs);

      logoutTimeoutId = setTimeout(() => {
        clearTimers();
        performAdminAutoLogout();
      }, ADMIN_IDLE_TIMEOUT_MS);
    };

    const events: Array<keyof WindowEventMap> = ['mousemove', 'mousedown', 'keydown', 'scroll', 'focus'];
    events.forEach((eventName) => window.addEventListener(eventName, resetTimer));
    document.addEventListener('visibilitychange', resetTimer);
    resetTimer();

    return () => {
      clearTimers();
      setShowAdminIdleWarning(false);
      events.forEach((eventName) => window.removeEventListener(eventName, resetTimer));
      document.removeEventListener('visibilitychange', resetTimer);
    };
  }, [isAdmin, ADMIN_IDLE_TIMEOUT_MS, ADMIN_IDLE_WARNING_SECONDS]);

  const loginWithToken = async (token: string) => {
    localStorage.setItem('token', token);
    const meResponse = await api.get('/auth/me');
    setUser(meResponse.data);
    await checkAdminAccess();
  };

  const login = async (email: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const { access_token } = response.data;
    await loginWithToken(access_token);
  };

  const startOAuthLogin = async (provider: OAuthProvider) => {
    const redirectUri = `${window.location.origin}/auth/oauth/callback`;
    const { auth_url } = await authAPI.oauthStart(provider, redirectUri);
    localStorage.setItem('oauth_provider', provider);
    window.location.href = auth_url;
  };

  const updateUser = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('oauth_provider');
    localStorage.removeItem('admin_token');
    setUser(null);
    setIsAdmin(false);
    setIsAdminLoading(false);
  };

  const adminLogin = async (username: string, password: string) => {
    const response = await adminAPI.login({ username, password });
    localStorage.setItem('admin_token', response.access_token);
    await checkAdminAccess();
  };

  const adminLogout = () => {
    localStorage.removeItem('admin_token');
    setIsAdmin(false);
    setIsAdminLoading(false);
    setShowAdminIdleWarning(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        loginWithToken,
        startOAuthLogin,
        logout,
        updateUser,
        isLoading,
        isAdmin,
        isAdminLoading,
        adminLogin,
        adminLogout,
        refreshAdminAccess: checkAdminAccess,
      }}
    >
      {children}
      {isAdmin && showAdminIdleWarning && (
        <div className="fixed bottom-4 right-4 z-[200] max-w-sm rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 shadow-lg">
          <p className="text-sm font-semibold text-amber-900">Admin auto logout warning</p>
          <p className="mt-1 text-sm text-amber-800">
            No activity detected. You will be logged out in {adminIdleCountdown}s.
          </p>
        </div>
      )}
    </AuthContext.Provider>
  );
}
