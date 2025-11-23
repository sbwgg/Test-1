import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { generateMovieMetadata } from '../services/gemini';
import { Movie, User, UserRole } from '../types';
import { Trash2, Plus, Sparkles, Film, BarChart3, Users, PlayCircle, Search, X, ShieldCheck, Clock, Calendar, Mic, Type, PenSquare, Save, UserCog, KeyRound } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  // Tabs
  const [activeTab, setActiveTab] = useState<'content' | 'users'>('content');

  // Content State
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // User Management State
  const [users, setUsers] = useState<User[]>([]);
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userSearchTerm, setUserSearchTerm] = useState('');

  // Movie Form Fields
  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
  const [coverUrl, setCoverUrl] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('');
  const [rating, setRating] = useState('');
  const [duration, setDuration] = useState('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [contentType, setContentType] = useState<'movie' | 'series'>('movie');
  const [audioLangs, setAudioLangs] = useState('');
  const [subLangs, setSubLangs] = useState('');

  // User Form Fields
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userAvatar, setUserAvatar] = useState('');
  const [userRole, setUserRole] = useState<UserRole>(UserRole.USER);
  const [userPassword, setUserPassword] = useState(''); // Only for changing

  const refreshData = async () => {
    const movieData = await db.getMovies();
    setMovies(movieData);
    const userData = await db.getUsers();
    setUsers(userData);
  };

  useEffect(() => {
    refreshData();
  }, []);

  // --- CONTENT ACTIONS ---

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this content?")) {
      await db.deleteMovie(id);
      refreshData();
    }
  };

  const handleEdit = (movie: Movie) => {
      setEditingId(movie.id);
      setTitle(movie.title);
      setDescription(movie.description);
      setCoverUrl(movie.coverUrl || movie.thumbnailUrl);
      setVideoUrl(movie.videoUrl);
      setGenre(movie.genre.join(', '));
      setRating(movie.rating);
      setDuration(movie.duration);
      setYear(movie.year);
      setContentType(movie.type);
      setAudioLangs(movie.audioLanguages ? movie.audioLanguages.join(', ') : '');
      setSubLangs(movie.subtitleLanguages ? movie.subtitleLanguages.join(', ') : '');
      setIsFormOpen(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAIGenerate = async () => {
    if (!title) return alert("Please enter a title first");
    setLoadingAI(true);
    try {
      const meta = await generateMovieMetadata(title);
      setDescription(meta.description);
      setGenre(meta.genre.join(', '));
      setRating(meta.rating);
      setDuration(meta.duration);
      setYear(meta.year);
      if (!coverUrl) setCoverUrl(`https://picsum.photos/seed/${title.replace(/\s/g, '')}/1920/800`);
    } catch (e) {
      alert("Generation failed.");
    } finally {
      setLoadingAI(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const moviePayload: any = {
      title,
      description,
      thumbnailUrl: coverUrl,
      coverUrl,
      videoUrl,
      genre: genre.split(',').map(g => g.trim()),
      rating,
      duration,
      year,
      type: contentType,
      audioLanguages: audioLangs.split(',').map(l => l.trim()).filter(Boolean),
      subtitleLanguages: subLangs.split(',').map(l => l.trim()).filter(Boolean),
    };

    if (editingId) {
        await db.updateMovie(editingId, moviePayload);
    } else {
        await db.addMovie(moviePayload);
    }

    await refreshData();
    closeForm();
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setTitle(''); setVideoUrl(''); setCoverUrl(''); setDescription('');
    setGenre(''); setRating(''); setDuration(''); setYear(new Date().getFullYear());
    setAudioLangs(''); setSubLangs('');
  };

  // --- USER ACTIONS ---

  const handleEditUser = (user: User) => {
      setEditingUserId(user.id);
      setUserName(user.name);
      setUserEmail(user.email);
      setUserRole(user.role);
      setUserAvatar(user.avatarUrl || '');
      setUserPassword('');
      setIsUserFormOpen(true);
  };

  const handleDeleteUser = async (id: string) => {
      if(confirm("Are you sure? This cannot be undone.")) {
          try {
            await db.deleteUser(id);
            refreshData();
          } catch(e: any) {
              alert(e.message);
          }
      }
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingUserId) return; // Should only support edit for now, creating via register

      const payload = {
          name: userName,
          email: userEmail,
          role: userRole,
          avatarUrl: userAvatar,
          password: userPassword || undefined
      };

      await db.updateUser(editingUserId, payload);
      await refreshData();
      setIsUserFormOpen(false);
      setEditingUserId(null);
  };

  const filteredMovies = movies.filter(m => m.title.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) || u.email.includes(userSearchTerm));

  // Stats
  const totalViews = movies.reduce((acc, curr) => acc + (curr.views || 0), 0);
  const totalGenres = new Set(movies.flatMap(m => m.genre)).size;

  return (
    <div className="pt-28 px-4 max-w-7xl mx-auto min-h-screen pb-20 bg-[#020617]">
      
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-fade-in">
        <div className="bg-[#1e293b]/60 backdrop-blur-md p-6 rounded-2xl border border-white/5 shadow-xl flex items-center justify-between group hover:border-violet-500/30 transition-all hover:-translate-y-1">
            <div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Total Library</p>
                <h3 className="text-4xl font-black text-white">{movies.length}</h3>
                <p className="text-xs text-gray-500 mt-2">Movies available</p>
            </div>
            <div className="bg-gradient-to-br from-violet-600/20 to-violet-900/10 p-4 rounded-xl group-hover:from-violet-600/30 transition-colors">
                <Film className="w-8 h-8 text-violet-500" />
            </div>
        </div>
        <div className="bg-[#1e293b]/60 backdrop-blur-md p-6 rounded-2xl border border-white/5 shadow-xl flex items-center justify-between group hover:border-cyan-500/30 transition-all hover:-translate-y-1">
            <div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Total Users</p>
                <h3 className="text-4xl font-black text-white">{users.length}</h3>
                <p className="text-xs text-gray-500 mt-2">Registered accounts</p>
            </div>
            <div className="bg-gradient-to-br from-cyan-600/20 to-cyan-900/10 p-4 rounded-xl group-hover:from-cyan-600/30 transition-colors">
                <Users className="w-8 h-8 text-cyan-500" />
            </div>
        </div>
        <div className="bg-[#1e293b]/60 backdrop-blur-md p-6 rounded-2xl border border-white/5 shadow-xl flex items-center justify-between group hover:border-pink-500/30 transition-all hover:-translate-y-1">
            <div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Categories</p>
                <h3 className="text-4xl font-black text-white">{totalGenres}</h3>
                <p className="text-xs text-gray-500 mt-2">Active genres</p>
            </div>
            <div className="bg-gradient-to-br from-pink-600/20 to-pink-900/10 p-4 rounded-xl group-hover:from-pink-600/30 transition-colors">
                <BarChart3 className="w-8 h-8 text-pink-500" />
            </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800 mb-8">
          <button 
            onClick={() => setActiveTab('content')}
            className={`px-6 py-3 font-bold text-sm transition-colors relative ${activeTab === 'content' ? 'text-violet-400' : 'text-gray-500 hover:text-gray-300'}`}
          >
              <div className="flex items-center gap-2"><Film className="w-4 h-4" /> Content Library</div>
              {activeTab === 'content' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-500"></div>}
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 font-bold text-sm transition-colors relative ${activeTab === 'users' ? 'text-violet-400' : 'text-gray-500 hover:text-gray-300'}`}
          >
              <div className="flex items-center gap-2"><Users className="w-4 h-4" /> User Management</div>
              {activeTab === 'users' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-500"></div>}
          </button>
      </div>

      {/* === CONTENT TAB === */}
      {activeTab === 'content' && (
      <>
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
            <h1 className="text-3xl font-bold text-white flex items-center tracking-tight">
            <ShieldCheck className="mr-3 text-violet-500 w-8 h-8" /> Media Control
            </h1>
            <div className="flex gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:w-80 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-violet-400 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search library..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#0f172a] border border-gray-700 text-white pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600/50 focus:border-violet-600 text-sm placeholder-gray-500 transition-all shadow-inner"
                    />
                </div>
                <button 
                onClick={() => { closeForm(); setIsFormOpen(!isFormOpen); }}
                className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2.5 rounded-lg flex items-center font-bold shadow-lg shadow-violet-900/20 transition-all hover:scale-105 active:scale-95"
                >
                {isFormOpen ? <X className="w-5 h-5 mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
                {isFormOpen ? 'Cancel' : 'Add Content'}
                </button>
            </div>
        </div>

        {isFormOpen && (
            <div className="bg-[#1e293b] p-8 rounded-2xl mb-12 border border-white/5 animate-slide-up shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-white">{editingId ? 'Edit Content' : 'Publish New Content'}</h2>
                    </div>
                    {!editingId && (
                        <div className="flex items-center gap-2 bg-gradient-to-r from-violet-900/50 to-cyan-900/50 border border-white/10 px-3 py-1.5 rounded-full">
                            <Sparkles className="w-4 h-4 text-violet-400" />
                            <span className="text-xs text-violet-200 font-medium">Auto Fill</span>
                        </div>
                    )}
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div className="relative flex gap-2">
                            <div className="relative flex-1 group">
                                <input 
                                type="text" 
                                id="title"
                                value={title} 
                                onChange={(e) => setTitle(e.target.value)}
                                className="block px-4 pb-2.5 pt-4 w-full text-sm text-white bg-transparent rounded-lg border border-gray-600 appearance-none focus:outline-none focus:ring-0 focus:border-violet-600 peer transition-colors"
                                placeholder=" "
                                required 
                                />
                                <label className="absolute text-sm text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-[#1e293b] px-2 left-1">
                                    Content Title
                                </label>
                            </div>
                            <button 
                            type="button"
                            onClick={handleAIGenerate}
                            disabled={loadingAI}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 rounded-lg flex items-center justify-center disabled:opacity-50 transition-all shadow-lg"
                            title="Auto-fill"
                            >
                            {loadingAI ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div> : <Sparkles className="w-5 h-5" />}
                            </button>
                        </div>

                        <div className="relative group">
                            <select 
                                value={contentType}
                                onChange={(e) => setContentType(e.target.value as 'movie' | 'series')}
                                className="block px-4 pb-2.5 pt-4 w-full text-sm text-white bg-transparent rounded-lg border border-gray-600 appearance-none focus:outline-none focus:ring-0 focus:border-violet-600 peer transition-colors cursor-pointer"
                            >
                                <option value="movie" className="bg-[#1e293b]">Movie</option>
                                <option value="series" className="bg-[#1e293b]">TV Series</option>
                            </select>
                            <label className="absolute text-sm text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-[#1e293b] px-2 left-1">
                                Content Type
                            </label>
                        </div>

                        <div className="relative group">
                            <input 
                                type="text" 
                                value={videoUrl} 
                                onChange={(e) => setVideoUrl(e.target.value)}
                                className="block px-4 pb-2.5 pt-4 w-full text-sm text-white bg-transparent rounded-lg border border-gray-600 appearance-none focus:outline-none focus:ring-0 focus:border-violet-600 peer transition-colors"
                                placeholder=" "
                                required
                            />
                            <label className="absolute text-sm text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-[#1e293b] px-2 left-1">
                                Video Source URL
                            </label>
                        </div>

                        <div className="relative group">
                            <input 
                                type="text" 
                                value={coverUrl} 
                                onChange={(e) => setCoverUrl(e.target.value)}
                                className="block px-4 pb-2.5 pt-4 w-full text-sm text-white bg-transparent rounded-lg border border-gray-600 appearance-none focus:outline-none focus:ring-0 focus:border-violet-600 peer transition-colors"
                                placeholder=" "
                                required
                            />
                            <label className="absolute text-sm text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-[#1e293b] px-2 left-1">
                                Cover Image URL
                            </label>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative group">
                                <input 
                                    type="text" 
                                    value={audioLangs}
                                    onChange={(e) => setAudioLangs(e.target.value)}
                                    className="block px-4 pb-2.5 pt-4 w-full text-sm text-white bg-transparent rounded-lg border border-gray-600 appearance-none focus:outline-none focus:ring-0 focus:border-violet-600 peer transition-colors"
                                    placeholder=" "
                                />
                                <label className="absolute text-sm text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-[#1e293b] px-2 left-1 flex items-center gap-1">
                                    <Mic className="w-3 h-3"/> Audio (comma sep)
                                </label>
                            </div>
                            <div className="relative group">
                                <input 
                                    type="text" 
                                    value={subLangs}
                                    onChange={(e) => setSubLangs(e.target.value)}
                                    className="block px-4 pb-2.5 pt-4 w-full text-sm text-white bg-transparent rounded-lg border border-gray-600 appearance-none focus:outline-none focus:ring-0 focus:border-violet-600 peer transition-colors"
                                    placeholder=" "
                                />
                                <label className="absolute text-sm text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-[#1e293b] px-2 left-1 flex items-center gap-1">
                                    <Type className="w-3 h-3"/> Subs (comma sep)
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="relative group">
                                <input 
                                    type="number" 
                                    value={year} 
                                    onChange={e => setYear(parseInt(e.target.value))} 
                                    className="block px-4 pb-2.5 pt-4 w-full text-sm text-white bg-transparent rounded-lg border border-gray-600 appearance-none focus:outline-none focus:ring-0 focus:border-violet-600 peer transition-colors"
                                    placeholder=" "
                                />
                                <label className="absolute text-sm text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-[#1e293b] px-2 left-1">
                                    Year
                                </label>
                            </div>
                            <div className="relative group">
                                <input 
                                    type="text" 
                                    value={rating} 
                                    onChange={e => setRating(e.target.value)} 
                                    className="block px-4 pb-2.5 pt-4 w-full text-sm text-white bg-transparent rounded-lg border border-gray-600 appearance-none focus:outline-none focus:ring-0 focus:border-violet-600 peer transition-colors"
                                    placeholder=" "
                                />
                                <label className="absolute text-sm text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-[#1e293b] px-2 left-1">
                                    Rating
                                </label>
                            </div>
                            <div className="relative group">
                                <input 
                                    type="text" 
                                    value={duration} 
                                    onChange={e => setDuration(e.target.value)} 
                                    className="block px-4 pb-2.5 pt-4 w-full text-sm text-white bg-transparent rounded-lg border border-gray-600 appearance-none focus:outline-none focus:ring-0 focus:border-violet-600 peer transition-colors"
                                    placeholder=" "
                                />
                                <label className="absolute text-sm text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-[#1e293b] px-2 left-1">
                                    Duration
                                </label>
                            </div>
                        </div>

                        <div className="relative group">
                            <input 
                                type="text" 
                                value={genre} 
                                onChange={(e) => setGenre(e.target.value)}
                                className="block px-4 pb-2.5 pt-4 w-full text-sm text-white bg-transparent rounded-lg border border-gray-600 appearance-none focus:outline-none focus:ring-0 focus:border-violet-600 peer transition-colors"
                                placeholder=" "
                            />
                            <label className="absolute text-sm text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-[#1e293b] px-2 left-1">
                                Genre (Comma separated)
                            </label>
                        </div>

                        <div className="relative group">
                            <textarea 
                                value={description} 
                                onChange={(e) => setDescription(e.target.value)}
                                className="block px-4 pb-2.5 pt-4 w-full text-sm text-white bg-transparent rounded-lg border border-gray-600 appearance-none focus:outline-none focus:ring-0 focus:border-violet-600 peer transition-colors h-28 resize-none"
                                placeholder=" "
                                required
                            />
                            <label className="absolute text-sm text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-[#1e293b] px-2 left-1">
                                Plot Summary
                            </label>
                        </div>
                    </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-700/50">
                    <button type="button" onClick={closeForm} className="px-6 py-2.5 rounded-lg text-gray-400 hover:text-white mr-4 font-semibold transition-colors hover:bg-white/5">Cancel</button>
                    <button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white font-bold py-2.5 px-8 rounded-lg shadow-lg shadow-violet-900/30 transition-all hover:scale-105 active:scale-95">
                        {editingId ? 'Save Changes' : 'Publish Content'}
                    </button>
                    </div>
                </form>
            </div>
            </div>
        )}

        {/* Data Grid */}
        <div className="bg-[#1e293b]/40 rounded-2xl overflow-hidden border border-gray-800/50 shadow-2xl backdrop-blur-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                <thead className="bg-[#111827] text-gray-400 uppercase text-[10px] font-bold tracking-widest border-b border-gray-800">
                    <tr>
                    <th className="px-8 py-5">Content</th>
                    <th className="px-6 py-5">Metadata</th>
                    <th className="px-6 py-5">Languages</th>
                    <th className="px-6 py-5">Performance</th>
                    <th className="px-6 py-5 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50 text-gray-300">
                    {filteredMovies.map(movie => (
                    <tr key={movie.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-8 py-4">
                            <div className="flex items-center">
                                <div className="h-16 w-12 flex-shrink-0 relative overflow-hidden rounded-md shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all">
                                    <img src={movie.thumbnailUrl} className="w-full h-full object-cover" alt="" />
                                </div>
                                <div className="ml-5">
                                    <div className="font-bold text-white text-sm group-hover:text-violet-400 transition-colors">{movie.title}</div>
                                    <div className="flex items-center text-xs text-gray-500 mt-1.5 space-x-2">
                                    <span className="bg-white/10 px-1 rounded text-[10px] text-gray-300 uppercase">{movie.type}</span>
                                    <Calendar className="w-3 h-3" /> <span>{movie.year}</span>
                                    <Clock className="w-3 h-3 ml-2" /> <span>{movie.duration}</span>
                                    </div>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1.5">
                                {movie.genre.slice(0, 2).map((g, i) => (
                                    <span key={i} className="px-2.5 py-1 rounded-full bg-[#334155] border border-gray-700 text-[10px] text-gray-300 font-medium hover:bg-white/10 transition-colors cursor-default">{g}</span>
                                ))}
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex flex-col gap-1 text-xs text-gray-400">
                                <div className="flex items-center gap-1"><Mic className="w-3 h-3"/> {movie.audioLanguages?.slice(0,2).join(', ') || 'En'}</div>
                                <div className="flex items-center gap-1"><Type className="w-3 h-3"/> {movie.subtitleLanguages?.slice(0,2).join(', ') || 'None'}</div>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex items-center text-sm font-medium text-gray-300">
                                <PlayCircle className="w-4 h-4 mr-2 text-gray-600" />
                                {movie.views.toLocaleString()}
                            </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                            <button 
                                onClick={() => handleEdit(movie)}
                                className="text-gray-400 hover:text-blue-400 p-2 rounded-full hover:bg-blue-500/10 transition-colors"
                                title="Edit"
                            >
                                <PenSquare className="w-5 h-5" />
                            </button>
                            <button 
                                onClick={() => handleDelete(movie.id)}
                                className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-500/10 transition-colors"
                                title="Delete"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
        </div>
      </>
      )}

      {/* === USERS TAB === */}
      {activeTab === 'users' && (
      <>
         <div className="flex justify-between items-center mb-6">
             <div className="relative w-80 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-violet-400 transition-colors" />
                <input 
                    type="text" 
                    placeholder="Search users..." 
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    className="w-full bg-[#0f172a] border border-gray-700 text-white pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600/50"
                />
             </div>
         </div>

         {/* User Edit Form Modal */}
         {isUserFormOpen && (
             <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                 <div className="bg-[#1e293b] rounded-2xl w-full max-w-lg border border-white/10 shadow-2xl p-6 animate-scale-in">
                     <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><UserCog className="text-violet-500" /> Edit User</h2>
                     <form onSubmit={handleUserSubmit} className="space-y-4">
                         <div className="flex items-center justify-center mb-6">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-3xl font-bold border-4 border-[#0f172a] overflow-hidden relative">
                                {userAvatar ? <img src={userAvatar} className="w-full h-full object-cover" /> : userName.charAt(0).toUpperCase()}
                            </div>
                         </div>
                         
                         <div>
                             <label className="text-xs text-gray-400 block mb-1">Full Name</label>
                             <input type="text" value={userName} onChange={e => setUserName(e.target.value)} className="w-full bg-[#0f172a] border border-gray-700 rounded p-2 text-white" required />
                         </div>
                         <div>
                             <label className="text-xs text-gray-400 block mb-1">Email</label>
                             <input type="email" value={userEmail} onChange={e => setUserEmail(e.target.value)} className="w-full bg-[#0f172a] border border-gray-700 rounded p-2 text-white" required />
                         </div>
                         <div>
                             <label className="text-xs text-gray-400 block mb-1">Avatar URL</label>
                             <input type="text" value={userAvatar} onChange={e => setUserAvatar(e.target.value)} className="w-full bg-[#0f172a] border border-gray-700 rounded p-2 text-white" placeholder="https://..." />
                         </div>
                         <div>
                             <label className="text-xs text-gray-400 block mb-1">Role / Rank</label>
                             <select value={userRole} onChange={e => setUserRole(e.target.value as UserRole)} className="w-full bg-[#0f172a] border border-gray-700 rounded p-2 text-white">
                                 <option value={UserRole.USER}>Standard User</option>
                                 <option value={UserRole.ADMIN}>Administrator</option>
                             </select>
                         </div>
                         <div>
                             <label className="text-xs text-gray-400 block mb-1 flex items-center gap-1"><KeyRound className="w-3 h-3"/> New Password (leave empty to keep current)</label>
                             <input type="password" value={userPassword} onChange={e => setUserPassword(e.target.value)} className="w-full bg-[#0f172a] border border-gray-700 rounded p-2 text-white" />
                         </div>

                         <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-gray-700">
                             <button type="button" onClick={() => setIsUserFormOpen(false)} className="px-4 py-2 rounded text-gray-400 hover:bg-white/5">Cancel</button>
                             <button type="submit" className="px-6 py-2 bg-violet-600 rounded text-white font-bold hover:bg-violet-700">Save Changes</button>
                         </div>
                     </form>
                 </div>
             </div>
         )}

         <div className="bg-[#1e293b]/40 rounded-2xl overflow-hidden border border-gray-800/50 shadow-2xl backdrop-blur-sm">
             <table className="w-full text-left">
                 <thead className="bg-[#111827] text-gray-400 uppercase text-[10px] font-bold tracking-widest border-b border-gray-800">
                     <tr>
                         <th className="px-6 py-4">User</th>
                         <th className="px-6 py-4">Email</th>
                         <th className="px-6 py-4">Rank</th>
                         <th className="px-6 py-4 text-right">Actions</th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-800/50 text-gray-300">
                     {filteredUsers.map(u => (
                         <tr key={u.id} className="hover:bg-white/[0.02]">
                             <td className="px-6 py-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-sm font-bold overflow-hidden">
                                    {u.avatarUrl ? <img src={u.avatarUrl} className="w-full h-full object-cover" /> : u.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-medium text-white">{u.name}</span>
                             </td>
                             <td className="px-6 py-4 text-gray-400">{u.email}</td>
                             <td className="px-6 py-4">
                                 {u.role === UserRole.ADMIN ? (
                                     <span className="bg-violet-500/20 text-violet-300 px-2 py-1 rounded text-xs font-bold border border-violet-500/30 flex w-fit items-center gap-1">
                                         <ShieldCheck className="w-3 h-3" /> ADMIN
                                     </span>
                                 ) : (
                                     <span className="bg-gray-700/50 text-gray-400 px-2 py-1 rounded text-xs font-bold border border-gray-700 flex w-fit items-center gap-1">
                                         USER
                                     </span>
                                 )}
                             </td>
                             <td className="px-6 py-4 text-right">
                                 <div className="flex items-center justify-end gap-2">
                                    <button onClick={() => handleEditUser(u)} className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-full"><PenSquare className="w-4 h-4" /></button>
                                    <button onClick={() => handleDeleteUser(u.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-full"><Trash2 className="w-4 h-4" /></button>
                                 </div>
                             </td>
                         </tr>
                     ))}
                 </tbody>
             </table>
         </div>
      </>
      )}

    </div>
  );
};

export default AdminDashboard;