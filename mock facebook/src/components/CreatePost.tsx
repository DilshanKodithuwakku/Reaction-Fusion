import React from 'react';
import { Video, Image as ImageIcon, Smile } from 'lucide-react';
import { useFeedStore } from '../store/useFeedStore';
import { CURRENT_USER } from '../mockData';

export const CreatePost: React.FC = () => {
  const { openCreatePostModal } = useFeedStore();

  return (
    <div className="bg-white dark:bg-fb-gray-darkCard rounded-xl shadow-xs border border-gray-200 dark:border-fb-gray-darkBorder p-3.5 mb-4 transition-all">
      {/* Upper section: Avatar and trigger */}
      <div className="flex items-center gap-2.5">
        <img 
          src={CURRENT_USER.avatarUrl} 
          alt={CURRENT_USER.name} 
          className="w-10 h-10 rounded-full object-cover flex-shrink-0 cursor-pointer hover:brightness-95" 
        />
        <button
          type="button"
          onClick={() => openCreatePostModal('text')}
          className="flex-1 text-left bg-[#F0F2F5] dark:bg-fb-gray-darkHover hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400 rounded-full px-4 py-2.5 text-sm font-normal transition-colors cursor-pointer"
        >
          What's on your mind, {CURRENT_USER.name.split(' ')[0]}?
        </button>
      </div>

      <div className="h-[1px] bg-gray-200 dark:bg-fb-gray-darkBorder my-3" />

      {/* Lower section: 3 authentic Facebook buttons */}
      <div className="flex items-center justify-between px-1">
        <button
          type="button"
          onClick={() => openCreatePostModal('text')}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-fb-gray-darkHover text-gray-600 dark:text-gray-300 text-xs sm:text-sm font-semibold transition-colors"
        >
          <Video className="w-6 h-6 text-rose-500" />
          <span className="hidden sm:inline">Live video</span>
        </button>

        <button
          type="button"
          onClick={() => openCreatePostModal('photo')}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-fb-gray-darkHover text-gray-600 dark:text-gray-300 text-xs sm:text-sm font-semibold transition-colors"
        >
          <ImageIcon className="w-6 h-6 text-green-500" />
          <span className="hidden sm:inline">Photo/video</span>
        </button>

        <button
          type="button"
          onClick={() => openCreatePostModal('feeling')}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-fb-gray-darkHover text-gray-600 dark:text-gray-300 text-xs sm:text-sm font-semibold transition-colors"
        >
          <Smile className="w-6 h-6 text-amber-500" />
          <span className="hidden sm:inline">Feeling/activity</span>
        </button>
      </div>
    </div>
  );
};
