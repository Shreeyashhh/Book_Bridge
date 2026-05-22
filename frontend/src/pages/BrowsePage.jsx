import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, ArrowUpDown, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { MOCK_BOOKS } from '../utils/mockData.js';
import { useAuth } from '../context/AuthContext.jsx';
import BookCard from '../components/BookCard.jsx';

const BrowsePage = () => {
  const { isMockMode } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter States
  const [keyword, setKeyword] = useState(searchParams.get('search') || '');
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [condition, setCondition] = useState('');
  const [type, setType] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Pagination & Loading States
  const [books, setBooks] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Sync keyword from search query if URL changes
  useEffect(() => {
    const searchVal = searchParams.get('search');
    if (searchVal !== null) {
      setKeyword(searchVal);
    }
  }, [searchParams]);

  // Load Data Trigger
  useEffect(() => {
    const loadBooks = async () => {
      setLoading(true);

      if (!isMockMode) {
        // Fetch from Express API
        try {
          const queryParams = new URLSearchParams({
            page,
            pageSize: 6,
            keyword,
            subject,
            grade,
            condition,
            type,
            sortBy,
          });

          const res = await fetch(`/api/books?${queryParams.toString()}`);
          if (res.ok) {
            const data = await res.json();
            setBooks(data.books);
            setTotalPages(data.pages);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.error("Failed backend fetch, falling back to mock search filtering.", err);
        }
      }

      // Mock Local Filtering logic (runs completely locally!)
      let filtered = [...MOCK_BOOKS];

      // 1. Text Search matching title, author, description
      if (keyword.trim() !== '') {
        const query = keyword.toLowerCase();
        filtered = filtered.filter(
          (b) =>
            b.title.toLowerCase().includes(query) ||
            b.author.toLowerCase().includes(query) ||
            b.description.toLowerCase().includes(query)
        );
      }

      // 2. Metadata matches
      if (subject) filtered = filtered.filter((b) => b.subject === subject);
      if (grade) filtered = filtered.filter((b) => b.grade === grade);
      if (condition) filtered = filtered.filter((b) => b.condition === condition);
      if (type) filtered = filtered.filter((b) => b.type === type);

      // 3. Status filter (only available books in directory)
      filtered = filtered.filter((b) => b.status === 'available');

      // 4. Sorting
      if (sortBy === 'newest') {
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } else if (sortBy === 'priceAsc') {
        filtered.sort((a, b) => a.price - b.price);
      } else if (sortBy === 'priceDesc') {
        filtered.sort((a, b) => b.price - a.price);
      }

      // 5. Pagination (6 items per page)
      const pageSize = 6;
      const count = filtered.length;
      const pages = Math.ceil(count / pageSize) || 1;
      const paginatedBooks = filtered.slice((page - 1) * pageSize, page * pageSize);

      setBooks(paginatedBooks);
      setTotalPages(pages);
      setLoading(false);
    };

    loadBooks();
  }, [keyword, subject, grade, condition, type, sortBy, page, isMockMode]);

  // Reset Filters
  const handleResetFilters = () => {
    setKeyword('');
    setSubject('');
    setGrade('');
    setCondition('');
    setType('');
    setSortBy('newest');
    setPage(1);
    setSearchParams({});
  };

  const activeFiltersCount = [subject, grade, condition, type].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 transition-colors duration-300">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-8 border-b border-slate-200/60 dark:border-slate-800/80 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-850 dark:text-white">Textbook Catalogue</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Browse available textbooks listed by fellow students nearby.</p>
        </div>
        
        {/* Reset / Status indicators */}
        <div className="flex items-center space-x-3">
          {isMockMode && (
            <span className="px-3 py-1 text-[10px] font-bold rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-250/20 uppercase tracking-widest">
              Guest Sandbox Mode
            </span>
          )}
          <button
            onClick={handleResetFilters}
            className="flex items-center space-x-1 px-4 py-2 text-xs font-semibold rounded-xl text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-violet-400 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Filters */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-850 dark:text-slate-200 flex items-center space-x-2">
                <SlidersHorizontal className="w-4 h-4 text-indigo-500" />
                <span>Filters</span>
              </span>
              {activeFiltersCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-600 text-white rounded-md">
                  {activeFiltersCount}
                </span>
              )}
            </div>

            {/* Keyword Search Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Search Key</label>
              <div className="flex items-center px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                <Search className="w-4 h-4 text-slate-400 mr-2" />
                <input
                  type="text"
                  placeholder="Title or author..."
                  value={keyword}
                  onChange={(e) => {
                    setKeyword(e.target.value);
                    setPage(1);
                  }}
                  className="w-full bg-transparent focus:outline-none text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                />
              </div>
            </div>

            {/* Subject Select */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Academic Subject</label>
              <select
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-700 dark:text-slate-350 focus:outline-none"
              >
                <option value="">All Subjects</option>
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

            {/* Grade Select */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Grade Level</label>
              <select
                value={grade}
                onChange={(e) => {
                  setGrade(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-700 dark:text-slate-350 focus:outline-none"
              >
                <option value="">All Grades</option>
                <option value="Middle School">Middle School</option>
                <option value="High School">High School</option>
                <option value="Undergraduate">Undergraduate</option>
                <option value="Postgraduate">Postgraduate</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Condition Select */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Book Condition</label>
              <select
                value={condition}
                onChange={(e) => {
                  setCondition(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-700 dark:text-slate-350 focus:outline-none"
              >
                <option value="">All Conditions</option>
                <option value="New">New</option>
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>

            {/* Type Option */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Transaction Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setType(type === 'sell' ? '' : 'sell');
                    setPage(1);
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    type === 'sell'
                      ? 'border-indigo-650 bg-indigo-50 text-indigo-700 dark:border-violet-500 dark:bg-violet-950/40 dark:text-violet-300'
                      : 'border-slate-250 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-950 text-slate-650 dark:text-slate-400'
                  }`}
                >
                  Buy / Sell
                </button>
                <button
                  onClick={() => {
                    setType(type === 'donate' ? '' : 'donate');
                    setPage(1);
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    type === 'donate'
                      ? 'border-emerald-650 bg-emerald-50 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : 'border-slate-250 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-950 text-slate-650 dark:text-slate-400'
                  }`}
                >
                  Donation
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Catalog List */}
        <div className="lg:col-span-3 space-y-6">
          {/* Sorting and result summary */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-sm text-sm">
            <span className="font-medium text-slate-500 dark:text-slate-400">
              Showing <span className="font-bold text-slate-800 dark:text-white">{books.length}</span> results
            </span>

            <div className="flex items-center space-x-2">
              <ArrowUpDown className="w-4 h-4 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent border-none text-slate-700 dark:text-slate-350 focus:outline-none font-semibold cursor-pointer py-1"
              >
                <option value="newest">Sort by: Newest First</option>
                <option value="priceAsc">Sort by: Price (Low to High)</option>
                <option value="priceDesc">Sort by: Price (High to Low)</option>
              </select>
            </div>
          </div>

          {/* Grid list of books */}
          {loading ? (
            <div className="flex items-center justify-center h-80">
              <span className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></span>
            </div>
          ) : books.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {books.map((book) => (
                <BookCard key={book._id} book={book} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center h-80 rounded-2xl border border-dashed border-slate-250 dark:border-slate-850">
              <SlidersHorizontal className="w-12 h-12 text-slate-400 mb-4" />
              <h3 className="font-bold text-lg text-slate-800 dark:text-white">No Books Found</h3>
              <p className="text-sm text-slate-500 dark:text-slate-450 mt-1 max-w-sm">
                Try widening your search queries, adjusting sliders, or checking other academic subjects.
              </p>
            </div>
          )}

          {/* Pagination buttons */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-4 pt-6 border-t border-slate-200/50 dark:border-slate-850">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="p-2.5 rounded-xl border border-slate-250 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-900 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-5 h-5 text-slate-650 dark:text-slate-300" />
              </button>
              
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                Page <span className="text-slate-900 dark:text-white font-bold">{page}</span> of {totalPages}
              </span>

              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="p-2.5 rounded-xl border border-slate-250 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-900 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                aria-label="Next Page"
              >
                <ChevronRight className="w-5 h-5 text-slate-650 dark:text-slate-300" />
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default BrowsePage;
