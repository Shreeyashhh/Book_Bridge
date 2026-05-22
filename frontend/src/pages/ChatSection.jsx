import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Send, MessageSquare, BookOpen, AlertCircle, Calendar, MapPin, Smile } from 'lucide-react';
import { MOCK_CHATS, MOCK_MESSAGES } from '../utils/mockData.js';
import { useAuth } from '../context/AuthContext.jsx';

const ChatSection = () => {
  const location = useLocation();
  const { user, isMockMode } = useAuth();

  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const messagesEndRef = useRef(null);

  // Auto-scroll function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load Chats list
  const loadChats = async () => {
    if (!user) return;
    setLoadingChats(true);

    if (!isMockMode) {
      try {
        const res = await fetch('/api/chats', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
          const data = await res.json();
          setChats(data);
          
          // Select default or state chat
          selectInitialChat(data);
          setLoadingChats(false);
          return;
        }
      } catch (err) {
        console.error(err);
      }
    }

    // Mock local chats loading
    const localChats = MOCK_CHATS.filter((c) =>
      c.participants.some((p) => p._id === user._id)
    );
    setChats(localChats);
    selectInitialChat(localChats);
    setLoadingChats(false);
  };

  const selectInitialChat = (chatsList) => {
    const passedChatId = location.state?.selectedChatId;
    if (passedChatId) {
      const found = chatsList.find((c) => c._id === passedChatId);
      if (found) {
        setSelectedChat(found);
        return;
      }
    }
    if (chatsList.length > 0) {
      setSelectedChat(chatsList[0]);
    }
  };

  useEffect(() => {
    loadChats();
  }, [user, isMockMode, location.state]);

  // Load Messages for selected chat
  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedChat) return;
      setLoadingMessages(true);

      if (!isMockMode) {
        try {
          const res = await fetch(`/api/chats/${selectedChat._id}/messages`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          if (res.ok) {
            const data = await res.json();
            setMessages(data);
            setLoadingMessages(false);
            return;
          }
        } catch (err) {
          console.error(err);
        }
      }

      // Mock messages loader
      const chatMessages = MOCK_MESSAGES[selectedChat._id] || [];
      setMessages(chatMessages);
      setLoadingMessages(false);
    };

    loadMessages();
  }, [selectedChat, isMockMode]);

  // Post new message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (messageText.trim() === '' || !selectedChat) return;

    const textToSend = messageText.trim();
    setMessageText('');

    if (isMockMode) {
      const newMsg = {
        _id: `msg_${Date.now()}`,
        chat: selectedChat._id,
        sender: {
          _id: user._id,
          name: user.name,
          avatar: user.avatar,
        },
        text: textToSend,
        createdAt: new Date().toISOString(),
      };

      // Save user message to active chat
      if (!MOCK_MESSAGES[selectedChat._id]) {
        MOCK_MESSAGES[selectedChat._id] = [];
      }
      MOCK_MESSAGES[selectedChat._id].push(newMsg);
      setMessages([...messages, newMsg]);

      // Update chats last message
      const chatIndex = MOCK_CHATS.findIndex(c => c._id === selectedChat._id);
      if (chatIndex >= 0) {
        MOCK_CHATS[chatIndex].lastMessage = textToSend;
        MOCK_CHATS[chatIndex].updatedAt = new Date().toISOString();
        // resort chats list
        setChats([...MOCK_CHATS].sort((a,b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
      }

      // Dynamic automatic chat replies (Mock Bot responding)
      const otherParticipant = selectedChat.participants.find(p => p._id !== user._id);
      
      setTimeout(() => {
        const responses = [
          "That sounds perfect! Where on campus should we meet?",
          "Yes, I can do $30 instead of $35. Meet at the library center tomorrow?",
          "Sure. I'm free between classes from 12 to 2 PM near the student union center.",
          "Awesome. I'll make sure to bring the book. Let me know when you arrive!",
        ];
        const randomReply = responses[Math.floor(Math.random() * responses.length)];

        const replyMsg = {
          _id: `msg_${Date.now() + 1}`,
          chat: selectedChat._id,
          sender: {
            _id: otherParticipant._id,
            name: otherParticipant.name,
            avatar: otherParticipant.avatar,
          },
          text: randomReply,
          createdAt: new Date().toISOString(),
        };

        MOCK_MESSAGES[selectedChat._id].push(replyMsg);
        setMessages(prev => [...prev, replyMsg]);

        if (chatIndex >= 0) {
          MOCK_CHATS[chatIndex].lastMessage = randomReply;
          MOCK_CHATS[chatIndex].updatedAt = new Date().toISOString();
          setChats([...MOCK_CHATS].sort((a,b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
        }
      }, 1500);

    } else {
      try {
        const res = await fetch(`/api/chats/${selectedChat._id}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ text: textToSend })
        });
        if (res.ok) {
          const savedMsg = await res.json();
          setMessages([...messages, savedMsg]);
          
          // reload chats to update sidebar
          const listRes = await fetch('/api/chats', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          if (listRes.ok) {
            const listData = await listRes.json();
            setChats(listData);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const getOtherParticipant = (chat) => {
    if (!chat || !user) return {};
    return chat.participants.find((p) => p._id !== user._id) || {};
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      
      {/* Container Card */}
      <div className="h-[75vh] flex rounded-2xl border border-slate-200/60 dark:border-slate-805/80 bg-white dark:bg-slate-900 shadow-xl dark:shadow-none overflow-hidden">
        
        {/* Left pane: Chats List */}
        <div className="w-1/3 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full bg-slate-50/50 dark:bg-slate-950/20">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <h2 className="font-extrabold text-slate-850 dark:text-white text-lg">Conversations</h2>
            <p className="text-[10px] text-slate-450 mt-0.5">Inbox messages for exchange meetups</p>
          </div>

          <div className="flex-grow overflow-y-auto custom-scrollbar divide-y divide-slate-100 dark:divide-slate-800/60">
            {loadingChats ? (
              <div className="flex items-center justify-center py-10">
                <span className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></span>
              </div>
            ) : chats.length > 0 ? (
              chats.map((chat) => {
                const other = getOtherParticipant(chat);
                const isSelected = selectedChat && selectedChat._id === chat._id;
                return (
                  <div
                    key={chat._id}
                    onClick={() => setSelectedChat(chat)}
                    className={`p-4 flex items-start space-x-3 cursor-pointer transition-all duration-300 ${
                      isSelected
                        ? 'bg-indigo-50/70 border-l-4 border-indigo-600 dark:bg-slate-800 dark:border-violet-400'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-950/30'
                    }`}
                  >
                    <img
                      src={other.avatar}
                      alt={other.name}
                      className="w-10 h-10 rounded-xl bg-indigo-50 flex-shrink-0"
                    />
                    <div className="flex-grow min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate">{other.name}</p>
                        <span className="text-[9px] text-slate-400">
                          {chat.updatedAt ? new Date(chat.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                      
                      {chat.bookRef && (
                        <p className="text-[10px] text-indigo-500 dark:text-violet-400 font-semibold truncate">
                          Re: {chat.bookRef.title}
                        </p>
                      )}
                      
                      <p className="text-xs text-slate-450 truncate mt-0.5">
                        {chat.lastMessage || 'Start a conversation...'}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-slate-400 dark:text-slate-500">
                <MessageSquare className="w-10 h-10 mx-auto mb-2 text-slate-350" />
                <p className="text-xs">No active chats. Start one from any Book Details page.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right pane: Message Thread */}
        <div className="w-2/3 flex flex-col h-full bg-slate-50/20 dark:bg-slate-950/5">
          {selectedChat ? (
            <>
              {/* Thread Header */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shadow-sm">
                <div className="flex items-center space-x-3">
                  <img
                    src={getOtherParticipant(selectedChat).avatar}
                    alt={getOtherParticipant(selectedChat).name}
                    className="w-10 h-10 rounded-xl"
                  />
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm leading-tight">
                      {getOtherParticipant(selectedChat).name}
                    </h3>
                    <p className="text-[10px] text-slate-500">{getOtherParticipant(selectedChat).school || 'Campus Student'}</p>
                  </div>
                </div>

                {selectedChat.bookRef && (
                  <div className="flex items-center space-x-3 text-right max-w-sm">
                    <div className="text-[10px]">
                      <p className="font-bold text-slate-750 dark:text-slate-200 truncate max-w-[150px]">{selectedChat.bookRef.title}</p>
                      <p className="text-indigo-650 dark:text-violet-400 font-extrabold uppercase">
                        {selectedChat.bookRef.type === 'donate' ? 'Free (Donation)' : `$${selectedChat.bookRef.price}`}
                      </p>
                    </div>
                    <img
                      src={selectedChat.bookRef.coverImage}
                      alt="book reference"
                      className="w-8 h-10 object-cover rounded border"
                    />
                  </div>
                )}
              </div>

              {/* Message scroll list */}
              <div className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar">
                
                {/* Safe swap alert */}
                <div className="mx-auto max-w-md p-3.5 rounded-xl border border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm text-[11px] text-slate-500 leading-normal flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-750 dark:text-slate-200">Safe Meetup Advice</p>
                    <p className="mt-0.5">Always agree to meet in well-lit public campus locations (e.g. library lobbies, cafeteria halls) to hand over books.</p>
                  </div>
                </div>

                {loadingMessages ? (
                  <div className="flex items-center justify-center py-20">
                    <span className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></span>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender._id === user._id;
                    return (
                      <div
                        key={msg._id}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end space-x-2`}
                      >
                        {!isMe && (
                          <img
                            src={msg.sender.avatar}
                            alt="avatar"
                            className="w-6 h-6 rounded-full flex-shrink-0"
                          />
                        )}
                        <div
                          className={`max-w-[70%] p-3 rounded-2xl text-xs font-medium leading-relaxed ${
                            isMe
                              ? 'bg-indigo-650 text-white rounded-br-none dark:bg-violet-650'
                              : 'bg-slate-200 text-slate-800 rounded-bl-none dark:bg-slate-805 dark:text-slate-200'
                          }`}
                        >
                          <p>{msg.text}</p>
                          <p className={`text-[8px] mt-1 text-right ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Message inputs */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center space-x-3">
                <input
                  type="text"
                  placeholder="Type a message, schedule a meetup..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="flex-grow px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400"
                />
                
                <button
                  type="submit"
                  className="p-3 rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 dark:bg-violet-650 dark:hover:bg-violet-550 transition-colors shadow-md shadow-indigo-100 dark:shadow-none"
                  aria-label="Send Message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <MessageSquare className="w-16 h-16 text-slate-300 dark:text-slate-750 mb-3" />
              <h3 className="font-bold text-slate-800 dark:text-white">Inbox Conversation Selected</h3>
              <p className="text-sm mt-1 max-w-xs">Select any chat thread from the left pane to message sellers or buyers.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default ChatSection;
