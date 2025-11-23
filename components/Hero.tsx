import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Info } from 'lucide-react';
import { Movie } from '../types';

interface HeroProps {
  movie: Movie;
}

const Hero: React.FC<HeroProps> = ({ movie }) => {
  return (
    <div className="relative h-[90vh] w-full overflow-hidden select-none">
      {/* Background Image with Zoom Effect */}
      <div className="absolute top-0 left-0 w-full h-full animate-fade-in">
        <img
          src={movie.coverUrl}
          alt={movie.title}
          className="w-full h-full object-cover object-top opacity-90 scale-105 origin-center"
        />
        {/* Cinematic Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/40 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/20 to-transparent"></div>
        <div className="absolute bottom-0 h-48 w-full bg-gradient-to-t from-[#141414] to-transparent"></div>
      </div>

      <div className="absolute top-0 left-0 w-full h-full px-4 md:px-16 flex flex-col justify-center pb-24">
        <div className="animate-slide-up max-w-3xl mt-20 md:mt-0">
            {/* Tagline/Year Badge */}
            <div className="flex items-center space-x-4 mb-6 opacity-0 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                 <div className="flex items-center space-x-1">
                    <span className="h-8 w-1 bg-red-600 rounded-full"></span>
                    <span className="text-white font-bold tracking-widest text-sm uppercase">Featured</span>
                 </div>
                 <span className="px-2 py-0.5 border border-gray-500 rounded text-gray-300 text-xs font-medium backdrop-blur-sm">{movie.rating}</span>
                 <span className="text-gray-300 font-medium text-sm">{movie.year}</span>
                 <span className="text-gray-300 font-medium text-sm hidden md:inline">• {movie.duration}</span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-[0.9] tracking-tight drop-shadow-2xl opacity-0 animate-fade-in" style={{ animationDelay: '0.5s' }}>
              {movie.title}
            </h1>
            
            <p className="text-lg md:text-xl text-gray-200 mb-10 line-clamp-3 leading-relaxed font-light max-w-xl text-shadow-lg opacity-0 animate-fade-in" style={{ animationDelay: '0.7s' }}>
              {movie.description}
            </p>

            <div className="flex flex-wrap gap-4 opacity-0 animate-fade-in" style={{ animationDelay: '0.9s' }}>
            <Link
                to={`/watch/${movie.id}`}
                className="flex items-center bg-white text-black px-8 py-3.5 rounded font-bold text-lg hover:bg-gray-200 transition-all duration-300 transform hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
                <Play className="h-6 w-6 mr-3 fill-black" />
                Play
            </Link>
            <button className="flex items-center bg-gray-500/30 text-white px-8 py-3.5 rounded font-bold text-lg hover:bg-gray-500/40 transition-all duration-300 transform hover:scale-105 backdrop-blur-md border border-white/20">
                <Info className="h-6 w-6 mr-3" />
                More Info
            </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;