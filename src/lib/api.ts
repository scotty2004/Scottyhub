/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Thin client for the real ScottyHub backend. Every function here maps 1:1
 * to a real endpoint — nothing in this file is mocked. As of the merge,
 * the backend (server/routes/*.js, copied from Scottyhub-main) runs in the
 * SAME process as this frontend (see server.ts), so requests are same-origin
 * relative paths by default — no separate backend URL needed.
 *
 * VITE_API_BASE_URL is only for the uncommon case of pointing this frontend
 * at a backend hosted on a different origin (e.g. local frontend dev against
 * a staging API). Leave it unset for the normal single-server deployment.
 */

const RAW_BASE = (import.meta as any).env?.VITE_API_BASE_URL || '';
// Strip a trailing slash so `${API_BASE}/api/x` never doubles up.
export const API_BASE = RAW_BASE.replace(/\/+$/, '');

const TOKEN_KEY = 'scotthub_token';

export const getToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setToken = (token: string | null) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
};

export class ApiError extends Error {
  status: number;
  requiresTotp?: boolean;
  constructor(message: string, status: number, requiresTotp?: boolean) {
    super(message);
    this.status = status;
    this.requiresTotp = requiresTotp;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  } catch (e) {
    throw new ApiError('Could not reach ScottyHub. Check the server URL and your connection.', 0);
  }

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    /* empty body */
  }

  if (!res.ok) {
    throw new ApiError(data?.message || `Request failed (${res.status})`, res.status, data?.requiresTotp);
  }

  return data as T;
}

// ---------- Auth (routes/auth.js) ----------
export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: string;
  avatar?: string;
}

export const authRegister = (username: string, email: string, password: string, referralCode?: string) =>
  request<{ message: string; userId: string }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password, referralCode }),
  });

export const authVerify = (userId: string, otp: string) =>
  request<{ message: string; token: string; user: AuthUser }>('/api/auth/verify', {
    method: 'POST',
    body: JSON.stringify({ userId, otp }),
  });

export const authLogin = (email: string, password: string, totpToken?: string) =>
  request<{ token?: string; user?: AuthUser; requiresTotp?: boolean; message?: string }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password, totpToken }),
  });

export const authSendOtp = (email: string) =>
  request<{ message: string; userId: string }>('/api/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });

export const authResetPassword = (userId: string, otp: string, newPassword: string) =>
  request<{ message: string }>('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ userId, otp, newPassword }),
  });

export interface MeResponse {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  wallet_balance?: number;
  points_balance?: number;
  xp?: number;
  level?: number;
  streak_count?: number;
  referral_code?: string;
}

export const authMe = () => request<MeResponse>('/api/auth/me');

// ---------- Users / profile (routes/users.js) ----------
export const updateMe = (fields: { username?: string; bio?: string; avatar?: string }) =>
  request<{ message: string }>('/api/users/me', { method: 'PUT', body: JSON.stringify(fields) });

// ---------- Posts / Connect feed (routes/posts.js) ----------
export interface ApiPost {
  id: string;
  content: string;
  mediaUrl?: string;
  mediaType?: string;
  createdAt: string;
  author: { id: string; username: string; avatar?: string; verified?: boolean };
  likeCount: number;
  commentCount: number;
  liked: boolean;
}

export const getPosts = (page = 1) => request<ApiPost[]>(`/api/posts?page=${page}`);

export const createPost = (content: string, mediaUrl?: string) =>
  request<ApiPost>('/api/posts', { method: 'POST', body: JSON.stringify({ content, mediaUrl }) });

export const likePost = (postId: string) =>
  request<{ liked: boolean; likeCount: number }>(`/api/posts/${postId}/like`, { method: 'PUT' });

// ---------- Earn / missions -> Grow tab (routes/earn.js) ----------
export interface EarnTask {
  id: string;
  title: string;
  description?: string;
  platform?: string;
  points_reward: number;
  xp_reward: number;
  completed: number | boolean;
}

export interface EarnOverview {
  balance: { cops: number; points: number };
  spin: { canSpin: boolean; prizes: { type: string; label: string }[] };
  tasks: EarnTask[];
  referral: { code: string; totalReferrals: number; totalEarnings: number };
}

export const getEarnOverview = () => request<EarnOverview>('/api/earn/overview');

export const completeEarnTask = (taskId: string) =>
  request<{ message: string }>(`/api/earn/tasks/${taskId}/complete`, { method: 'POST' });

// ---------- Library -> Learn tab (routes/library.js) ----------
export interface LibraryItem {
  id: string;
  category: string;
  title: string;
  description?: string;
  url: string;
  sizeLabel?: string;
  uploaderName?: string;
  created_at?: string;
}

export const getLibrary = (category?: string) =>
  request<{ items: LibraryItem[]; categories: string[] }>(
    `/api/library${category ? `?category=${encodeURIComponent(category)}` : ''}`
  );

// ---------- Notifications (routes/notifications.js) ----------
export interface ApiNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: number | boolean;
  created_at: string;
}

export const getNotifications = () =>
  request<{ notifications: ApiNotification[]; unread: number }>('/api/notifications');

export const markNotificationReadApi = (id: string) =>
  request<{ message: string }>(`/api/notifications/${id}/read`, { method: 'PUT' });

export const markAllNotificationsReadApi = () =>
  request<{ message: string }>('/api/notifications/read-all', { method: 'PUT' });

// ---------- Wallet (routes/wallet.js) ----------
export interface WalletTxn {
  id: string;
  type: string;
  amount: number;
  description?: string;
  created_at: string;
}
export interface WalletWithdrawal {
  id: string;
  amount: number;
  method: string;
  account_details?: string;
  status: string;
  created_at: string;
}
export interface WalletOverview {
  balance: number;
  points: number;
  transactions: WalletTxn[];
  withdrawals: WalletWithdrawal[];
  minWithdrawal: number;
}
export const getWalletOverview = () => request<WalletOverview>('/api/wallet/overview');

export const requestWithdrawal = (amount: number, method: string, accountDetails: string) =>
  request<{ message: string }>('/api/wallet/withdraw', {
    method: 'POST',
    body: JSON.stringify({ amount, method, accountDetails }),
  });

export const redeemCoupon = (code: string) =>
  request<{ message: string; amount?: number }>('/api/wallet/redeem-coupon', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });

// ---------- Boost / SMM panel (routes/boost.js) ----------
export interface BoostService {
  id: string;
  platform: string;
  type: string;
  price_per_1000: number;
  min_qty: number;
  max_qty: number;
}
export const getBoostServices = (platform?: string) =>
  request<{ services: BoostService[] }>(`/api/boost/services${platform ? `?platform=${encodeURIComponent(platform)}` : ''}`);

export const createBoostOrder = (serviceId: string, link: string, quantity: number) =>
  request<{ message: string; order?: any }>('/api/boost/order', {
    method: 'POST',
    body: JSON.stringify({ service_id: serviceId, link, quantity }),
  });

export const getBoostOrders = () => request<{ orders: any[] }>('/api/boost/orders');

// ---------- Marketplace (routes/marketplace.js) ----------
export interface MarketplaceListing {
  id: string;
  name: string;
  category: string;
  price: number;
  rent_price?: number;
  cover_image?: string;
  seller_username: string;
  seller_avatar?: string;
  rating_avg: number;
  review_count: number;
  sales_count?: number;
}
export const getMarketplaceListings = (category?: string) =>
  request<MarketplaceListing[]>(`/api/marketplace/listings${category ? `?category=${encodeURIComponent(category)}` : ''}`);

export const getMyPurchases = () => request<any[]>('/api/marketplace/my-purchases');
export const getMyListings = () => request<any[]>('/api/marketplace/my-listings');

export const buyListing = (listingId: string) =>
  request<{ message: string }>(`/api/marketplace/listings/${listingId}/buy`, { method: 'POST' });

export const rentListing = (listingId: string, days: number) =>
  request<{ message: string }>(`/api/marketplace/listings/${listingId}/rent`, {
    method: 'POST',
    body: JSON.stringify({ days }),
  });

// ---------- Premium plans (routes/premium.js) ----------
export const getPremiumPlans = () => request<any[]>('/api/premium/plans');
export const getPremiumStatus = () => request<any>('/api/premium/status');
export const upgradePremium = (planId: string) =>
  request<{ message: string }>('/api/premium/upgrade', { method: 'POST', body: JSON.stringify({ planId }) });

// ---------- Movies (routes/movies.js) ----------
export interface MovieResult {
  id: string;
  title: string;
  year?: string;
  poster?: string;
  genres?: { text: string }[];
}
export const getTrendingMovies = () => request<{ results: MovieResult[] }>('/api/movies/trending');
export const searchMovies = (q: string) => request<{ results: MovieResult[] }>(`/api/movies/search?q=${encodeURIComponent(q)}`);
export const getMovieDetail = (id: string) => request<any>(`/api/movies/${encodeURIComponent(id)}`);

// ---------- Sports (routes/sports.js) ----------
export interface SportEvent {
  strLeague: string;
  dateEvent: string;
  strHomeTeam: string;
  strAwayTeam: string;
  intHomeScore: number | null;
  intAwayScore: number | null;
  strStatus: string;
  homeLogo?: string;
  awayLogo?: string;
}
export const getSports = (type: 'livescores' | 'basketball' | 'cricket' | 'rugby') =>
  request<SportEvent[]>(`/api/sports/${type}`);

// ---------- Downloader (routes/download.js) ----------
export const searchSong = (query: string) => request<any>(`/api/download/song?query=${encodeURIComponent(query)}`);
export const downloadMedia = (url: string) =>
  request<any>('/api/download', { method: 'POST', body: JSON.stringify({ url }) });

// ---------- Bot Generator (routes/botgen.js) ----------
export interface BotTemplateField {
  key: string;
  label: string;
  required?: boolean;
  default?: string;
  settingsKey: string;
}
export interface BotTemplate {
  id: string;
  name: string;
  fields: BotTemplateField[];
}
export const getBotTemplates = () => request<BotTemplate[]>('/api/botgen/templates');
export const generateBot = (templateId: string, fields: Record<string, string>, menuTheme?: string) =>
  request<{ downloadUrl: string; bannerUsed: boolean; creditsRemaining?: number }>('/api/botgen/generate', {
    method: 'POST',
    body: JSON.stringify({ templateId, fields, menuTheme }),
  });

// ---------- Analytics (routes/analytics.js) ----------
export const getAnalyticsOverview = () => request<any>('/api/analytics/overview');

// ---------- Admin (routes/admin.js) — only succeeds for role: 'admin' ----------
export interface AdminStats {
  totalUsers: number;
  verifiedUsers: number;
  totalPosts: number;
  totalNews: number;
  totalCopsInCirculation: number;
  pendingWithdrawals: number;
  pendingWithdrawalAmount: number;
  activePremiumUsers: number;
  activeMarketplaceListings: number;
  pendingReports: number;
}
export const getAdminStats = () => request<AdminStats>('/api/admin/stats');
export const getAdminUsers = (search?: string) =>
  request<{ users: any[] }>(`/api/admin/users${search ? `?search=${encodeURIComponent(search)}` : ''}`);
export const adminWarnUser = (id: string, reason: string) =>
  request<{ message: string }>(`/api/admin/users/${id}/warn`, { method: 'POST', body: JSON.stringify({ reason }) });
export const adminSuspendUser = (id: string) =>
  request<{ message: string }>(`/api/admin/users/${id}/suspend`, { method: 'POST' });
export const adminBanUser = (id: string) =>
  request<{ message: string }>(`/api/admin/users/${id}/ban`, { method: 'POST' });

// ---------- Groups (routes/groups.js) ----------
export const getGroups = () => request<any[]>('/api/groups');
export const joinGroup = (id: string) => request<{ message: string }>(`/api/groups/${id}/join`, { method: 'POST' });
export const leaveGroup = (id: string) => request<{ message: string }>(`/api/groups/${id}/leave`, { method: 'POST' });

// ---------- Follows (routes/follows.js) ----------
export const toggleFollow = (userId: string) => request<{ following: boolean }>(`/api/follows/${userId}`, { method: 'POST' });
export const getFollowStatus = (userId: string) => request<{ following: boolean }>(`/api/follows/${userId}/status`);
export const getFollowingList = () => request<any[]>('/api/follows/following/list');

// ---------- Search (routes/search.js) ----------
export const globalSearch = (q: string) => request<any>(`/api/search?q=${encodeURIComponent(q)}`);

// ---------- Dashboard (routes/dashboard.js) ----------
export const getDashboard = () => request<any>('/api/dashboard');
export const dashboardCheckin = () => request<{ message: string }>('/api/dashboard/checkin', { method: 'POST' });

// ---------- Settings (routes/settings.js) ----------
export const getAccountSettings = () => request<any>('/api/settings');
export const updateNotificationSettings = (prefs: Record<string, boolean>) =>
  request<{ message: string }>('/api/settings/notifications', { method: 'PUT', body: JSON.stringify(prefs) });
export const updatePrivacySettings = (prefs: Record<string, boolean>) =>
  request<{ message: string }>('/api/settings/privacy', { method: 'PUT', body: JSON.stringify(prefs) });

// ---------- AI Chat (routes/ai.js — real ScottyAI, OpenRouter-backed, credit-limited) ----------
export interface AiChatResult {
  content: { type: string; text: string }[];
  creditsRemaining?: number;
}
export const aiChat = (messages: { role: 'user' | 'assistant'; content: string }[]) =>
  request<AiChatResult>('/api/ai/chat', { method: 'POST', body: JSON.stringify({ messages }) });
export const getVapidPublicKey = () => request<{ key: string }>('/api/push/vapid-public-key');
export const subscribePush = (subscription: PushSubscriptionJSON) =>
  request<{ message: string }>('/api/push/subscribe', { method: 'POST', body: JSON.stringify(subscription) });
