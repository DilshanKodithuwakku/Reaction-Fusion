import React, { useState, useRef } from 'react';
import { 
  ThumbsUp, 
  MessageSquare, 
  Share2, 
  MoreHorizontal, 
  Globe, 
  Bookmark, 
  Bell, 
  EyeOff, 
  Trash2, 
  X, 
  Send, 
  Camera, 
  Smile, 
  Film 
} from 'lucide-react';
import { Post, ReactionType } from '../types';
import { useFeedStore } from '../store/useFeedStore';
import { CommentItem } from './CommentItem';
import { ReactionsFlyout, REACTIONS_DATA } from './ReactionsFlyout';
import { CURRENT_USER } from '../mockData';

interface PostCardProps {
  post: Post;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showComments, setShowComments] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [isHoveringLike, setIsHoveringLike] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [copiedShare, setCopiedShare] = useState(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const commentInputRef = useRef<HTMLInputElement>(null);

  const { reactToPost, addComment, sharePost, deletePost, toggleSavePost } = useFeedStore();

  const TEXT_LIMIT = 220;
  const isLongText = post.content.length > TEXT_LIMIT && !post.backgroundGradient;
  const displayContent = isExpanded || !isLongText 
    ? post.content 
    : post.content.slice(0, TEXT_LIMIT) + '...';

  // Find active reaction metadata
  const currentReaction = post.userReaction 
    ? REACTIONS_DATA.find(r => r.type === post.userReaction) 
    : null;

  const handleMouseEnterLike = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHoveringLike(true);
    }, 300);
  };

  const handleMouseLeaveLike = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHoveringLike(false);
    }, 250);
  };

  const handleQuickLikeClick = () => {
    // If no reaction, default to 'like'. If already reacted, toggle it off.
    reactToPost(post.id, post.userReaction ? post.userReaction : 'like');
    setIsHoveringLike(false);
  };

  const handleSelectReaction = (reaction: ReactionType) => {
    reactToPost(post.id, reaction);
    setIsHoveringLike(false);
  };

  const handleCommentClick = () => {
    setShowComments(true);
    setTimeout(() => {
      commentInputRef.current?.focus();
    }, 100);
  };

  const handleShare = () => {
    sharePost(post.id);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const handleAddComment = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!commentInput.trim()) return;
    addComment(post.id, commentInput);
    setCommentInput('');
  };

  return (
    <article
      data-post-id={post.id}
      className="relative bg-white dark:bg-fb-gray-darkCard rounded-xl shadow-xs border border-gray-200 dark:border-fb-gray-darkBorder mb-4 overflow-hidden transition-all select-text"
    >
      {/* 1. Author Header */}
      <header className="flex items-center justify-between p-3.5 pb-2">
        <div className="flex items-center gap-3">
          <div className="relative cursor-pointer">
            <img
              src={post.author.avatarUrl}
              alt={post.author.name}
              className="w-10 h-10 rounded-full object-cover hover:brightness-95 transition-all"
            />
            {post.author.isOnline && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-fb-gray-darkCard rounded-full" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-1.5 flex-wrap leading-tight">
              <span className="font-semibold text-sm text-gray-900 dark:text-gray-100 hover:underline cursor-pointer">
                {post.author.name}
              </span>
              {post.author.verified && (
                <span className="text-fb-blue text-xs font-bold" title="Verified Account">✓</span>
              )}
              {post.feeling && (
                <span className="text-xs text-gray-600 dark:text-gray-400 font-normal">
                  {post.feeling}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              <span>{post.formattedTime}</span>
              <span>•</span>
              <span title="Public">
                <Globe className="w-3.5 h-3.5 inline text-gray-400" />
              </span>
            </div>
          </div>
        </div>

        {/* 3-dot Menu and Hide ('X') Button */}
        <div className="flex items-center gap-1">
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-fb-gray-darkHover flex items-center justify-center text-gray-500 dark:text-gray-300 transition-colors"
              title="Actions for this post"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-9 w-60 bg-white dark:bg-fb-gray-darkCard border border-gray-200 dark:border-fb-gray-darkBorder rounded-2xl shadow-2xl py-2 z-20 font-sans">
                <button
                  onClick={() => { toggleSavePost(post.id); setShowMenu(false); }}
                  className="w-full px-3.5 py-2 text-left text-xs font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-fb-gray-darkHover flex items-center gap-3"
                >
                  <Bookmark className={`w-4 h-4 ${post.isSaved ? 'text-fb-blue fill-current' : ''}`} />
                  <div>
                    <p className="font-semibold">{post.isSaved ? 'Unsave post' : 'Save post'}</p>
                    <p className="text-[11px] text-gray-500">Add this to your saved items</p>
                  </div>
                </button>

                <button
                  onClick={() => setShowMenu(false)}
                  className="w-full px-3.5 py-2 text-left text-xs font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-fb-gray-darkHover flex items-center gap-3"
                >
                  <Bell className="w-4 h-4" />
                  <div>
                    <p className="font-semibold">Turn on notifications for this post</p>
                  </div>
                </button>

                <button
                  onClick={() => { deletePost(post.id); setShowMenu(false); }}
                  className="w-full px-3.5 py-2 text-left text-xs font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-fb-gray-darkHover flex items-center gap-3"
                >
                  <EyeOff className="w-4 h-4" />
                  <div>
                    <p className="font-semibold">Hide post</p>
                    <p className="text-[11px] text-gray-500">See fewer posts like this</p>
                  </div>
                </button>

                <div className="h-[1px] bg-gray-200 dark:bg-fb-gray-darkBorder my-1" />

                <button
                  onClick={() => { deletePost(post.id); setShowMenu(false); }}
                  className="w-full px-3.5 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-3"
                >
                  <Trash2 className="w-4 h-4" />
                  <p className="font-semibold">Delete post</p>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => deletePost(post.id)}
            className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-fb-gray-darkHover flex items-center justify-center text-gray-500 dark:text-gray-300 transition-colors"
            title="Hide post"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* 2. Post Content */}
      {post.backgroundGradient ? (
        /* Facebook Status Background Canvas */
        <div className={`py-14 px-8 ${post.backgroundGradient} text-white flex items-center justify-center text-center shadow-inner`}>
          <p className="text-2xl sm:text-3xl font-bold leading-snug drop-shadow-md select-text">
            {post.content}
          </p>
        </div>
      ) : (
        /* Regular Text Body */
        <div className="px-3.5 py-1">
          <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-line leading-normal select-text">
            {displayContent}
          </p>
          {isLongText && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:underline mt-1 cursor-pointer"
            >
              {isExpanded ? 'See Less' : 'See More'}
            </button>
          )}
        </div>
      )}

      {/* 3. Media Area */}
      {post.mediaUrl && (
        <div className="mt-2.5 bg-black/5 dark:bg-black/40 overflow-hidden flex items-center justify-center max-h-[550px]">
          <img
            src={post.mediaUrl}
            alt="Attachment"
            className="w-full object-cover max-h-[550px] hover:brightness-95 transition-all cursor-pointer"
            loading="lazy"
          />
        </div>
      )}

      {/* 4. Metrics Bar */}
      <div className="px-3.5 py-2.5 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-fb-gray-darkBorder/60">
        <div className="flex items-center gap-1.5 cursor-pointer hover:underline">
          {post.likesCount > 0 && (
            <div className="flex items-center -space-x-1">
              <span className="w-4 h-4 rounded-full bg-fb-blue text-white flex items-center justify-center shadow-xs">
                <ThumbsUp className="w-2.5 h-2.5 fill-current" />
              </span>
              <span className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[9px] shadow-xs">
                ❤️
              </span>
            </div>
          )}
          <span>{post.likesCount > 0 ? post.likesCount : ''}</span>
        </div>

        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => setShowComments(!showComments)}
            className="hover:underline"
          >
            {post.commentsCount} comments
          </button>
          <span>{post.sharesCount} shares</span>
        </div>
      </div>

      {/* 5. Action Bar (Like with Hover Reactions Flyout, Comment, Share) */}
      <div className="px-2 py-1 flex items-center justify-between border-b border-gray-100 dark:border-fb-gray-darkBorder relative">
        {/* Like Button with Hover Flyout */}
        <div 
          className="flex-1 relative"
          onMouseEnter={handleMouseEnterLike}
          onMouseLeave={handleMouseLeaveLike}
        >
          {isHoveringLike && (
            <ReactionsFlyout onSelectReaction={handleSelectReaction} />
          )}

          <button
            type="button"
            onClick={handleQuickLikeClick}
            className={`w-full py-2 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold transition-colors ${
              currentReaction 
                ? `${currentReaction.color} font-bold hover:bg-gray-100 dark:hover:bg-fb-gray-darkHover` 
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-fb-gray-darkHover'
            }`}
          >
            {currentReaction ? (
              <>
                <span className="text-base leading-none">{currentReaction.emoji}</span>
                <span>{currentReaction.label}</span>
              </>
            ) : (
              <>
                <ThumbsUp className="w-4 h-4" />
                <span>Like</span>
              </>
            )}
          </button>
        </div>

        {/* Comment Button */}
        <button
          type="button"
          onClick={handleCommentClick}
          className="flex-1 py-2 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-fb-gray-darkHover transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Comment</span>
        </button>

        {/* Share Button */}
        <button
          type="button"
          onClick={handleShare}
          className="flex-1 py-2 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-fb-gray-darkHover transition-colors"
        >
          <Share2 className="w-4 h-4" />
          <span>{copiedShare ? 'Shared!' : 'Share'}</span>
        </button>
      </div>

      {/* 6. Comment Section */}
      {showComments && (
        <div className="p-3.5 pt-3 bg-gray-50/40 dark:bg-fb-gray-darkHover/10">
          {/* Comments List */}
          {post.comments.length > 0 && (
            <div className="space-y-1 mb-3">
              {post.comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </div>
          )}

          {/* Comment Input Box */}
          <form onSubmit={handleAddComment} className="flex items-center gap-2 mt-2">
            <img
              src={CURRENT_USER.avatarUrl}
              alt={CURRENT_USER.name}
              className="w-8 h-8 rounded-full object-cover flex-shrink-0 cursor-pointer"
            />
            <div className="flex-1 relative flex items-center bg-[#F0F2F5] dark:bg-fb-gray-darkHover rounded-full px-3 py-1.5 focus-within:ring-2 focus-within:ring-fb-blue">
              <input
                ref={commentInputRef}
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Write a comment..."
                className="w-full bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 text-xs focus:outline-none pr-16"
              />

              {/* Input tool icons */}
              <div className="absolute right-2 flex items-center gap-1 text-gray-500 dark:text-gray-400">
                <button type="button" className="p-1 hover:text-gray-700 dark:hover:text-gray-200">
                  <Smile className="w-4 h-4" />
                </button>
                <button type="button" className="p-1 hover:text-gray-700 dark:hover:text-gray-200">
                  <Camera className="w-4 h-4" />
                </button>
                <button type="button" className="p-1 hover:text-gray-700 dark:hover:text-gray-200">
                  <Film className="w-4 h-4" />
                </button>
                {commentInput.trim() && (
                  <button
                    type="submit"
                    className="p-1 text-fb-blue hover:text-fb-blue-hover"
                    title="Send comment"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      )}
    </article>
  );
};
