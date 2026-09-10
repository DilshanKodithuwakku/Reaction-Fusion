export type ReactionType = 'like' | 'love' | 'care' | 'haha' | 'wow' | 'sad' | 'angry';

export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  isOnline?: boolean;
  verified?: boolean;
  bio?: string;
}

export interface Story {
  id: string;
  author: User;
  mediaUrl: string;
  isViewed?: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
}

export interface Comment {
  id: string;
  postId: string;
  author: User;
  content: string;
  timestamp: number;
  formattedTime: string;
  likesCount: number;
  isLiked?: boolean;
}

export interface Post {
  id: string;
  author: User;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  backgroundGradient?: string;
  feeling?: string;
  timestamp: number;
  formattedTime: string;
  likesCount: number;
  userReaction?: ReactionType | null;
  commentsCount: number;
  sharesCount: number;
  isSaved?: boolean;
  comments: Comment[];
  privacy?: 'public' | 'friends' | 'only_me';
}
