import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Minus, 
  Phone, 
  Video, 
  Send, 
  Smile, 
  Image as ImageIcon 
} from 'lucide-react';
import { useFeedStore } from '../store/useFeedStore';

export const ChatWindow: React.FC = () => {
  const { activeChat, closeChat, chatMessages, sendMessage } = useFeedStore();
  const [inputText, setInputText] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = activeChat ? chatMessages[activeChat.id] || [] : [];

  useEffect(() => {
    if (!isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isMinimized]);

  if (!activeChat) return null;

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(activeChat.id, inputText);
    setInputText('');
  };

  return (
    <div className="fixed bottom-0 right-16 sm:right-24 z-40 w-80 sm:w-[330px] bg-white dark:bg-fb-gray-darkCard rounded-t-xl shadow-2xl border border-b-0 border-gray-200 dark:border-fb-gray-darkBorder flex flex-col font-sans transition-all">
      {/* Header */}
      <div 
        className="p-2.5 bg-white dark:bg-fb-gray-darkCard border-b border-gray-200 dark:border-fb-gray-darkBorder rounded-t-xl flex items-center justify-between shadow-xs cursor-pointer"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative flex-shrink-0">
            <img
              src={activeChat.avatarUrl}
              alt={activeChat.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            {activeChat.isOnline && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-fb-gray-darkCard rounded-full" />
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">
              {activeChat.name}
            </span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400">
              {activeChat.isOnline ? 'Active now' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 text-fb-blue" onClick={(e) => e.stopPropagation()}>
          <button type="button" className="p-1 hover:bg-gray-100 dark:hover:bg-fb-gray-darkHover rounded-full" title="Start voice call">
            <Phone className="w-3.5 h-3.5" />
          </button>
          <button type="button" className="p-1 hover:bg-gray-100 dark:hover:bg-fb-gray-darkHover rounded-full" title="Start video call">
            <Video className="w-3.5 h-3.5" />
          </button>
          <button 
            type="button" 
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-fb-gray-darkHover rounded-full text-gray-500 dark:text-gray-400" 
            title={isMinimized ? "Expand" : "Minimize"}
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button 
            type="button" 
            onClick={closeChat}
            className="p-1 hover:bg-gray-100 dark:hover:bg-fb-gray-darkHover rounded-full text-gray-500 dark:text-gray-400" 
            title="Close chat"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Body & Input (hidden when minimized) */}
      {!isMinimized && (
        <>
          {/* Scrollable messages container */}
          <div className="h-72 overflow-y-auto p-3 space-y-2 text-xs bg-white dark:bg-fb-gray-darkCard">
            {messages.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <img src={activeChat.avatarUrl} alt="" className="w-14 h-14 rounded-full mx-auto mb-2 object-cover" />
                <p className="font-semibold text-gray-800 dark:text-gray-200">{activeChat.name}</p>
                <p className="text-[11px]">You're friends on Facebook</p>
                <p className="text-[11px] mt-2">Say hi to start the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderId === 'user-me';
                return (
                  <div 
                    key={msg.id}
                    className={`flex items-end gap-1.5 ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isMe && (
                      <img
                        src={activeChat.avatarUrl}
                        alt=""
                        className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                      />
                    )}
                    <div
                      className={`max-w-[75%] px-3 py-2 rounded-2xl ${
                        isMe
                          ? 'bg-fb-blue text-white rounded-br-xs'
                          : 'bg-gray-100 dark:bg-fb-gray-darkHover text-gray-900 dark:text-gray-100 rounded-bl-xs'
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message input */}
          <form 
            onSubmit={handleSend}
            className="p-2 border-t border-gray-200 dark:border-fb-gray-darkBorder flex items-center gap-1.5 bg-white dark:bg-fb-gray-darkCard"
          >
            <div className="flex items-center gap-0.5 text-fb-blue">
              <button type="button" className="p-1 hover:bg-gray-100 dark:hover:bg-fb-gray-darkHover rounded-full">
                <ImageIcon className="w-4 h-4" />
              </button>
              <button type="button" className="p-1 hover:bg-gray-100 dark:hover:bg-fb-gray-darkHover rounded-full">
                <Smile className="w-4 h-4" />
              </button>
            </div>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Aa"
              className="flex-1 bg-[#F0F2F5] dark:bg-fb-gray-darkHover text-gray-900 dark:text-gray-100 placeholder-gray-500 rounded-full px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-fb-blue"
            />

            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-1.5 text-fb-blue hover:bg-blue-50 dark:hover:bg-fb-gray-darkHover rounded-full disabled:opacity-30 transition-opacity"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </>
      )}
    </div>
  );
};
