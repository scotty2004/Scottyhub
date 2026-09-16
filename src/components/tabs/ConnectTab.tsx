import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Image, Heart, MessageCircle, MessageSquare, Send, Sparkles, WifiOff } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ConnectTab: React.FC = () => {
  const { posts, addPost, toggleLikePost, isOnline, messages, sendMessage, profile } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'feed' | 'chat'>('feed');
  const [selectedTag, setSelectedTag] = useState<'All' | 'Connect' | 'Learn' | 'Grow'>('All');
  
  // Post Creator State
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTag, setNewPostTag] = useState<'Connect' | 'Learn' | 'Grow' | 'General'>('Connect');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Chat State
  const [chatInput, setChatInput] = useState('');

  const filteredPosts = posts.filter((p) => selectedTag === 'All' || p.tag === selectedTag);

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    addPost(newPostContent, newPostTag, imagePreview || undefined);
    setNewPostContent('');
    setImagePreview(null);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    sendMessage(chatInput);
    setChatInput('');
  };

  return (
    <div className="min-h-full pb-20 text-white space-y-4 p-4">
      {/* Header & Subtab Switcher */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div>
          <h2 className="text-lg font-extrabold tracking-tight text-white flex items-center gap-2">
            <span>Connect Community</span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold tracking-wider">
              Live Feed
            </span>
          </h2>
          <p className="text-xs text-slate-400">Collaborate, post updates, and chat with ScottHub members.</p>
        </div>

        <div className="flex p-1 bg-slate-900/80 border border-white/10 rounded-2xl backdrop-blur-xl">
          <button
            onClick={() => setActiveSubTab('feed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeSubTab === 'feed' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Community
          </button>
          <button
            onClick={() => setActiveSubTab('chat')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeSubTab === 'chat' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Messages
          </button>
        </div>
      </div>

      {activeSubTab === 'feed' ? (
        <div className="space-y-4">
          {/* Post Creation Box */}
          <form
            onSubmit={handlePostSubmit}
            className="p-4 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-2xl shadow-xl space-y-3"
          >
            <div className="flex items-start gap-3">
              <img
                src={profile.avatar}
                alt={profile.name}
                referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-full object-cover border border-white/10 mt-1"
              />
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder={isOnline ? "What's on your mind? Share with ScottHub..." : "Drafting post offline... Will sync when online."}
                rows={3}
                className="w-full bg-slate-950/80 border border-white/10 rounded-2xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition resize-none"
              />
            </div>

            {imagePreview && (
              <div className="relative rounded-2xl overflow-hidden border border-white/10">
                <img src={imagePreview} alt="Preview" referrerPolicy="no-referrer" className="w-full h-32 object-cover" />
                <button
                  type="button"
                  onClick={() => setImagePreview(null)}
                  className="absolute top-2 right-2 p-1 bg-black/70 hover:bg-black rounded-full text-white text-xs"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <select
                  value={newPostTag}
                  onChange={(e) => setNewPostTag(e.target.value as any)}
                  className="bg-slate-950/80 border border-white/10 text-slate-300 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Connect">#Connect</option>
                  <option value="Learn">#Learn</option>
                  <option value="Grow">#Grow</option>
                  <option value="General">#General</option>
                </select>

                <button
                  type="button"
                  onClick={() =>
                    setImagePreview(
                      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=600'
                    )
                  }
                  className="p-2 bg-slate-800/80 hover:bg-slate-700/80 border border-white/5 rounded-xl text-slate-300 text-xs flex items-center gap-1 transition"
                  title="Attach Photo"
                >
                  <Image className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="hidden sm:inline">Add Image</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={!newPostContent.trim()}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-indigo-500/20 border border-indigo-400/30"
              >
                {!isOnline && <WifiOff className="w-3.5 h-3.5 text-amber-300" />}
                <Send className="w-3.5 h-3.5" />
                <span>{isOnline ? 'Post' : 'Save Offline'}</span>
              </button>
            </div>
          </form>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {['All', 'Connect', 'Learn', 'Grow'].map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag as any)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition shrink-0 ${
                  selectedTag === tag
                    ? 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-300'
                    : 'bg-slate-900/60 border border-white/10 text-slate-400 hover:text-slate-200'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>

          {/* Posts Feed */}
          <div className="space-y-3">
            {filteredPosts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-3xl bg-slate-900/60 border backdrop-blur-2xl shadow-lg space-y-3 ${
                  post.isPendingSync ? 'border-amber-500/40 bg-amber-950/10' : 'border-white/10'
                }`}
              >
                {/* Author row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={post.authorAvatar}
                      alt={post.author}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full object-cover border border-white/10"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-100">{post.author}</span>
                        {post.isPendingSync && (
                          <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[9px] font-bold border border-amber-500/30">
                            Offline Queue
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {post.authorHandle} • {post.timestamp}
                      </span>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-semibold">
                    #{post.tag}
                  </span>
                </div>

                {/* Content */}
                <p className="text-xs text-slate-200 leading-relaxed">{post.content}</p>

                {post.image && (
                  <div className="rounded-2xl overflow-hidden border border-white/10">
                    <img
                      src={post.image}
                      alt="Attachment"
                      referrerPolicy="no-referrer"
                      className="w-full h-44 object-cover"
                    />
                  </div>
                )}

                {/* Like & Comment bar */}
                <div className="flex items-center justify-between pt-1 border-t border-white/10 text-xs text-slate-400">
                  <button
                    onClick={() => toggleLikePost(post.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl transition ${
                      post.isLiked ? 'text-rose-400 bg-rose-500/10 font-bold' : 'hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${post.isLiked ? 'fill-rose-400 text-rose-400' : ''}`} />
                    <span>{post.likes}</span>
                  </button>

                  <div className="flex items-center gap-1.5 text-slate-400 px-2 py-1">
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>{post.commentsCount} comments</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        /* Direct Messages / AI Assistant Chat */
        <div className="space-y-3">
          <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs flex items-center gap-2 backdrop-blur-xl">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>Chatting with ScottHub Mobile Assistant & Community Sync.</span>
          </div>

          <div className="p-4 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-2xl shadow-xl min-h-[320px] flex flex-col justify-between space-y-4">
            <div className="space-y-3 overflow-y-auto max-h-[300px] pr-1">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex items-start gap-2.5 ${msg.isSelf ? 'flex-row-reverse' : ''}`}>
                  <img
                    src={msg.senderAvatar}
                    alt={msg.senderName}
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5 border border-white/10"
                  />
                  <div
                    className={`p-3 rounded-2xl text-xs max-w-[80%] leading-relaxed ${
                      msg.isSelf
                        ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-500/20'
                        : 'bg-slate-800/80 text-slate-200 border border-white/10 rounded-tl-none'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-300 opacity-80 mb-1">
                      <span>{msg.senderName}</span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <p>{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-2 border-t border-white/10">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask ScottHub AI assistant or send message..."
                className="flex-1 bg-slate-950/80 border border-white/10 rounded-2xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-2xl transition shadow-md shadow-indigo-500/20"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
