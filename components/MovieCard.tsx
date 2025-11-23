import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Mic, Type, Film, Tv } from 'lucide-react';
import { Movie } from '../types';

interface MovieCardProps {
  movie: Movie;
}

const getFlagEmoji = (language: string) => {
  const map: { [key: string]: string } = {
    'English': '🇺🇸',
    'Japanese': '🇯🇵',
    'Spanish': '🇪🇸',
    'French': '🇫🇷',
    'German': '🇩🇪',
    'Italian': '🇮🇹',
    'Korean': '🇰🇷',
    'Chinese': '🇨🇳',
    'Russian': '🇷🇺',
    'Portuguese': '🇧🇷',
    'Hindi': '🇮🇳',
    'Thai': '🇹🇭',
  };
  return map[language] || '🏳️';
};

const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  return (
    <Link to={`/watch/${movie.id}`} className="group flex flex-col w-40 md:w-48 lg:w-52 cursor-pointer transition-transform duration-300 hover:-translate-y-2">
      
      {/* 1. Poster Container - Fixed 2:3 Aspect Ratio */}
      <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden shadow-lg mb-3 ring-1 ring-white/10 bg-[#1e293b]">
        <img
          src={movie.thumbnailUrl}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 group-hover:opacity-80"
          loading="lazy"
        />
        
        {/* Hover Overlay with Play Button */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
          <div className="bg-white/20 p-3 rounded-full backdrop-blur-md border border-white/30 shadow-[0_0_20px_rgba(139,92,246,0.4)] transform scale-50 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-6 h-6 text-white fill-white" />
          </div>
        </div>

        {/* Rating Badge (Top Right) */}
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md border border-white/10 px-1.5 py-0.5 rounded text-[10px] font-bold text-gray-200">
          {movie.rating}
        </div>
      </div>

      {/* 2. Metadata Section (Below Poster) */}
      <div className="px-1 space-y-1.5">
        
        {/* Title */}
        <h3 className="text-white font-bold text-sm leading-tight truncate group-hover:text-violet-400 transition-colors">
          {movie.title}
        </h3>

        {/* Year and Type Row */}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span className="font-medium">{movie.year}</span>
          <div className="flex items-center gap-1 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
             {movie.type === 'series' ? <Tv className="w-3 h-3" /> : <Film className="w-3 h-3" />}
             <span className="uppercase text-[9px] font-bold tracking-wider">
               {movie.type === 'series' ? 'TV' : 'Movie'}
             </span>
          </div>
        </div>

        {/* Language Flags Row */}
        <div className="flex items-center gap-3 pt-1 border-t border-gray-800/50 mt-1">
          {/* Audio Flags */}
          <div className="flex items-center gap-1" title="Audio Languages">
             <Mic className="w-3 h-3 text-gray-500" />
             <div className="flex -space-x-1">
                {(movie.audioLanguages || ['English']).slice(0, 3).map((lang, i) => (
                  <span key={i} className="text-sm grayscale-[30%] hover:grayscale-0 transition-all z-0 hover:z-10 transform hover:scale-125 cursor-help" title={lang}>
                    {getFlagEmoji(lang)}
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
                    {getFlagEmoji(lang)}
                  </span>
                ))}
             </div>
          </div>
        </div>

      </div>
    </Link>
  );
};

export default MovieCard;