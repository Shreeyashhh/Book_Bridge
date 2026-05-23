import Chat from '../models/Chat.js';
import Message from '../models/Message.js';
import Book from '../models/Book.js';

// @desc    Create or access a chat session
// @route   POST /api/chats
// @access  Private
export const createChat = async (req, res) => {
  const { bookId, sellerId } = req.body;

  if (!bookId || !sellerId) {
    return res.status(400).json({ message: 'Book ID and Seller ID are required' });
  }

  if (sellerId === req.user._id.toString()) {
    return res.status(400).json({ message: 'You cannot start a chat with yourself' });
  }

  try {
    // Check if chat already exists
    let chat = await Chat.findOne({
      bookRef: bookId,
      participants: { $all: [req.user._id, sellerId] },
    });

    if (chat) {
      chat = await chat.populate('participants', 'name email avatar school');
      chat = await chat.populate('bookRef', 'title coverImage price type status');
      return res.json(chat);
    }

    // Check if book exists
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Create new chat
    const newChat = new Chat({
      participants: [req.user._id, sellerId],
      bookRef: bookId,
    });

    let savedChat = await newChat.save();
    savedChat = await savedChat.populate('participants', 'name email avatar school');
    savedChat = await savedChat.populate('bookRef', 'title coverImage price type status');

    res.status(201).json(savedChat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's chat sessions
// @route   GET /api/chats
// @access  Private
export const getChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: { $in: [req.user._id] },
    })
      .populate('participants', 'name email avatar school')
      .populate('bookRef', 'title coverImage price type status')
      .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get chat message history
// @route   GET /api/chats/:id/messages
// @access  Private
export const getChatMessages = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({ message: 'Chat session not found' });
    }

    // Check if user is in chat
    if (!chat.participants.some(p => p.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized to view these messages' });
    }

    const messages = await Message.find({ chat: req.params.id })
      .populate('sender', 'name email avatar')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send a message
// @route   POST /api/chats/:id/messages
// @access  Private
export const sendMessage = async (req, res) => {
  const { text } = req.body;

  if (!text || text.trim() === '') {
    return res.status(400).json({ message: 'Message text cannot be empty' });
  }

  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({ message: 'Chat session not found' });
    }

    if (!chat.participants.some(p => p.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized to send messages in this chat' });
    }

    const message = new Message({
      chat: req.params.id,
      sender: req.user._id,
      text: text.trim(),
    });

    let savedMessage = await message.save();
    savedMessage = await savedMessage.populate('sender', 'name email avatar');

    // Update chat last message
    chat.lastMessage = text;
    await chat.save();

    res.status(201).json(savedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
