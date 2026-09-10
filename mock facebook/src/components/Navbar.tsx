import React from 'react';
import { 
  Search, 
  Home, 
  Tv, 
  Store, 
  Users, 
  Gamepad2, 
  Grid, 
  MessageCircle, 
  Bell 
} from 'lucide-react';
import { useFeedStore } from '../store/useFeedStore';
import { CURRENT_USER } from '../mockData';
import { AccountDropdown } from './AccountDropdown';

export const Navbar: React.FC = () => {
  const { toggleAccountMenu, openCreatePostModal } = useFeedStore();

  return (
    <nav className="sticky top-0 z-40 h-14 bg-white dark:bg-fb-gray-darkCard border-b border-gray-200 dark:border-fb-gray-darkBorder px-4 flex items-center justify-between shadow-xs select-none">
      {/* Left: Brand & Search */}
      <div className="flex items-center gap-2 w-1/4 min-w-[200px]">
        <div 
          className="w-10 h-10 rounded-full bg-fb-blue flex items-center justify-center text-white font-bold text-2xl cursor-pointer hover:opacity-95 transition-opacity shadow-inner flex-shrink-0"
          title="Facebook"
        >
          f
        </div>

        <div className="relative flex-1 max-w-[240px] hidden sm:block">
          <Search className="w-4 h-4 text-gray-500 dark:text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Facebook"
            className="w-full bg-[#F0F2F5] dark:bg-fb-gray-darkHover text-sm rounded-full pl-9 pr-4 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-fb-blue transition-all"
          />
        </div>
      </div>

      {/* Center: Main Navigation Tabs */}
      <div className="hidden md:flex items-center justify-center flex-1 max-w-xl h-full">
        <button 
          className="flex items-center justify-center flex-1 h-full border-b-[3px] border-fb-blue text-fb-blue hover:bg-gray-100 dark:hover:bg-fb-gray-darkHover rounded-md transition-colors"
          title="Home"
        >
          <Home className="w-7 h-7" />
        </button>
        <button 
          className="flex items-center justify-center flex-1 h-full border-b-[3px] border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-fb-gray-darkHover rounded-md transition-colors"
          title="Video"
        >
          <Tv className="w-7 h-7" />
        </button>
        <button 
          className="flex items-center justify-center flex-1 h-full border-b-[3px] border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-fb-gray-darkHover rounded-md transition-colors"
          title="Marketplace"
        >
          <Store className="w-7 h-7" />
        </button>
        <button 
          className="flex items-center justify-center flex-1 h-full border-b-[3px] border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-fb-gray-darkHover rounded-md transition-colors"
          title="Groups"
        >
          <Users className="w-7 h-7" />
        </button>
        <button 
          className="flex items-center justify-center flex-1 h-full border-b-[3px] border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-fb-gray-darkHover rounded-md transition-colors"
          title="Gaming"
        >
          <Gamepad2 className="w-7 h-7" />
        </button>
      </div>

      {/* Right: Menu, Messenger, Notifications, Profile Avatar */}
      <div className="flex items-center justify-end gap-2 w-1/4 min-w-[200px] relative">
        {/* Menu */}
        <button 
          onClick={() => openCreatePostModal('text')}
          className="hidden sm:flex w-10 h-10 rounded-full bg-gray-200 dark:bg-fb-gray-darkHover hover:bg-gray-300 dark:hover:bg-gray-600 items-center justify-center text-gray-700 dark:text-gray-200 transition-colors"
          title="Menu"
        >
          <Grid className="w-5 h-5" />
        </button>

        {/* Messenger */}
        <button 
          className="w-10 h-10 rounded-full bg-gray-200 dark:bg-fb-gray-darkHover hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-200 transition-colors relative"
          title="Messenger"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-white dark:ring-fb-gray-darkCard">
            2
          </span>
        </button>

        {/* Notifications */}
        <button 
          className="w-10 h-10 rounded-full bg-gray-200 dark:bg-fb-gray-darkHover hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-200 transition-colors relative"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-white dark:ring-fb-gray-darkCard">
            3
          </span>
        </button>

        {/* User Profile avatar dropdown toggle */}
        <div 
          onClick={toggleAccountMenu}
          className="cursor-pointer relative group flex items-center select-none"
          title="Your profile"
        >
          <img
            src={CURRENT_USER.avatarUrl}
            alt={CURRENT_USER.name}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-transparent group-hover:ring-fb-blue transition-all"
          />
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-fb-gray-darkCard rounded-full" />
        </div>

        {/* Account Menu Dropdown */}
        <AccountDropdown />
      </div>
    </nav>
  );
};
