export type Post = {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    position?: string;
    club?: string;
  };
  content: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
};

export type UserProfileDetailed = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fatherName: string;
  motherName: string;
  nationality: string;
  address: string;
  age: number;
  gender: string;
  dateOfBirth: string;
  profilePicture: string;
  position: string;
  club: string;
  joinDate: string;
  isVerified: boolean;
  connections: number;
  rating: number;
};

export type Tryout = {
  id: string;
  title: string;
  club: string;
  location: string;
  date: string;
  time?: string;
  level?: string;
  positions?: string[];
  spotsAvailable?: number;
  applicationDeadline?: string;
  requirements?: string[];
  contact?: string;
  isPremium?: boolean;
  isDeadlineSoon?: boolean;
};