import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Menu, X, User, LogOut, Settings, Layout, ShieldAlert, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import ThemeToggle from './ThemeToggle.jsx';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 glass-nav shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 text-indigo-600 dark:text-violet-400 font-extrabold text-xl tracking-tight">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-200 dark:shadow-none">
              <BookOpen className="w-5 h-5" />
            </div>
            <span>Book<span className="text-slate-800 dark:text-white">Bridge</span></span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/browse"
              className={`text-sm font-medium transition-colors ${
                isActive('/browse')
                  ? 'text-indigo-600 dark:text-violet-400'
                  : 'text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-violet-400'
              }`}
            >
              Browse Catalog
            </Link>

            {user && (
              <Link
                to="/chat"
                className={`flex items-center space-x-1.5 text-sm font-medium transition-colors ${
                  isActive('/chat')
                    ? 'text-indigo-600 dark:text-violet-400'
                    : 'text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-violet-400'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Inbox</span>
              </Link>
            )}

            {user && user.role === 'admin' && (
              <Link
                to="/admin"
                className={`flex items-center space-x-1 text-sm font-semibold text-rose-500 hover:text-rose-600 dark:text-rose-400`}
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Admin Panel</span>
              </Link>
            )}
          </div>

          {/* Right Action Items */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <img
                    src={user.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=default'}
                    alt="avatar"
                    className="w-9 h-9 rounded-xl border border-indigo-100 dark:border-slate-800 object-cover bg-indigo-50 dark:bg-slate-800"
                  />
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{user.name}</p>
                    <p className="text-[10px] text-slate-500 truncate max-w-[120px]">{user.school || 'Student'}</p>
                  </div>
                </button>

                {/* Profile Dropdown */}
                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)}></div>
                    <div className="absolute right-0 mt-3 w-52 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 shadow-xl py-2 z-20 animate-fade-in">
                      <Link
                        to="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-800"
                      >
                        <Layout className="w-4 h-4 text-slate-400" />
                        <span>My Dashboard</span>
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-800"
                      >
                        <Settings className="w-4 h-4 text-slate-400" />
                        <span>Profile Settings</span>
                      </Link>
                      <hr className="my-1 border-slate-200 dark:border-slate-800" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 w-full text-left px-4 py-2.5 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                to="/auth"
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 shadow-md shadow-indigo-200 dark:shadow-none hover:-translate-y-0.5"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-violet-400 focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white/95 dark:bg-slate-950/95 border-b border-slate-200 dark:border-slate-800 animate-slide-up">
          <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
            <Link
              to="/browse"
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2.5 rounded-xl text-base font-medium ${
                isActive('/browse') ? 'bg-indigo-50 text-indigo-600 dark:bg-slate-800 dark:text-white' : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              Browse Catalog
            </Link>

            {user && (
              <Link
                to="/chat"
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2.5 rounded-xl text-base font-medium ${
                  isActive('/chat') ? 'bg-indigo-50 text-indigo-600 dark:bg-slate-800 dark:text-white' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                Inbox
              </Link>
            )}

            {user && user.role === 'admin' && (
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2.5 rounded-xl text-base font-medium text-rose-600 dark:text-rose-400"
              >
                Admin Panel
              </Link>
            )}

            {user ? (
              <div className="pt-4 pb-2 border-t border-slate-200 dark:border-slate-800 mt-2">
                <div className="flex items-center px-3 mb-3">
                  <img
                    src={user.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=default'}
                    alt="avatar"
                    className="w-10 h-10 rounded-xl"
                  />
                  <div className="ml-3">
                    <p className="text-base font-bold text-slate-800 dark:text-white">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                </div>
                <Link
                  to="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 text-base font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-violet-400"
                >
                  My Dashboard
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 text-base font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-violet-400"
                >
                  Profile Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-rose-600 dark:text-rose-400 hover:text-rose-700"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 mt-2">
                <Link
                  to="/auth"
                  onClick={() => setIsOpen(false)}
                  className="block text-center w-full px-5 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
