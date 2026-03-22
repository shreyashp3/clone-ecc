import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { auth as apiAuth, User as ApiUser } from "@/integrations/api/client";

type AppRole = "super_admin" | "admin" | "content_manager" | "support_agent" | "marketing_manager";

interface User extends ApiUser {
  id: string;
  email?: string;
  roles?: AppRole[];
  profile?: {
    displayName?: string;
    avatarUrl?: string;
  };
  user_metadata?: {
    full_name: string;
  };
}

interface Session {
  user: User;
  access_token: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  roles: AppRole[];
  isStaff: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const initRef = useRef(false);

  // Initialize auth state from localStorage
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const loadInitialState = async () => {
      try {
        // Try to get user from localStorage
        const storedUser = localStorage.getItem('auth_user');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            
            const storedRoles = Array.isArray(parsedUser.roles) && parsedUser.roles.length > 0
              ? parsedUser.roles
              : parsedUser.role
                ? [parsedUser.role]
                : [];

            if (storedRoles.length > 0) {
              setRoles(storedRoles as AppRole[]);
            }

            setSession({
              user: parsedUser,
              access_token: localStorage.getItem('auth_tokens')
                ? JSON.parse(localStorage.getItem('auth_tokens')!).accessToken
                : '',
            });
          } catch {
            localStorage.removeItem('auth_user');
          }
        }
      } catch (error) {
        console.warn('Failed to load initial auth state:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialState();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await apiAuth.login(email, password);
      
      const apiUser = response.user;
      const userData: User = {
        ...apiUser,
        id: apiUser.id,
        email: apiUser.email,
        roles: (apiUser.roles as AppRole[]) || [],
        user_metadata: {
          full_name: `${apiUser.firstName || ''} ${apiUser.lastName || ''}`.trim(),
        },
      };

      setUser(userData);
      
      const userRoles: AppRole[] = (apiUser.roles as AppRole[])?.length
        ? (apiUser.roles as AppRole[])
        : ['super_admin', 'admin', 'content_manager', 'support_agent', 'marketing_manager'].includes(apiUser.role)
          ? [apiUser.role as AppRole]
          : ['content_manager'];
      setRoles(userRoles);

      setSession({
        user: userData,
        access_token: response.accessToken,
      });
    } catch (error) {
      console.error('Sign in failed:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const response = await apiAuth.register(email, password, fullName);
      
      const apiUser = response.user;
      const userData: User = {
        ...apiUser,
        id: apiUser.id,
        email: apiUser.email,
        roles: (apiUser.roles as AppRole[]) || [],
        user_metadata: {
          full_name: fullName || '',
        },
      };

      setUser(userData);
      setRoles((apiUser.roles as AppRole[]) || ['content_manager']);
      
      setSession({
        user: userData,
        access_token: response.accessToken,
      });
    } catch (error) {
      console.error('Sign up failed:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await apiAuth.logout();
      setUser(null);
      setSession(null);
      setRoles([]);
    } catch (error) {
      console.error('Sign out failed:', error);
      throw error;
    }
  };

  const isStaff = roles.length > 0;
  const isAdmin = roles.includes("super_admin") || roles.includes("admin");

  return (
    <AuthContext.Provider
      value={{ user, session, loading, roles, isStaff, isAdmin, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
