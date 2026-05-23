export const MOCK_USERS = [
  {
    _id: "user_alice",
    name: "Alice Johnson",
    email: "alice@university.edu",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Alice",
    school: "Stanford University",
    location: "Stanford, CA",
    bio: "Computer Science junior. Always swapping tech books!",
    role: "user",
    wishlist: ["book_2"]
  },
  {
    _id: "user_bob",
    name: "Bob Smith",
    email: "bob@university.edu",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Bob",
    school: "UC Berkeley",
    location: "Berkeley, CA",
    bio: "Pre-med sophomore. Giving away old humanities books and looking for science books.",
    role: "user",
    wishlist: ["book_1"]
  },
  {
    _id: "user_admin",
    name: "Platform Moderator",
    email: "admin@bookbridge.com",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Admin",
    school: "BookBridge Office",
    location: "San Francisco, CA",
    bio: "System Administrator and book moderator.",
    role: "admin",
    wishlist: []
  }
];

export const MOCK_BOOKS = [
  {
    _id: "book_1",
    title: "Introduction to Algorithms, 4th Edition",
    author: "Thomas H. Cormen, Charles E. Leiserson",
    subject: "Engineering & Tech",
    grade: "Undergraduate",
    language: "English",
    condition: "Like New",
    price: 45,
    type: "sell",
    coverImage: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=600&q=80",
    description: "Mint condition. No highlights or markings. Essential reading for computer science students covering graph algorithms, sorting, and data structures.",
    status: "available",
    owner: {
      _id: "user_alice",
      name: "Alice Johnson",
      avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Alice",
      school: "Stanford University",
      location: "Stanford, CA"
    },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: "book_2",
    title: "Calculus: Early Transcendentals, 9th Edition",
    author: "James Stewart",
    subject: "Mathematics",
    grade: "Undergraduate",
    language: "English",
    condition: "Good",
    price: 35,
    type: "sell",
    coverImage: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80",
    description: "Has some wear on the corners but pages are clean. Very helpful for single and multi-variable calculus classes.",
    status: "available",
    owner: {
      _id: "user_bob",
      name: "Bob Smith",
      avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Bob",
      school: "UC Berkeley",
      location: "Berkeley, CA"
    },
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: "book_3",
    title: "Physics for Scientists and Engineers",
    author: "Raymond A. Serway, John W. Jewett",
    subject: "Science",
    grade: "Undergraduate",
    language: "English",
    condition: "Fair",
    price: 0,
    type: "donate",
    coverImage: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80",
    description: "Spine is taped up, and has writing in mechanical pencil, but all pages are legible. Donating to anyone who needs it for physics 101.",
    status: "available",
    owner: {
      _id: "user_bob",
      name: "Bob Smith",
      avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Bob",
      school: "UC Berkeley",
      location: "Berkeley, CA"
    },
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: "book_4",
    title: "Campbell Biology, 12th Edition",
    author: "Lisa A. Urry, Michael L. Cain",
    subject: "Science",
    grade: "Undergraduate",
    language: "English",
    condition: "New",
    price: 75,
    type: "sell",
    coverImage: "https://images.unsplash.com/photo-1530210120071-aa4d16fe03d2?auto=format&fit=crop&w=600&q=80",
    description: "Unopened shrink-wrapped biology book. Dropped the class early so don't need it. Saves you money compared to the university bookstore!",
    status: "available",
    owner: {
      _id: "user_alice",
      name: "Alice Johnson",
      avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Alice",
      school: "Stanford University",
      location: "Stanford, CA"
    },
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: "book_5",
    title: "Macroeconomics, 11th Edition",
    author: "N. Gregory Mankiw",
    subject: "Business & Economics",
    grade: "Undergraduate",
    language: "English",
    condition: "Good",
    price: 25,
    type: "sell",
    coverImage: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=600&q=80",
    description: "Good condition, slight highlighting in Chapter 3 and 4, overall perfect text reference.",
    status: "available",
    owner: {
      _id: "user_bob",
      name: "Bob Smith",
      avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Bob",
      school: "UC Berkeley",
      location: "Berkeley, CA"
    },
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: "book_6",
    title: "The Odyssey",
    author: "Homer (Translated by Robert Fagles)",
    subject: "Arts & Humanities",
    grade: "High School",
    language: "English",
    condition: "Fair",
    price: 0,
    type: "donate",
    coverImage: "https://images.unsplash.com/photo-1463320306483-b58c247efb06?auto=format&fit=crop&w=600&q=80",
    description: "Paperback. Cover is folded, but text is clean. Giving it away for free to anyone studying Greek literature.",
    status: "available",
    owner: {
      _id: "user_alice",
      name: "Alice Johnson",
      avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Alice",
      school: "Stanford University",
      location: "Stanford, CA"
    },
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const MOCK_CHATS = [
  {
    _id: "chat_1",
    participants: [
      {
        _id: "user_alice",
        name: "Alice Johnson",
        avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Alice",
        school: "Stanford University"
      },
      {
        _id: "user_bob",
        name: "Bob Smith",
        avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Bob",
        school: "UC Berkeley"
      }
    ],
    bookRef: {
      _id: "book_2",
      title: "Calculus: Early Transcendentals, 9th Edition",
      coverImage: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80",
      price: 35,
      type: "sell",
      status: "available"
    },
    lastMessage: "Is the price negotiable to $30?",
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  }
];

export const MOCK_MESSAGES = {
  "chat_1": [
    {
      _id: "msg_1",
      chat: "chat_1",
      sender: { _id: "user_alice" },
      text: "Hi Bob, I saw your Calculus book listed! Is it still available?",
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
    },
    {
      _id: "msg_2",
      chat: "chat_1",
      sender: { _id: "user_bob" },
      text: "Hey Alice! Yes, it is still available. I can meet up on campus or mail it.",
      createdAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString()
    },
    {
      _id: "msg_3",
      chat: "chat_1",
      sender: { _id: "user_alice" },
      text: "Awesome! Is the price negotiable to $30?",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    }
  ]
};

export const MOCK_REQUESTS = [
  {
    _id: "req_1",
    book: {
      _id: "book_2",
      title: "Calculus: Early Transcendentals, 9th Edition",
      coverImage: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80",
      price: 35,
      type: "sell",
      status: "available"
    },
    buyer: {
      _id: "user_alice",
      name: "Alice Johnson",
      avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Alice",
      school: "Stanford University",
      location: "Stanford, CA"
    },
    seller: {
      _id: "user_bob",
      name: "Bob Smith",
      avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Bob"
    },
    status: "pending",
    type: "sell",
    proposedPrice: 30,
    message: "Hey Bob! I sent a message, hoping we could meet up for this at Stanford next week.",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  }
];
