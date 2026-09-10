import React, { useRef } from 'react';
import { Plus, ChevronRight, ChevronLeft } from 'lucide-react';
import { CURRENT_USER, MOCK_STORIES } from '../mockData';

export const StoriesTray: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = direction === 'left' ? -260 : 260;
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative mb-4 group/tray">
      {/* Scroll Left Button */}
      <button
        type="button"
        onClick={() => handleScroll('left')}
        className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white dark:bg-fb-gray-darkCard text-gray-700 dark:text-gray-200 shadow-md border border-gray-200 dark:border-fb-gray-darkBorder items-center justify-center hover:bg-gray-100 dark:hover:bg-fb-gray-darkHover transition-all opacity-0 group-hover/tray:opacity-100"
        title="Previous stories"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* Stories Carousel */}
      <div
        ref={scrollRef}
        className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* 1. Create Story Card */}
        <div className="relative flex-shrink-0 w-28 sm:w-32 h-48 sm:h-52 rounded-xl overflow-hidden shadow-xs border border-gray-200 dark:border-fb-gray-darkBorder bg-white dark:bg-fb-gray-darkCard cursor-pointer group flex flex-col justify-between">
          <div className="h-[70%] overflow-hidden">
            <img
              src={CURRENT_USER.avatarUrl}
              alt={CURRENT_USER.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          {/* Plus icon button centered on the seam */}
          <div className="absolute top-[62%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-fb-blue border-4 border-white dark:border-fb-gray-darkCard text-white flex items-center justify-center shadow-md">
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div className="h-[30%] pt-4 pb-2 px-2 text-center flex items-center justify-center">
            <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 leading-tight">
              Create story
            </span>
          </div>
        </div>

        {/* 2. Friend Story Cards */}
        {MOCK_STORIES.map((story) => (
          <div
            key={story.id}
            className="relative flex-shrink-0 w-28 sm:w-32 h-48 sm:h-52 rounded-xl overflow-hidden shadow-xs border border-gray-200 dark:border-fb-gray-darkBorder cursor-pointer group select-none"
          >
            {/* Background Story Image */}
            <img
              src={story.mediaUrl}
              alt={story.author.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />

            {/* Dark gradient for text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/75 pointer-events-none" />

            {/* Author Avatar Top-Left with Story Ring */}
            <div className="absolute top-3 left-3 z-10">
              <img
                src={story.author.avatarUrl}
                alt={story.author.name}
                className={`w-9 h-9 rounded-full object-cover ring-4 ${
                  story.isViewed ? 'ring-gray-400' : 'ring-fb-blue'
                }`}
              />
            </div>

            {/* Author Name Bottom */}
            <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10">
              <p className="text-white text-xs font-semibold leading-tight drop-shadow-md truncate">
                {story.author.name}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Scroll Right Button */}
      <button
        type="button"
        onClick={() => handleScroll('right')}
        className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white dark:bg-fb-gray-darkCard text-gray-700 dark:text-gray-200 shadow-md border border-gray-200 dark:border-fb-gray-darkBorder items-center justify-center hover:bg-gray-100 dark:hover:bg-fb-gray-darkHover transition-all opacity-0 group-hover/tray:opacity-100"
        title="Next stories"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
};
