import Book from '../models/Book.js';
import User from '../models/User.js';

// @desc    Get all books with advanced filtering, search, pagination
// @route   GET /api/books
// @access  Public
export const getBooks = async (req, res) => {
  try {
    const pageSize = Number(req.query.pageSize) || 6;
    const page = Number(req.query.page) || 1;

    // Search query keyword matching title/author/description
    const keyword = req.query.keyword
      ? {
          $or: [
            { title: { $regex: req.query.keyword, $options: 'i' } },
            { author: { $regex: req.query.keyword, $options: 'i' } },
            { description: { $regex: req.query.keyword, $options: 'i' } },
          ],
        }
      : {};

    // Filters
    const subject = req.query.subject ? { subject: req.query.subject } : {};
    const grade = req.query.grade ? { grade: req.query.grade } : {};
    const condition = req.query.condition ? { condition: req.query.condition } : {};
    const type = req.query.type ? { type: req.query.type } : {};
    const status = { status: 'available' }; // default only available books in catalogue

    // Combine queries
    const query = {
      ...keyword,
      ...subject,
      ...grade,
      ...condition,
      ...type,
      ...status,
    };

    // Sort order
    let sortOptions = { createdAt: -1 }; // default newest
    if (req.query.sortBy === 'priceAsc') {
      sortOptions = { price: 1 };
    } else if (req.query.sortBy === 'priceDesc') {
      sortOptions = { price: -1 };
    }

    const count = await Book.countDocuments(query);
    const books = await Book.find(query)
      .populate('owner', 'name email avatar school location')
      .sort(sortOptions)
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({
      books,
      page,
      pages: Math.ceil(count / pageSize),
      totalBooks: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get book details by ID
// @route   GET /api/books/:id
// @access  Public
export const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('owner', 'name email avatar school location bio');

    if (book) {
      res.json(book);
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new book listing
// @route   POST /api/books
// @access  Private
export const createBook = async (req, res) => {
  const { title, author, subject, grade, language, condition, price, type, coverImage, description } = req.body;

  try {
    const book = new Book({
      title,
      author,
      subject,
      grade,
      language,
      condition,
      price: type === 'donate' ? 0 : price,
      type,
      coverImage: coverImage || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=400&q=80',
      description,
      owner: req.user._id,
    });

    const createdBook = await book.save();
    res.status(201).json(createdBook);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update book listing
// @route   PUT /api/books/:id
// @access  Private
export const updateBook = async (req, res) => {
  const { title, author, subject, grade, language, condition, price, type, coverImage, description, status } = req.body;

  try {
    const book = await Book.findById(req.params.id);

    if (book) {
      // Check if user is owner of the book or admin
      if (book.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to edit this listing' });
      }

      book.title = title || book.title;
      book.author = author || book.author;
      book.subject = subject || book.subject;
      book.grade = grade || book.grade;
      book.language = language || book.language;
      book.condition = condition || book.condition;
      book.price = type === 'donate' ? 0 : (price !== undefined ? price : book.price);
      book.type = type || book.type;
      book.coverImage = coverImage || book.coverImage;
      book.description = description || book.description;
      book.status = status || book.status;

      const updatedBook = await book.save();
      res.json(updatedBook);
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete book listing
// @route   DELETE /api/books/:id
// @access  Private
export const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (book) {
      // Check if user is owner of the book or admin
      if (book.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to delete this listing' });
      }

      await book.deleteOne();
      res.json({ message: 'Book listing deleted successfully' });
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle book in wishlist
// @route   POST /api/books/:id/wishlist
// @access  Private
export const toggleWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const index = user.wishlist.indexOf(book._id);
    let message = '';
    if (index >= 0) {
      user.wishlist.splice(index, 1);
      message = 'Book removed from wishlist';
    } else {
      user.wishlist.push(book._id);
      message = 'Book added to wishlist';
    }

    await user.save();
    res.json({ message, wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get book recommendations (related by subject or grade)
// @route   GET /api/books/:id/recommendations
// @access  Public
export const getRecommendations = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (book) {
      const recommendations = await Book.find({
        _id: { $ne: book._id },
        status: 'available',
        $or: [
          { subject: book.subject },
          { grade: book.grade },
        ],
      })
        .populate('owner', 'name email avatar school')
        .limit(4);

      res.json(recommendations);
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user listed books (dashboard helper)
// @route   GET /api/books/user/listings
// @access  Private
export const getUserListings = async (req, res) => {
  try {
    const books = await Book.find({ owner: req.user._id });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get admin analytics overview
// @route   GET /api/books/admin/analytics
// @access  Private/Admin
export const getAdminAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalBooks = await Book.countDocuments({});
    const soldBooks = await Book.countDocuments({ status: 'sold' });
    const availableBooks = await Book.countDocuments({ status: 'available' });

    // Listings by subject
    const subjectStats = await Book.aggregate([
      { $group: { _id: '$subject', count: { $sum: 1 } } }
    ]);

    // Listings by type (sell vs donate)
    const typeStats = await Book.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    res.json({
      totalUsers,
      totalBooks,
      soldBooks,
      availableBooks,
      subjectStats,
      typeStats,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
