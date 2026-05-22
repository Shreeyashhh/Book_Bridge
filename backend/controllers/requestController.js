import Request from '../models/Request.js';
import Book from '../models/Book.js';

// @desc    Create a new transaction request
// @route   POST /api/requests
// @access  Private
export const createRequest = async (req, res) => {
  const { bookId, type, proposedPrice, message } = req.body;

  try {
    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (book.status !== 'available') {
      return res.status(400).json({ message: 'Book is no longer available' });
    }

    if (book.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot request your own book' });
    }

    // Check if user already requested this book
    const requestExists = await Request.findOne({
      book: bookId,
      buyer: req.user._id,
      status: { $in: ['pending', 'approved'] },
    });

    if (requestExists) {
      return res.status(400).json({ message: 'You already have an active request for this book' });
    }

    const transactionRequest = new Request({
      book: bookId,
      buyer: req.user._id,
      seller: book.owner,
      type,
      proposedPrice: type === 'donate' ? 0 : proposedPrice || book.price,
      message,
    });

    const savedRequest = await transactionRequest.save();
    res.status(201).json(savedRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user requests (both incoming as seller and outgoing as buyer)
// @route   GET /api/requests
// @access  Private
export const getRequests = async (req, res) => {
  try {
    // Outgoing (requests made by me)
    const outgoing = await Request.find({ buyer: req.user._id })
      .populate('book', 'title coverImage price type status')
      .populate('seller', 'name email avatar school')
      .sort({ createdAt: -1 });

    // Incoming (requests received by me)
    const incoming = await Request.find({ seller: req.user._id })
      .populate('book', 'title coverImage price type status')
      .populate('buyer', 'name email avatar school location contact')
      .sort({ createdAt: -1 });

    res.json({ incoming, outgoing });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update request status
// @route   PUT /api/requests/:id
// @access  Private
export const updateRequestStatus = async (req, res) => {
  const { status } = req.body;

  if (!['approved', 'rejected', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status update' });
  }

  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const isSeller = request.seller.toString() === req.user._id.toString();
    const isBuyer = request.buyer.toString() === req.user._id.toString();

    // Permissions:
    // Seller can approve, reject, complete
    // Buyer can cancel
    if (status === 'cancelled' && !isBuyer) {
      return res.status(403).json({ message: 'Only the request initiator can cancel a request' });
    }

    if (['approved', 'rejected', 'completed'].includes(status) && !isSeller) {
      return res.status(403).json({ message: 'Only the book owner can approve, reject, or complete a request' });
    }

    request.status = status;
    const updatedRequest = await request.save();

    // If marked as completed, set the book status as sold
    if (status === 'completed') {
      const book = await Book.findById(request.book);
      if (book) {
        book.status = 'sold';
        await book.save();
      }

      // Automatically reject other pending requests for the same book
      await Request.updateMany(
        { book: request.book, _id: { $ne: request._id }, status: 'pending' },
        { status: 'rejected' }
      );
    }

    res.json(updatedRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
