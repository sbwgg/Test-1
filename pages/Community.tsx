
import React, { useState, useEffect } from 'react';
import { useAuth } from '../services/authContext';
import { useToast } from '../services/toastContext';
import { db } from '../services/db';
import { Post, UserRole } from '../types';
import { MessageSquare, Users, Star, Megaphone, Trash2, Pin, Plus, X, Tag, User as UserIcon, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const Community: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [showMyPosts, setShowMyPosts] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<string>('General');
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await db.getPosts();
      setPosts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      await db.createPost({ title: newTitle, content: newContent, category: newCategory });
      setNewTitle('');
      setNewContent('');
      setNewCategory('General');
      setIsModalOpen(false);
      toast.success("Post created successfully!");
      fetchPosts();
    } catch (err) {
      toast.error('Failed to create post');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this post?")) {
      try {
        await db.deletePost(id);
        toast.success("Post deleted");
        fetchPosts();
      } catch (e) {
        toast.error("Failed to delete post");
      }
    }
  };

  const handlePin = async (id: string) => {
    try {
      await db.togglePinPost(id);
      fetchPosts();
    } catch (e) {
      toast.error("Failed to toggle pin");
    }
  };

  const filteredPosts = posts.filter(post => {
    if (showMyPosts && (!user || post.userId !== user.id)) return false;
    if (activeCategory !== 'All' && post.category !== activeCategory) return false;
    return true;
  });

  const categories = [
    { name: 'General', icon: Users, color: 'text-blue-500' },
    { name: 'Updates', icon: Megaphone, color: 'text-red-500' },
    { name: 'Recommendations', icon: Star, color: 'text-green-500' },
    { name: 'Discussion', icon: MessageSquare, color: 'text-violet-500' }
  ];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const countComments = (comments: any[]): number => {
      if(!comments) return 0;
      let count = comments.length;
      for(const c of comments) {
          if(c.replies) count += countComments(c.replies);
      }
      return count;
  };

  return (
    <div className="pt-28 min-h-screen px-4 md:px-12 pb-20 bg-[#020617]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-cyan-400 mb-2">Community Hub</h1>
            <p className="text-gray-400">Join the discussion, share your favorites, and get the latest updates.</p>
          </div>
          <button 
            onClick={() => user ? setIsModalOpen(true) : toast.info("Please log in to post")}
            className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-violet-900/30 transition-all hover:-translate-y-1"
          >
            <Plus className="w-5 h-5" /> New Post
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="space-y-6">
             <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-white/5 rounded-2xl p-4 shadow-xl">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 px-2">Categories</h3>
                <div className="space-y-1">
                   <button 
                     onClick={() => { setActiveCategory('All'); setShowMyPosts(false); }}
                     className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-between group ${activeCategory === 'All' && !showMyPosts ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                   >
                     <span className="flex items-center gap-2">#All</span>
                   </button>
                   {categories.map(cat => (
                     <button 
                       key={cat.name}
                       onClick={() => { setActiveCategory(cat.name); setShowMyPosts(false); }}
                       className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-between group ${activeCategory === cat.name && !showMyPosts ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                     >
                       <span className={`flex items-center gap-2 ${activeCategory === cat.name ? cat.color : ''}`}>#{cat.name}</span>
                       <span className="bg-[#020617] text-gray-500 text-[10px] px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                         {posts.filter(p => p.category === cat.name).length} posts
                       </span>
                     </button>
                   ))}
                </div>

                {user && (
                    <div className="mt-6 pt-6 border-t border-white/5">
                        <button 
                            onClick={() => setShowMyPosts(true)}
                            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${showMyPosts ? 'bg-violet-600/20 text-violet-300' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <UserIcon className="w-4 h-4" /> My Posts
                        </button>
                    </div>
                )}
             </div>
          </div>

          <div className="lg:col-span-3 space-y-4">
             {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-violet-500"></div>
                </div>
             ) : filteredPosts.length > 0 ? (
                filteredPosts.map(post => {
                    const likeCount = (post.likes?.length || 0) - (post.dislikes?.length || 0);
                    const commentCount = countComments(post.comments || []);
                    return (
                    <div key={post.id} className={`bg-[#1e293b]/50 backdrop-blur-md border rounded-2xl p-6 transition-all hover:bg-[#1e293b]/80 group relative ${post.isPinned ? 'border-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.1)]' : 'border-white/5'}`}>
                        <div className="flex items-start justify-between">
                            <div className="flex gap-4 w-full">
                                <Link to={`/profile/${post.userId}`} className="flex-shrink-0 cursor-pointer">
                                   <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center border border-white/10 overflow-hidden">
                                      {post.authorAvatar ? <img src={post.authorAvatar} alt="ava" className="w-full h-full object-cover" /> : <UserIcon className="w-5 h-5 text-gray-400" />}
                                   </div>
                                </Link>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Link to={`/community/post/${post.id}`} className="text-lg font-bold text-white leading-tight hover:text-violet-400 transition-colors">
                                            {post.title}
                                        </Link>
                                        {post.isPinned && <Pin className="w-4 h-4 text-violet-400 fill-violet-400 rotate-45" />}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                                        <Link to={`/profile/${post.userId}`} className={`font-medium hover:underline ${post.authorRole === 'ADMIN' ? 'text-violet-400' : 'text-gray-300'}`}>
                                            {post.authorName}
                                        </Link>
                                        <span>•</span>
                                        <span>{formatDate(post.createdAt)}</span>
                                        <span>•</span>
                                        <span className={`px-1.5 py-0.5 rounded bg-white/5 border border-white/5 ${categories.find(c => c.name === post.category)?.color}`}>
                                            {post.category}
                                        </span>
                                    </div>
                                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap line-clamp-3">{post.content}</p>
                                    
                                    {/* Footer Stats */}
                                    <div className="flex items-center gap-6 mt-4 text-sm text-gray-400">
                                        <div className="flex items-center gap-1.5">
                                            <ThumbsUp className="w-4 h-4" />
                                            <span>{likeCount}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <MessageSquare className="w-4 h-4" />
                                            <span>{commentCount} comments</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                {user?.role === 'ADMIN' && (
                                    <>
                                        <button onClick={() => handlePin(post.id)} className={`p-2 rounded hover:bg-white/10 transition-colors ${post.isPinned ? 'text-violet-400' : 'text-gray-400'}`} title={post.isPinned ? "Unpin" : "Pin"}>
                                            <Pin className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(post.id)} className="p-2 rounded hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors" title="Delete">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </>
                                )}
                                {user?.role !== 'ADMIN' && user?.id === post.userId && (
                                     <button onClick={() => handleDelete(post.id)} className="p-2 rounded hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors" title="Delete">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                    );
                })
             ) : (
                <div className="bg-[#1e293b]/30 rounded-2xl p-12 text-center border border-white/5">
                    <p className="text-gray-400 text-lg">No posts found.</p>
                </div>
             )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
           <div className="bg-[#1e293b] w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-scale-in">
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white">Create New Post</h2>
                  <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleCreatePost} className="p-6 space-y-4">
                  <div className="space-y-1">
                      <label className="text-sm text-gray-400 font-medium">Title</label>
                      <input 
                        type="text" 
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-all"
                        placeholder="What's on your mind?"
                        required
                      />
                  </div>
                  
                  <div className="space-y-1">
                      <label className="text-sm text-gray-400 font-medium">Category</label>
                      <div className="flex gap-2 flex-wrap">
                          {categories.map(cat => (
                              <button
                                type="button"
                                key={cat.name}
                                onClick={() => setNewCategory(cat.name)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${newCategory === cat.name ? 'bg-violet-600 border-violet-600 text-white' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}
                              >
                                  {cat.name}
                              </button>
                          ))}
                      </div>
                  </div>

                  <div className="space-y-1">
                      <label className="text-sm text-gray-400 font-medium">Content</label>
                      <textarea 
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-all h-32 resize-none"
                        placeholder="Share your thoughts..."
                        required
                      />
                  </div>

                  <div className="pt-4 flex justify-end gap-3">
                      <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white font-medium">Cancel</button>
                      <button 
                        type="submit" 
                        disabled={submitLoading}
                        className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-violet-900/20 disabled:opacity-50"
                      >
                          {submitLoading ? 'Posting...' : 'Post'}
                      </button>
                  </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default Community;
