import { Movie, User } from '../types';

const API_URL = '/api/movies';
const USERS_URL = '/api/users';

const getHeaders = () => {
  const token = localStorage.getItem('streamai_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

export const db = {
  // --- MOVIES ---
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

  updateMovie: async (id: string, movie: Partial<Movie>): Promise<void> => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(movie)
    });
    if (!res.ok) throw new Error('Failed to update movie');
  },

  deleteMovie: async (id: string): Promise<void> => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete movie');
  },

  // --- USERS ---
  getUsers: async (): Promise<User[]> => {
    const res = await fetch(USERS_URL, {
        headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch users');
    return await res.json();
  },

  updateUser: async (id: string, data: Partial<User> & { password?: string }): Promise<void> => {
    const res = await fetch(`${USERS_URL}/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update user');
  },

  deleteUser: async (id: string): Promise<void> => {
    const res = await fetch(`${USERS_URL}/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to delete user');
    }
  }
};