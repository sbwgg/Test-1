import { Movie, User, Post } from '../types';

const API_URL = '/api/movies';
const USERS_URL = '/api/users';
const PROFILE_URL = '/api/profile';
const POSTS_URL = '/api/posts';

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

  updateProfile: async (data: Partial<User> & { password?: string }): Promise<{user: User, token: string}> => {
    const res = await fetch(PROFILE_URL, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Failed to update profile');
    return result;
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
  },

  // --- COMMUNITY POSTS ---
  getPosts: async (): Promise<Post[]> => {
    try {
        const res = await fetch(POSTS_URL);
        if (!res.ok) throw new Error('Failed to fetch posts');
        return await res.json();
    } catch (e) {
        console.error(e);
        return [];
    }
  },

  createPost: async (post: { title: string, content: string, category: string }): Promise<Post> => {
      const res = await fetch(POSTS_URL, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(post)
      });
      if (!res.ok) throw new Error('Failed to create post');
      return await res.json();
  },

  deletePost: async (id: string): Promise<void> => {
      const res = await fetch(`${POSTS_URL}/${id}`, {
          method: 'DELETE',
          headers: getHeaders()
      });
      if (!res.ok) throw new Error('Failed to delete post');
  },

  togglePinPost: async (id: string): Promise<void> => {
      const res = await fetch(`${POSTS_URL}/${id}/pin`, {
          method: 'PUT',
          headers: getHeaders()
      });
      if (!res.ok) throw new Error('Failed to pin/unpin post');
  }
};