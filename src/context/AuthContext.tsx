import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UserRole } from '../types.js';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, role?: UserRole) => Promise<User>;
  register: (name: string, email: string, role?: UserRole, institution?: string) => Promise<User>;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
  loginAsDemo: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: 'student',
  isLoggedIn: false,
  isLoading: true,
  login: async () => ({ id: '', name: '', email: '', role: 'student', createdAt: '' }),
  register: async () => ({ id: '', name: '', email: '', role: 'student', createdAt: '' }),
  logout: () => {},
  switchRole: () => {},
  loginAsDemo: () => {},
});

const DEMO_STUDENT: User = {
  id: 'user-student-demo',
  name: 'Alex Rivera',
  email: 'alex.student@learnsense.edu',
  role: 'student',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  createdAt: new Date().toISOString(),
  institution: 'Horizon Academy of Sciences',
  gradeLevel: 'Undergraduate Year 2',
};

const DEMO_TEACHER: User = {
  id: 'user-teacher-demo',
  name: 'Dr. Elena Rostova',
  email: 'elena.teacher@learnsense.edu',
  role: 'teacher',
  avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  createdAt: new Date().toISOString(),
  institution: 'Department of Computer Science & Pedagogy',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('learnsense_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEMO_STUDENT;
      }
    }
    return DEMO_STUDENT; // Default authenticated demo student for effortless immediate testing
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('learnsense_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('learnsense_user');
    }
  }, [user]);

  const login = async (email: string, role?: UserRole): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      });
      const data = await res.json();
      const authenticatedUser = data.user || {
        id: `user-${Date.now()}`,
        name: email.split('@')[0],
        email,
        role: role || 'student',
        createdAt: new Date().toISOString(),
      };
      setUser(authenticatedUser);
      return authenticatedUser;
    } catch (err) {
      const fallbackUser: User = {
        id: `user-${Date.now()}`,
        name: email.split('@')[0],
        email,
        role: role || 'student',
        createdAt: new Date().toISOString(),
      };
      setUser(fallbackUser);
      return fallbackUser;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    role: UserRole = 'student',
    institution?: string
  ): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, role, institution }),
      });
      const data = await res.json();
      const created = data.user || {
        id: `user-${Date.now()}`,
        name,
        email,
        role,
        institution,
        createdAt: new Date().toISOString(),
      };
      setUser(created);
      return created;
    } catch (err) {
      const created: User = {
        id: `user-${Date.now()}`,
        name,
        email,
        role,
        institution,
        createdAt: new Date().toISOString(),
      };
      setUser(created);
      return created;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('learnsense_user');
  };

  const switchRole = (newRole: UserRole) => {
    if (!user) {
      setUser(newRole === 'teacher' ? DEMO_TEACHER : DEMO_STUDENT);
      return;
    }
    const updated: User = {
      ...user,
      role: newRole,
    };
    setUser(updated);
  };

  const loginAsDemo = (demoRole: UserRole) => {
    setUser(demoRole === 'teacher' ? DEMO_TEACHER : DEMO_STUDENT);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'student',
        isLoggedIn: !!user,
        isLoading,
        login,
        register,
        logout,
        switchRole,
        loginAsDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
