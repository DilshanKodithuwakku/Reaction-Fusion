import { User, Post, Story, ChatMessage } from './types';

export const CURRENT_USER: User = {
  id: 'user-me',
  name: 'කසුන් පෙරේරා',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  isOnline: true,
  verified: true,
  bio: 'Living each day to the fullest ✨ | Software Engineer',
};

export const MOCK_USERS: User[] = [
  {
    id: 'user-1',
    name: 'ඩිලාන් ප්‍රනාන්දු',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    isOnline: true,
    verified: false,
  },
  {
    id: 'user-2',
    name: 'නෙත්මි සිල්වා',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    isOnline: true,
    verified: true,
  },
  {
    id: 'user-3',
    name: 'ඉසුරු විජේසිංහ',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    isOnline: true,
    verified: false,
  },
  {
    id: 'user-4',
    name: 'චතුරිකා ලක්මාලි',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    isOnline: false,
    verified: true,
  },
  {
    id: 'user-5',
    name: 'සචින්ත මධුශංක',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    isOnline: true,
    verified: false,
  },
];

export const MOCK_STORIES: Story[] = [
  {
    id: 'story-1',
    author: MOCK_USERS[1], // Nethmi
    mediaUrl: 'https://images.unsplash.com/photo-1546708973-b339540b5162?w=500&auto=format&fit=crop&q=80',
    isViewed: false,
  },
  {
    id: 'story-2',
    author: MOCK_USERS[2], // Isuru
    mediaUrl: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=500&auto=format&fit=crop&q=80',
    isViewed: false,
  },
  {
    id: 'story-3',
    author: MOCK_USERS[3], // Chathurika
    mediaUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=80',
    isViewed: true,
  },
  {
    id: 'story-4',
    author: MOCK_USERS[4], // Sachintha
    mediaUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=500&auto=format&fit=crop&q=80',
    isViewed: false,
  },
];

// Fallback initial posts (Sinhala) in case backend is offline
export const INITIAL_POSTS: Post[] = [
  {
    id: 'sinhala-post-1',
    author: MOCK_USERS[1], // Nethmi
    content: 'අද උදෑසන නුවරඑළිය ග්‍රෙගරි වැව අසල ගත් සුන්දර ඡායාරූපයක්... ⛰️🌸 සොබාදහමේ සුන්දරත්වය වචන වලින් විස්තර කරන්න බෑ. සිතට දැනෙන්නේ පුදුමාකාර නිස්කලංක බවක්! හැමෝටම සුබ සති අන්තයක් වේවා!',
    mediaUrl: 'https://images.unsplash.com/photo-1546708973-b339540b5162?w=1200&auto=format&fit=crop&q=80',
    mediaType: 'image',
    feeling: '— feeling blessed in Nuwara Eliya',
    timestamp: Date.now() - 1000 * 60 * 35,
    formattedTime: '35m',
    likesCount: 14,
    userReaction: 'love',
    commentsCount: 3,
    sharesCount: 5,
    privacy: 'public',
    comments: [
      {
        id: 'comm-1',
        postId: 'sinhala-post-1',
        author: MOCK_USERS[0],
        content: 'ඇත්තටම හරිම ලස්සනයි නෙත්මි! පරිස්සමෙන් ගිහින් එන්න ❤️',
        timestamp: Date.now() - 1000 * 60 * 25,
        formattedTime: '25m',
        likesCount: 3,
        isLiked: true,
      },
      {
        id: 'comm-2',
        postId: 'sinhala-post-1',
        author: CURRENT_USER,
        content: 'නුවරඑළිය මේ දවස්වල හොඳටම සීතලද?',
        timestamp: Date.now() - 1000 * 60 * 18,
        formattedTime: '18m',
        likesCount: 1,
        isLiked: false,
      },
    ],
  },
  {
    id: 'sinhala-post-2',
    author: MOCK_USERS[2], // Isuru
    content: 'ශ්‍රී ලංකා ක්‍රිකට් කොල්ලන්ට උණුසුම් සුබ පැතුම්! 🏏🇱🇰 මොන තරම් විශිෂ්ට සටනක්ද මේක... අවසාන පන්දු ඕවරය වෙනකම්ම හුස්ම අල්ලගෙන බැලුවේ. පන්දු යැවීම සහ පන්දු රැකීම උපරිමයි. ජයවේවා ශ්‍රී ලංකා!',
    mediaUrl: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=1200&auto=format&fit=crop&q=80',
    mediaType: 'image',
    timestamp: Date.now() - 1000 * 60 * 90,
    formattedTime: '1h',
    likesCount: 28,
    userReaction: 'like',
    commentsCount: 2,
    sharesCount: 9,
    privacy: 'public',
    comments: [
      {
        id: 'comm-3',
        postId: 'sinhala-post-2',
        author: MOCK_USERS[4],
        content: 'නියම සටනක් දුන්නේ අපේ කොල්ලො ටික! ආඩම්බරයි 🇱🇰🔥',
        timestamp: Date.now() - 1000 * 60 * 45,
        formattedTime: '45m',
        likesCount: 5,
        isLiked: false,
      },
    ],
  },
];

export const MOCK_INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  'user-1': [
    { id: 'm1', senderId: 'user-1', text: 'මචං කසුන්! අද රෑට සෙට් වෙමුද?', timestamp: Date.now() - 1000 * 60 * 40 },
    { id: 'm2', senderId: 'user-me', text: 'ඔව් මචං, මම 7 වෙද්දි එන්නම්!', timestamp: Date.now() - 1000 * 60 * 20 },
    { id: 'm3', senderId: 'user-1', text: 'එලම! කොල්ලුපිටියේ අර කොත්තු කඩේට යමු 👍', timestamp: Date.now() - 1000 * 60 * 5 },
  ],
  'user-2': [
    { id: 'm4', senderId: 'user-2', text: 'කසුන්, නුවරඑළියේ ෆොටෝස් ටික බැලුවද?', timestamp: Date.now() - 1000 * 60 * 120 },
    { id: 'm5', senderId: 'user-me', text: 'ඔව් නෙත්මි, ගොඩක් ලස්සනයි! පරිස්සමෙන් එන්න.', timestamp: Date.now() - 1000 * 60 * 90 },
  ],
};

export const MOCK_SPONSORED = [
  {
    id: 'ad-1',
    title: 'ශ්‍රී ලංකා සංචාරක හෝටල් වෙන්කිරීම්',
    url: 'srilankahotels.lk',
    description: 'ඇල්ල, නුවරඑළිය සහ ගාල්ලේ සුඛෝපභෝගී හෝටල් කාමර 30% ක විශේෂ වට්ටමක් සහිතව වෙන්කරවා ගන්න.',
    imageUrl: 'https://images.unsplash.com/photo-1546708973-b339540b5162?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'ad-2',
    title: 'ඩයලොග් 5G සබඳතා',
    url: 'dialog.lk/5g',
    description: 'දිවයිනේ වේගවත්ම 5G අත්දැකීම දැන් ඔබගේ නිවසටම ලබාගන්න.',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop&q=80',
  },
];

export const MOCK_BIRTHDAY = {
  user: MOCK_USERS[0], // Dilan Fernando
  othersCount: 2,
};
