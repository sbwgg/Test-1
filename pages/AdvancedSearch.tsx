import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../services/db';
import { Movie } from '../types';
import MovieCard from '../components/MovieCard';
import { Search, Filter, SlidersHorizontal, Globe, Mic, Type } from 'lucide-react';

const AdvancedSearch: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [query, setQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedAudio, setSelectedAudio] = useState<string>('all');
  const [selectedSub, setSelectedSub] = useState<string>('all');

  useEffect(() => {
    const fetch = async () => {
      const data = await db.getMovies();
      setMovies(data);
      setLoading(false);
    };
    fetch();
  }, []);

  // Extract unique options for dropdowns
  const genres = useMemo(() => Array.from(new Set(movies.flatMap(m => m.genre))).sort(), [movies]);
  const years = useMemo(() => Array.from(new Set(movies.map(m => m.year))).sort((a: number, b: number) => b - a), [movies]);
  const audioLangs = useMemo(() => Array.from(new Set(movies.flatMap(m => m.audioLanguages || []))).sort(), [movies]);
  const subLangs = useMemo(() => Array.from(new Set(movies.flatMap(m => m.subtitleLanguages || []))).sort(), [movies]);

  // Filter Logic
  const filteredMovies = movies.filter(movie => {
    const matchesQuery = movie.title.toLowerCase().includes(query.toLowerCase());
    const matchesType = selectedType === 'all' || movie.type === selectedType;
    const matchesGenre = selectedGenre === 'all' || movie.genre.includes(selectedGenre);
    const matchesYear = selectedYear === 'all' || movie.year.toString() === selectedYear;
    const matchesAudio = selectedAudio === 'all' || (movie.audioLanguages || []).includes(selectedAudio);
    const matchesSub = selectedSub === 'all' || (movie.subtitleLanguages || []).includes(selectedSub);

    return matchesQuery && matchesType && matchesGenre && matchesYear && matchesAudio && matchesSub;
  });

  return (
    <div className="pt-24 min-h-screen px-4 md:px-12 pb-20 bg-[#020617]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-cyan-400 mb-2">Explore Library</h1>
            <p className="text-gray-400">Find exactly what you want to watch with advanced filtering.</p>
          </div>
          <div className="text-gray-500 text-sm font-medium">
             Showing {filteredMovies.length} results
          </div>
        </div>

        {/* Filters Panel */}
        <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-12 shadow-2xl">
          <div className="flex items-center gap-2 mb-6 text-violet-300 font-semibold uppercase tracking-wider text-xs">
            <Filter className="w-4 h-4" /> Filters Configuration
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Search Input */}
            <div className="col-span-1 md:col-span-2 lg:col-span-4 relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-violet-400 transition-colors" />
                <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by title..." 
                  className="w-full bg-[#0f172a] border border-gray-700 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all placeholder-gray-600 text-lg"
                />
            </div>

            {/* Type */}
            <div className="space-y-2">
              <label className="text-xs text-gray-400 ml-1 flex items-center gap-1"><Type className="w-3 h-3"/> Content Type</label>
              <select 
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-all appearance-none cursor-pointer hover:bg-[#1e293b]"
              >
                <option value="all">All Content</option>
                <option value="movie">Movies</option>
                <option value="series">TV Series</option>
              </select>
            </div>

            {/* Genre */}
            <div className="space-y-2">
              <label className="text-xs text-gray-400 ml-1 flex items-center gap-1"><SlidersHorizontal className="w-3 h-3"/> Genre</label>
              <select 
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-all appearance-none cursor-pointer hover:bg-[#1e293b]"
              >
                <option value="all">Any Genre</option>
                {genres.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            {/* Year */}
            <div className="space-y-2">
               <label className="text-xs text-gray-400 ml-1 flex items-center gap-1"><Globe className="w-3 h-3"/> Release Year</label>
              <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-all appearance-none cursor-pointer hover:bg-[#1e293b]"
              >
                <option value="all">Any Year</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

             {/* Audio */}
             <div className="space-y-2">
              <label className="text-xs text-gray-400 ml-1 flex items-center gap-1"><Mic className="w-3 h-3"/> Audio Language</label>
              <select 
                value={selectedAudio}
                onChange={(e) => setSelectedAudio(e.target.value)}
                className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-all appearance-none cursor-pointer hover:bg-[#1e293b]"
              >
                <option value="all">Any Language</option>
                {audioLangs.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>
          
           {/* Secondary Row for Subtitles */}
           <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-xs text-gray-400 ml-1 flex items-center gap-1"><Type className="w-3 h-3"/> Subtitles</label>
                <select 
                  value={selectedSub}
                  onChange={(e) => setSelectedSub(e.target.value)}
                  className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-all appearance-none cursor-pointer hover:bg-[#1e293b]"
                >
                  <option value="all">Any Subtitles</option>
                  {subLangs.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              
              <div className="md:col-span-3 flex items-end justify-end">
                  <button 
                    onClick={() => {
                        setQuery('');
                        setSelectedType('all');
                        setSelectedGenre('all');
                        setSelectedYear('all');
                        setSelectedAudio('all');
                        setSelectedSub('all');
                    }}
                    className="text-gray-400 hover:text-white text-sm underline decoration-gray-600 hover:decoration-white underline-offset-4 transition-all"
                  >
                    Clear All Filters
                  </button>
              </div>
           </div>
        </div>

        {/* Results Grid */}
        {loading ? (
             <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
             </div>
        ) : filteredMovies.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {filteredMovies.map(movie => (
                    <div key={movie.id} className="transform hover:-translate-y-2 transition-transform duration-300">
                         <MovieCard movie={movie} />
                    </div>
                ))}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center py-32 text-gray-500 opacity-60">
                <Search className="w-20 h-20 mb-4 stroke-1" />
                <p className="text-xl font-light">No content matches your specific criteria.</p>
                <p className="text-sm mt-2">Try adjusting your filters.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedSearch;