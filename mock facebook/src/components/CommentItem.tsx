import React, { useState } from 'react';
import { ThumbsUp } from 'lucide-react';
import { Comment } from '../types';

interface CommentItemProps {
  comment: Comment;
}

export const CommentItem: React.FC<CommentItemProps> = ({ comment }) => {
  const [isLiked, setIsLiked] = useState(comment.isLiked || false);
  const [likesCount, setLikesCount] = useState(comment.likesCount || 0);

  const handleToggleLike = () => {
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    setLikesCount(prev => nextLiked ? prev + 1 : Math.max(0, prev - 1));
  };

  return (
    <div className="flex items-start gap-2 group mb-2 text-xs">
      <img 
        src={comment.author.avatarUrl} 
        alt={comment.author.name}
        className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-0.5 cursor-pointer hover:brightness-95" 
      />

      <div className="flex-1 max-w-[90%]">
        <div className="relative inline-block bg-[#F0F2F5] dark:bg-fb-gray-darkHover px-3 py-2 rounded-2xl">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-gray-900 dark:text-gray-100 hover:underline cursor-pointer">
              {comment.author.name}
            </span>
            {comment.author.verified && (
              <span className="text-fb-blue text-[10px]" title="Verified">✓</span>
            )}
          </div>

          <p className="text-gray-800 dark:text-gray-200 mt-0.5 whitespace-pre-wrap leading-relaxed select-text">
            {comment.content}
          </p>

          {/* Facebook Like Reaction Badge */}
          {likesCount > 0 && (
            <div className="absolute -bottom-2 right-1.5 bg-white dark:bg-fb-gray-darkCard shadow-xs rounded-full px-1.5 py-0.5 flex items-center gap-1 border border-gray-200 dark:border-fb-gray-darkBorder text-[10px] text-gray-600 dark:text-gray-300">
              <div className="w-3.5 h-3.5 rounded-full bg-fb-blue text-white flex items-center justify-center">
                <ThumbsUp className="w-2.5 h-2.5 fill-current" />
              </div>
              <span className="font-semibold">{likesCount}</span>
            </div>
          )}
        </div>

        {/* Comment footer actions */}
        <div className="flex items-center gap-3 px-3 mt-1 text-[11px] text-gray-500 dark:text-gray-400 font-semibold">
          <button
            type="button"
            onClick={handleToggleLike}
            className={`hover:underline transition-colors ${
              isLiked ? 'text-fb-blue font-bold' : ''
            }`}
          >
            Like
          </button>
          <button type="button" className="hover:underline">Reply</button>
          <span className="font-normal text-gray-400 dark:text-gray-500">
            {comment.formattedTime}
          </span>
        </div>
      </div>
    </div>
  );
};
