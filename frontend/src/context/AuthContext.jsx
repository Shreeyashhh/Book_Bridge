import React, { createContext, useContext, useEffect, useState } from 'react';
import { MOCK_USERS } from '../utils/mockData.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMockMode, setIsMockMode] = useState(true);

  // Initialize and check backend connection
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      // If there is no token, check if we have a mock user session in localStorage
      const savedMockUser = localStorage.getItem('mock_user');

      try {
        // Try fetching backend
        const res = await fetch('/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
          setIsMockMode(false);
          setLoading(false);
          return;
        } else if (res.status === 401) {
          // Backend is active, but token is invalid or missing (Guest/Logged out)
          setIsMockMode(false);
          setUser(null);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn("Backend server not found, entering local Mock-API mode.");
      }

      // Backend failed or not available - Fallback to mock session
      setIsMockMode(true);
      if (savedMockUser) {
        setUser(JSON.parse(savedMockUser));
      } else {
        // Default: start as guest, but let them sign in easily
        setUser(null);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Login handler
  const login = async (email, password) => {
    setLoading(true);
    
    // Real API mode try
    if (!isMockMode) {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (res.ok) {
          setUser(data);
          localStorage.setItem('token', data.token);
          setLoading(false);
          return { success: true };
        } else {
          setLoading(false);
          return { success: false, message: data.message || 'Login failed' };
        }
      } catch (err) {
        console.error("API login failed, falling back to mock login.", err);
        setIsMockMode(true);
      }
    }

    // Mock Mode fallback
    // Look up user in local mock storage (or initial mock users)
    const localUsers = JSON.parse(localStorage.getItem('users_db')) || MOCK_USERS;
    const matchedUser = localUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (matchedUser) {
      // In mock mode, password 'password' works for all or any input passes for demonstration
      setUser(matchedUser);
      localStorage.setItem('mock_user', JSON.stringify(matchedUser));
      setLoading(false);
      return { success: true };
    } else {
      setLoading(false);
      return { success: false, message: 'Invalid credentials. Hint: try alice@university.edu or bob@university.edu (password is any)' };
    }
  };

  // Signup handler
  const signup = async (name, email, password, school, location, bio) => {
    setLoading(true);

    if (!isMockMode) {
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, school, location, bio })
        });
        const data = await res.json();

        if (res.ok) {
          setUser(data);
          localStorage.setItem('token', data.token);
          setLoading(false);
          return { success: true };
        } else {
          setLoading(false);
          return { success: false, message: data.message || 'Signup failed' };
        }
      } catch (err) {
        console.error("API signup failed, falling back to mock signup.", err);
        setIsMockMode(true);
      }
    }

    // Mock Mode fallback
    const localUsers = JSON.parse(localStorage.getItem('users_db')) || MOCK_USERS;
    
    if (localUsers.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      setLoading(false);
      return { success: false, message: 'User already exists' };
    }

    const newUser = {
      _id: `user_${Date.now()}`,
      name,
      email,
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
      school: school || 'State University',
      location: location || '',
      bio: bio || '',
      role: 'user',
      wishlist: []
    };

    const updatedUsers = [...localUsers, newUser];
    localStorage.setItem('users_db', JSON.stringify(updatedUsers));
    setUser(newUser);
    localStorage.setItem('mock_user', JSON.stringify(newUser));
    setLoading(false);
    return { success: true };
  };

  // Logout handler
  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('mock_user');
  };

  // Update profile handler
  const updateProfile = async (profileData) => {
    setLoading(true);

    if (!isMockMode) {
      try {
        const res = await fetch('/api/auth/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(profileData)
        });
        const data = await res.json();

        if (res.ok) {
          setUser(data);
          setLoading(false);
          return { success: true };
        } else {
          setLoading(false);
          return { success: false, message: data.message || 'Profile update failed' };
        }
      } catch (err) {
        console.error("API profile update failed, falling back to mock.", err);
        setIsMockMode(true);
      }
    }

    // Mock Mode update
    const updatedUser = {
      ...user,
      ...profileData,
    };
    
    // Update in users_db
    const localUsers = JSON.parse(localStorage.getItem('users_db')) || MOCK_USERS;
    const index = localUsers.findIndex(u => u._id === user._id);
    if (index >= 0) {
      localUsers[index] = updatedUser;
      localStorage.setItem('users_db', JSON.stringify(localUsers));
    }
    
    setUser(updatedUser);
    localStorage.setItem('mock_user', JSON.stringify(updatedUser));
    setLoading(false);
    return { success: true };
  };

  return (
    <AuthContext.Provider value={{ user, loading, error: null, login, signup, logout, updateProfile, isMockMode, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
