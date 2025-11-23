import React, { useEffect, useState } from 'react';
import { db } from '../services/db';
import { Movie } from '../types';
import Hero from '../components/Hero';
import MovieCard from '../components/MovieCard';

const Home: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [featured, setFeatured] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const allMovies = await db.getMovies();
        setMovies(allMovies);
        const feat = allMovies.find(m => m.isFeatured) || allMovies[0];
        setFeatured(feat);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#141414]">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
             <span className="text-red-600 font-bold text-xs">YUME</span>
          </div>
        </div>
    </div>
  );

  if (!featured) return <div className="text-white text-center mt-32 text-xl font-light">No content available. Login as Admin to add movies!</div>;

  const genres = Array.from(new Set(movies.flatMap(m => m.genre)));

  return (
    <div className="pb-20 bg-[#141414] overflow-hidden">
      <Hero movie={featured} />
      
      <div className="relative z-10 space-y-12 md:space-y-20 -mt-24 md:-mt-32 px-4 md:px-12 pb-12">
        {/* Trending Section */}
        <div className="space-y-3 group">
          <h3 className="text-xl md:text-2xl font-bold text-gray-200 group-hover:text-white transition-colors duration-300 pl-2 border-l-4 border-transparent group-hover:border-red-600">Trending Now</h3>
          <div className="relative group/slider">
             <div className="flex space-x-4 overflow-x-auto hide-scrollbar py-8 px-2 -mx-2 mask-linear-fade">
                {movies.map(movie => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
             </div>
          </div>
        </div>

        {/* Genre Sections */}
        {genres.slice(0, 4).map(genre => (
          <div key={genre} className="space-y-3 group">
             <h3 className="text-xl md:text-2xl font-bold text-gray-200 group-hover:text-white transition-colors duration-300 pl-2 border-l-4 border-transparent group-hover:border-red-600">{genre} Movies</h3>
             <div className="relative group/slider">
                <div className="flex space-x-4 overflow-x-auto hide-scrollbar py-8 px-2 -mx-2">
                   {movies
                     .filter(m => m.genre.includes(genre))
                     .map(movie => (
                       <MovieCard key={movie.id} movie={movie} />
                   ))}
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;