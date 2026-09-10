import React, { useState, useRef } from 'react';
import { 
  X, 
  Globe, 
  Users, 
  Lock, 
  Image as ImageIcon, 
  Smile, 
  MapPin, 
  UserPlus, 
  Palette 
} from 'lucide-react';
import { useFeedStore } from '../store/useFeedStore';
import { CURRENT_USER } from '../mockData';

const BACKGROUND_GRADIENTS = [
  { id: 'none', label: 'Default', class: '' },
  { id: 'fire', label: 'Sunset Fire', class: 'bg-gradient-to-r from-amber-500 via-rose-500 to-pink-600 text-white' },
  { id: 'cosmic', label: 'Cosmic Violet', class: 'bg-gradient-to-br from-purple-700 via-indigo-600 to-blue-500 text-white' },
  { id: 'ocean', label: 'Ocean Breeze', class: 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white' },
  { id: 'neon', label: 'Neon Glow', class: 'bg-gradient-to-tr from-pink-500 to-yellow-500 text-white' },
];

const FEELINGS_LIST = [
  '😊 happy',
  '❤️ blessed',
  '🎉 excited',
  '☕ relaxed',
  '🚀 inspired',
  '💪 motivated',
];

export const CreatePostModal: React.FC = () => {
  const { isCreatePostModalOpen, closeCreatePostModal, addPost, modalInitialType } = useFeedStore();

  const [content, setContent] = useState('');
  const [selectedGradient, setSelectedGradient] = useState<string | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string>('');
  const [privacy, setPrivacy] = useState<'public' | 'friends' | 'only_me'>('public');
  const [feeling, setFeeling] = useState<string>('');
  const [showFeelings, setShowFeelings] = useState(modalInitialType === 'feeling');
  const [showImagePicker, setShowImagePicker] = useState(modalInitialType === 'photo');
  const [privacyDropdown, setPrivacyDropdown] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isCreatePostModalOpen) return null;

  const handlePost = () => {
    if (!content.trim() && !mediaUrl.trim()) return;

    addPost(
      content,
      mediaUrl,
      selectedGradient ? BACKGROUND_GRADIENTS.find(g => g.id === selectedGradient)?.class : undefined,
      feeling ? `— feeling ${feeling}` : undefined,
      privacy
    );

    // Reset and close
    setContent('');
    setMediaUrl('');
    setSelectedGradient(null);
    setFeeling('');
    closeCreatePostModal();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setMediaUrl(reader.result);
          setSelectedGradient(null); // Clear background gradient if photo is attached
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const isPostDisabled = !content.trim() && !mediaUrl.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div 
        className="bg-white dark:bg-fb-gray-darkCard w-full max-w-[500px] rounded-2xl shadow-2xl border border-gray-200 dark:border-fb-gray-darkBorder overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative border-b border-gray-200 dark:border-fb-gray-darkBorder py-3.5 px-4 text-center">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Create post
          </h2>
          <button
            type="button"
            onClick={closeCreatePostModal}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-gray-100 dark:bg-fb-gray-darkHover hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-4 overflow-y-auto space-y-4">
          {/* User Info Bar */}
          <div className="flex items-center gap-3">
            <img
              src={CURRENT_USER.avatarUrl}
              alt={CURRENT_USER.name}
              className="w-11 h-11 rounded-full object-cover"
            />
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                  {CURRENT_USER.name}
                </span>
                {feeling && (
                  <span className="text-xs text-gray-600 dark:text-gray-400 font-normal">
                    feeling {feeling}
                  </span>
                )}
              </div>

              {/* Privacy Selector Pill */}
              <div className="relative inline-block mt-0.5">
                <button
                  type="button"
                  onClick={() => setPrivacyDropdown(!privacyDropdown)}
                  className="bg-gray-200/80 dark:bg-fb-gray-darkHover px-2.5 py-1 rounded-md flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-300 transition-colors"
                >
                  {privacy === 'public' && <Globe className="w-3.5 h-3.5" />}
                  {privacy === 'friends' && <Users className="w-3.5 h-3.5" />}
                  {privacy === 'only_me' && <Lock className="w-3.5 h-3.5" />}
                  <span className="capitalize">{privacy.replace('_', ' ')}</span>
                  <span className="text-[10px]">▼</span>
                </button>

                {privacyDropdown && (
                  <div className="absolute left-0 top-7 bg-white dark:bg-fb-gray-darkCard border border-gray-200 dark:border-fb-gray-darkBorder rounded-xl shadow-lg p-1.5 z-20 w-36 space-y-1">
                    <button
                      type="button"
                      onClick={() => { setPrivacy('public'); setPrivacyDropdown(false); }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-left rounded-lg hover:bg-gray-100 dark:hover:bg-fb-gray-darkHover text-gray-800 dark:text-gray-200"
                    >
                      <Globe className="w-3.5 h-3.5 text-fb-blue" />
                      <span>Public</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setPrivacy('friends'); setPrivacyDropdown(false); }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-left rounded-lg hover:bg-gray-100 dark:hover:bg-fb-gray-darkHover text-gray-800 dark:text-gray-200"
                    >
                      <Users className="w-3.5 h-3.5 text-green-600" />
                      <span>Friends</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setPrivacy('only_me'); setPrivacyDropdown(false); }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-left rounded-lg hover:bg-gray-100 dark:hover:bg-fb-gray-darkHover text-gray-800 dark:text-gray-200"
                    >
                      <Lock className="w-3.5 h-3.5 text-red-500" />
                      <span>Only me</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Text Area (with optional colored canvas background) */}
          <div
            className={`rounded-xl transition-all ${
              selectedGradient && !mediaUrl
                ? `${BACKGROUND_GRADIENTS.find(g => g.id === selectedGradient)?.class} min-h-[160px] flex items-center justify-center p-6 shadow-inner`
                : ''
            }`}
          >
            <textarea
              rows={selectedGradient && !mediaUrl ? 3 : 4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`What's on your mind, ${CURRENT_USER.name.split(' ')[0]}?`}
              className={`w-full bg-transparent resize-none focus:outline-none leading-relaxed ${
                selectedGradient && !mediaUrl
                  ? 'text-center text-xl font-bold placeholder-white/70 text-white'
                  : 'text-base text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400'
              }`}
            />
          </div>

          {/* Background Gradients Selector */}
          {!mediaUrl && (
            <div className="flex items-center gap-2 py-1">
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Palette className="w-3.5 h-3.5" />
                <span>Theme:</span>
              </span>
              <div className="flex items-center gap-1.5">
                {BACKGROUND_GRADIENTS.map((gradient) => (
                  <button
                    key={gradient.id}
                    type="button"
                    onClick={() => setSelectedGradient(gradient.id === 'none' ? null : gradient.id)}
                    className={`w-6 h-6 rounded-lg transition-transform ${
                      gradient.id === 'none'
                        ? 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-fb-gray-darkCard'
                        : gradient.class
                    } ${selectedGradient === gradient.id || (!selectedGradient && gradient.id === 'none') ? 'ring-2 ring-fb-blue scale-110' : 'hover:scale-105'}`}
                    title={gradient.label}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Photo Preview or File Picker Drawer */}
          {showImagePicker && (
            <div className="border border-dashed border-gray-300 dark:border-fb-gray-darkBorder rounded-xl p-3 relative bg-gray-50 dark:bg-fb-gray-darkHover/30">
              {mediaUrl ? (
                <div className="relative rounded-lg overflow-hidden max-h-60">
                  <img src={mediaUrl} alt="Attached" className="w-full h-full object-cover max-h-60" />
                  <button
                    type="button"
                    onClick={() => setMediaUrl('')}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-gray-900/80 hover:bg-gray-900 text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-fb-gray-darkHover text-gray-600 dark:text-gray-300 flex items-center justify-center mx-auto mb-2">
                    <ImageIcon className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Add Photos/Videos</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">or drag and drop</p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-3 px-4 py-1.5 bg-gray-200 dark:bg-fb-gray-darkHover hover:bg-gray-300 rounded-lg text-xs font-semibold text-gray-800 dark:text-gray-200"
                  >
                    Choose Photo
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              )}
            </div>
          )}

          {/* Feeling Picker Drawer */}
          {showFeelings && (
            <div className="p-2.5 bg-gray-50 dark:bg-fb-gray-darkHover/40 rounded-xl border border-gray-200 dark:border-fb-gray-darkBorder">
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 block">
                How are you feeling?
              </span>
              <div className="flex flex-wrap gap-1.5">
                {FEELINGS_LIST.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => { setFeeling(feeling === f ? '' : f); setShowFeelings(false); }}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      feeling === f
                        ? 'bg-amber-100 border-amber-300 text-amber-800 font-semibold'
                        : 'bg-white dark:bg-fb-gray-darkCard border-gray-200 dark:border-fb-gray-darkBorder text-gray-700 dark:text-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* "Add to your post" toolbar */}
          <div className="border border-gray-200 dark:border-fb-gray-darkBorder rounded-xl p-3 flex items-center justify-between shadow-xs">
            <span className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200">
              Add to your post
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowImagePicker(!showImagePicker)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-fb-gray-darkHover text-green-500 transition-colors"
                title="Photo/video"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
              <button
                type="button"
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-fb-gray-darkHover text-blue-500 transition-colors"
                title="Tag people"
              >
                <UserPlus className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setShowFeelings(!showFeelings)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-fb-gray-darkHover text-amber-500 transition-colors"
                title="Feeling/activity"
              >
                <Smile className="w-5 h-5" />
              </button>
              <button
                type="button"
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-fb-gray-darkHover text-rose-500 transition-colors"
                title="Check in"
              >
                <MapPin className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer Submit */}
        <div className="p-4 border-t border-gray-200 dark:border-fb-gray-darkBorder bg-gray-50/50 dark:bg-fb-gray-darkCard">
          <button
            type="button"
            onClick={handlePost}
            disabled={isPostDisabled}
            className="w-full bg-fb-blue hover:bg-fb-blue-hover disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl shadow-xs transition-colors text-sm"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
};
