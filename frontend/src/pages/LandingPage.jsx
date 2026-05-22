import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Tag, Gift, MessageSquare, ShieldCheck, ArrowRight, BookOpen, Star } from 'lucide-react';
import { MOCK_BOOKS } from '../utils/mockData.js';
import { useAuth } from '../context/AuthContext.jsx';
import BookCard from '../components/BookCard.jsx';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchVal, setSearchVal] = useState('');
  const [featuredBooks, setFeaturedBooks] = useState([]);

  useEffect(() => {
    // Show first 3-4 books on landing page
    setFeaturedBooks(MOCK_BOOKS.slice(0, 4));
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchVal.trim())}`);
    } else {
      navigate('/browse');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      
      {/* Background glow effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full glow-purple opacity-40 dark:opacity-30 pointer-events-none"></div>
      <div className="absolute top-[20%] right-[-15%] w-[800px] h-[800px] rounded-full glow-blue opacity-30 dark:opacity-20 pointer-events-none"></div>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          {/* Tagline Badge */}
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border border-indigo-100 bg-indigo-50/50 dark:border-slate-800 dark:bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-ping"></span>
            <span className="text-xs font-bold text-indigo-700 dark:text-violet-400">Sustainable Textbook Exchanges for Students</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight font-sans">
            Bridge the Gap on{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 dark:from-violet-400 dark:to-blue-400">
              Textbook Costs
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Buy, sell, or donate textbooks directly within your student community. Save money, reduce paper waste, and help peer students succeed.
          </p>

          {/* Elegant Search Bar */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto p-1.5 flex flex-col sm:flex-row items-center gap-2 bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-100 dark:shadow-none border border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center flex-grow w-full px-3">
              <Search className="w-5 h-5 text-slate-400 mr-2" />
              <input
                type="text"
                placeholder="Search by title, author, or subject..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full py-2.5 bg-transparent focus:outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-100 dark:shadow-none transition-all duration-300 flex items-center justify-center space-x-1.5"
            >
              <span>Search Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Secondary CTA buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              to="/browse"
              className="px-6 py-3 rounded-xl border border-slate-250 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-900 font-semibold text-slate-700 dark:text-slate-200 text-sm shadow-sm transition-all duration-300"
            >
              Browse Catalog
            </Link>
            <Link
              to={user ? "/dashboard" : "/auth"}
              className="px-6 py-3 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold text-sm hover:bg-slate-800 dark:hover:bg-white shadow-sm transition-all duration-300"
            >
              List a Textbook
            </Link>
          </div>
        </div>
      </section>

      {/* Analytics Dashboard Grid Style */}
      <section className="bg-slate-100/50 dark:bg-slate-900/40 py-12 border-y border-slate-200/50 dark:border-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-1">
              <p className="text-3xl md:text-4xl font-extrabold text-indigo-600 dark:text-violet-400">1,200+</p>
              <p className="text-xs md:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Books Exchanged</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl md:text-4xl font-extrabold text-indigo-600 dark:text-violet-400">800+</p>
              <p className="text-xs md:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Registered Students</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl md:text-4xl font-extrabold text-indigo-600 dark:text-violet-400">350+</p>
              <p className="text-xs md:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Books Donated</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl md:text-4xl font-extrabold text-indigo-600 dark:text-violet-400">$24,500+</p>
              <p className="text-xs md:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Saved by Students</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Segment */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-3 max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Why Use BookBridge?</h2>
          <p className="text-slate-500 dark:text-slate-400">Designed with modern UI features to make exchanging learning resources frictionless.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="p-3 w-fit rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-violet-400">
              <Tag className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Direct Buying & Selling</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Skip third-party bookstores and retail margins. Set your price, verify textbooks in person, and transact directly on or near campus.
            </p>
          </div>
          {/* Card 2 */}
          <div className="p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="p-3 w-fit rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-650 dark:text-emerald-400">
              <Gift className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Giving Back with Donations</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Help students in need by marking books as free donations. Foster a collaborative environment at your university.
            </p>
          </div>
          {/* Card 3 */}
          <div className="p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="p-3 w-fit rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-650 dark:text-purple-400">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">In-App Negotiation Chat</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Connect with buyers or sellers immediately through our chat. Negotiate details, arrange safe meetups, and swap book details securely.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Books Row */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 mb-10">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Recent Textbook Listings</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Check out what was listed near you just recently.</p>
          </div>
          <Link
            to="/browse"
            className="text-sm font-semibold text-indigo-600 dark:text-violet-400 hover:underline flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {featuredBooks.map((book) => (
            <BookCard key={book._id} book={book} />
          ))}
        </div>
      </section>

      {/* Student Testimonials Banner */}
      <section className="bg-gradient-to-tr from-indigo-650 to-purple-750 dark:from-indigo-950/50 dark:to-purple-950/50 py-16 text-white border-t border-slate-200 dark:border-none shadow-inner">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <Star className="w-10 h-10 text-amber-300 fill-current mx-auto animate-pulse" />
          <h2 className="text-2xl md:text-3xl font-extrabold">"I saved over $300 in my first sophomore semester using BookBridge."</h2>
          <div className="space-y-1">
            <p className="font-bold text-indigo-100">David Miller</p>
            <p className="text-xs text-indigo-200 uppercase tracking-widest font-semibold">CS Student, Stanford University</p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
