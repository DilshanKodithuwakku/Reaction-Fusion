import React from 'react';
import { ReactionType } from '../types';

interface ReactionsFlyoutProps {
  onSelectReaction: (reaction: ReactionType) => void;
}

export const REACTIONS_DATA: { type: ReactionType; label: string; emoji: string; color: string }[] = [
  { type: 'like', label: 'Like', emoji: '👍', color: 'text-fb-blue' },
  { type: 'love', label: 'Love', emoji: '❤️', color: 'text-rose-500' },
  { type: 'care', label: 'Care', emoji: '🥰', color: 'text-amber-500' },
  { type: 'haha', label: 'Haha', emoji: '😆', color: 'text-amber-500' },
  { type: 'wow', label: 'Wow', emoji: '😮', color: 'text-amber-500' },
  { type: 'sad', label: 'Sad', emoji: '😢', color: 'text-amber-500' },
  { type: 'angry', label: 'Angry', emoji: '😡', color: 'text-orange-600' },
];

export const ReactionsFlyout: React.FC<ReactionsFlyoutProps> = ({ onSelectReaction }) => {
  return (
    <div 
      className="absolute bottom-11 left-0 z-30 bg-white dark:bg-fb-gray-darkCard border border-gray-200 dark:border-fb-gray-darkBorder rounded-full shadow-xl px-2 py-1.5 flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-150"
      onClick={(e) => e.stopPropagation()}
    >
      {REACTIONS_DATA.map((r) => (
        <button
          key={r.type}
          type="button"
          onClick={() => onSelectReaction(r.type)}
          className="relative group/emoji w-9 h-9 rounded-full hover:bg-gray-100 dark:hover:bg-fb-gray-darkHover flex items-center justify-center transition-transform hover:scale-135 duration-200 cursor-pointer"
        >
          {/* Reaction Label Tooltip */}
          <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-900/90 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full opacity-0 group-hover/emoji:opacity-100 pointer-events-none transition-opacity">
            {r.label}
          </span>
          <span className="text-2xl select-none transform transition-transform group-hover/emoji:-translate-y-1">
            {r.emoji}
          </span>
        </button>
      ))}
    </div>
  );
};
