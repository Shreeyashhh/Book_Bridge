import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Github, Twitter, Mail, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center space-x-2 text-indigo-600 dark:text-violet-400 font-extrabold text-xl tracking-tight">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-md">
                <BookOpen className="w-5 h-5" />
              </div>
              <span>Book<span className="text-slate-800 dark:text-white">Bridge</span></span>
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
              BookBridge is a student-first web portal helping university and school students buy, sell, or donate textbooks directly within their local academic communities. Keep education affordable and sustainable.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="p-2 bg-slate-200 hover:bg-indigo-500 hover:text-white dark:bg-slate-800 dark:hover:bg-violet-500 dark:text-slate-300 text-slate-600 rounded-xl transition-all duration-300">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-slate-200 hover:bg-indigo-500 hover:text-white dark:bg-slate-800 dark:hover:bg-violet-500 dark:text-slate-300 text-slate-600 rounded-xl transition-all duration-300">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-slate-200 hover:bg-indigo-500 hover:text-white dark:bg-slate-800 dark:hover:bg-violet-500 dark:text-slate-300 text-slate-600 rounded-xl transition-all duration-300">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">Navigation</h4>
            <ul className="space-y-2.5 text-sm text-slate-500 dark:text-slate-400">
              <li>
                <Link to="/" className="hover:text-indigo-600 dark:hover:text-violet-400 transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/browse" className="hover:text-indigo-600 dark:hover:text-violet-400 transition-colors">Browse Textbooks</Link>
              </li>
              <li>
                <Link to="/auth" className="hover:text-indigo-600 dark:hover:text-violet-400 transition-colors">Login / Signup</Link>
              </li>
            </ul>
          </div>

          {/* Newsletter / Contact */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">Stay Updated</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Subscribe to get notified when students list textbooks matching your course list.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex space-x-2">
              <input
                type="email"
                placeholder="Enter school email"
                className="px-3.5 py-2.5 w-full text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100"
              />
              <button
                type="submit"
                className="px-4 py-2.5 text-sm font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 dark:bg-violet-600 dark:hover:bg-violet-500 transition-all duration-300"
              >
                Join
              </button>
            </form>
          </div>

        </div>

        <hr className="my-8 border-slate-200 dark:border-slate-800" />

        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 dark:text-slate-500 space-y-4 sm:space-y-0">
          <p>© {new Date().getFullYear()} BookBridge. All rights reserved.</p>
          <p className="flex items-center space-x-1">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" />
            <span>for students worldwide.</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
