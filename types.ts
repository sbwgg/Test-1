export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
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
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string) => Promise<void>;
  register: (email: string, name: string) => Promise<void>;
  logout: () => void;
}
