import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Tag, Gift, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const BookCard = ({ book, onWishlistToggle }) => {
  const navigate = useNavigate();
  const { user, isMockMode, setUser } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    if (user && user.wishlist) {
      setIsWishlisted(user.wishlist.includes(book._id));
    }
  }, [user, book._id]);

  const handleCardClick = () => {
    navigate(`/books/${book._id}`);
  };

  const handleWishlistClick = async (e) => {
    e.stopPropagation(); // Prevent clicking card details
    if (!user) {
      navigate('/auth');
      return;
    }

    // Call toggle handler if provided, otherwise manage internally
    if (onWishlistToggle) {
      await onWishlistToggle(book._id);
      setIsWishlisted(!isWishlisted);
      return;
    }

    // Default internal toggler
    if (isMockMode) {
      // Toggle in mock user wishlist
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

  // Condition Badge Styling helper
  const getConditionColor = (cond) => {
    switch (cond) {
      case 'New':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800';
      case 'Like New':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
      case 'Good':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800';
      case 'Fair':
        return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
      case 'Poor':
        return 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative cursor-pointer flex flex-col h-full rounded-2xl border border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-900 overflow-hidden shadow-sm hover:shadow-xl dark:shadow-none hover:-translate-y-1.5 transition-all duration-300 ease-out"
    >
      {/* Cover Image & Hover Overlays */}
      <div className="relative aspect-[4/3] w-full bg-slate-100 dark:bg-slate-850 overflow-hidden">
        <img
          src={book.coverImage || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=400&q=80'}
          alt={book.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Transaction Type Overlay */}
        <div className="absolute top-3 left-3 flex gap-2">
          {book.type === 'donate' ? (
            <span className="flex items-center space-x-1 px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-lg text-emerald-800 bg-emerald-50 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50">
              <Gift className="w-3 h-3" />
              <span>Donate</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1 px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-lg text-indigo-850 bg-indigo-50 dark:bg-indigo-950/80 dark:text-indigo-350 border border-indigo-200/50 dark:border-indigo-800/50">
              <Tag className="w-3 h-3" />
              <span>Sell</span>
            </span>
          )}

          <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border uppercase tracking-wider ${getConditionColor(book.condition)}`}>
            {book.condition}
          </span>
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          className="absolute top-3 right-3 p-2 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-md hover:bg-white dark:hover:bg-slate-900 text-slate-500 hover:text-rose-500 transition-all duration-300"
          aria-label="Wishlist Book"
        >
          <Heart className={`w-4 h-4 transition-all duration-300 ${isWishlisted ? 'text-rose-500 fill-current scale-110' : ''}`} />
        </button>
      </div>

      {/* Book Metadata */}
      <div className="flex flex-col flex-grow p-5 space-y-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-indigo-500 dark:text-violet-400 uppercase tracking-wider">{book.subject}</p>
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base leading-snug truncate group-hover:text-indigo-600 dark:group-hover:text-violet-400 transition-colors">
            {book.title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">by {book.author}</p>
        </div>

        {/* Short Description */}
        <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-2 leading-relaxed flex-grow">
          {book.description}
        </p>

        {/* Price & Owner Row */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center space-x-2">
            <img
              src={book.owner?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=default'}
              alt={book.owner?.name || 'Owner'}
              className="w-7 h-7 rounded-lg bg-indigo-50 object-cover"
            />
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              <p className="truncate max-w-[80px] text-slate-700 dark:text-slate-350">{book.owner?.name}</p>
              <p className="truncate max-w-[80px] text-slate-400">{book.owner?.school || 'Student'}</p>
            </div>
          </div>

          <div className="text-right">
            {book.type === 'donate' ? (
              <span className="font-extrabold text-base text-emerald-600 dark:text-emerald-400">FREE</span>
            ) : (
              <span className="font-extrabold text-base text-slate-900 dark:text-slate-100">${book.price}</span>
            )}
            <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">{book.grade}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
