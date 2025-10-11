export type StudentCategory = 'SCIENCE' | 'ART' | 'COMMERCIAL';

export type UserRole = 'STUDENT' | 'TEACHER' | 'TUTOR' | 'SCHOOL_ADMIN' | 'SUPER_ADMIN';

export type SubscriptionTier = 'FREE' | 'PREMIUM_MONTHLY' | 'PREMIUM_YEARLY' | 'INSTITUTIONAL';

export type SubscriptionStatus = 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PENDING';

export interface School {
  id: string;
  name: string;
  email: string;
}

export interface User {
  id: string;
  email: string;
  username?: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string; // ADD THIS LINE
  role: UserRole;
  studentCategory?: StudentCategory;
  subscriptionTier: SubscriptionTier;
  subscriptionStatus: SubscriptionStatus;
  subscriptionEndsAt?: string;
  school?: School;
  createdAt: string;
  lastLogin?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  studentCategory?: StudentCategory;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}