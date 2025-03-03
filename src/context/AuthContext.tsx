
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';

interface User {
  id: string;
  name: string;
  email?: string;
  isGuest: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  continueAsGuest: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // Login function (simplified mock)
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Mock API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // In a real app, you would validate with a backend
      // This is just a placeholder for demo purposes
      const user: User = {
        id: 'user-' + Date.now(),
        name: email.split('@')[0],
        email,
        isGuest: false
      };
      
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      toast({
        title: "Logged in successfully",
        description: `Welcome back, ${user.name}!`,
      });
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function (simplified mock)
  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // Mock API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const user: User = {
        id: 'user-' + Date.now(),
        name,
        email,
        isGuest: false
      };
      
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      toast({
        title: "Account created",
        description: `Welcome to ChatAI, ${name}!`,
      });
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "There was an error creating your account.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Continue as guest
  const continueAsGuest = () => {
    setIsLoading(true);
    try {
      const guestUser: User = {
        id: 'guest-' + Date.now(),
        name: 'Guest User',
        isGuest: true
      };
      
      setUser(guestUser);
      localStorage.setItem('user', JSON.stringify(guestUser));
      toast({
        title: "Welcome, Guest!",
        description: "You can continue using the chat. Create an account anytime to save your conversations.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, continueAsGuest, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
