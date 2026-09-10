import React, { useState } from 'react';
import { 
  Users, 
  Bookmark, 
  Store, 
  Clock, 
  Calendar, 
  Flag, 
  ChevronDown, 
  ChevronUp,
  Tv,
  Rss,
  HeartHandshake,
  CreditCard
} from 'lucide-react';
import { CURRENT_USER } from '../mockData';

export const LeftSidebar: React.FC = () => {
  const [showMore, setShowMore] = useState(false);

  return (
    <aside className="hidden lg:block w-[280px] xl:w-[320px] h-[calc(100vh-3.5rem)] sticky top-14 overflow-y-auto px-2 py-3 select-none flex-shrink-0">
      {/* Current User Profile link */}
      <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-200/70 dark:hover:bg-fb-gray-darkHover cursor-pointer transition-colors">
        <img 
          src={CURRENT_USER.avatarUrl} 
          alt={CURRENT_USER.name} 
          className="w-9 h-9 rounded-full object-cover" 
        />
        <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">{CURRENT_USER.name}</span>
      </div>

      {/* Primary Facebook Links */}
      <div className="space-y-0.5 mt-1 border-b border-gray-200 dark:border-fb-gray-darkBorder pb-2">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-200/70 dark:hover:bg-fb-gray-darkHover cursor-pointer transition-colors">
          <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/40 text-fb-blue flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <span className="font-medium text-sm text-gray-900 dark:text-gray-100">Friends</span>
        </div>

        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-200/70 dark:hover:bg-fb-gray-darkHover cursor-pointer transition-colors">
          <div className="w-9 h-9 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-600 flex items-center justify-center">
            <Rss className="w-5 h-5" />
          </div>
          <span className="font-medium text-sm text-gray-900 dark:text-gray-100">Feeds</span>
        </div>

        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-200/70 dark:hover:bg-fb-gray-darkHover cursor-pointer transition-colors">
          <div className="w-9 h-9 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <span className="font-medium text-sm text-gray-900 dark:text-gray-100">Groups</span>
        </div>

        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-200/70 dark:hover:bg-fb-gray-darkHover cursor-pointer transition-colors">
          <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 flex items-center justify-center">
            <Store className="w-5 h-5" />
          </div>
          <span className="font-medium text-sm text-gray-900 dark:text-gray-100">Marketplace</span>
        </div>

        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-200/70 dark:hover:bg-fb-gray-darkHover cursor-pointer transition-colors">
          <div className="w-9 h-9 rounded-full bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 flex items-center justify-center">
            <Tv className="w-5 h-5" />
          </div>
          <span className="font-medium text-sm text-gray-900 dark:text-gray-100">Video</span>
        </div>

        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-200/70 dark:hover:bg-fb-gray-darkHover cursor-pointer transition-colors">
          <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <span className="font-medium text-sm text-gray-900 dark:text-gray-100">Memories</span>
        </div>

        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-200/70 dark:hover:bg-fb-gray-darkHover cursor-pointer transition-colors">
          <div className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 flex items-center justify-center">
            <Bookmark className="w-5 h-5" />
          </div>
          <span className="font-medium text-sm text-gray-900 dark:text-gray-100">Saved</span>
        </div>

        {/* Collapsible Additional Links */}
        {showMore && (
          <>
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-200/70 dark:hover:bg-fb-gray-darkHover cursor-pointer transition-colors">
              <div className="w-9 h-9 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-600 flex items-center justify-center">
                <Flag className="w-5 h-5" />
              </div>
              <span className="font-medium text-sm text-gray-900 dark:text-gray-100">Pages</span>
            </div>

            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-200/70 dark:hover:bg-fb-gray-darkHover cursor-pointer transition-colors">
              <div className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-900/40 text-red-500 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="font-medium text-sm text-gray-900 dark:text-gray-100">Events</span>
            </div>

            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-200/70 dark:hover:bg-fb-gray-darkHover cursor-pointer transition-colors">
              <div className="w-9 h-9 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-500 flex items-center justify-center">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <span className="font-medium text-sm text-gray-900 dark:text-gray-100">Fundraisers</span>
            </div>

            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-200/70 dark:hover:bg-fb-gray-darkHover cursor-pointer transition-colors">
              <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-500 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <span className="font-medium text-sm text-gray-900 dark:text-gray-100">Orders & payments</span>
            </div>
          </>
        )}

        {/* See more toggle */}
        <div 
          onClick={() => setShowMore(!showMore)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-200/70 dark:hover:bg-fb-gray-darkHover cursor-pointer transition-colors"
        >
          <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-fb-gray-darkHover text-gray-700 dark:text-gray-300 flex items-center justify-center">
            {showMore ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
          <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
            {showMore ? 'See less' : 'See more'}
          </span>
        </div>
      </div>

      {/* Your Shortcuts */}
      <div className="mt-3">
        <h4 className="px-3 text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
          Your shortcuts
        </h4>
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-200/70 dark:hover:bg-fb-gray-darkHover cursor-pointer transition-colors">
          <img 
            src="https://images.unsplash.com/photo-1551632811-561732d1e306?w=100&auto=format&fit=crop&q=80" 
            alt="Group" 
            className="w-9 h-9 rounded-xl object-cover" 
          />
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
            Pacific Ridge Trail Hikers
          </span>
        </div>
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-200/70 dark:hover:bg-fb-gray-darkHover cursor-pointer transition-colors">
          <img 
            src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&auto=format&fit=crop&q=80" 
            alt="Group" 
            className="w-9 h-9 rounded-xl object-cover" 
          />
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
            Vintage Vinyl & Audio Club
          </span>
        </div>
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-200/70 dark:hover:bg-fb-gray-darkHover cursor-pointer transition-colors">
          <img 
            src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=100&auto=format&fit=crop&q=80" 
            alt="Group" 
            className="w-9 h-9 rounded-xl object-cover" 
          />
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
            Bay Area Photographers
          </span>
        </div>
      </div>

      {/* Meta Footer */}
      <div className="px-3 mt-6 text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <p className="leading-normal">
          Privacy · Terms · Advertising · Ad Choices · Cookies · More · Meta © 2026
        </p>
      </div>
    </aside>
  );
};
