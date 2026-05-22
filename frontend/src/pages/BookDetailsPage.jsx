import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Tag, Gift, MapPin, University, Send, MessageSquare, AlertCircle, Heart, ChevronRight, ArrowLeft } from 'lucide-react';
import { MOCK_BOOKS, MOCK_REQUESTS, MOCK_CHATS } from '../utils/mockData.js';
import { useAuth } from '../context/AuthContext.jsx';
import BookCard from '../components/BookCard.jsx';

const BookDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isMockMode, setUser } = useAuth();

  const [book, setBook] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Request Modal States
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [proposedPrice, setProposedPrice] = useState(0);
  const [requestMessage, setRequestMessage] = useState('');
  const [requestSending, setRequestSending] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [requestError, setRequestError] = useState('');

  useEffect(() => {
    const loadBookData = async () => {
      setLoading(true);
      if (!isMockMode) {
        try {
          const res = await fetch(`/api/books/${id}`);
          if (res.ok) {
            const data = await res.json();
            setBook(data);
            setProposedPrice(data.price);
            
            // Fetch recommendations
            const recRes = await fetch(`/api/books/${id}/recommendations`);
            if (recRes.ok) {
              const recData = await recRes.json();
              setRecommendations(recData);
            }
            setLoading(false);
            return;
          }
        } catch (err) {
          console.error(err);
        }
      }

      // Mock Local Loader
      const found = MOCK_BOOKS.find((b) => b._id === id);
      if (found) {
        setBook(found);
        setProposedPrice(found.price);

        // Mock recommendations (same subject/grade, excluding self)
        const recs = MOCK_BOOKS.filter(
          (b) => b._id !== found._id && (b.subject === found.subject || b.grade === found.grade)
        ).slice(0, 4);
        setRecommendations(recs);
      }
      setLoading(false);
    };

    loadBookData();
  }, [id, isMockMode]);

  useEffect(() => {
    if (user && book) {
      setIsWishlisted(user.wishlist.includes(book._id));
    }
  }, [user, book]);

  // Wishlist Toggler
  const handleWishlistToggle = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (isMockMode) {
      const updatedWishlist = [...user.wishlist];
      const index = updatedWishlist.indexOf(book._id);
      if (index >= 0) {
        updatedWishlist.splice(index, 1);
      } else {
        updatedWishlist.push(book._id);
      }
      const updatedUser = { ...user, wishlist: updatedWishlist };
      setUser(updatedUser);
      localStorage.setItem('mock_user', JSON.stringify(updatedUser));
      setIsWishlisted(!isWishlisted);
    } else {
      try {
        const res = await fetch(`/api/books/${book._id}/wishlist`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setUser({ ...user, wishlist: data.wishlist });
          setIsWishlisted(!isWishlisted);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Chat Creation / Redirection
  const handleStartChat = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (isMockMode) {
      // Find or create mock chat session
      let existingChat = MOCK_CHATS.find(
        (c) => c.bookRef._id === book._id && c.participants.some((p) => p._id === book.owner._id)
      );

      if (!existingChat) {
        existingChat = {
          _id: `chat_${Date.now()}`,
          participants: [
            { _id: user._id, name: user.name, avatar: user.avatar, school: user.school },
            { _id: book.owner._id, name: book.owner.name, avatar: book.owner.avatar, school: book.owner.school }
          ],
          bookRef: {
            _id: book._id,
            title: book.title,
            coverImage: book.coverImage,
            price: book.price,
            type: book.type,
            status: book.status
          },
          lastMessage: `Hi ${book.owner.name}, I am interested in ${book.title}!`,
          updatedAt: new Date().toISOString()
        };
        MOCK_CHATS.unshift(existingChat);
      }

      navigate('/chat', { state: { selectedChatId: existingChat._id } });
    } else {
      try {
        const res = await fetch('/api/chats', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ bookId: book._id, sellerId: book.owner._id })
        });
        if (res.ok) {
          const chat = await res.json();
          navigate('/chat', { state: { selectedChatId: chat._id } });
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Submit Request
  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!user) return;

    setRequestSending(true);
    setRequestError('');

    if (isMockMode) {
      // Create Mock request
      const newRequest = {
        _id: `req_${Date.now()}`,
        book: {
          _id: book._id,
          title: book.title,
          coverImage: book.coverImage,
          price: book.price,
          type: book.type,
          status: book.status
        },
        buyer: {
          _id: user._id,
          name: user.name,
          avatar: user.avatar,
          school: user.school,
          location: user.location
        },
        seller: {
          _id: book.owner._id,
          name: book.owner.name,
          avatar: book.owner.avatar
        },
        status: 'pending',
        type: book.type,
        proposedPrice: book.type === 'donate' ? 0 : proposedPrice,
        message: requestMessage,
        createdAt: new Date().toISOString()
      };

      MOCK_REQUESTS.unshift(newRequest);
      setTimeout(() => {
        setRequestSending(false);
        setRequestSuccess(true);
        // Automatically hide modal after 2 seconds
        setTimeout(() => {
          setShowRequestModal(false);
          setRequestSuccess(false);
          setRequestMessage('');
        }, 2000);
      }, 800);
    } else {
      try {
        const res = await fetch('/api/requests', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            bookId: book._id,
            type: book.type,
            proposedPrice: book.type === 'donate' ? 0 : proposedPrice,
            message: requestMessage
          })
        });

        const data = await res.json();
        setRequestSending(false);

        if (res.ok) {
          setRequestSuccess(true);
          setTimeout(() => {
            setShowRequestModal(false);
            setRequestSuccess(false);
            setRequestMessage('');
          }, 2000);
        } else {
          setRequestError(data.message || 'Request failed. You might already have a pending request.');
        }
      } catch (err) {
        setRequestSending(false);
        setRequestError('Could not connect to the API server.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <span className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></span>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-16 h-16 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Textbook Not Found</h2>
        <p className="text-slate-500">The listing may have been deleted, marked sold, or hidden by moderators.</p>
        <Link to="/browse" className="inline-block px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold">
          Back to Catalogue
        </Link>
      </div>
    );
  }

  const isOwner = user && user._id === book.owner._id;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-1 text-sm font-semibold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-violet-400 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Go Back</span>
      </button>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Cover Image Gallery Column */}
        <div className="lg:col-span-1 space-y-4">
          <div className="aspect-[3/4] w-full rounded-2xl border border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-md">
            <img
              src={book.coverImage}
              alt={book.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          <button
            onClick={handleWishlistToggle}
            className={`w-full flex items-center justify-center space-x-2 py-3 rounded-xl border font-bold text-sm transition-all ${
              isWishlisted
                ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/20 dark:border-rose-900/60 dark:text-rose-450'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-550 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-350 dark:hover:bg-slate-850'
            }`}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
            <span>{isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
          </button>
        </div>

        {/* Textbook Metadata & Details Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            
            {/* Subject and tags row */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 text-xs font-bold bg-indigo-50 dark:bg-slate-800 text-indigo-700 dark:text-violet-400 rounded-lg">
                {book.subject}
              </span>
              <span className="px-3 py-1 text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-300 rounded-lg uppercase tracking-wider">
                {book.condition} Condition
              </span>
              <span className="px-3 py-1 text-xs font-bold bg-slate-105 dark:bg-slate-805 text-slate-600 dark:text-slate-400 rounded-lg">
                {book.grade}
              </span>
            </div>

            {/* Title & Author */}
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-850 dark:text-white leading-tight">
              {book.title}
            </h1>
            <p className="text-base text-slate-500 dark:text-slate-400">Written by <span className="font-semibold text-slate-700 dark:text-slate-200">{book.author}</span></p>

            {/* Price section */}
            <div className="flex items-center space-x-4 py-4 px-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 bg-white dark:bg-slate-900 w-fit shadow-sm">
              <div className="space-y-0.5">
                <p className="text-[10px] text-slate-450 uppercase font-bold tracking-widest">Listing Type</p>
                <div className="flex items-center space-x-1.5">
                  {book.type === 'donate' ? (
                    <>
                      <Gift className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Donation</span>
                    </>
                  ) : (
                    <>
                      <Tag className="w-4 h-4 text-indigo-500" />
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">For Sale</span>
                    </>
                  )}
                </div>
              </div>

              <div className="h-8 border-l border-slate-200 dark:border-slate-800"></div>

              <div>
                <p className="text-[10px] text-slate-450 uppercase font-bold tracking-widest">Cost</p>
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {book.type === 'donate' ? 'FREE' : `$${book.price}`}
                </span>
              </div>
            </div>

            {/* Availability status banner */}
            {book.status !== 'available' && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 dark:bg-amber-950/20 dark:border-amber-900/50 dark:text-amber-400 text-sm font-semibold flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>This textbook has been marked as {book.status} and is no longer exchangeable.</span>
              </div>
            )}

            {/* Action Bar (Buyer options) */}
            {book.status === 'available' && !isOwner && (
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <button
                  onClick={() => setShowRequestModal(true)}
                  className="flex-grow py-3.5 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-sm shadow-md shadow-indigo-150 dark:shadow-none hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{book.type === 'donate' ? 'Request Textbook' : 'Make Offer / Buy'}</span>
                </button>

                <button
                  onClick={handleStartChat}
                  className="py-3.5 px-6 rounded-xl font-bold border border-slate-250 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-250 text-sm shadow-sm transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <MessageSquare className="w-4 h-4 text-indigo-500" />
                  <span>Chat with Seller</span>
                </button>
              </div>
            )}

            {isOwner && (
              <div className="pt-2">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center space-x-2 py-3 px-6 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 text-sm shadow-sm transition-all"
                >
                  <span>Manage in Dashboard</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}

          </div>

          <hr className="border-slate-200 dark:border-slate-850" />

          {/* Description */}
          <div className="space-y-2">
            <h3 className="font-bold text-lg text-slate-850 dark:text-white">Listing Description</h3>
            <p className="text-sm text-slate-650 dark:text-slate-400 leading-relaxed whitespace-pre-line">
              {book.description}
            </p>
          </div>

          {/* Table Details */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-slate-850 dark:text-white">Textbook Attributes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/50 dark:border-slate-800/80 bg-white dark:bg-slate-900 text-sm">
                <span className="text-slate-450">Language</span>
                <span className="font-semibold text-slate-750 dark:text-slate-200">{book.language || 'English'}</span>
              </div>
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/50 dark:border-slate-800/80 bg-white dark:bg-slate-900 text-sm">
                <span className="text-slate-450">Category Subject</span>
                <span className="font-semibold text-slate-750 dark:text-slate-200">{book.subject}</span>
              </div>
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/50 dark:border-slate-800/80 bg-white dark:bg-slate-900 text-sm">
                <span className="text-slate-450">Grade Targeting</span>
                <span className="font-semibold text-slate-750 dark:text-slate-200">{book.grade}</span>
              </div>
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/50 dark:border-slate-800/80 bg-white dark:bg-slate-900 text-sm">
                <span className="text-slate-450">Listed Date</span>
                <span className="font-semibold text-slate-750 dark:text-slate-200">
                  {new Date(book.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          <hr className="border-slate-200 dark:border-slate-850" />

          {/* Seller Profile Information */}
          <div className="p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-850 dark:text-slate-200 text-base">Listed by Student</h3>
            <div className="flex items-start space-x-4">
              <img
                src={book.owner?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=default'}
                alt={book.owner?.name}
                className="w-12 h-12 rounded-xl object-cover bg-indigo-50"
              />
              <div className="space-y-1.5 flex-grow">
                <p className="font-bold text-slate-800 dark:text-white leading-none">{book.owner?.name}</p>
                
                <div className="flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center space-x-1">
                    <University className="w-3.5 h-3.5 text-slate-400" />
                    <span>{book.owner?.school || 'School/University details not provided'}</span>
                  </span>
                  {book.owner?.location && (
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{book.owner.location}</span>
                    </span>
                  )}
                </div>

                {book.owner?.bio && (
                  <p className="text-xs text-slate-500 leading-relaxed italic bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    "{book.owner.bio}"
                  </p>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Recommended books segment */}
      {recommendations.length > 0 && (
        <section className="mt-16 pt-10 border-t border-slate-200/60 dark:border-slate-850">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">You might also like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {recommendations.map((rec) => (
              <BookCard key={rec._id} book={rec} />
            ))}
          </div>
        </section>
      )}

      {/* Offer / Request Modal Dialog */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative animate-slide-up">
            
            <h2 className="text-xl font-bold text-slate-850 dark:text-white mb-2">
              {book.type === 'donate' ? 'Submit Textbook Request' : 'Submit Buy Offer'}
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Sending a request notifies the seller. Ensure to schedule a safe meetup location.
            </p>

            {requestSuccess ? (
              <div className="py-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-650 flex items-center justify-center mx-auto">
                  <Send className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-emerald-600 dark:text-emerald-400">Request Sent Successfully!</h3>
                <p className="text-xs text-slate-500">Negotiations are pending owner review. View progress on your Dashboard.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitRequest} className="space-y-4">
                {requestError && (
                  <div className="p-3 text-xs font-semibold rounded-xl bg-rose-50 border border-rose-200 text-rose-600 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-450 flex items-center space-x-1.5">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{requestError}</span>
                  </div>
                )}

                {book.type === 'sell' && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Your Offer Price ($)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={proposedPrice}
                      onChange={(e) => setProposedPrice(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 font-bold"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">Custom Message</label>
                  <textarea
                    rows="4"
                    required
                    placeholder="Provide details such as when you can meet up, which classes you need this for, or a contact details fallback..."
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-850 dark:text-slate-100"
                  ></textarea>
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRequestModal(false)}
                    className="flex-1 py-3 border border-slate-250 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-855 rounded-xl font-bold text-sm text-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={requestSending}
                    className="flex-1 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 dark:bg-violet-650 dark:hover:bg-violet-550 text-sm flex items-center justify-center space-x-1.5"
                  >
                    {requestSending ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <span>Submit Request</span>
                        <Send className="w-3.5 h-3.5" />
                      </>
                    )}
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

export default BookDetailsPage;
