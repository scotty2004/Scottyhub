/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { initialCourses, initialHabits, initialNotifications, initialPosts, initialProfile } from '../data/mockData';
import { ActiveTab, ChatMessage, CommunityPost, Course, Habit, NotificationItem, OfflineAction, PlatformMode, UserProfile } from '../types';
import * as api from '../lib/api';

interface AppContextType {
  platform: PlatformMode;
  setPlatform: (platform: PlatformMode) => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;

  // Offline & Network
  isOnline: boolean;
  toggleOnline: () => void;
  offlineQueue: OfflineAction[];
  triggerSync: () => void;
  cacheSizeMb: number;
  clearOfflineCache: () => void;

  // Biometric Auth (device-level lock screen — separate from backend account auth)
  isLocked: boolean;
  isBiometricModalOpen: boolean;
  openBiometricAuth: () => void;
  closeBiometricAuth: () => void;
  authenticateBiometrics: (pin?: string) => boolean;
  lockApp: () => void;

  // Backend Account Auth (real — routes/auth.js)
  isAuthenticated: boolean;
  authLoading: boolean;
  authError: string | null;
  pendingVerifyUserId: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  verify: (otp: string) => Promise<boolean>;
  logout: () => void;

  // Profile & Preferences
  profile: UserProfile;
  updateProfile: (updated: Partial<UserProfile>) => void;

  // Data Collections
  posts: CommunityPost[];
  addPost: (content: string, tag: 'Connect' | 'Learn' | 'Grow' | 'General', image?: string) => void;
  toggleLikePost: (postId: string) => void;

  courses: Course[];
  toggleLessonCompletion: (courseId: string, lessonId: string) => void;
  toggleCourseDownload: (courseId: string) => void;

  habits: Habit[];
  toggleHabit: (habitId: string) => void;

  notifications: NotificationItem[];
  unreadCount: number;
  markNotificationRead: (id: string) => void;
  sendPushNotification: (title: string, message: string, type?: NotificationItem['type']) => void;
  activePushToast: NotificationItem | null;
  dismissPushToast: () => void;

  // Messaging / Chat (local AI-assistant panel — see note in sendMessage below)
  messages: ChatMessage[];
  sendMessage: (text: string) => void;

  // Dev Code Modal
  isCodeModalOpen: boolean;
  setIsCodeModalOpen: (open: boolean) => void;

  // Drawer & Navigation Modals
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  toggleDrawer: () => void;
  activeToolModal: string | null;
  setActiveToolModal: (tool: string | null) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  DEVICE_PREFS: 'scotthub_device_prefs_v1', // local-only: pin, biometric toggle, auto-lock
  DOWNLOADED: 'scotthub_downloaded_ids_v1', // local-only: which library items were opened/downloaded
  QUEUE: 'scotthub_offline_queue_v1',
};

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250';
const DEFAULT_THUMBNAIL =
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=400';

const VALID_NOTIF_TYPES: NotificationItem['type'][] = ['connect', 'learn', 'grow', 'security', 'system'];

const formatTimestamp = (iso?: string) => {
  if (!iso) return 'Just now';
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return 'Just now';
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [platform, setPlatform] = useState<PlatformMode>('ios');
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [offlineQueue, setOfflineQueue] = useState<OfflineAction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.QUEUE);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Biometric / device-lock state (local — this guards the phone screen, not the backend account)
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isBiometricModalOpen, setIsBiometricModalOpen] = useState<boolean>(false);

  // Code Viewer State
  const [isCodeModalOpen, setIsCodeModalOpen] = useState<boolean>(false);

  // ScottyHub Drawer & Active Tool Modal State
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [activeToolModal, setActiveToolModal] = useState<string | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const toggleDrawer = () => setIsDrawerOpen((prev) => !prev);
  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      sendPushNotification('Theme Mode', `Switched to ${next} theme mode.`, 'system');
      return next;
    });
  };

  // ---- Backend Account Auth ----
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [pendingVerifyUserId, setPendingVerifyUserId] = useState<string | null>(null);
  const [pendingVerifyEmail, setPendingVerifyEmail] = useState<string | null>(null);
  const [pendingVerifyPassword, setPendingVerifyPassword] = useState<string | null>(null);

  // Local device-only prefs, merged into `profile` (biometric toggle, PIN, auto-lock).
  // These live on the device, not the ScottyHub server — matching how a real
  // mobile app stores security/device settings outside the account record.
  const [devicePrefs, setDevicePrefs] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DEVICE_PREFS);
      return saved ? JSON.parse(saved) : { biometricEnabled: true, pinCode: '1234', autoLockMinutes: 1 };
    } catch {
      return { biometricEnabled: true, pinCode: '1234', autoLockMinutes: 1 };
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DEVICE_PREFS, JSON.stringify(devicePrefs));
    } catch {}
  }, [devicePrefs]);

  const [downloadedIds, setDownloadedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DOWNLOADED);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });
  const persistDownloadedIds = (next: Set<string>) => {
    setDownloadedIds(next);
    try {
      localStorage.setItem(STORAGE_KEYS.DOWNLOADED, JSON.stringify(Array.from(next)));
    } catch {}
  };

  // Profile State — starts from local placeholder, replaced by real /api/auth/me data on login
  const [profile, setProfile] = useState<UserProfile>({ ...initialProfile, ...devicePrefs });

  // Real data collections (empty until fetched from the backend)
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [rawTasks, setRawTasks] = useState<api.EarnTask[]>([]);
  const [rawLibrary, setRawLibrary] = useState<api.LibraryItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const [activePushToast, setActivePushToast] = useState<NotificationItem | null>(null);

  // Chat State — "ScottyAI" assistant panel, now backed by the real
  // /api/ai/chat endpoint (see sendMessage below) rather than canned replies.
  // Real user-to-user messaging (routes/messages.js + socket/chat.js) is a
  // separate feature needing new conversation-list UI — flagged, not faked.
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      senderId: 'bot',
      senderName: 'ScottyAI',
      senderAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=150',
      text: 'Welcome to ScottyHub! Ask me about bot commands, ZWL/ZiG rates, coding scripts, or anything else.',
      timestamp: 'Just now',
      isSelf: false,
      status: 'sent',
    },
  ]);

  // Derived: map raw backend data into the exact shapes the existing UI components expect
  const habits: Habit[] = rawTasks.map((t) => ({
    id: t.id,
    title: t.title,
    category: 'Grow',
    streak: profile.streakDays,
    completedToday: !!t.completed,
    targetDaysPerWeek: 7,
    iconName: 'Target',
  }));

  const courses: Course[] = rawLibrary.map((item) => {
    const done = downloadedIds.has(item.id);
    return {
      id: item.id,
      title: item.title,
      category: item.category,
      description: item.description || '',
      thumbnail: DEFAULT_THUMBNAIL,
      instructor: item.uploaderName || 'ScottyHub Library',
      level: 'Beginner',
      lessons: [
        {
          id: `${item.id}-resource`,
          title: 'Open resource',
          duration: item.sizeLabel || '',
          completed: done,
          content: item.description || 'Tap download to open this resource.',
          videoUrl: item.url,
        },
      ],
      isDownloaded: done,
      downloadSizeMb: parseFloat(item.sizeLabel || '0') || 0,
      progressPercent: done ? 100 : 0,
    };
  });

  // Pulls everything the tabs need from the real backend. Called once right after
  // login/verify succeeds, and can be re-called (e.g. after posting) to refresh.
  const loadRealData = async () => {
    const results = await Promise.allSettled([
      api.getPosts(),
      api.getEarnOverview(),
      api.getLibrary(),
      api.getNotifications(),
    ]);

    const [postsRes, earnRes, libRes, notifRes] = results;

    if (postsRes.status === 'fulfilled') {
      setPosts(
        postsRes.value.map((p) => ({
          id: p.id,
          author: p.author.username,
          authorHandle: `@${p.author.username}`,
          authorAvatar: p.author.avatar || DEFAULT_AVATAR,
          content: p.content,
          timestamp: formatTimestamp(p.createdAt),
          likes: p.likeCount,
          isLiked: p.liked,
          commentsCount: p.commentCount,
          tag: 'General',
          image: p.mediaUrl || undefined,
        }))
      );
    }

    if (earnRes.status === 'fulfilled') {
      setRawTasks(earnRes.value.tasks || []);
    }

    if (libRes.status === 'fulfilled') {
      setRawLibrary(libRes.value.items || []);
    }

    if (notifRes.status === 'fulfilled') {
      setNotifications(
        notifRes.value.notifications.map((n) => ({
          id: n.id,
          title: n.title,
          message: n.message,
          type: (VALID_NOTIF_TYPES as string[]).includes(n.type) ? (n.type as NotificationItem['type']) : 'system',
          timestamp: formatTimestamp(n.created_at),
          read: !!n.is_read,
        }))
      );
    }
  };

  const applyMe = (me: api.MeResponse) => {
    setProfile((prev) => ({
      ...prev,
      name: me.username,
      email: me.email,
      handle: `@${me.username}`,
      avatar: me.avatar || DEFAULT_AVATAR,
      bio: me.bio || '',
      streakDays: me.streak_count || 0,
    }));
  };

  // On mount: if a token is already stored (returning session), verify it and load data
  useEffect(() => {
    const existing = api.getToken();
    if (!existing) return;
    (async () => {
      setAuthLoading(true);
      try {
        const me = await api.authMe();
        applyMe(me);
        setIsAuthenticated(true);
        await loadRealData();
      } catch {
        api.setToken(null);
        setIsAuthenticated(false);
      } finally {
        setAuthLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      const res = await api.authLogin(email, password);
      if (res.requiresTotp) {
        setAuthError('This account has 2FA enabled. Log in from the full ScottyHub site to enter your code.');
        return false;
      }
      if (!res.token || !res.user) {
        setAuthError(res.message || 'Login failed');
        return false;
      }
      api.setToken(res.token);
      const me = await api.authMe();
      applyMe(me);
      setIsAuthenticated(true);
      await loadRealData();
      sendPushNotification('Welcome Back', `Signed in as ${res.user.username}.`, 'security');
      return true;
    } catch (e: any) {
      setAuthError(e?.message || 'Login failed');
      return false;
    } finally {
      setAuthLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      const res = await api.authRegister(username, email, password);
      setPendingVerifyUserId(res.userId);
      setPendingVerifyEmail(email);
      setPendingVerifyPassword(password);
      return true;
    } catch (e: any) {
      setAuthError(e?.message || 'Registration failed');
      return false;
    } finally {
      setAuthLoading(false);
    }
  };

  const verify = async (otp: string): Promise<boolean> => {
    if (!pendingVerifyUserId) {
      setAuthError('Start registration again.');
      return false;
    }
    setAuthError(null);
    setAuthLoading(true);
    try {
      const res = await api.authVerify(pendingVerifyUserId, otp);
      api.setToken(res.token);
      const me = await api.authMe();
      applyMe(me);
      setIsAuthenticated(true);
      setPendingVerifyUserId(null);
      setPendingVerifyEmail(null);
      setPendingVerifyPassword(null);
      await loadRealData();
      sendPushNotification('Account Verified', `Welcome to ScottyHub, ${res.user.username}!`, 'security');
      return true;
    } catch (e: any) {
      setAuthError(e?.message || 'Verification failed');
      return false;
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    api.setToken(null);
    setIsAuthenticated(false);
    setPosts([]);
    setRawTasks([]);
    setRawLibrary([]);
    setNotifications([]);
    setProfile({ ...initialProfile, ...devicePrefs });
    sendPushNotification('Signed Out', 'You have been logged out of ScottyHub.', 'security');
  };

  // Monitor Network State
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      sendPushNotification('Back Online', 'Internet connection restored. Syncing offline changes...', 'system');
    };
    const handleOffline = () => {
      setIsOnline(false);
      sendPushNotification('Offline Mode Active', 'You are now offline. Changes will be saved locally and queued for auto-sync.', 'system');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Persist the offline action queue locally
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(offlineQueue));
    } catch (e) {
      console.warn('Storage write error', e);
    }
  }, [offlineQueue]);

  // Trigger sync when back online
  useEffect(() => {
    if (isOnline && offlineQueue.length > 0) {
      triggerSync();
    }
  }, [isOnline]);

  const toggleOnline = () => {
    const nextState = !isOnline;
    setIsOnline(nextState);
    if (nextState) {
      sendPushNotification('Network Connected', 'Simulated online connection enabled.', 'system');
    } else {
      sendPushNotification('Offline Simulator', 'Switched to offline local caching mode.', 'system');
    }
  };

  const triggerSync = async () => {
    if (offlineQueue.length === 0) return;

    const queued = offlineQueue;
    setOfflineQueue([]);

    // Replay queued creates against the real API now that we're back online
    for (const action of queued) {
      if (action.type === 'CREATE_POST' && isAuthenticated) {
        try {
          await api.createPost(action.payload.content, action.payload.image);
        } catch {
          /* best-effort replay */
        }
      }
    }
    if (isAuthenticated) await loadRealData();

    setPosts((prev) => prev.map((p) => (p.isPendingSync ? { ...p, isPendingSync: false, timestamp: 'Just synced' } : p)));

    sendPushNotification('Sync Complete', `Successfully synced ${queued.length} offline action${queued.length > 1 ? 's' : ''} with ScottyHub!`, 'system');

    try {
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.2 } });
    } catch {}
  };

  const cacheSizeMb = Number(
    (
      courses.filter((c) => c.isDownloaded).reduce((acc, curr) => acc + curr.downloadSizeMb, 0) +
      posts.length * 0.15 +
      14.2
    ).toFixed(1)
  );

  const clearOfflineCache = () => {
    persistDownloadedIds(new Set());
    setOfflineQueue([]);
    sendPushNotification('Cache Cleared', 'Offline downloaded assets and cached data cleared.', 'system');
  };

  // Biometrics (device lock screen)
  const openBiometricAuth = () => {
    setIsBiometricModalOpen(true);
  };

  const closeBiometricAuth = () => {
    setIsBiometricModalOpen(false);
  };

  const authenticateBiometrics = (pin?: string): boolean => {
    if (pin !== undefined) {
      if (pin === profile.pinCode) {
        setIsLocked(false);
        setIsBiometricModalOpen(false);
        sendPushNotification('Access Granted', 'Unlocked with PIN Code.', 'security');
        return true;
      }
      return false;
    }

    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      try {
        window.navigator.vibrate([40, 30, 40]);
      } catch {}
    }

    setIsLocked(false);
    setIsBiometricModalOpen(false);
    sendPushNotification('Face ID Authenticated', 'Privacy verified via Biometric Scanner.', 'security');

    try {
      confetti({ particleCount: 25, spread: 50, origin: { y: 0.3 } });
    } catch {}

    return true;
  };

  const lockApp = () => {
    setIsLocked(true);
    sendPushNotification('App Locked', 'Biometric privacy lock activated.', 'security');
  };

  // Profile updates — bio/avatar/name sync to the real backend; PIN/biometric/
  // auto-lock are device-only settings and stay local.
  const updateProfile = (updated: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updated }));

    const deviceOnly: Partial<typeof devicePrefs> = {};
    if (updated.biometricEnabled !== undefined) deviceOnly.biometricEnabled = updated.biometricEnabled;
    if (updated.pinCode !== undefined) deviceOnly.pinCode = updated.pinCode;
    if (updated.autoLockMinutes !== undefined) deviceOnly.autoLockMinutes = updated.autoLockMinutes;
    if (Object.keys(deviceOnly).length > 0) {
      setDevicePrefs((prev: any) => ({ ...prev, ...deviceOnly }));
    }

    const remoteFields: { username?: string; bio?: string; avatar?: string } = {};
    if (updated.name !== undefined) remoteFields.username = updated.name;
    if (updated.bio !== undefined) remoteFields.bio = updated.bio;
    if (updated.avatar !== undefined) remoteFields.avatar = updated.avatar;
    if (isAuthenticated && Object.keys(remoteFields).length > 0) {
      api.updateMe(remoteFields).catch((e) => {
        sendPushNotification('Profile Sync Failed', e?.message || 'Could not save profile to ScottyHub.', 'system');
      });
    }
  };

  // Community Posts (Connect tab) — real backend feed
  const addPost = (content: string, tag: 'Connect' | 'Learn' | 'Grow' | 'General', image?: string) => {
    const isPending = !isOnline || !isAuthenticated;
    const newPost: CommunityPost = {
      id: `local-${Date.now()}`,
      author: profile.name,
      authorHandle: profile.handle,
      authorAvatar: profile.avatar,
      content,
      timestamp: isPending ? 'Pending sync' : 'Just now',
      likes: 0,
      commentsCount: 0,
      tag,
      image,
      isPendingSync: isPending,
    };

    setPosts((prev) => [newPost, ...prev]);

    if (isPending) {
      setOfflineQueue((prev) => [
        ...prev,
        {
          id: `queue-${Date.now()}`,
          type: 'CREATE_POST',
          payload: { content, image },
          timestamp: Date.now(),
        },
      ]);
      sendPushNotification('Post Saved Offline', 'Post queued in local storage. Will auto-sync when online.', 'connect');
      return;
    }

    api
      .createPost(content, image)
      .then((real) => {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === newPost.id
              ? {
                  id: real.id,
                  author: real.author.username,
                  authorHandle: `@${real.author.username}`,
                  authorAvatar: real.author.avatar || DEFAULT_AVATAR,
                  content: real.content,
                  timestamp: formatTimestamp(real.createdAt),
                  likes: real.likeCount,
                  isLiked: real.liked,
                  commentsCount: real.commentCount,
                  tag,
                  image: real.mediaUrl || undefined,
                }
              : p
          )
        );
        sendPushNotification('Post Published', 'Your ScottyHub community post is live!', 'connect');
      })
      .catch((e) => {
        sendPushNotification('Post Failed', e?.message || 'Could not publish post.', 'connect');
      });
  };

  const toggleLikePost = (postId: string) => {
    const target = posts.find((p) => p.id === postId);
    if (!target) return;
    const wasLiked = !!target.isLiked;

    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, isLiked: !wasLiked, likes: wasLiked ? p.likes - 1 : p.likes + 1 } : p))
    );

    if (!isAuthenticated || postId.startsWith('local-')) return;

    api.likePost(postId).catch(() => {
      // revert on failure
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, isLiked: wasLiked, likes: target.likes } : p))
      );
    });
  };

  // Courses / Learn tab — backed by the real downloads library
  const toggleLessonCompletion = (courseId: string, _lessonId: string) => {
    // Each library resource maps to a single lesson, so this mirrors the download toggle
    toggleCourseDownload(courseId);
  };

  const toggleCourseDownload = (courseId: string) => {
    const item = rawLibrary.find((c) => c.id === courseId);
    if (!item) return;
    const next = new Set(downloadedIds);
    if (next.has(courseId)) {
      next.delete(courseId);
      persistDownloadedIds(next);
      sendPushNotification('Offline Storage Removed', `Removed offline assets for "${item.title}".`, 'learn');
    } else {
      next.add(courseId);
      persistDownloadedIds(next);
      if (typeof window !== 'undefined' && item.url) {
        window.open(item.url, '_blank', 'noopener,noreferrer');
      }
      sendPushNotification('Course Downloaded', `"${item.title}" opened from the ScottyHub library.`, 'learn');
      try {
        confetti({ particleCount: 40, spread: 70, origin: { y: 0.4 } });
      } catch {}
    }
  };

  // Habits (Grow tab) — backed by real earn/missions tasks. Missions can only be
  // completed once (the backend has no "uncomplete" — matches real reward systems),
  // so toggling an already-completed task is a no-op.
  const toggleHabit = (habitId: string) => {
    const task = rawTasks.find((t) => t.id === habitId);
    if (!task || task.completed) return;

    setRawTasks((prev) => prev.map((t) => (t.id === habitId ? { ...t, completed: true } : t)));

    if (!isAuthenticated) return;

    api
      .completeEarnTask(habitId)
      .then(() => {
        sendPushNotification('Habit Check-In!', `Completed "${task.title}".`, 'grow');
        try {
          confetti({ particleCount: 35, spread: 60, origin: { y: 0.4 } });
        } catch {}
      })
      .catch((e) => {
        setRawTasks((prev) => prev.map((t) => (t.id === habitId ? { ...t, completed: false } : t)));
        sendPushNotification('Check-In Failed', e?.message || 'Could not complete this task.', 'grow');
      });
  };

  // Push Notifications (local in-app toast — used for both real backend events
  // above and pure UI feedback like theme/lock changes)
  const sendPushNotification = (
    title: string,
    message: string,
    type: NotificationItem['type'] = 'system'
  ) => {
    const newItem: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title,
      message,
      type,
      timestamp: 'Just now',
      read: false,
    };

    setNotifications((prev) => [newItem, ...prev]);
    setActivePushToast(newItem);

    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      try {
        window.navigator.vibrate(100);
      } catch {}
    }
  };

  const dismissPushToast = () => {
    setActivePushToast(null);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    if (isAuthenticated && !id.startsWith('notif-')) {
      api.markNotificationReadApi(id).catch(() => {});
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Messaging — real ScottyAI assistant (server/routes/ai.js -> OpenRouter,
  // multi-turn, credit-limited per the user's plan). Requires being logged in
  // (the endpoint is auth-protected), same as every other real ScottyHub
  // feature in this app.
  const sendMessage = (text: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'user',
      senderName: profile.name,
      senderAvatar: profile.avatar,
      text,
      timestamp: 'Just now',
      isSelf: true,
      status: isOnline ? 'sent' : 'pending',
    };

    setMessages((prev) => [...prev, userMsg]);

    const botAvatar = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=150';
    const pushBotReply = (replyText: string) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-bot-${Date.now()}`,
          senderId: 'bot',
          senderName: 'ScottyAI',
          senderAvatar: botAvatar,
          text: replyText,
          timestamp: 'Just now',
          isSelf: false,
          status: 'sent',
        },
      ]);
    };

    if (!isOnline) {
      sendPushNotification('Message Saved Offline', 'Message will be sent when connection returns.', 'connect');
      return;
    }

    if (!isAuthenticated) {
      pushBotReply('Log in to chat with ScottyAI.');
      return;
    }

    // Send the last few turns as conversation history for context
    const history = [...messages, userMsg]
      .slice(-10)
      .map((m) => ({ role: (m.isSelf ? 'user' : 'assistant') as 'user' | 'assistant', content: m.text }));

    api
      .aiChat(history)
      .then((res) => {
        const reply = res.content?.[0]?.text || "Sorry, I couldn't process that right now.";
        pushBotReply(reply);
      })
      .catch((e: any) => {
        pushBotReply(e?.message || 'ScottyAI is temporarily unreachable. Please try again shortly.');
      });
  };

  return (
    <AppContext.Provider
      value={{
        platform,
        setPlatform,
        activeTab,
        setActiveTab,
        isOnline,
        toggleOnline,
        offlineQueue,
        triggerSync,
        cacheSizeMb,
        clearOfflineCache,
        isLocked,
        isBiometricModalOpen,
        openBiometricAuth,
        closeBiometricAuth,
        authenticateBiometrics,
        lockApp,
        isAuthenticated,
        authLoading,
        authError,
        pendingVerifyUserId,
        login,
        register,
        verify,
        logout,
        profile,
        updateProfile,
        posts,
        addPost,
        toggleLikePost,
        courses,
        toggleLessonCompletion,
        toggleCourseDownload,
        habits,
        toggleHabit,
        notifications,
        unreadCount,
        markNotificationRead,
        sendPushNotification,
        activePushToast,
        dismissPushToast,
        messages,
        sendMessage,
        isCodeModalOpen,
        setIsCodeModalOpen,
        isDrawerOpen,
        setIsDrawerOpen,
        toggleDrawer,
        activeToolModal,
        setActiveToolModal,
        theme,
        toggleTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
