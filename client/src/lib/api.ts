import { queryOptions } from "@tanstack/react-query";

// Types
export type User = {
  id: string;
  username: string;
  email: string;
  joinDate: string;
  balance: string;
  totalDeposited: string;
  totalWithdrawn: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'VIP';
  affiliateId: string | null;
  status: 'Active' | 'Blocked' | 'Self-Excluded';
  lastActive: string;
  netProfit?: number;
};

export type UserDetail = User & {
  stats: {
    totalBets: number;
    totalWins: number;
    netProfit: number;
  };
  recentTransactions: Transaction[];
};

export type Game = {
  id: string;
  name: string;
  type: 'Bingo' | 'Slot' | 'Table' | 'Live';
  status: 'Active' | 'Maintenance';
  createdAt: string;
  plays: number;
  uniquePlayers: number;
  wagered: number;
  payout: number;
  ngr: number;
};

export type Affiliate = {
  id: string;
  name: string;
  code: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
  referredUsers: number;
  totalNGR: number;
  commission: number;
};

export type AffiliateDetail = Affiliate & {
  referredUsers: User[];
};

export type Transaction = {
  id: string;
  userId: string;
  gameId: string | null;
  type: 'Bet' | 'Win' | 'Deposit' | 'Withdrawal' | 'Jackpot';
  amount: string;
  timestamp: string;
};

export type Activity = Transaction & {
  username: string;
  gameName?: string;
};

export type DashboardStats = {
  activeUsers: number;
  totalGGR: number;
  totalNGR: number;
  newSignupsToday: number;
};

export type TopUsers = {
  topWinners: User[];
  topLosers: User[];
};

// API Fetch Functions
async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
  }
  return res.json();
}

// Query Options
export const usersQueryOptions = (search?: string) =>
  queryOptions({
    queryKey: ["users", search],
    queryFn: () => fetchJson<User[]>(`/api/users${search ? `?search=${encodeURIComponent(search)}` : ""}`),
  });

export const userQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["user", id],
    queryFn: () => fetchJson<UserDetail>(`/api/users/${id}`),
    enabled: !!id,
  });

export const gamesQueryOptions = () =>
  queryOptions({
    queryKey: ["games"],
    queryFn: () => fetchJson<Game[]>("/api/games"),
  });

export const gameQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["game", id],
    queryFn: () => fetchJson<Game>(`/api/games/${id}`),
    enabled: !!id,
  });

export const affiliatesQueryOptions = () =>
  queryOptions({
    queryKey: ["affiliates"],
    queryFn: () => fetchJson<Affiliate[]>("/api/affiliates"),
  });

export const affiliateQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["affiliate", id],
    queryFn: () => fetchJson<AffiliateDetail>(`/api/affiliates/${id}`),
    enabled: !!id,
  });

export const activityQueryOptions = (limit = 20) =>
  queryOptions({
    queryKey: ["activity", limit],
    queryFn: () => fetchJson<Activity[]>(`/api/activity?limit=${limit}`),
    refetchInterval: 5000, // Auto-refresh every 5 seconds
  });

export const dashboardStatsQueryOptions = () =>
  queryOptions({
    queryKey: ["dashboardStats"],
    queryFn: () => fetchJson<DashboardStats>("/api/dashboard/stats"),
    refetchInterval: 10000,
  });

export const topUsersQueryOptions = () =>
  queryOptions({
    queryKey: ["topUsers"],
    queryFn: () => fetchJson<TopUsers>("/api/dashboard/top-users"),
  });
