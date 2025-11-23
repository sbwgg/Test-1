
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export interface SiteSettings {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  showNotification: boolean;
  notificationMessage: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  watchlist?: string[]; // Array of Movie IDs
  isWatchlistPublic?: boolean;
  createdAt?: string;
}

export interface Movie {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  coverUrl: string;
  videoUrl: string;
  genre: string[];
  year: number;
  duration: string;
  rating: string;
  isFeatured?: boolean;
  views: number;
  type: 'movie' | 'series';
  audioLanguages: string[];
  subtitleLanguages: string[];
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
  likes: string[]; // Array of User IDs
  dislikes: string[]; // Array of User IDs
  replies: Comment[];
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
  likes: string[]; // Array of User IDs
  dislikes: string[]; // Array of User IDs
  comments: Comment[];
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string) => Promise<void>;
  register: (email: string, name: string) => Promise<void>;
  updateProfile: (data: Partial<User> & { password?: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}
