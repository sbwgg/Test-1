import { Movie } from '../types';

const API_URL = '/api/movies';

const getHeaders = () => {
  const token = localStorage.getItem('streamai_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

export const db = {
  getMovies: async (): Promise<Movie[]> => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Failed to fetch movies');
      return await res.json();
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  getMovieById: async (id: string): Promise<Movie | undefined> => {
    try {
      const res = await fetch(`${API_URL}/${id}`);
      if (!res.ok) return undefined;
      return await res.json();
    } catch (e) {
      console.error(e);
      return undefined;
    }
  },

  addMovie: async (movie: Movie): Promise<void> => {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(movie)
    });
    if (!res.ok) throw new Error('Failed to add movie');
  },

  deleteMovie: async (id: string): Promise<void> => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete movie');
  }
};