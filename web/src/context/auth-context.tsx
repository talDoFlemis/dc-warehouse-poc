import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { User } from '@/api/types';
import * as authApi from '@/api/auth';
import { ApiError } from '@/api/client';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  canWrite: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    authApi
      .getProfile()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const loggedUser = await authApi.login(username, password);
    setUser(loggedUser);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (e) {
      if (e instanceof ApiError && e.status === 403) {
        // already logged out
      } else {
        throw e;
      }
    }
    setUser(null);
  }, []);

  const isAdmin = user?.role === 'admin';
  const canWrite = user?.role === 'admin' || user?.role === 'writer';

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, logout, isAdmin, canWrite }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
