import React from 'react';
import { 
  Settings, 
  HelpCircle, 
  Moon, 
  MessageSquareWarning, 
  LogOut, 
  ChevronRight 
} from 'lucide-react';
import { useFeedStore } from '../store/useFeedStore';
import { CURRENT_USER } from '../mockData';

export const AccountDropdown: React.FC = () => {
  const { isAccountMenuOpen, closeAccountMenu, darkMode, toggleDarkMode } = useFeedStore();

  if (!isAccountMenuOpen) return null;

  return (
    <div 
      className="absolute right-4 top-14 w-80 bg-white dark:bg-fb-gray-darkCard rounded-2xl shadow-2xl border border-gray-200 dark:border-fb-gray-darkBorder p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150 font-sans"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Profile Card */}
      <div 
        onClick={closeAccountMenu}
        className="p-2.5 rounded-xl shadow-xs border border-gray-100 dark:border-fb-gray-darkBorder/60 hover:bg-gray-100 dark:hover:bg-fb-gray-darkHover cursor-pointer transition-colors"
      >
        <div className="flex items-center gap-3">
          <img
            src={CURRENT_USER.avatarUrl}
            alt={CURRENT_USER.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex flex-col">
            <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
              {CURRENT_USER.name}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              See your profile
            </span>
          </div>
        </div>
      </div>

      <div className="h-[1px] bg-gray-200 dark:bg-fb-gray-darkBorder my-2" />

      {/* Menu Options */}
      <div className="space-y-0.5 text-xs text-gray-800 dark:text-gray-200">
        <div className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-fb-gray-darkHover cursor-pointer transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-fb-gray-darkHover flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <span className="font-medium text-sm">Settings & privacy</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>

        <div className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-fb-gray-darkHover cursor-pointer transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-fb-gray-darkHover flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <span className="font-medium text-sm">Help & support</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>

        {/* Display & Accessibility / Dark Mode Toggle */}
        <div 
          onClick={toggleDarkMode}
          className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-fb-gray-darkHover cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-fb-gray-darkHover flex items-center justify-center">
              <Moon className="w-5 h-5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-medium text-sm">Display & accessibility</span>
              <span className="text-[11px] text-gray-500 dark:text-gray-400">
                Dark mode: {darkMode ? 'On' : 'Off'}
              </span>
            </div>
          </div>
          {/* Custom iOS/FB toggle switch */}
          <div className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${darkMode ? 'bg-fb-blue' : 'bg-gray-300'}`}>
            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${darkMode ? 'translate-x-4' : 'translate-x-0'}`} />
          </div>
        </div>

        <div className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-fb-gray-darkHover cursor-pointer transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-fb-gray-darkHover flex items-center justify-center">
              <MessageSquareWarning className="w-5 h-5" />
            </div>
            <span className="font-medium text-sm">Give feedback</span>
          </div>
        </div>

        <div className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-fb-gray-darkHover cursor-pointer transition-colors text-red-600">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center">
              <LogOut className="w-5 h-5 text-red-600" />
            </div>
            <span className="font-medium text-sm">Log Out</span>
          </div>
        </div>
      </div>

      <div className="mt-3 px-2 text-[11px] text-gray-400 dark:text-gray-500 leading-tight">
        Privacy · Terms · Advertising · Cookies · More · Meta © 2026
      </div>
    </div>
  );
};
