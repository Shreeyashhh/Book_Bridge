import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Tag, Gift, Trash2, Edit3, CheckCircle, Clock, XCircle, FileText, ChevronRight, Inbox, BookOpen, AlertCircle, Sparkles } from 'lucide-react';
import { MOCK_BOOKS, MOCK_REQUESTS } from '../utils/mockData.js';
import { useAuth } from '../context/AuthContext.jsx';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user, isMockMode } = useAuth();

  // Active Tab
  const [activeTab, setActiveTab] = useState('listings'); // 'listings', 'incoming', 'outgoing'

  // Listings & Requests State
  const [myListings, setMyListings] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Book Modal & Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBookId, setEditingBookId] = useState(null); // Non-null if editing
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [subject, setSubject] = useState('Other');
  const [grade, setGrade] = useState('Undergraduate');
  const [condition, setCondition] = useState('Good');
  const [price, setPrice] = useState(0);
  const [type, setType] = useState('sell');
  const [coverImage, setCoverImage] = useState('');
  const [description, setDescription] = useState('');

  // Form error/sending state
  const [formError, setFormError] = useState('');
  const [formSending, setFormSending] = useState(false);

  // Redirect if guest
  useEffect(() => {
    if (!user) {
      navigate('/auth', { state: { from: '/dashboard' } });
    }
  }, [user, navigate]);

  // Load Dashboard Data
  const loadDashboardData = async () => {
    if (!user) return;
    setLoading(true);

    if (!isMockMode) {
      try {
        // Fetch listings
        const listRes = await fetch('/api/books/user/listings', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const reqRes = await fetch('/api/requests', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (listRes.ok && reqRes.ok) {
          const listingsData = await listRes.json();
          const requestsData = await reqRes.json();
          setMyListings(listingsData);
          setIncomingRequests(requestsData.incoming);
          setOutgoingRequests(requestsData.outgoing);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error("Dashboard fetch failed, using local Mock state.", err);
      }
    }

    // Mock local loads
    const filteredListings = MOCK_BOOKS.filter((b) => b.owner._id === user._id || b.owner === user._id);
    const filteredIncoming = MOCK_REQUESTS.filter((r) => r.seller._id === user._id || r.seller === user._id);
    const filteredOutgoing = MOCK_REQUESTS.filter((r) => r.buyer._id === user._id || r.buyer === user._id);

    setMyListings(filteredListings);
    setIncomingRequests(filteredIncoming);
    setOutgoingRequests(filteredOutgoing);
    setLoading(false);
  };

  useEffect(() => {
    loadDashboardData();
  }, [user, isMockMode]);

  // Add / Edit Form Handler
  const handleSaveBook = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSending(true);

    const payload = {
      title,
      author,
      subject,
      grade,
      condition,
      price: type === 'donate' ? 0 : price,
      type,
      coverImage: coverImage.trim() || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=400&q=80',
      description,
    };

    if (isMockMode) {
      if (editingBookId) {
        // Edit Mode
        const index = MOCK_BOOKS.findIndex((b) => b._id === editingBookId);
        if (index >= 0) {
          MOCK_BOOKS[index] = {
            ...MOCK_BOOKS[index],
            ...payload,
          };
        }
      } else {
        // Create Mode
        const newBook = {
          _id: `book_${Date.now()}`,
          ...payload,
          status: 'available',
          owner: {
            _id: user._id,
            name: user.name,
            avatar: user.avatar,
            school: user.school,
            location: user.location,
          },
          createdAt: new Date().toISOString(),
        };
        MOCK_BOOKS.unshift(newBook);
      }

      setTimeout(() => {
        setFormSending(false);
        resetForm();
        setShowAddModal(false);
        loadDashboardData();
      }, 500);
    } else {
      try {
        const url = editingBookId ? `/api/books/${editingBookId}` : '/api/books';
        const method = editingBookId ? 'PUT' : 'POST';

        const res = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          setFormSending(false);
          resetForm();
          setShowAddModal(false);
          loadDashboardData();
        } else {
          const errData = await res.json();
          setFormSending(false);
          setFormError(errData.message || 'Saving book failed');
        }
      } catch (err) {
        setFormSending(false);
        setFormError('Connection issue: backend could not be reached.');
      }
    }
  };

  // Trigger Edit Book pre-fill
  const handleEditClick = (book) => {
    setEditingBookId(book._id);
    setTitle(book.title);
    setAuthor(book.author);
    setSubject(book.subject);
    setGrade(book.grade);
    setCondition(book.condition);
    setPrice(book.price);
    setType(book.type);
    setCoverImage(book.coverImage);
    setDescription(book.description);
    setShowAddModal(true);
  };

  // Delete Book
  const handleDeleteBook = async (bookId) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;

    if (isMockMode) {
      const idx = MOCK_BOOKS.findIndex((b) => b._id === bookId);
      if (idx >= 0) {
        MOCK_BOOKS.splice(idx, 1);
        loadDashboardData();
      }
    } else {
      try {
        const res = await fetch(`/api/books/${bookId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
          loadDashboardData();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Mark Book Status Sold / Available Toggle
  const handleToggleSold = async (bookId, currentStatus) => {
    const nextStatus = currentStatus === 'available' ? 'sold' : 'available';

    if (isMockMode) {
      const book = MOCK_BOOKS.find((b) => b._id === bookId);
      if (book) {
        book.status = nextStatus;
        loadDashboardData();
      }
    } else {
      try {
        const res = await fetch(`/api/books/${bookId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ status: nextStatus })
        });
        if (res.ok) {
          loadDashboardData();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Handle Action Status on requests (Accept, Reject, Complete)
  const handleRequestStatusChange = async (requestId, nextStatus, bookId) => {
    if (isMockMode) {
      const req = MOCK_REQUESTS.find((r) => r._id === requestId);
      if (req) {
        req.status = nextStatus;

        // If completed, set the mock book as sold
        if (nextStatus === 'completed' && bookId) {
          const book = MOCK_BOOKS.find((b) => b._id === bookId);
          if (book) book.status = 'sold';

          // Reject other requests for same book
          MOCK_REQUESTS.forEach((r) => {
            if (r.book._id === bookId && r._id !== requestId && r.status === 'pending') {
              r.status = 'rejected';
            }
          });
        }

        loadDashboardData();
      }
    } else {
      try {
        const res = await fetch(`/api/requests/${requestId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ status: nextStatus })
        });
        if (res.ok) {
          loadDashboardData();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const resetForm = () => {
    setEditingBookId(null);
    setTitle('');
    setAuthor('');
    setSubject('Other');
    setGrade('Undergraduate');
    setCondition('Good');
    setPrice(0);
    setType('sell');
    setCoverImage('');
    setDescription('');
    setFormError('');
  };

  // Stats Counters
  const activeCount = myListings.filter((b) => b.status === 'available').length;
  const soldCount = myListings.filter((b) => b.status === 'sold').length;
  const pendingRequestsCount = incomingRequests.filter((r) => r.status === 'pending').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-8 border-b border-slate-200/60 dark:border-slate-800/80 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-3xl font-extrabold text-slate-850 dark:text-white">Student Dashboard</h1>
            {isMockMode && (
              <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-[9px] font-bold border border-amber-250/20 text-amber-600 uppercase tracking-widest">
                <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                Sandbox mode
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Hello, {user?.name}. Oversee your listed textbooks and transaction requests.</p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="flex items-center space-x-1.5 px-5 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-100 dark:shadow-none hover:-translate-y-0.5 transition-all duration-300"
        >
          <Plus className="w-4 h-4" />
          <span>List a Textbook</span>
        </button>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Listings</p>
            <p className="text-3xl font-black text-slate-800 dark:text-white mt-1">{activeCount}</p>
          </div>
          <BookOpen className="w-8 h-8 text-indigo-500/80" />
        </div>
        <div className="p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Textbooks Swapped</p>
            <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{soldCount}</p>
          </div>
          <CheckCircle className="w-8 h-8 text-emerald-500/80" />
        </div>
        <div className="p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Offers</p>
            <p className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-1">{pendingRequestsCount}</p>
          </div>
          <Clock className="w-8 h-8 text-amber-500/80" />
        </div>
      </div>

      {/* Tab Panels Layout */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-8">
        <button
          onClick={() => setActiveTab('listings')}
          className={`pb-3 text-sm font-bold border-b-2 mr-8 transition-colors ${
            activeTab === 'listings'
              ? 'border-indigo-600 text-indigo-600 dark:border-violet-400 dark:text-violet-400'
              : 'border-transparent text-slate-450 hover:text-slate-650'
          }`}
        >
          My Listings ({myListings.length})
        </button>
        <button
          onClick={() => setActiveTab('incoming')}
          className={`pb-3 text-sm font-bold border-b-2 mr-8 transition-colors ${
            activeTab === 'incoming'
              ? 'border-indigo-600 text-indigo-600 dark:border-violet-400 dark:text-violet-400'
              : 'border-transparent text-slate-450 hover:text-slate-650'
          }`}
        >
          Requests Received ({incomingRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('outgoing')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'outgoing'
              ? 'border-indigo-600 text-indigo-600 dark:border-violet-400 dark:text-violet-400'
              : 'border-transparent text-slate-450 hover:text-slate-650'
          }`}
        >
          Requests Sent ({outgoingRequests.length})
        </button>
      </div>

      {/* Tab Contents */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <span className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></span>
        </div>
      ) : (
        <>
          {/* TAB 1: USER LISTINGS */}
          {activeTab === 'listings' && (
            <div>
              {myListings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {myListings.map((book) => (
                    <div
                      key={book._id}
                      className="p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-start space-x-4 relative"
                    >
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-20 h-24 rounded-lg object-cover bg-slate-100 flex-shrink-0"
                      />
                      
                      <div className="space-y-1.5 flex-grow min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                            book.status === 'available'
                              ? 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 border border-green-200/50'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
                          }`}>
                            {book.status}
                          </span>
                          <span className="text-[10px] text-slate-400">{book.subject}</span>
                        </div>

                        <h3 className="font-bold text-slate-850 dark:text-white truncate text-base leading-tight pr-6">{book.title}</h3>
                        <p className="text-xs text-slate-500 truncate">by {book.author}</p>
                        
                        <div className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                          {book.type === 'donate' ? 'Free (Donation)' : `$${book.price}`}
                        </div>

                        {/* Actions buttons */}
                        <div className="flex items-center space-x-3 pt-3">
                          <button
                            onClick={() => handleToggleSold(book._id, book.status)}
                            className="flex items-center space-x-1 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350 transition-colors"
                          >
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                            <span>{book.status === 'available' ? 'Mark Sold' : 'Mark Available'}</span>
                          </button>
                          
                          <button
                            onClick={() => handleEditClick(book)}
                            className="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/45 rounded-lg transition-colors"
                            title="Edit Listing"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteBook(book._id)}
                            className="p-2 text-rose-500 hover:bg-rose-550/10 rounded-lg transition-colors"
                            title="Delete Listing"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 border-2 border-dashed border-slate-250 dark:border-slate-850 rounded-2xl">
                  <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <h3 className="font-bold text-slate-800 dark:text-white">No books listed yet</h3>
                  <p className="text-sm text-slate-500 mt-1 mb-4">List your old textbooks and find eager buyers/receivers on campus.</p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
                  >
                    Create a Listing
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: INCOMING REQUESTS (RECEIVED) */}
          {activeTab === 'incoming' && (
            <div className="space-y-4">
              {incomingRequests.length > 0 ? (
                incomingRequests.map((req) => (
                  <div
                    key={req._id}
                    className="p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col md:flex-row justify-between gap-6"
                  >
                    {/* Buyer & Book Details */}
                    <div className="space-y-4 flex-grow">
                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded flex items-center space-x-1 ${
                          req.status === 'pending'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                            : req.status === 'approved'
                            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                            : req.status === 'completed'
                            ? 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                        }`}>
                          {req.status}
                        </span>
                        <span className="text-xs text-slate-400">Request ID: {req._id}</span>
                      </div>

                      <div className="flex items-start space-x-4">
                        <img
                          src={req.book?.coverImage}
                          alt="book"
                          className="w-14 h-18 object-cover rounded bg-slate-100 flex-shrink-0"
                        />
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-450 uppercase">Textbook Requested</p>
                          <Link to={`/books/${req.book?._id}`} className="font-extrabold text-slate-800 dark:text-white hover:text-indigo-600 hover:underline text-base block leading-tight">
                            {req.book?.title}
                          </Link>
                          <p className="text-xs text-slate-500">
                            Listing Type: {req.type === 'donate' ? 'Free Donation' : `Sell Price $${req.book?.price}`}
                          </p>
                        </div>
                      </div>

                      {/* Requester Profile */}
                      <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl flex items-center justify-between border border-slate-100 dark:border-slate-850">
                        <div className="flex items-center space-x-2.5">
                          <img
                            src={req.buyer?.avatar}
                            alt="buyer avatar"
                            className="w-8 h-8 rounded-lg"
                          />
                          <div className="text-xs">
                            <p className="font-bold text-slate-700 dark:text-slate-300">{req.buyer?.name}</p>
                            <p className="text-[10px] text-slate-500">{req.buyer?.school}</p>
                          </div>
                        </div>

                        {req.type === 'sell' && (
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-slate-450 uppercase">Proposed Offer</p>
                            <p className="text-base font-black text-indigo-600 dark:text-violet-400">${req.proposedPrice}</p>
                          </div>
                        )}
                      </div>

                      {req.message && (
                        <div className="text-xs bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850/80 p-3 rounded-xl">
                          <p className="font-semibold text-slate-450 uppercase text-[9px] mb-1">Buyer Note</p>
                          <p className="text-slate-600 dark:text-slate-455">"{req.message}"</p>
                        </div>
                      )}
                    </div>

                    {/* Operational controls */}
                    <div className="flex flex-row md:flex-col justify-end gap-3 self-end md:self-center">
                      {req.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleRequestStatusChange(req._id, 'approved', req.book?._id)}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-650 hover:bg-indigo-600 transition-colors"
                          >
                            Approve Offer
                          </button>
                          <button
                            onClick={() => handleRequestStatusChange(req._id, 'rejected', req.book?._id)}
                            className="px-4 py-2 rounded-xl text-xs font-bold border border-rose-200 hover:bg-rose-50 text-rose-600 dark:border-rose-900/40 dark:hover:bg-rose-950/20 dark:text-rose-400 transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {req.status === 'approved' && (
                        <>
                          <button
                            onClick={() => handleRequestStatusChange(req._id, 'completed', req.book?._id)}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors"
                          >
                            Complete Swap
                          </button>
                          <button
                            onClick={() => handleRequestStatusChange(req._id, 'rejected', req.book?._id)}
                            className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                          >
                            Reject Swap
                          </button>
                        </>
                      )}

                      {(req.status === 'completed' || req.status === 'rejected' || req.status === 'cancelled') && (
                        <div className="text-xs text-slate-400 dark:text-slate-500 italic flex items-center space-x-1 justify-end">
                          <span>Request completed and archived.</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 border-2 border-dashed border-slate-250 dark:border-slate-850 rounded-2xl">
                  <Inbox className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <h3 className="font-bold text-slate-800 dark:text-white">No requests received yet</h3>
                  <p className="text-sm text-slate-500 mt-1">Pending student purchase or swap offers will be displayed here.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: OUTGOING REQUESTS (SENT) */}
          {activeTab === 'outgoing' && (
            <div className="space-y-4">
              {outgoingRequests.length > 0 ? (
                outgoingRequests.map((req) => (
                  <div
                    key={req._id}
                    className="p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col md:flex-row justify-between gap-6"
                  >
                    <div className="space-y-4 flex-grow">
                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          req.status === 'pending'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                            : req.status === 'approved'
                            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                            : req.status === 'completed'
                            ? 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                        }`}>
                          {req.status}
                        </span>
                        <span className="text-xs text-slate-400">Request Sent on {new Date(req.createdAt).toLocaleDateString()}</span>
                      </div>

                      <div className="flex items-start space-x-4">
                        <img
                          src={req.book?.coverImage}
                          alt="book"
                          className="w-14 h-18 object-cover rounded bg-slate-100 flex-shrink-0"
                        />
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-450 uppercase">Textbook Info</p>
                          <Link to={`/books/${req.book?._id}`} className="font-extrabold text-slate-800 dark:text-white hover:text-indigo-650 hover:underline text-base block leading-tight">
                            {req.book?.title}
                          </Link>
                          <p className="text-xs text-slate-500">
                            Seller: <span className="font-semibold text-slate-700 dark:text-slate-350">{req.seller?.name}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl text-xs max-w-sm">
                        <span className="text-slate-450">Proposed Offer</span>
                        <span className="font-bold text-indigo-600 dark:text-violet-400 text-sm">
                          {req.type === 'donate' ? 'Free Donation' : `$${req.proposedPrice}`}
                        </span>
                      </div>
                    </div>

                    <div className="self-end md:self-center">
                      {req.status === 'pending' && (
                        <button
                          onClick={() => handleRequestStatusChange(req._id, 'cancelled', req.book?._id)}
                          className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-300 transition-colors"
                        >
                          Cancel Request
                        </button>
                      )}
                      
                      {req.status === 'approved' && (
                        <div className="text-xs text-indigo-600 dark:text-violet-400 font-semibold italic">
                          Approved! Arrange meet-up in chat with {req.seller?.name}.
                        </div>
                      )}

                      {req.status === 'completed' && (
                        <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center space-x-1">
                          <CheckCircle className="w-4 h-4" />
                          <span>Swap Complete</span>
                        </div>
                      )}

                      {(req.status === 'rejected' || req.status === 'cancelled') && (
                        <div className="text-xs text-slate-400 dark:text-slate-500 italic">
                          Archived
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 border-2 border-dashed border-slate-250 dark:border-slate-850 rounded-2xl">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <h3 className="font-bold text-slate-800 dark:text-white">No request history</h3>
                  <p className="text-sm text-slate-500 mt-1">Swaps or purchase offers you submit to other students will show here.</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Listing Creation / Editing Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative my-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            <h2 className="text-2xl font-bold text-slate-850 dark:text-white mb-2">
              {editingBookId ? 'Edit Textbook Listing' : 'List a Textbook'}
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Fill out the textbook particulars. Provide clear condition assessments and a description.
            </p>

            <form onSubmit={handleSaveBook} className="space-y-4">
              {formError && (
                <div className="p-3 text-xs font-semibold rounded-xl bg-rose-50 border border-rose-200 text-rose-600 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-455 flex items-center space-x-1.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Textbook Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Introduction to Algorithms"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-sm focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Author(s)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Thomas H. Cormen"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Subject Area</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-350 text-sm focus:outline-none"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science</option>
                    <option value="Literature & Languages">Literature & Languages</option>
                    <option value="Social Sciences & History">Social Sciences & History</option>
                    <option value="Engineering & Tech">Engineering & Tech</option>
                    <option value="Business & Economics">Business & Economics</option>
                    <option value="Arts & Humanities">Arts & Humanities</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Grade Level</label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-350 text-sm focus:outline-none"
                  >
                    <option value="Middle School">Middle School</option>
                    <option value="High School">High School</option>
                    <option value="Undergraduate">Undergraduate</option>
                    <option value="Postgraduate">Postgraduate</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Condition</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-350 text-sm focus:outline-none"
                  >
                    <option value="New">New</option>
                    <option value="Like New">Like New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Transaction Intent</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setType('sell')}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        type === 'sell'
                          ? 'border-indigo-650 bg-indigo-50 text-indigo-700 dark:border-violet-500 dark:bg-violet-950/30 dark:text-violet-300'
                          : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-850 text-slate-500'
                      }`}
                    >
                      Sell Textbook
                    </button>
                    <button
                      type="button"
                      onClick={() => setType('donate')}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        type === 'donate'
                          ? 'border-emerald-650 bg-emerald-50 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-950/30 dark:text-emerald-300'
                          : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-850 text-slate-500'
                      }`}
                    >
                      Free Donation
                    </button>
                  </div>
                </div>

                {type === 'sell' && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Asking Price ($)</label>
                    <input
                      type="number"
                      required={type === 'sell'}
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-sm focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Cover Image URL</label>
                <input
                  type="text"
                  placeholder="e.g. https://images.unsplash.com/photo-..."
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-sm focus:outline-none"
                />
                <p className="text-[10px] text-slate-400 italic">Leave empty to use a generic textbooks backdrop illustration.</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Description / Swap Details</label>
                <textarea
                  required
                  rows="4"
                  placeholder="Tell students details such as specific coursework match, markings/highlights inside, or how/where they can collect..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-100 text-sm focus:outline-none"
                ></textarea>
              </div>

              <div className="flex space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 border border-slate-250 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-850 rounded-xl font-bold text-sm text-slate-700 dark:text-slate-350"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={formSending}
                  className="flex-1 py-3 rounded-xl font-bold text-white bg-indigo-650 hover:bg-indigo-600 transition-colors flex items-center justify-center space-x-1.5"
                >
                  {formSending ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <span>Save Listing</span>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default UserDashboard;
