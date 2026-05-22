import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Users, BookOpen, Key, Trash2, ShieldAlert, CheckCircle, BarChart3, AlertCircle } from 'lucide-react';
import { MOCK_USERS, MOCK_BOOKS } from '../utils/mockData.js';
import { useAuth } from '../context/AuthContext.jsx';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isMockMode } = useAuth();

  // Redirect if not admin
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    } else if (user.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Tab State
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'moderation'

  // DB States
  const [usersList, setUsersList] = useState([]);
  const [booksList, setBooksList] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalBooks: 0,
    soldBooks: 0,
    availableBooks: 0,
  });
  const [loading, setLoading] = useState(true);

  // Password reset modal states
  const [resettingUser, setResettingUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  // Fetch admin dashboard details
  const fetchAdminData = async () => {
    if (!user || user.role !== 'admin') return;
    setLoading(true);

    if (!isMockMode) {
      try {
        const usersRes = await fetch('/api/auth/users', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const booksRes = await fetch('/api/books?pageSize=100'); // Load large set for moderation
        const analyticsRes = await fetch('/api/books/admin/analytics', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (usersRes.ok && booksRes.ok && analyticsRes.ok) {
          const usersData = await usersRes.json();
          const booksData = await booksRes.json();
          const analyticsData = await analyticsRes.json();

          setUsersList(usersData);
          setBooksList(booksData.books);
          setAnalytics(analyticsData);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error("Admin fetch failed, using local Mock state.", err);
      }
    }

    // Mock local updates
    const localUsers = JSON.parse(localStorage.getItem('users_db')) || MOCK_USERS;
    setUsersList(localUsers);
    setBooksList(MOCK_BOOKS);
    
    setAnalytics({
      totalUsers: localUsers.length,
      totalBooks: MOCK_BOOKS.length,
      soldBooks: MOCK_BOOKS.filter(b => b.status === 'sold').length,
      availableBooks: MOCK_BOOKS.filter(b => b.status === 'available').length,
    });
    setLoading(false);
  };

  useEffect(() => {
    fetchAdminData();
  }, [user, isMockMode]);

  // Admin delete user
  const handleDeleteUser = async (userId, userName) => {
    if (userId === user._id) return alert('You cannot delete your own admin account.');
    if (!window.confirm(`Are you sure you want to permanently delete user account: ${userName}?`)) return;

    if (isMockMode) {
      const localUsers = JSON.parse(localStorage.getItem('users_db')) || MOCK_USERS;
      const idx = localUsers.findIndex(u => u._id === userId);
      if (idx >= 0) {
        localUsers.splice(idx, 1);
        localStorage.setItem('users_db', JSON.stringify(localUsers));
        fetchAdminData();
      }
    } else {
      try {
        const res = await fetch(`/api/auth/users/${userId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) fetchAdminData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Admin password reset
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resettingUser) return;

    if (isMockMode) {
      // In mock mode, password resets just show success immediately
      setResetSuccess(`Password reset successfully for ${resettingUser.name}`);
      setTimeout(() => {
        setResetSuccess('');
        setResettingUser(null);
        setNewPassword('');
      }, 2000);
    } else {
      try {
        const res = await fetch(`/api/auth/users/${resettingUser._id}/reset-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ newPassword })
        });
        if (res.ok) {
          setResetSuccess(`Password reset successfully for ${resettingUser.name}`);
          setTimeout(() => {
            setResetSuccess('');
            setResettingUser(null);
            setNewPassword('');
          }, 2000);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Admin delete listing (Moderation)
  const handleDeleteListing = async (bookId, bookTitle) => {
    if (!window.confirm(`Are you sure you want to remove textbook listing: "${bookTitle}"?`)) return;

    if (isMockMode) {
      const idx = MOCK_BOOKS.findIndex(b => b._id === bookId);
      if (idx >= 0) {
        MOCK_BOOKS.splice(idx, 1);
        fetchAdminData();
      }
    } else {
      try {
        const res = await fetch(`/api/books/${bookId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) fetchAdminData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-8 border-b border-slate-200/60 dark:border-slate-800/80 gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-3xl font-extrabold text-slate-850 dark:text-white flex items-center space-x-2">
              <ShieldAlert className="w-8 h-8 text-rose-500" />
              <span>Admin Console</span>
            </h1>
            <span className="px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-xs font-bold text-rose-600 dark:text-rose-400 border border-rose-205/20 uppercase tracking-widest">
              Root Control
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Platform management: Moderate textbook lists, reset credentials, and view metrics.</p>
        </div>
      </div>

      {/* Analytics widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-10">
        <div className="p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Members</p>
            <p className="text-3xl font-black text-slate-800 dark:text-white mt-1">{analytics.totalUsers}</p>
          </div>
          <Users className="w-8 h-8 text-indigo-500/80" />
        </div>
        <div className="p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Listings</p>
            <p className="text-3xl font-black text-slate-800 dark:text-white mt-1">{analytics.totalBooks}</p>
          </div>
          <BookOpen className="w-8 h-8 text-purple-500/80" />
        </div>
        <div className="p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Available Books</p>
            <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{analytics.availableBooks}</p>
          </div>
          <CheckCircle className="w-8 h-8 text-emerald-500/80" />
        </div>
        <div className="p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sold / Exchanged</p>
            <p className="text-3xl font-black text-rose-500 dark:text-rose-455 mt-1">{analytics.soldBooks}</p>
          </div>
          <BarChart3 className="w-8 h-8 text-rose-500/80" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-8">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 text-sm font-bold border-b-2 mr-8 transition-colors ${
            activeTab === 'users'
              ? 'border-rose-500 text-rose-600 dark:border-rose-400 dark:text-rose-400'
              : 'border-transparent text-slate-450 hover:text-slate-650'
          }`}
        >
          User Account Registry ({usersList.length})
        </button>
        <button
          onClick={() => setActiveTab('moderation')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'moderation'
              ? 'border-rose-500 text-rose-600 dark:border-rose-400 dark:text-rose-400'
              : 'border-transparent text-slate-450 hover:text-slate-650'
          }`}
        >
          Book Moderation ({booksList.length})
        </button>
      </div>

      {/* Contents */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <span className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></span>
        </div>
      ) : (
        <>
          {/* TAB 1: USER REGISTRY */}
          {activeTab === 'users' && (
            <div className="p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400 min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <th className="py-4">Student Profile</th>
                    <th className="py-4">Email</th>
                    <th className="py-4">Institution</th>
                    <th className="py-4">Role</th>
                    <th className="py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {usersList.map((usr) => (
                    <tr key={usr._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                      <td className="py-4 flex items-center space-x-3">
                        <img
                          src={usr.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=default'}
                          alt="avatar"
                          className="w-9 h-9 rounded-lg"
                        />
                        <span className="font-extrabold text-slate-800 dark:text-slate-200">{usr.name}</span>
                      </td>
                      <td className="py-4 text-xs font-semibold">{usr.email}</td>
                      <td className="py-4 text-xs">{usr.school || 'Not specified'}</td>
                      <td className="py-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          usr.role === 'admin'
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/50'
                            : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                        }`}>
                          {usr.role}
                        </span>
                      </td>
                      <td className="py-4 text-right space-x-2">
                        <button
                          onClick={() => setResettingUser(usr)}
                          className="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/45 rounded-lg transition-colors"
                          title="Reset Password"
                        >
                          <Key className="w-4 h-4 inline" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(usr._id, usr.name)}
                          disabled={usr.role === 'admin'}
                          className="p-2 text-rose-500 hover:bg-rose-550/10 rounded-lg disabled:opacity-30 disabled:pointer-events-none transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: BOOK MODERATION */}
          {activeTab === 'moderation' && (
            <div className="p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400 min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <th className="py-4">Textbook Info</th>
                    <th className="py-4">Owner</th>
                    <th className="py-4">Subject</th>
                    <th className="py-4">Condition</th>
                    <th className="py-4">Price/Type</th>
                    <th className="py-4 text-right">Moderator actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {booksList.map((bk) => (
                    <tr key={bk._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                      <td className="py-4 flex items-center space-x-3">
                        <img
                          src={bk.coverImage}
                          alt="cover"
                          className="w-10 h-14 object-cover rounded bg-slate-100"
                        />
                        <div className="max-w-[200px]">
                          <p className="font-extrabold text-slate-800 dark:text-slate-200 truncate">{bk.title}</p>
                          <p className="text-[10px] text-slate-400 truncate">by {bk.author}</p>
                        </div>
                      </td>
                      <td className="py-4 text-xs font-semibold">{bk.owner?.name || 'Unknown Student'}</td>
                      <td className="py-4 text-xs">{bk.subject}</td>
                      <td className="py-4 text-xs">{bk.condition}</td>
                      <td className="py-4 text-xs font-bold text-slate-700 dark:text-slate-300">
                        {bk.type === 'donate' ? 'FREE (Donated)' : `$${bk.price} (Sale)`}
                      </td>
                      <td className="py-4 text-right">
                        <button
                          onClick={() => handleDeleteListing(bk._id, bk.title)}
                          className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 border border-rose-250/20 hover:bg-rose-50 dark:hover:bg-rose-950/20 flex items-center space-x-1.5 ml-auto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Password Reset Modal */}
      {resettingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative animate-slide-up">
            
            <h2 className="text-xl font-bold text-slate-850 dark:text-white mb-2">Reset Password</h2>
            <p className="text-xs text-slate-500 mb-6">Reset user credentials for student: <span className="font-bold text-slate-750 dark:text-slate-300">{resettingUser.name}</span></p>

            {resetSuccess ? (
              <div className="py-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-650 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-emerald-600 dark:text-emerald-400">{resetSuccess}</h3>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">New Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter new strong password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-100 text-sm focus:outline-none"
                  />
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setResettingUser(null);
                      setNewPassword('');
                    }}
                    className="flex-1 py-2.5 border border-slate-250 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-850 rounded-xl font-bold text-sm text-slate-750 dark:text-slate-350"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-500 transition-colors text-sm"
                  >
                    Submit Reset
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
