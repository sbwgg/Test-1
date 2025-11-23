export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string; // New field for PFP
}

export interface Movie {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string; // Poster
  coverUrl: string; // Wide banner
  videoUrl: string;
  genre: string[];
  year: number;
  duration: string;
  rating: string; // e.g., PG-13, R
  isFeatured?: boolean;
  views: number;
  
  // Advanced Fields
  type: 'movie' | 'series';
  audioLanguages: string[];
  subtitleLanguages: string[];
}

export interface Post {
  id: string;
  userId: string;
  authorName: string;
  authorAvatar?: string;
  authorRole: UserRole;
  title: string;
  content: string;
  category: 'General' | 'Updates' | 'Recommendations' | 'Discussion';
  createdAt: string;
  isPinned: boolean;
  likes: number;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string) => Promise<void>;
  register: (email: string, name: string) => Promise<void>;
  updateProfile: (data: Partial<User> & { password?: string }) => Promise<void>;
  logout: () => void;
}