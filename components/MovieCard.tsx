import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Plus, ThumbsUp, ChevronDown, Monitor } from 'lucide-react';
import { Movie } from '../types';

interface MovieCardProps {
  movie: Movie;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  return (
    <div className="group relative h-36 min-w-[240px] md:h-40 md:min-w-[280px] lg:h-44 lg:min-w-[320px] cursor-pointer perspective-1000">
      {/* Base Image (Static) */}
      <img
        src={movie.thumbnailUrl}
        alt={movie.title}
        className="rounded-lg w-full h-full object-cover transition-all duration-500 group-hover:opacity-0 shadow-lg group-hover:shadow-violet-500/20"
        loading="lazy"
      />

      {/* Hover Popup Card */}
      <div className="absolute top-0 left-0 w-full bg-[#1e293b] rounded-lg shadow-2xl overflow-hidden invisible group-hover:visible opacity-0 group-hover:opacity-100 group-hover:scale-110 group-hover:-translate-y-10 group-hover:z-50 transition-all duration-300 ease-out delay-200 ring-1 ring-white/10 origin-center z-50">
        
        {/* Preview Image Area */}
        <div className="relative h-36 w-full">
             <img
                src={movie.thumbnailUrl}
                alt={movie.title}
                className="object-cover w-full h-full"
            />
            {/* Dark gradient on bottom of image for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1e293b] via-transparent to-transparent"></div>
            <div className="absolute bottom-2 left-2 flex gap-1">
                 {movie.type === 'series' && <span className="text-[10px] font-bold bg-black/60 text-white px-1.5 py-0.5 rounded backdrop-blur-sm">SERIES</span>}
                 <span className="text-[10px] font-bold bg-white/20 text-white px-1.5 py-0.5 rounded backdrop-blur-sm">HD</span>
            </div>
        </div>

        {/* Action Buttons & Info */}
        <div className="p-4 space-y-3 bg-[#1e293b]">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Link to={`/watch/${movie.id}`} className="bg-white rounded-full p-2 hover:bg-violet-400 hover:text-white transition-colors shadow-[0_0_10px_rgba(255,255,255,0.2)] group/btn">
                        <Play className="h-3 w-3 text-black fill-current group-hover/btn:scale-110 transition-transform group-hover/btn:text-white group-hover/btn:fill-white" />
                    </Link>
                    <button className="border-2 border-gray-500 rounded-full p-1.5 hover:border-violet-400 text-gray-400 hover:text-white transition-colors bg-[#0f172a]/50">
                        <Plus className="h-3 w-3" />
                    </button>
                    <button className="border-2 border-gray-500 rounded-full p-1.5 hover:border-violet-400 text-gray-400 hover:text-white transition-colors bg-[#0f172a]/50">
                        <ThumbsUp className="h-3 w-3" />
                    </button>
                </div>
                <Link to={`/watch/${movie.id}`} className="border-2 border-gray-500 rounded-full p-1.5 hover:border-white text-gray-400 hover:text-white ml-auto transition-colors bg-[#0f172a]/50">
                    <ChevronDown className="h-3 w-3" />
                </Link>
            </div>

            <div>
                <h4 className="text-white font-bold text-sm mb-1 line-clamp-1">{movie.title}</h4>
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