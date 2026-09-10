import React from 'react';
import { Search, MoreHorizontal, Gift } from 'lucide-react';
import { MOCK_SPONSORED, MOCK_USERS, MOCK_BIRTHDAY } from '../mockData';
import { useFeedStore } from '../store/useFeedStore';

export const RightSidebar: React.FC = () => {
  const { openChat } = useFeedStore();

  return (
    <aside className="hidden xl:block w-[300px] xl:w-[340px] h-[calc(100vh-3.5rem)] sticky top-14 overflow-y-auto px-3 py-3 select-none flex-shrink-0">
      {/* 1. Sponsored Section */}
      <div className="pb-4 border-b border-gray-200 dark:border-fb-gray-darkBorder">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 px-1">
          Sponsored
        </h3>
        <div className="space-y-2">
          {MOCK_SPONSORED.map((ad) => (
            <a 
              key={ad.id}
              href={`#${ad.id}`}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-200/70 dark:hover:bg-fb-gray-darkHover transition-colors group cursor-pointer block"
            >
              <img 
                src={ad.imageUrl} 
                alt={ad.title} 
                className="w-24 h-24 object-cover rounded-xl flex-shrink-0"
              />
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-1 group-hover:underline">
                  {ad.title}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {ad.url}
                </span>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-2 leading-relaxed">
                  {ad.description}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* 2. Birthdays Section */}
      <div className="py-3 border-b border-gray-200 dark:border-fb-gray-darkBorder px-1">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
          Birthdays
        </h3>
        <div 
          onClick={() => openChat(MOCK_BIRTHDAY.user)}
          className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-200/70 dark:hover:bg-fb-gray-darkHover cursor-pointer transition-colors"
        >
          <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-950/40 text-fb-blue flex items-center justify-center flex-shrink-0">
            <Gift className="w-5 h-5 text-fb-blue" />
          </div>
          <p className="text-xs text-gray-800 dark:text-gray-200 leading-normal">
            <span className="font-semibold">{MOCK_BIRTHDAY.user.name}</span> and <span className="font-semibold">{MOCK_BIRTHDAY.othersCount} others</span> have birthdays today.
          </p>
        </div>
      </div>

      {/* 3. Contacts / Messenger Sidebar */}
      <div className="pt-3">
        <div className="flex items-center justify-between mb-1 px-1">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
            Contacts
          </h3>
          <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
            <button className="hover:bg-gray-200 dark:hover:bg-fb-gray-darkHover p-1.5 rounded-full" title="Search Contact">
              <Search className="w-4 h-4" />
            </button>
            <button className="hover:bg-gray-200 dark:hover:bg-fb-gray-darkHover p-1.5 rounded-full" title="Options">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-0.5">
          {MOCK_USERS.map((user) => (
            <div 
              key={user.id}
              onClick={() => openChat(user)}
              className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-200/70 dark:hover:bg-fb-gray-darkHover cursor-pointer transition-colors group"
            >
              <div className="relative flex-shrink-0">
                <img 
                  src={user.avatarUrl} 
                  alt={user.name} 
                  className="w-9 h-9 rounded-full object-cover"
                />
                {user.isOnline && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-fb-gray-darkCard rounded-full" />
                )}
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {user.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};
