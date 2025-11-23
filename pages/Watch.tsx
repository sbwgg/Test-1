import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { Movie } from '../types';
import { ArrowLeft } from 'lucide-react';

const Watch: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<Movie | null>(null);

  useEffect(() => {
    const fetchMovie = async () => {
      if (id) {
        const found = await db.getMovieById(id);
        if (found) {
          setMovie(found);
        } else {
          navigate('/');
        }
      }
    };
    fetchMovie();
  }, [id, navigate]);

  if (!movie) return <div className="h-screen bg-black text-white flex items-center justify-center">Loading Player...</div>;

  return (
    <div className="w-full h-screen bg-black flex flex-col relative">
      <div className="absolute top-0 w-full p-6 z-10 flex items-center bg-gradient-to-b from-black/80 to-transparent">
        <Link to="/" className="text-white hover:text-gray-300 mr-4">
          <ArrowLeft className="h-8 w-8" />
        </Link>
        <div>
           <h2 className="text-white text-xl font-bold">{movie.title}</h2>
           <p className="text-gray-400 text-sm">Watching now • {movie.genre.join(', ')}</p>
        </div>
      </div>

      <div className="flex-grow flex items-center justify-center bg-black">
        <video 
          controls 
          autoPlay 
          className="w-full h-full max-h-screen object-contain"
          poster={movie.coverUrl}
        >
          <source src={movie.videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
};

export default Watch;