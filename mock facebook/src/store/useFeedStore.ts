import { create } from 'zustand';
import { Post, Comment, User, ReactionType, ChatMessage } from '../types';
import { INITIAL_POSTS, CURRENT_USER, MOCK_INITIAL_MESSAGES } from '../mockData';

const API_BASE = 'http://localhost:4000/api';

interface FeedState {
  posts: Post[];
  isLoading: boolean;
  backendError: string | null;
  darkMode: boolean;
  activeChat: User | null;
  chatMessages: Record<string, ChatMessage[]>;
  isCreatePostModalOpen: boolean;
  modalInitialType: 'text' | 'photo' | 'feeling';
  isAccountMenuOpen: boolean;
  
  // API Sync Actions
  fetchPosts: () => Promise<void>;
  openCreatePostModal: (type?: 'text' | 'photo' | 'feeling') => void;
  closeCreatePostModal: () => void;
  addPost: (
    content: string, 
    mediaUrl?: string, 
    backgroundGradient?: string, 
    feeling?: string, 
    privacy?: 'public' | 'friends' | 'only_me'
  ) => Promise<void>;
  reactToPost: (postId: string, reaction: ReactionType) => Promise<void>;
  addComment: (postId: string, content: string) => Promise<void>;
  sharePost: (postId: string) => void;
  deletePost: (postId: string) => void;
  toggleSavePost: (postId: string) => void;

  // Chat Actions
  openChat: (user: User) => void;
  closeChat: () => void;
  sendMessage: (recipientId: string, text: string) => void;

  // UI Actions
  toggleDarkMode: () => void;
  toggleAccountMenu: () => void;
  closeAccountMenu: () => void;
}

// Helper to format relative time
function formatRelativeTime(date: Date): string {
  const now = Date.now();
  const diffMinutes = Math.max(1, Math.floor((now - date.getTime()) / (1000 * 60)));
  if (diffMinutes < 60) return `${diffMinutes}m`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d`;
}

// Helper to map backend Post response to frontend Post structure
interface BackendAuthor {
  id: string;
  name: string;
  avatarUrl: string;
  handle: string;
}

interface BackendComment {
  id: string;
  authorId: string;
  text: string;
  createdAt: string;
  author: BackendAuthor;
}

interface BackendPost {
  id: string;
  content: string;
  mediaUrl: string | null;
  createdAt: string;
  author: BackendAuthor;
  metrics?: {
    totalReactions: number;
    totalComments: number;
    reactionsByType: Record<string, number>;
  };
  recentComments?: BackendComment[];
}

function mapBackendPost(bp: BackendPost): Post {
  return {
    id: bp.id,
    author: bp.author,
    content: bp.content,
    mediaUrl: bp.mediaUrl || undefined,
    timestamp: new Date(bp.createdAt).getTime(),
    formattedTime: formatRelativeTime(new Date(bp.createdAt)),
    likesCount: bp.metrics?.totalReactions || 0,
    userReaction: null,
    commentsCount: bp.metrics?.totalComments || (bp.recentComments?.length || 0),
    sharesCount: Math.floor(Math.random() * 8) + 1,
    isSaved: false,
    privacy: 'public',
    comments: (bp.recentComments || []).map((c) => ({
      id: c.id,
      postId: bp.id,
      author: c.author,
      content: c.text,
      timestamp: new Date(c.createdAt).getTime(),
      formattedTime: formatRelativeTime(new Date(c.createdAt)),
      likesCount: 0,
      isLiked: false,
    })),
  };
}

export const useFeedStore = create<FeedState>((set, get) => {
  const initialDark = typeof window !== 'undefined' 
    ? (localStorage.getItem('fb_dark_mode') === 'true' || window.matchMedia('(prefers-color-scheme: dark)').matches)
    : false;

  if (typeof document !== 'undefined' && initialDark) {
    document.documentElement.classList.add('dark');
  }

  return {
    posts: JSON.parse(JSON.stringify(INITIAL_POSTS)),
    isLoading: false,
    backendError: null,
    darkMode: initialDark,
    activeChat: null,
    chatMessages: JSON.parse(JSON.stringify(MOCK_INITIAL_MESSAGES)),
    isCreatePostModalOpen: false,
    modalInitialType: 'text',
    isAccountMenuOpen: false,

    fetchPosts: async () => {
      set({ isLoading: true, backendError: null });
      try {
        const response = await fetch(`${API_BASE}/posts?limit=25`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const result = await response.json();
        
        if (result.success && Array.isArray(result.data)) {
          const livePosts = result.data.map(mapBackendPost);
          set({ posts: livePosts, isLoading: false });
        } else {
          set({ isLoading: false });
        }
      } catch (err: unknown) {
        console.warn('[FeedStore] Backend connection failed, using local seed:', err);
        set({ 
          isLoading: false, 
          backendError: 'Backend offline, displaying cached Sinhala feed.' 
        });
      }
    },

    openCreatePostModal: (type = 'text') => {
      set({ isCreatePostModalOpen: true, modalInitialType: type, isAccountMenuOpen: false });
    },

    closeCreatePostModal: () => {
      set({ isCreatePostModalOpen: false });
    },

    addPost: async (content, mediaUrl, backgroundGradient, feeling, privacy = 'public') => {
      // 1. Optimistic local post creation
      const tempId = 'post-' + Date.now().toString();
      const newPost: Post = {
        id: tempId,
        author: CURRENT_USER,
        content,
        mediaUrl: mediaUrl?.trim() || undefined,
        mediaType: mediaUrl ? 'image' : undefined,
        backgroundGradient: backgroundGradient || undefined,
        feeling: feeling || undefined,
        timestamp: Date.now(),
        formattedTime: 'Just now',
        likesCount: 0,
        userReaction: null,
        commentsCount: 0,
        sharesCount: 0,
        isSaved: false,
        privacy,
        comments: [],
      };

      set((state) => ({
        posts: [newPost, ...state.posts],
        isCreatePostModalOpen: false,
      }));

      // 2. Sync with backend API
      try {
        const res = await fetch(`${API_BASE}/posts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            authorId: CURRENT_USER.id,
            content,
            mediaUrl: mediaUrl?.trim() || null,
          }),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data?.id) {
            // Update temp ID with real ID
            set((state) => ({
              posts: state.posts.map((p) => (p.id === tempId ? { ...p, id: json.data.id } : p)),
            }));
          }
        }
      } catch (err) {
        console.warn('[FeedStore] Error saving post to backend:', err);
      }
    },

    reactToPost: async (postId: string, reaction: ReactionType) => {
      let nextReaction: ReactionType | null = reaction;

      // 1. Optimistic local state update
      set((state) => ({
        posts: state.posts.map((p) => {
          if (p.id === postId) {
            if (p.userReaction === reaction) {
              nextReaction = null;
              return {
                ...p,
                userReaction: null,
                likesCount: Math.max(0, p.likesCount - 1),
              };
            }
            const wasUnreacted = !p.userReaction;
            return {
              ...p,
              userReaction: reaction,
              likesCount: wasUnreacted ? p.likesCount + 1 : p.likesCount,
            };
          }
          return p;
        }),
      }));

      // 2. Sync with backend API & trigger webhook
      try {
        if (nextReaction) {
          await fetch(`${API_BASE}/posts/${postId}/reactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: CURRENT_USER.id,
              type: nextReaction.toUpperCase(),
            }),
          });
        } else {
          await fetch(`${API_BASE}/posts/${postId}/reactions`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: CURRENT_USER.id,
            }),
          });
        }
      } catch (err) {
        console.warn('[FeedStore] Error syncing reaction with backend:', err);
      }
    },

    addComment: async (postId: string, content: string) => {
      if (!content.trim()) return;

      const tempCommId = 'comm-' + Date.now().toString();
      const newComment: Comment = {
        id: tempCommId,
        postId,
        author: CURRENT_USER,
        content: content.trim(),
        timestamp: Date.now(),
        formattedTime: 'Just now',
        likesCount: 0,
        isLiked: false,
      };

      // 1. Optimistic update
      set((state) => ({
        posts: state.posts.map((p) => {
          if (p.id === postId) {
            return {
              ...p,
              commentsCount: p.commentsCount + 1,
              comments: [...p.comments, newComment],
            };
          }
          return p;
        }),
      }));

      // 2. Sync with backend & trigger webhook
      try {
        const res = await fetch(`${API_BASE}/posts/${postId}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            authorId: CURRENT_USER.id,
            text: content.trim(),
          }),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data?.id) {
            set((state) => ({
              posts: state.posts.map((p) => {
                if (p.id === postId) {
                  return {
                    ...p,
                    comments: p.comments.map((c) => (c.id === tempCommId ? { ...c, id: json.data.id } : c)),
                  };
                }
                return p;
              }),
            }));
          }
        }
      } catch (err) {
        console.warn('[FeedStore] Error saving comment to backend:', err);
      }
    },

    sharePost: (postId: string) => {
      set((state) => ({
        posts: state.posts.map((p) => {
          if (p.id === postId) {
            return { ...p, sharesCount: p.sharesCount + 1 };
          }
          return p;
        }),
      }));
    },

    deletePost: (postId: string) => {
      set((state) => ({
        posts: state.posts.filter((p) => p.id !== postId),
      }));
    },

    toggleSavePost: (postId: string) => {
      set((state) => ({
        posts: state.posts.map((p) => {
          if (p.id === postId) {
            return { ...p, isSaved: !p.isSaved };
          }
          return p;
        }),
      }));
    },

    openChat: (user: User) => {
      set({ activeChat: user });
    },

    closeChat: () => {
      set({ activeChat: null });
    },

    sendMessage: (recipientId: string, text: string) => {
      if (!text.trim()) return;
      const newMsg: ChatMessage = {
        id: 'msg-' + Date.now().toString(),
        senderId: 'user-me',
        text: text.trim(),
        timestamp: Date.now(),
      };

      set((state) => {
        const existing = state.chatMessages[recipientId] || [];
        return {
          chatMessages: {
            ...state.chatMessages,
            [recipientId]: [...existing, newMsg],
          },
        };
      });

      // Realistic automated Sinhala reply after 1.5 seconds!
      setTimeout(() => {
        const state = get();
        if (state.activeChat && state.activeChat.id === recipientId) {
          const autoReply: ChatMessage = {
            id: 'reply-' + Date.now().toString(),
            senderId: recipientId,
            text: 'එලම මචං! මම ඉක්මනටම විස්තරේ බලලා කියන්නම් 👍',
            timestamp: Date.now(),
          };
          set((s) => ({
            chatMessages: {
              ...s.chatMessages,
              [recipientId]: [...(s.chatMessages[recipientId] || []), autoReply],
            },
          }));
        }
      }, 1500);
    },

    toggleDarkMode: () => {
      set((state) => {
        const nextDark = !state.darkMode;
        if (typeof window !== 'undefined') {
          localStorage.setItem('fb_dark_mode', String(nextDark));
          if (nextDark) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
        return { darkMode: nextDark };
      });
    },

    toggleAccountMenu: () => {
      set((state) => ({ isAccountMenuOpen: !state.isAccountMenuOpen }));
    },

    closeAccountMenu: () => {
      set({ isAccountMenuOpen: false });
    },
  };
});
