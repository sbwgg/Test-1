import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { generateMovieMetadata } from '../services/gemini';
import { Movie } from '../types';
import { Trash2, Plus, Sparkles, Film, BarChart3, Users, PlayCircle, Search, X, ShieldCheck, Clock, Calendar, Star } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
  const [coverUrl, setCoverUrl] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('');
  const [rating, setRating] = useState('');
  const [duration, setDuration] = useState('');
  const [year, setYear] = useState<number>(new Date().getFullYear());

  const refreshMovies = async () => {
    const data = await db.getMovies();
    setMovies(data);
  };

  useEffect(() => {
    refreshMovies();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this movie?")) {
      await db.deleteMovie(id);
      refreshMovies();
    }
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
    const newMovie: Movie = {
      id: Date.now().toString(),
      title,
      description,
      thumbnailUrl: coverUrl,
      coverUrl,
      videoUrl,
      genre: genre.split(',').map(g => g.trim()),
      rating,
      duration,
      year,
      views: 0,
      isFeatured: false
    };

    await db.addMovie(newMovie);
    await refreshMovies();
    setIsAdding(false);
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setGenre('');
    setRating('');
    setDuration('');
    setCoverUrl('');
  };

  const filteredMovies = movies.filter(m => m.title.toLowerCase().includes(searchTerm.toLowerCase()));

  // Stats
  const totalViews = movies.reduce((acc, curr) => acc + (curr.views || 0), 0);
  const totalGenres = new Set(movies.flatMap(m => m.genre)).size;

  return (
    <div className="pt-28 px-4 max-w-7xl mx-auto min-h-screen pb-20">
      
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-fade-in">
        <div className="bg-[#1f1f1f]/80 backdrop-blur-md p-6 rounded-2xl border border-white/5 shadow-xl flex items-center justify-between group hover:border-white/10 transition-all hover:-translate-y-1">
            <div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Total Library</p>
                <h3 className="text-4xl font-black text-white">{movies.length}</h3>
                <p className="text-xs text-gray-500 mt-2">Movies available</p>
            </div>
            <div className="bg-gradient-to-br from-blue-600/20 to-blue-900/10 p-4 rounded-xl group-hover:from-blue-600/30 transition-colors">
                <Film className="w-8 h-8 text-blue-500" />
            </div>
        </div>
        <div className="bg-[#1f1f1f]/80 backdrop-blur-md p-6 rounded-2xl border border-white/5 shadow-xl flex items-center justify-between group hover:border-white/10 transition-all hover:-translate-y-1">
            <div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Total Engagement</p>
                <h3 className="text-4xl font-black text-white">{totalViews.toLocaleString()}</h3>
                <p className="text-xs text-gray-500 mt-2">Global stream count</p>
            </div>
            <div className="bg-gradient-to-br from-green-600/20 to-green-900/10 p-4 rounded-xl group-hover:from-green-600/30 transition-colors">
                <Users className="w-8 h-8 text-green-500" />
            </div>
        </div>
        <div className="bg-[#1f1f1f]/80 backdrop-blur-md p-6 rounded-2xl border border-white/5 shadow-xl flex items-center justify-between group hover:border-white/10 transition-all hover:-translate-y-1">
            <div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Categories</p>
                <h3 className="text-4xl font-black text-white">{totalGenres}</h3>
                <p className="text-xs text-gray-500 mt-2">Active genres</p>
            </div>
            <div className="bg-gradient-to-br from-purple-600/20 to-purple-900/10 p-4 rounded-xl group-hover:from-purple-600/30 transition-colors">
                <BarChart3 className="w-8 h-8 text-purple-500" />
            </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
        <h1 className="text-3xl font-bold text-white flex items-center tracking-tight">
          <ShieldCheck className="mr-3 text-red-600 w-8 h-8" /> Content Management
        </h1>
        <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-white transition-colors" />
                <input 
                    type="text" 
                    placeholder="Search library..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#141414] border border-gray-700 text-white pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600/50 focus:border-red-600 text-sm placeholder-gray-500 transition-all shadow-inner"
                />
            </div>
            <button 
            onClick={() => setIsAdding(!isAdding)}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg flex items-center font-bold shadow-lg shadow-red-900/20 transition-all hover:scale-105 active:scale-95"
            >
            {isAdding ? <X className="w-5 h-5 mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
            {isAdding ? 'Close' : 'Add Movie'}
            </button>
        </div>
      </div>

      {isAdding && (
        <div className="bg-[#181818] p-8 rounded-2xl mb-12 border border-white/5 animate-slide-up shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
             <Film className="w-64 h-64" />
          </div>

          <div className="relative z-10">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-white">Publish New Content</h2>
                    <p className="text-gray-400 text-sm mt-1">Add a new movie to the global streaming library.</p>
                </div>
                <div className="flex items-center gap-2 bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-white/10 px-3 py-1.5 rounded-full">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="text-xs text-purple-200 font-medium">Auto Fill</span>
                </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Floating Label Input Group */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    
                    {/* Title with AI Button */}
                    <div className="relative flex gap-2">
                        <div className="relative flex-1 group">
                            <input 
                            type="text" 
                            id="title"
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)}
                            className="block px-4 pb-2.5 pt-4 w-full text-sm text-white bg-transparent rounded-lg border border-gray-600 appearance-none focus:outline-none focus:ring-0 focus:border-red-600 peer transition-colors"
                            placeholder=" "
                            required 
                            />
                            <label htmlFor="title" className="absolute text-sm text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-[#181818] px-2 peer-focus:px-2 peer-focus:text-red-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1">
                                Movie Title
                            </label>
                        </div>
                        <button 
                        type="button"
                        onClick={handleAIGenerate}
                        disabled={loadingAI}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 rounded-lg flex items-center justify-center disabled:opacity-50 transition-all shadow-lg shadow-purple-900/20"
                        title="Auto-fill"
                        >
                        {loadingAI ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div> : <Sparkles className="w-5 h-5" />}
                        </button>
                    </div>

                    <div className="relative group">
                        <input 
                            type="text" 
                            id="videoUrl"
                            value={videoUrl} 
                            onChange={(e) => setVideoUrl(e.target.value)}
                            className="block px-4 pb-2.5 pt-4 w-full text-sm text-white bg-transparent rounded-lg border border-gray-600 appearance-none focus:outline-none focus:ring-0 focus:border-red-600 peer transition-colors"
                            placeholder=" "
                            required
                        />
                        <label htmlFor="videoUrl" className="absolute text-sm text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-[#181818] px-2 peer-focus:px-2 peer-focus:text-red-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1">
                            Video Source URL
                        </label>
                    </div>

                    <div className="relative group">
                        <input 
                            type="text" 
                            id="coverUrl"
                            value={coverUrl} 
                            onChange={(e) => setCoverUrl(e.target.value)}
                            className="block px-4 pb-2.5 pt-4 w-full text-sm text-white bg-transparent rounded-lg border border-gray-600 appearance-none focus:outline-none focus:ring-0 focus:border-red-600 peer transition-colors"
                            placeholder=" "
                            required
                        />
                        <label htmlFor="coverUrl" className="absolute text-sm text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-[#181818] px-2 peer-focus:px-2 peer-focus:text-red-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1">
                            Cover Image URL
                        </label>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="relative group">
                            <input 
                                type="number" 
                                id="year"
                                value={year} 
                                onChange={e => setYear(parseInt(e.target.value))} 
                                className="block px-4 pb-2.5 pt-4 w-full text-sm text-white bg-transparent rounded-lg border border-gray-600 appearance-none focus:outline-none focus:ring-0 focus:border-red-600 peer transition-colors"
                                placeholder=" "
                            />
                            <label htmlFor="year" className="absolute text-sm text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-[#181818] px-2 peer-focus:px-2 peer-focus:text-red-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1">
                                Year
                            </label>
                        </div>
                        <div className="relative group">
                            <input 
                                type="text" 
                                id="rating"
                                value={rating} 
                                onChange={e => setRating(e.target.value)} 
                                className="block px-4 pb-2.5 pt-4 w-full text-sm text-white bg-transparent rounded-lg border border-gray-600 appearance-none focus:outline-none focus:ring-0 focus:border-red-600 peer transition-colors"
                                placeholder=" "
                            />
                            <label htmlFor="rating" className="absolute text-sm text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-[#181818] px-2 peer-focus:px-2 peer-focus:text-red-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1">
                                Rating
                            </label>
                        </div>
                        <div className="relative group">
                            <input 
                                type="text" 
                                id="duration"
                                value={duration} 
                                onChange={e => setDuration(e.target.value)} 
                                className="block px-4 pb-2.5 pt-4 w-full text-sm text-white bg-transparent rounded-lg border border-gray-600 appearance-none focus:outline-none focus:ring-0 focus:border-red-600 peer transition-colors"
                                placeholder=" "
                            />
                            <label htmlFor="duration" className="absolute text-sm text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-[#181818] px-2 peer-focus:px-2 peer-focus:text-red-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1">
                                Duration
                            </label>
                        </div>
                    </div>

                    <div className="relative group">
                        <input 
                            type="text" 
                            id="genre"
                            value={genre} 
                            onChange={(e) => setGenre(e.target.value)}
                            className="block px-4 pb-2.5 pt-4 w-full text-sm text-white bg-transparent rounded-lg border border-gray-600 appearance-none focus:outline-none focus:ring-0 focus:border-red-600 peer transition-colors"
                            placeholder=" "
                        />
                        <label htmlFor="genre" className="absolute text-sm text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-[#181818] px-2 peer-focus:px-2 peer-focus:text-red-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1">
                            Genre (Comma separated)
                        </label>
                    </div>

                    <div className="relative group">
                        <textarea 
                            id="description"
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)}
                            className="block px-4 pb-2.5 pt-4 w-full text-sm text-white bg-transparent rounded-lg border border-gray-600 appearance-none focus:outline-none focus:ring-0 focus:border-red-600 peer transition-colors h-28 resize-none"
                            placeholder=" "
                            required
                        />
                        <label htmlFor="description" className="absolute text-sm text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-[#181818] px-2 peer-focus:px-2 peer-focus:text-red-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-6 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1">
                            Plot Summary
                        </label>
                    </div>
                </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-700/50">
                <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-2.5 rounded-lg text-gray-400 hover:text-white mr-4 font-semibold transition-colors hover:bg-white/5">Cancel</button>
                <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-8 rounded-lg shadow-lg shadow-red-900/30 transition-all hover:scale-105 active:scale-95">
                    Publish Movie
                </button>
                </div>
            </form>
          </div>
        </div>
      )}

      {/* Modern Data Grid */}
      <div className="bg-[#181818] rounded-2xl overflow-hidden border border-gray-800/50 shadow-2xl">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
            <thead className="bg-[#111] text-gray-400 uppercase text-[10px] font-bold tracking-widest border-b border-gray-800">
                <tr>
                <th className="px-8 py-5">Content</th>
                <th className="px-6 py-5">Metadata</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5">Performance</th>
                <th className="px-6 py-5 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50 text-gray-300">
                {filteredMovies.map(movie => (
                <tr key={movie.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-4">
                        <div className="flex items-center">
                            <div className="h-16 w-24 flex-shrink-0 relative overflow-hidden rounded-md shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all">
                                <img src={movie.thumbnailUrl} className="w-full h-full object-cover" alt="" />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                            </div>
                            <div className="ml-5">
                                <div className="font-bold text-white text-sm group-hover:text-red-500 transition-colors">{movie.title}</div>
                                <div className="flex items-center text-xs text-gray-500 mt-1.5 space-x-2">
                                   <Calendar className="w-3 h-3" /> <span>{movie.year}</span>
                                   <Clock className="w-3 h-3 ml-2" /> <span>{movie.duration}</span>
                                </div>
                            </div>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                            {movie.genre.slice(0, 2).map((g, i) => (
                                <span key={i} className="px-2.5 py-1 rounded-full bg-[#222] border border-gray-700 text-[10px] text-gray-300 font-medium hover:bg-white/10 transition-colors cursor-default">{g}</span>
                            ))}
                            {movie.genre.length > 2 && <span className="px-2 py-1 text-[10px] text-gray-500">+{movie.genre.length - 2}</span>}
                        </div>
                    </td>
                    <td className="px-6 py-4">
                         <div className="flex items-center space-x-2">
                            <span className="relative flex h-2.5 w-2.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                            </span>
                            <span className="text-xs font-medium text-green-500">Live</span>
                         </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center text-sm font-medium text-gray-300">
                            <PlayCircle className="w-4 h-4 mr-2 text-gray-600" />
                            {movie.views.toLocaleString()}
                        </div>
                        <div className="w-24 h-1 bg-gray-800 rounded-full mt-2 overflow-hidden">
                             <div className="h-full bg-red-600/50" style={{ width: `${Math.min(movie.views / 100, 100)}%` }}></div>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                    <button 
                        onClick={() => handleDelete(movie.id)}
                        className="text-gray-500 hover:text-red-500 p-2.5 rounded-full hover:bg-red-500/10 transition-all transform hover:scale-110 active:scale-95"
                        title="Delete"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
        {filteredMovies.length === 0 && (
            <div className="py-20 text-center text-gray-500 flex flex-col items-center">
                <Film className="w-16 h-16 mb-4 opacity-10" />
                <p className="text-lg font-medium">No movies found matching "{searchTerm}"</p>
                <p className="text-sm opacity-50">Try a different search term or add a new movie.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;