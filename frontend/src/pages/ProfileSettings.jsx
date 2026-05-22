import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, School, MapPin, AlignLeft, Lock, Camera, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const ProfileSettings = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();

  // Form Fields
  const [name, setName] = useState('');
  const [school, setSchool] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');

  // Password Fields
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI status
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);

  // Sync profile details
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setSchool(user.school || '');
      setLocation(user.location || '');
      setBio(user.bio || '');
      setAvatar(user.avatar || '');
    } else {
      navigate('/auth');
    }
  }, [user, navigate]);

  // Handle Save Profile
  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    setSaveSuccess('');
    setSaveError('');
    setSaving(true);

    const payload = { name, school, location, bio, avatar };

    const result = await updateProfile(payload);
    setSaving(false);

    if (result.success) {
      setSaveSuccess('Profile settings updated successfully!');
      setTimeout(() => setSaveSuccess(''), 3000);
    } else {
      setSaveError(result.message || 'Updating profile failed.');
    }
  };

  // Handle Save Password
  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    setSaveSuccess('');
    setSaveError('');

    if (password !== confirmPassword) {
      setSaveError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setSaveError('Password must be at least 6 characters long.');
      return;
    }

    setSaving(true);
    const result = await updateProfile({ password });
    setSaving(false);
    
    if (result.success) {
      setSaveSuccess('Password updated successfully!');
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => setSaveSuccess(''), 3000);
    } else {
      setSaveError(result.message || 'Updating password failed.');
    }
  };

  // Preset avatar selectors
  const avatarsList = [
    { name: 'Alice', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Alice' },
    { name: 'Bob', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Bob' },
    { name: 'Charlie', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Charlie' },
    { name: 'David', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=David' },
    { name: 'Emily', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Emily' }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 transition-colors duration-300">
      
      {/* Title */}
      <div className="pb-6 mb-8 border-b border-slate-200/60 dark:border-slate-805/85">
        <h1 className="text-3xl font-extrabold text-slate-850 dark:text-white">Profile Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Control your student profile, institution credentials, and password.</p>
      </div>

      {/* Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Avatar Select Panel */}
        <div className="col-span-1 space-y-6">
          <div className="p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm text-center space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">Avatar Choice</h3>
            <div className="relative w-24 h-24 mx-auto bg-slate-50 rounded-full border overflow-hidden">
              <img
                src={avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=default'}
                alt="user profile avatar"
                className="w-full h-full object-cover"
              />
            </div>
            
            <p className="text-[10px] text-slate-400 italic">Select one of our student avatars preset below:</p>
            
            <div className="flex flex-wrap items-center justify-center gap-2">
              {avatarsList.map((av) => (
                <button
                  key={av.name}
                  type="button"
                  onClick={() => setAvatar(av.url)}
                  className={`w-9 h-9 rounded-lg border overflow-hidden transition-all ${
                    avatar === av.url ? 'ring-2 ring-indigo-500 scale-105' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={av.url} alt={av.name} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Edit Forms */}
        <div className="col-span-2 space-y-8">
          
          {/* Status Banners */}
          {saveSuccess && (
            <div className="p-4 text-xs font-semibold rounded-xl bg-emerald-50 border border-emerald-250 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/60 dark:text-emerald-400 flex items-center space-x-1.5 animate-fade-in">
              <CheckCircle className="w-4.5 h-4.5 flex-shrink-0" />
              <span>{saveSuccess}</span>
            </div>
          )}
          {saveError && (
            <div className="p-4 text-xs font-semibold rounded-xl bg-rose-50 border border-rose-200 text-rose-600 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-455 flex items-center space-x-1.5 animate-fade-in">
              <AlertCircle className="w-4.5 h-4.5 flex-shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

          {/* Form 1: General Info */}
          <div className="p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
            <h3 className="font-extrabold text-slate-850 dark:text-white text-base">General Information</h3>
            <form onSubmit={handleSubmitProfile} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase">Student Name</label>
                <div className="flex items-center px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus-within:ring-2 focus-within:ring-indigo-500">
                  <User className="w-4 h-4 text-slate-400 mr-2.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-transparent focus:outline-none text-sm text-slate-850 dark:text-slate-100 placeholder-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">School / University</label>
                  <div className="flex items-center px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus-within:ring-2 focus-within:ring-indigo-500">
                    <School className="w-4 h-4 text-slate-400 mr-2.5" />
                    <input
                      type="text"
                      value={school}
                      onChange={(e) => setSchool(e.target.value)}
                      className="w-full bg-transparent focus:outline-none text-sm text-slate-850 dark:text-slate-100 placeholder-slate-400"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">Campuses / City Location</label>
                  <div className="flex items-center px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus-within:ring-2 focus-within:ring-indigo-500">
                    <MapPin className="w-4 h-4 text-slate-400 mr-2.5" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full bg-transparent focus:outline-none text-sm text-slate-850 dark:text-slate-100 placeholder-slate-400"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase">Short Bio</label>
                <div className="flex items-start px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus-within:ring-2 focus-within:ring-indigo-500">
                  <AlignLeft className="w-4 h-4 text-slate-400 mr-2.5 mt-0.5" />
                  <textarea
                    rows="3"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-transparent focus:outline-none text-sm text-slate-850 dark:text-slate-100 placeholder-slate-400"
                  ></textarea>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl font-bold text-white bg-indigo-650 hover:bg-indigo-600 transition-colors text-xs flex items-center justify-center space-x-1.5 ml-auto"
              >
                {saving ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <span>Save General Info</span>
                )}
              </button>
            </form>
          </div>

          {/* Form 2: Change Password */}
          <div className="p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
            <h3 className="font-extrabold text-slate-850 dark:text-white text-base">Security & Password</h3>
            <form onSubmit={handleSubmitPassword} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">New Password</label>
                  <div className="flex items-center px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus-within:ring-2 focus-within:ring-indigo-500">
                    <Lock className="w-4 h-4 text-slate-400 mr-2.5" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-transparent focus:outline-none text-sm text-slate-850 dark:text-slate-100"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">Confirm Password</label>
                  <div className="flex items-center px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus-within:ring-2 focus-within:ring-indigo-500">
                    <Lock className="w-4 h-4 text-slate-400 mr-2.5" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-transparent focus:outline-none text-sm text-slate-850 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl font-bold text-white bg-indigo-650 hover:bg-indigo-600 transition-colors text-xs flex items-center justify-center space-x-1.5 ml-auto"
              >
                {saving ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <span>Update Password</span>
                )}
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
};

export default ProfileSettings;
