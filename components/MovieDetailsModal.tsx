import React from 'react';
import { Link } from 'react-router-dom';
import { X, Play, Clock, Calendar, Star, Mic, Type } from 'lucide-react';
import { Movie } from '../types';

interface MovieDetailsModalProps {
  movie: Movie;
  onClose: () => void;
}

const MovieDetailsModal: React.FC<MovieDetailsModalProps> = ({ movie, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-[#141414] w-full max-w-4xl rounded-xl overflow-hidden shadow-2xl animate-scale-in border border-white/10">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 z-20 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full transition-colors backdrop-blur-md"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Hero Banner Section */}
        <div className="relative h-64 md:h-96 w-full">
            <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent z-10" />
            <img 
                src={movie.coverUrl} 
                alt={movie.title} 
                className="w-full h-full object-cover"
            />
            
            <div className="absolute bottom-0 left-0 p-6 md:p-10 z-20 w-full">
                <h2 className="text-4xl md:text-5xl font-black text-white drop-shadow-lg mb-4">{movie.title}</h2>
                <div className="flex items-center gap-4 text-sm font-medium">
                    <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded border border-green-500/30">98% Match</span>
                    <span className="text-gray-300">{movie.year}</span>
                    <span className="border border-gray-500 px-1.5 rounded text-gray-400 text-xs">{movie.rating}</span>
                    <span className="text-gray-300">{movie.duration}</span>
                    <span className="bg-white/20 px-2 py-0.5 rounded text-xs text-white uppercase">{movie.type}</span>
                </div>
            </div>
        </div>

        {/* Content Section */}
        <div className="px-6 md:px-10 pb-10 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column (Desc + Actions) */}
            <div className="md:col-span-2 space-y-6">
                 <div className="flex items-center gap-4">
                    <Link 
                        to={`/watch/${movie.id}`}
                        className="flex-1 bg-white text-black py-3 rounded-md font-bold text-center hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                    >
                        <Play className="fill-black w-5 h-5" /> Play
                    </Link>
                 </div>

                 <div>
                    <h3 className="text-white font-bold mb-2 text-lg">Plot Summary</h3>
                    <p className="text-gray-300 leading-relaxed font-light">{movie.description}</p>
                 </div>

                 <div className="grid grid-cols-2 gap-4 text-sm text-gray-400 border-t border-white/10 pt-4">
                     <div>
                        <span className="block text-gray-500 font-semibold mb-1">Audio</span>
                        <div className="flex flex-wrap gap-1">
                            {movie.audioLanguages?.map(l => (
                                <span key={l} className="bg-white/5 px-2 py-1 rounded text-xs">{l}</span>
                            ))}
                        </div>
                     </div>
                     <div>
                        <span className="block text-gray-500 font-semibold mb-1">Subtitles</span>
                        <div className="flex flex-wrap gap-1">
                            {movie.subtitleLanguages?.map(l => (
                                <span key={l} className="bg-white/5 px-2 py-1 rounded text-xs">{l}</span>
                            ))}
                        </div>
                     </div>
                 </div>
            </div>

            {/* Right Column (Details) */}
            <div className="space-y-4">
                <div>
                    <span className="text-gray-500 text-sm block mb-1">Genres</span>
                    <div className="flex flex-wrap gap-2">
                        {movie.genre.map(g => (
                            <span key={g} className="text-white text-sm hover:underline cursor-pointer">{g}</span>
                        ))}
                    </div>
                </div>
                <div>
                    <span className="text-gray-500 text-sm block mb-1">Maturity Rating</span>
                    <div className="inline-flex items-center border border-white/20 px-2 py-1 rounded bg-white/5">
                        <span className="text-white font-bold text-sm">{movie.rating}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Recommended for ages 14 and up</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailsModal;