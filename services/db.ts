
import { Movie, User, Post, SiteSettings } from '../types';

const API_URL = '/api/movies';
const USERS_URL = '/api/users';
const PROFILE_URL = '/api/profile';
const POSTS_URL = '/api/posts';
const SETTINGS_URL = '/api/settings';

const getHeaders = () => {
  const token = localStorage.getItem('streamai_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

export const db = {
  // --- SETTINGS ---
  getSettings: async (): Promise<SiteSettings> => {
      const res = await fetch(SETTINGS_URL);
      if (!res.ok) throw new Error("Failed to fetch settings");
      return await res.json();
  },

  updateSettings: async (settings: SiteSettings): Promise<SiteSettings> => {
      const res = await fetch(SETTINGS_URL, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(settings)
      });
      if (!res.ok) throw new Error("Failed to update settings");
      return await res.json();
  },

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

  getPublicProfile: async (id: string): Promise<any> => {
      const res = await fetch(`${USERS_URL}/profile/${id}`, {
          headers: getHeaders() // Send headers to check if it's "me"
      });
      if(!res.ok) throw new Error("Profile not found");
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

  toggleWatchlist: async (movieId: string): Promise<string[]> => {
      const res = await fetch(`/api/user/watchlist/${movieId}`, {
          method: 'PUT',
          headers: getHeaders()
      });
      if(!res.ok) throw new Error("Failed to update watchlist");
      return await res.json();
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

  getPostById: async (id: string): Promise<Post> => {
      const res = await fetch(`${POSTS_URL}/${id}`);
      if (!res.ok) throw new Error("Post not found");
      return await res.json();
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
  },

  vote: async (targetId: string, targetType: 'post' | 'comment', voteType: 'like' | 'dislike'): Promise<Post> => {
      const res = await fetch(`/api/vote`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ targetId, targetType, voteType })
      });
      if(!res.ok) throw new Error("Vote failed");
      return await res.json();
  },

  addComment: async (postId: string, content: string, parentCommentId?: string): Promise<Post> => {
      const res = await fetch(`${POSTS_URL}/${postId}/comments`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ content, parentCommentId })
      });
      if(!res.ok) throw new Error("Failed to comment");
      return await res.json();
  }
};
