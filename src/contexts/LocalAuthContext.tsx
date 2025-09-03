import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface LocalUser {
  id: string;
  email: string;
  full_name: string;
  role: 'user' | 'host' | 'admin';
  avatar_url?: string;
}

interface LocalAuthContextType {
  user: LocalUser | null;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: any }>;
  signOut: () => void;
  isLoading: boolean;
}

const LocalAuthContext = createContext<LocalAuthContextType | undefined>(undefined);

// Demo users
const DEMO_USERS: LocalUser[] = [
  {
    id: 'demo-user-1',
    email: 'user@demo.com',
    full_name: 'Demo User',
    role: 'user',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
  },
  {
    id: 'demo-host-1',
    email: 'host@demo.com',
    full_name: 'Demo Host',
    role: 'host',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
  },
  {
    id: 'demo-admin-1',
    email: 'admin@demo.com',
    full_name: 'Demo Admin',
    role: 'admin',
    avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150'
  }
];

export const LocalAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('localAuthUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('localAuthUser');
      }
    }
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Check if it's a demo user
      const demoUser = DEMO_USERS.find(u => u.email === email);
      
      if (demoUser && password === 'demo123') {
        setUser(demoUser);
        localStorage.setItem('localAuthUser', JSON.stringify(demoUser));
        
        toast({
          title: "Login Successful!",
          description: `Welcome back, ${demoUser.full_name}!`
        });
        
        navigate('/');
        return { error: null };
      }
      
      // For non-demo users, check if they exist in localStorage
      const existingUsers = JSON.parse(localStorage.getItem('localUsers') || '[]');
      const existingUser = existingUsers.find((u: any) => u.email === email && u.password === password);
      
      if (existingUser) {
        const userData = {
          id: existingUser.id,
          email: existingUser.email,
          full_name: existingUser.full_name,
          role: existingUser.role || 'user',
          avatar_url: existingUser.avatar_url
        };
        
        setUser(userData);
        localStorage.setItem('localAuthUser', JSON.stringify(userData));
        
        toast({
          title: "Login Successful!",
          description: `Welcome back, ${userData.full_name}!`
        });
        
        navigate('/');
        return { error: null };
      }
      
      return { error: { message: 'Invalid email or password' } };
    } catch (error) {
      return { error: { message: 'An error occurred during login' } };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    setIsLoading(true);
    
    try {
      // Check if user already exists
      const existingUsers = JSON.parse(localStorage.getItem('localUsers') || '[]');
      const userExists = existingUsers.find((u: any) => u.email === email);
      
      if (userExists) {
        return { error: { message: 'User already exists with this email' } };
      }
      
      // Create new user
      const newUser = {
        id: `local-user-${Date.now()}`,
        email,
        password,
        full_name: fullName,
        role: 'user' as const,
        avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=FF6600&color=fff`
      };
      
      // Save to localStorage
      existingUsers.push(newUser);
      localStorage.setItem('localUsers', JSON.stringify(existingUsers));
      
      // Set as current user
      const userData = {
        id: newUser.id,
        email: newUser.email,
        full_name: newUser.full_name,
        role: newUser.role,
        avatar_url: newUser.avatar_url
      };
      
      setUser(userData);
      localStorage.setItem('localAuthUser', JSON.stringify(userData));
      
      toast({
        title: "Account Created!",
        description: `Welcome to CREATOR SPACES, ${fullName}!`
      });
      
      navigate('/');
      return { error: null };
    } catch (error) {
      return { error: { message: 'An error occurred during registration' } };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('localAuthUser');
    
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out."
    });
    
    navigate('/');
  };

  return (
    <LocalAuthContext.Provider value={{ user, signIn, signUp, signOut, isLoading }}>
      {children}
    </LocalAuthContext.Provider>
  );
};

export const useLocalAuth = () => {
  const context = useContext(LocalAuthContext);
  if (context === undefined) {
    throw new Error('useLocalAuth must be used within a LocalAuthProvider');
  }
  return context;
}; 