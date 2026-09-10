import React, { useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';
import { StoriesTray } from './components/StoriesTray';
import { CreatePost } from './components/CreatePost';
import { PostCard } from './components/PostCard';
import { CreatePostModal } from './components/CreatePostModal';
import { ChatWindow } from './components/ChatWindow';
import { useFeedStore } from './store/useFeedStore';

export const App: React.FC = () => {
  const { posts, closeAccountMenu, fetchPosts, isLoading } = useFeedStore();

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <div 
      onClick={closeAccountMenu}
      className="min-h-screen bg-[#F0F2F5] dark:bg-fb-gray-darkBg text-gray-900 dark:text-gray-100 flex flex-col font-sans transition-colors duration-200 antialiased"
    >
      {/* 1. Top Facebook Navbar */}
      <Navbar />

      {/* 2. Main 3-Column Desktop Layout */}
      <div className="flex-1 flex justify-center max-w-[1920px] w-full mx-auto">
        {/* Left Column: Navigation Sidebar */}
        <LeftSidebar />

        {/* Center Column: Stories Tray & News Feed */}
        <main className="flex-1 max-w-[680px] px-2 sm:px-4 py-4 min-w-0">
          {/* Stories & Reels Tray */}
          <StoriesTray />

          {/* Create Post Widget */}
          <CreatePost />

          {/* News Feed Stream */}
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {/* Bottom Feed Sentinel */}
          <div className="py-8 text-center text-xs text-gray-400 dark:text-gray-500 select-none">
            {isLoading ? (
              <>
                <div className="w-8 h-8 border-2 border-fb-blue border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <span>සටහන් පූරණය වෙමින් පවතී...</span>
              </>
            ) : (
              <span>ඔබ සියලු නවතම සටහන් නරඹා ඇත.</span>
            )}
          </div>
        </main>

        {/* Right Column: Sponsored, Birthdays, and Active Contacts */}
        <RightSidebar />
      </div>

      {/* 3. Authentic Facebook Create Post Dialog */}
      <CreatePostModal />

      {/* 4. Docked Messenger Chat Window */}
      <ChatWindow />
    </div>
  );
};

export default App;
