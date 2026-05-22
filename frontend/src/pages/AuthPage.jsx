import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, User, School, MapPin, AlignLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, signup, loading } = useAuth();

  // Tab State
  const [isLoginTab, setIsLoginTab] = useState(true);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [school, setSchool] = useState('');
  const [locationField, setLocationField] = useState('');
  const [bio, setBio] = useState('');

  // Error States
  const [formError, setFormError] = useState('');

  // If user is already logged in, redirect them
  useEffect(() => {
    if (user) {
      const redirectPath = location.state?.from || '/dashboard';
      navigate(redirectPath);
    }
  }, [user, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (isLoginTab) {
      // Login flow
      const result = await login(email, password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setFormError(result.message);
      }
    } else {
      // Signup flow
      if (password.length < 6) {
        setFormError('Password must be at least 6 characters long.');
        return;
      }

      const result = await signup(name, email, password, school, locationField, bio);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setFormError(result.message);
      }
    }
  };

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center px-4 py-16 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      
      {/* Background radial overlays */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full glow-purple opacity-20 pointer-events-none"></div>

      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-xl p-8 relative z-10 animate-slide-up">
        
        {/* Title Header */}
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-3xl font-extrabold text-slate-850 dark:text-white tracking-tight">
            {isLoginTab ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isLoginTab ? 'Exchange books with students on campus' : 'Join BookBridge to swap your learning resources'}
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6">
          <button
            onClick={() => {
              setIsLoginTab(true);
              setFormError('');
            }}
            className={`flex-1 pb-3 text-sm font-bold text-center border-b-2 transition-all ${
              isLoginTab
                ? 'border-indigo-600 text-indigo-600 dark:border-violet-400 dark:text-violet-400'
                : 'border-transparent text-slate-400 hover:text-slate-650'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setIsLoginTab(false);
              setFormError('');
            }}
            className={`flex-1 pb-3 text-sm font-bold text-center border-b-2 transition-all ${
              !isLoginTab
                ? 'border-indigo-600 text-indigo-600 dark:border-violet-400 dark:text-violet-400'
                : 'border-transparent text-slate-400 hover:text-slate-650'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 text-xs font-semibold rounded-xl bg-rose-50 border border-rose-200 text-rose-600 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-450 flex items-center space-x-1.5 animate-fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Name Field (Sign Up Only) */}
          {!isLoginTab && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
              <div className="flex items-center px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus-within:ring-2 focus-within:ring-indigo-500">
                <User className="w-4 h-4 text-slate-400 mr-2.5" />
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-transparent focus:outline-none text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400"
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
            <div className="flex items-center px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus-within:ring-2 focus-within:ring-indigo-500">
              <Mail className="w-4 h-4 text-slate-400 mr-2.5" />
              <input
                type="email"
                required
                placeholder="you@school.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent focus:outline-none text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
            <div className="flex items-center px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus-within:ring-2 focus-within:ring-indigo-500">
              <Lock className="w-4 h-4 text-slate-400 mr-2.5" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent focus:outline-none text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400"
              />
            </div>
          </div>

          {/* School Field (Sign Up Only) */}
          {!isLoginTab && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">University / School</label>
              <div className="flex items-center px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus-within:ring-2 focus-within:ring-indigo-500">
                <School className="w-4 h-4 text-slate-400 mr-2.5" />
                <input
                  type="text"
                  placeholder="Stanford University"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  className="w-full bg-transparent focus:outline-none text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400"
                />
              </div>
            </div>
          )}

          {/* Location Field (Sign Up Only) */}
          {!isLoginTab && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Location / Campus Dorm</label>
              <div className="flex items-center px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus-within:ring-2 focus-within:ring-indigo-500">
                <MapPin className="w-4 h-4 text-slate-400 mr-2.5" />
                <input
                  type="text"
                  placeholder="Stanford, CA"
                  value={locationField}
                  onChange={(e) => setLocationField(e.target.value)}
                  className="w-full bg-transparent focus:outline-none text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400"
                />
              </div>
            </div>
          )}

          {/* Bio Field (Sign Up Only) */}
          {!isLoginTab && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Short Bio</label>
              <div className="flex items-start px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus-within:ring-2 focus-within:ring-indigo-500">
                <AlignLeft className="w-4 h-4 text-slate-400 mr-2.5 mt-0.5" />
                <textarea
                  placeholder="Tell campus peers what you study or list..."
                  rows="2"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-transparent focus:outline-none text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400"
                ></textarea>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-100 dark:shadow-none transition-all duration-300 flex items-center justify-center space-x-1.5"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <span>{isLoginTab ? 'Sign In' : 'Register Now'}</span>
            )}
          </button>
        </form>

        {/* Demo Hint */}
        <div className="mt-8 text-center text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4">
          <p className="font-bold">Sandbox Demo logins:</p>
          <p className="mt-1">
            Student: <span className="font-semibold text-slate-500 dark:text-slate-350">alice@university.edu</span>
          </p>
          <p>
            Admin: <span className="font-semibold text-slate-500 dark:text-slate-350">admin@bookbridge.com</span>
          </p>
          <p className="text-[10px] italic mt-1">(Any password will authenticate in mock mode)</p>
        </div>

      </div>
    </div>
  );
};

export default AuthPage;
