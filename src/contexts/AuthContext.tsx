
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

// Define user roles
export type UserRole = 'admin' | 'analyst';

// Define user interface
export interface User {
  id: string;
  username: string;
  role: UserRole;
  email: string;
}

// Mock users for demonstration
const MOCK_USERS = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    role: 'admin' as UserRole,
    email: 'admin@skyidrow.com'
  },
  {
    id: '2',
    username: 'analyst',
    password: 'analyst123',
    role: 'analyst' as UserRole,
    email: 'analyst@skyidrow.com'
  }
];

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthorized: (requiredRoles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check for existing session on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem('skyidrow_user');
        const storedToken = localStorage.getItem('skyidrow_token');
        
        if (storedUser && storedToken) {
          const user = JSON.parse(storedUser);
          // Validate the stored user data
          if (user && user.id && user.username && user.role) {
            setCurrentUser(user);
            setIsAuthenticated(true);
            console.log('Session restored for user:', user.username);
          } else {
            // Invalid user data, clear storage
            localStorage.removeItem('skyidrow_user');
            localStorage.removeItem('skyidrow_token');
          }
        }
      } catch (error) {
        console.error('Failed to restore session:', error);
        localStorage.removeItem('skyidrow_user');
        localStorage.removeItem('skyidrow_token');
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  // Handle navigation after auth state is initialized
  useEffect(() => {
    if (!isInitialized) return;

    const isPublicRoute = ['/login', '/unauthorized'].includes(location.pathname);
    
    if (!isAuthenticated && !isPublicRoute) {
      navigate('/login', { replace: true });
    } else if (isAuthenticated && location.pathname === '/login') {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, isInitialized, location.pathname, navigate]);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // In a real app, this would be an API call
      const user = MOCK_USERS.find(
        u => u.username === username && u.password === password
      );

      if (user) {
        // Remove password before storing the user
        const { password: _, ...safeUser } = user;
        
        // Create a mock token (in a real app, this would come from the server)
        const token = btoa(`${username}:${Date.now()}`);
        
        // Store in localStorage for session persistence
        localStorage.setItem('skyidrow_user', JSON.stringify(safeUser));
        localStorage.setItem('skyidrow_token', token);
        
        setCurrentUser(safeUser);
        setIsAuthenticated(true);
        
        console.log('User logged in:', username);
        
        toast({
          title: "Login successful",
          description: `Welcome back, ${username}!`,
        });
        
        return true;
      } else {
        toast({
          title: "Login failed",
          description: "Invalid username or password",
          variant: "destructive",
        });
        
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login error",
        description: "An unexpected error occurred during login",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('skyidrow_user');
      localStorage.removeItem('skyidrow_token');
      setCurrentUser(null);
      setIsAuthenticated(false);
      
      console.log('User logged out');
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isAuthorized = (requiredRoles: UserRole[]): boolean => {
    if (!currentUser) return false;
    return requiredRoles.includes(currentUser.role);
  };

  // Don't render children until auth state is initialized
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ currentUser, isAuthenticated, login, logout, isAuthorized }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
