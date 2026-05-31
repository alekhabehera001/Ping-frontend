export interface User {
  _id: string;
  email: string;
  name: string;
  avatar?: string;
  fcmToken?: string;
  coupleId?: string;
  isEmailVerified: boolean;
  appLanguage?: string;
  createdAt?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  user: User | null;
  tokens: TokenPair | null;
}

export interface Couple {
  _id: string;
  user1: User | string;
  user2?: User | string;
  inviteCode: string;
  status: 'pending' | 'active' | 'unlinked';
  anniversary?: string;
  createdAt?: string;
}

export interface Question {
  _id: string;
  text: string;
  category: string;
  scheduledFor: string;
  isActive: boolean;
}

export interface Answer {
  _id: string;
  questionId: string | Question;
  userId: string | User;
  coupleId: string;
  text: string;
  isRevealed: boolean;
  createdAt: string;
}

export type MoodType = 'happy' | 'sad' | 'stressed' | 'angry' | 'excited' | 'loved' | 'tired';

export interface Mood {
  _id: string;
  userId: string | User;
  coupleId: string;
  mood: MoodType;
  note?: string;
  createdAt: string;
}

export type MemoryType = 'photo' | 'voice' | 'note';

export interface Memory {
  _id: string;
  coupleId: string;
  uploadedBy: string | User;
  type: MemoryType;
  s3Key?: string;
  s3Url?: string;
  caption?: string;
  noteText?: string;
  createdAt: string;
}

export interface Streak {
  _id: string;
  coupleId: string;
  currentStreak: number;
  longestStreak: number;
  lastAnsweredDate?: string;
  badges: ('week' | 'month' | 'century')[];
  recoveryTokens: number;
}

export interface Notification {
  _id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

export interface ApiResponse<T = unknown> {
  status: boolean;
  message: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
