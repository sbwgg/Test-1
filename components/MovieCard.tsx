import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Plus, ThumbsUp, ChevronDown } from 'lucide-react';
import { Movie } from '../types';

interface MovieCardProps {
  movie: Movie;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  return (
    // 'group' is strictly scoped to this specific card container
    <div className="group relative w-full h-auto aspect-[2/3] cursor-pointer perspective-1000 z-0 hover:z-50">
      
      {/* Base Poster (Static) */}
      <img
        src={movie.thumbnailUrl}
        alt={movie.title}
        className="rounded-lg w-full h-full object-cover shadow-lg transition-all duration-300 group-hover:opacity-0"
        loading="lazy"
      />

      {/* Hover Popup Card */}
      {/* Positioned absolutely, hidden by default, visible on group hover */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] bg-[#1e293b] rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden invisible group-hover:visible opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-105 transition-all duration-300 ease-out delay-300 ring-1 ring-white/10 z-50">
        
        {/* Preview Image Area */}
        <div className="relative h-48 w-full">
             <img
                src={movie.coverUrl || movie.thumbnailUrl}
                alt={movie.title}
                className="object-cover w-full h-full"
            />
            {/* Dark gradient for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1e293b] via-transparent to-transparent"></div>
            <div className="absolute bottom-2 left-3 flex gap-1">
                 {movie.type === 'series' && <span className="text-[10px] font-bold bg-black/60 text-white px-1.5 py-0.5 rounded backdrop-blur-sm">SERIES</span>}
                 <span className="text-[10px] font-bold bg-white/20 text-white px-1.5 py-0.5 rounded backdrop-blur-sm">HD</span>
            </div>
        </div>

        {/* Action Buttons & Info */}
        <div className="p-4 space-y-3 bg-[#1e293b]">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Link to={`/watch/${movie.id}`} className="bg-white rounded-full p-2.5 hover:bg-violet-400 hover:text-white transition-colors shadow-[0_0_10px_rgba(255,255,255,0.2)] group/btn">
                        <Play className="h-4 w-4 text-black fill-current group-hover/btn:scale-110 transition-transform group-hover/btn:text-white group-hover/btn:fill-white" />
                    </Link>
                    <button className="border-2 border-gray-500 rounded-full p-2 hover:border-violet-400 text-gray-400 hover:text-white transition-colors bg-[#0f172a]/50">
                        <Plus className="h-4 w-4" />
                    </button>
                    <button className="border-2 border-gray-500 rounded-full p-2 hover:border-violet-400 text-gray-400 hover:text-white transition-colors bg-[#0f172a]/50">
                        <ThumbsUp className="h-4 w-4" />
                    </button>
                </div>
                <Link to={`/watch/${movie.id}`} className="border-2 border-gray-500 rounded-full p-2 hover:border-white text-gray-400 hover:text-white ml-auto transition-colors bg-[#0f172a]/50">
                    <ChevronDown className="h-4 w-4" />
                </Link>
            </div>

            <div>
                <h4 className="text-white font-bold text-base mb-1 line-clamp-1">{movie.title}</h4>
                <div className="flex items-center space-x-2 mb-2">
                    <span className="text-green-400 font-bold text-xs">98% Match</span>
                    <span className="border border-gray-600 px-1.5 py-0.5 rounded-[2px] text-[10px] text-gray-300 uppercase">{movie.rating}</span>
                    <span className="text-gray-400 text-xs">{movie.duration}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {movie.genre.slice(0, 3).map((g, i) => (
                        <span key={i} className="text-[10px] text-gray-400 flex items-center">
                            {i > 0 && <span className="text-gray-600 mr-2 text-[8px]">•</span>}
                            {g}
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