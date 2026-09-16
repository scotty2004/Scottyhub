export type PlatformMode = 'ios' | 'android' | 'fullscreen';

export type ActiveTab = 'home' | 'connect' | 'learn' | 'grow' | 'settings';

export interface UserProfile {
  name: string;
  email: string;
  handle: string;
  avatar: string;
  bio: string;
  streakDays: number;
  biometricEnabled: boolean;
  pinCode: string;
  autoLockMinutes: number;
}

export interface CommunityPost {
  id: string;
  author: string;
  authorHandle: string;
  authorAvatar: string;
  content: string;
  timestamp: string;
  likes: number;
  isLiked?: boolean;
  commentsCount: number;
  tag: 'Connect' | 'Learn' | 'Grow' | 'General';
  isPendingSync?: boolean;
  image?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  isSelf: boolean;
  status: 'sent' | 'pending' | 'failed';
}

export interface CourseLesson {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  content: string;
  videoUrl?: string;
}

export interface Course {
  id: string;
  title: string;
  category: string;
  description: string;
  thumbnail: string;
  instructor: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  lessons: CourseLesson[];
  isDownloaded: boolean;
  downloadSizeMb: number;
  progressPercent: number;
}

export interface Habit {
  id: string;
  title: string;
  category: 'Connect' | 'Learn' | 'Grow';
  streak: number;
  completedToday: boolean;
  targetDaysPerWeek: number;
  iconName: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'connect' | 'learn' | 'grow' | 'security' | 'system';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export interface OfflineAction {
  id: string;
  type: 'CREATE_POST' | 'TOGGLE_HABIT' | 'COMPLETE_LESSON' | 'SEND_MESSAGE';
  payload: any;
  timestamp: number;
}
