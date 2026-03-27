export interface Player {
  id: string;
  name: string;
  position: string;
  club: string;
  location: string;
  rating: number;
  matches: number;
  goals: number;
  assists?: number;
  image?: string;
  isConnected?: boolean;
  age?: number;
  nationality?: string;
}

export interface Club {
  id: string;
  name: string;
  location: string;
  league: string;
  logo?: string;
  division: string;
  founded?: number;
}

export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  venue: string;
  league: string;
  isLive?: boolean;
  hasNotification?: boolean;
  score?: {
    home: number;
    away: number;
  };
}

export interface Tryout {
  id: string;
  club: string;
  position: string;
  date: string;
  time: string;
  location: string;
  level: 'Professional' | 'Academy' | 'Amateur' | 'Youth';
  ageGroup: string;
  deadline: string;
  spots: number;
  requirements: string[];
  contact?: string;
  fee?: number;
}

export interface CoachMessage {
  id: string;
  type: 'training' | 'diet' | 'match' | 'general';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  timestamp: string;
  isRead?: boolean;
}

export interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  badge?: string | number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  position: string;
  club?: string;
  avatar?: string;
  joinDate: string;
  isVerified: boolean;
  connections: number;
  rating: number;
}

export interface UserProfileDetailed {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fatherName: string;
  motherName: string;
  nationality: string;
  address: string;
  age: number;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  dateOfBirth: string;
  profilePicture?: string;
  position?: string;
  club?: string;
  joinDate: string;
  isVerified: boolean;
  connections: number;
  rating: number;
}

export interface Post {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    profilePicture?: string;
    position?: string;
    club?: string;
  };
  content: string;
  media?: {
    type: 'image' | 'video';
    url: string;
    thumbnail?: string;
  };
  attributes?: Record<string, number>; // Player skill ratings from AI assessment
  likes: number;
  comments: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  user: {
    id: string;
    name: string;
    profilePicture?: string;
  };
  content: string;
  createdAt: string;
}