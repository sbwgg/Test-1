import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Mic, Type, Film, Tv, Info } from 'lucide-react';
import { Movie } from '../types';
import { getFlag } from '../utils/languages';

interface MovieCardProps {
  movie: Movie;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  return (
    <div className="group flex flex-col w-40 md:w-48 lg:w-52 relative">
      <Link to={`/watch/${movie.id}`}>
        {/* 1. Poster Container - Fixed 2:3 Aspect Ratio */}
        <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden shadow-lg mb-3 ring-1 ring-white/10 bg-[#1e293b] cursor-pointer">
          <img
            src={movie.thumbnailUrl}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 group-hover:opacity-60"
            loading="lazy"
          />
          
          {/* Hover Overlay with Play Button */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center backdrop-blur-[2px] gap-3">
            <div className="bg-white p-3 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.4)] transform scale-50 group-hover:scale-100 transition-transform duration-300 hover:bg-gray-200">
              <Play className="w-6 h-6 text-black fill-black" />
            </div>
            <span className="text-white font-bold text-xs tracking-widest uppercase opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75">Watch Now</span>
          </div>

          {/* Rating Badge (Top Right) */}
          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md border border-white/10 px-1.5 py-0.5 rounded text-[10px] font-bold text-gray-200 z-10">
            {movie.rating}
          </div>
        </div>
      </Link>

      {/* 2. Metadata Section (Below Poster) */}
      <div className="px-1 space-y-1.5">
        
        {/* Title */}
        <div className="flex justify-between items-start">
           <h3 className="text-white font-bold text-sm leading-tight truncate group-hover:text-violet-400 transition-colors flex-1" title={movie.title}>
             {movie.title}
           </h3>
           {/* Info Icon */}
           <Link to={`/watch/${movie.id}`} className="text-gray-500 hover:text-white transition-colors">
              <Info className="w-3.5 h-3.5" />
           </Link>
        </div>

        {/* Year and Type Row */}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span className="font-medium text-gray-500">{movie.year}</span>
          <div className="flex items-center gap-1 bg-white/5 px-1.5 py-0.5 rounded border border-white/5 group-hover:border-white/20 transition-colors">
             {movie.type === 'series' ? <Tv className="w-3 h-3 text-violet-400" /> : <Film className="w-3 h-3 text-cyan-400" />}
             <span className="uppercase text-[9px] font-bold tracking-wider text-gray-300">
               {movie.type === 'series' ? 'TV Series' : 'Movie'}
             </span>
          </div>
        </div>

        {/* Language Flags Row */}
        <div className="flex items-center gap-3 pt-1 border-t border-gray-800/50 mt-1 opacity-60 group-hover:opacity-100 transition-opacity">
          {/* Audio Flags */}
          <div className="flex items-center gap-1" title="Audio Languages">
             <Mic className="w-3 h-3 text-gray-500" />
             <div className="flex -space-x-1">
                {(movie.audioLanguages || ['English']).slice(0, 3).map((lang, i) => (
                  <span key={i} className="text-sm grayscale-[30%] hover:grayscale-0 transition-all z-0 hover:z-10 transform hover:scale-125 cursor-help" title={lang}>
                    {getFlag(lang)}
                  </span>
                ))}
             </div>
          </div>

          {/* Subtitle Flags */}
          <div className="flex items-center gap-1" title="Subtitle Languages">
             <Type className="w-3 h-3 text-gray-500" />
             <div className="flex -space-x-1">
                {(movie.subtitleLanguages || []).slice(0, 2).map((lang, i) => (
                  <span key={i} className="text-sm grayscale-[30%] hover:grayscale-0 transition-all z-0 hover:z-10 transform hover:scale-125 cursor-help" title={lang}>
                    {getFlag(lang)}
                  </span>
                ))}
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MovieCard;
