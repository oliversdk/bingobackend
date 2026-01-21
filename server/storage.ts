// Database storage implementation using Drizzle ORM - see blueprint:javascript_database
import { 
  users, games, affiliates, transactions,
  type User, type InsertUser,
  type Game, type InsertGame,
  type Affiliate, type InsertAffiliate,
  type Transaction, type InsertTransaction
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, gte, lte } from "drizzle-orm";

export interface IStorage {
  // Users
  getUsers(limit?: number, offset?: number, search?: string): Promise<User[]>;
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  getUserStats(userId: string): Promise<{
    totalBets: number;
    totalWins: number;
    netProfit: number;
  }>;

  // Games
  getGames(): Promise<Game[]>;
  getGame(id: string): Promise<Game | undefined>;
  createGame(game: InsertGame): Promise<Game>;
  getGameStats(gameId: string): Promise<{
    plays: number;
    uniquePlayers: number;
    wagered: number;
    payout: number;
    ngr: number;
  }>;

  // Affiliates
  getAffiliates(): Promise<Affiliate[]>;
  getAffiliate(id: string): Promise<Affiliate | undefined>;
  createAffiliate(affiliate: InsertAffiliate): Promise<Affiliate>;
  getAffiliateStats(affiliateId: string): Promise<{
    referredUsers: number;
    totalNGR: number;
  }>;

  // Transactions
  getTransactions(limit?: number, userId?: string): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getRecentActivity(limit?: number): Promise<Array<Transaction & { username: string; gameName?: string }>>;

  // Analytics
  getDashboardStats(): Promise<{
    activeUsers: number;
    totalGGR: number;
    totalNGR: number;
    newSignupsToday: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUsers(limit = 100, offset = 0, search?: string): Promise<User[]> {
    if (search) {
      return await db.select().from(users)
        .where(sql`${users.username} ILIKE ${'%' + search + '%'} OR ${users.email} ILIKE ${'%' + search + '%'}`)
        .limit(limit).offset(offset).orderBy(desc(users.lastActive));
    }
    
    return await db.select().from(users).limit(limit).offset(offset).orderBy(desc(users.lastActive));
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user || undefined;
  }

  async getUserStats(userId: string): Promise<{ totalBets: number; totalWins: number; netProfit: number }> {
    const bets = await db.select({ total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)` })
      .from(transactions)
      .where(and(eq(transactions.userId, userId), eq(transactions.type, 'Bet')));

    const wins = await db.select({ total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)` })
      .from(transactions)
      .where(and(eq(transactions.userId, userId), sql`${transactions.type} IN ('Win', 'Jackpot')`));

    return {
      totalBets: Number(bets[0]?.total || 0),
      totalWins: Number(wins[0]?.total || 0),
      netProfit: Number(wins[0]?.total || 0) - Number(bets[0]?.total || 0),
    };
  }

  // Games
  async getGames(): Promise<Game[]> {
    return await db.select().from(games);
  }

  async getGame(id: string): Promise<Game | undefined> {
    const [game] = await db.select().from(games).where(eq(games.id, id));
    return game || undefined;
  }

  async createGame(insertGame: InsertGame): Promise<Game> {
    const [game] = await db.insert(games).values(insertGame).returning();
    return game;
  }

  async getGameStats(gameId: string): Promise<{ plays: number; uniquePlayers: number; wagered: number; payout: number; ngr: number }> {
    const bets = await db.select({
      plays: sql<number>`COUNT(*)`,
      uniquePlayers: sql<number>`COUNT(DISTINCT ${transactions.userId})`,
      wagered: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`
    })
      .from(transactions)
      .where(and(eq(transactions.gameId, gameId), eq(transactions.type, 'Bet')));

    const wins = await db.select({ payout: sql<number>`COALESCE(SUM(${transactions.amount}), 0)` })
      .from(transactions)
      .where(and(eq(transactions.gameId, gameId), sql`${transactions.type} IN ('Win', 'Jackpot')`));

    const wagered = Number(bets[0]?.wagered || 0);
    const payout = Number(wins[0]?.payout || 0);

    return {
      plays: Number(bets[0]?.plays || 0),
      uniquePlayers: Number(bets[0]?.uniquePlayers || 0),
      wagered,
      payout,
      ngr: wagered - payout,
    };
  }

  // Affiliates
  async getAffiliates(): Promise<Affiliate[]> {
    return await db.select().from(affiliates);
  }

  async getAffiliate(id: string): Promise<Affiliate | undefined> {
    const [affiliate] = await db.select().from(affiliates).where(eq(affiliates.id, id));
    return affiliate || undefined;
  }

  async createAffiliate(insertAffiliate: InsertAffiliate): Promise<Affiliate> {
    const [affiliate] = await db.insert(affiliates).values(insertAffiliate).returning();
    return affiliate;
  }

  async getAffiliateStats(affiliateId: string): Promise<{ referredUsers: number; totalNGR: number }> {
    const referredCount = await db.select({ count: sql<number>`COUNT(*)` })
      .from(users)
      .where(eq(users.affiliateId, affiliateId));

    // Calculate NGR for all referred users
    const userIds = await db.select({ id: users.id })
      .from(users)
      .where(eq(users.affiliateId, affiliateId));

    if (userIds.length === 0) {
      return { referredUsers: 0, totalNGR: 0 };
    }

    const bets = await db.select({ total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)` })
      .from(transactions)
      .where(and(
        sql`${transactions.userId} IN (${sql.join(userIds.map(u => sql`${u.id}`), sql`, `)})`,
        eq(transactions.type, 'Bet')
      ));

    const wins = await db.select({ total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)` })
      .from(transactions)
      .where(and(
        sql`${transactions.userId} IN (${sql.join(userIds.map(u => sql`${u.id}`), sql`, `)})`,
        sql`${transactions.type} IN ('Win', 'Jackpot')`
      ));

    return {
      referredUsers: Number(referredCount[0]?.count || 0),
      totalNGR: Number(bets[0]?.total || 0) - Number(wins[0]?.total || 0),
    };
  }

  // Transactions
  async getTransactions(limit = 50, userId?: string): Promise<Transaction[]> {
    if (userId) {
      return await db.select().from(transactions)
        .where(eq(transactions.userId, userId))
        .limit(limit).orderBy(desc(transactions.timestamp));
    }
    
    return await db.select().from(transactions).limit(limit).orderBy(desc(transactions.timestamp));
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db.insert(transactions).values(insertTransaction).returning();
    
    // Update user balances based on transaction type
    const user = await this.getUser(insertTransaction.userId);
    if (user) {
      const amount = Number(insertTransaction.amount);
      const updates: Partial<User> = { lastActive: new Date() };

      switch (insertTransaction.type) {
        case 'Deposit':
          updates.balance = String(Number(user.balance) + amount);
          updates.totalDeposited = String(Number(user.totalDeposited) + amount);
          break;
        case 'Withdrawal':
          updates.balance = String(Number(user.balance) - amount);
          updates.totalWithdrawn = String(Number(user.totalWithdrawn) + amount);
          break;
        case 'Bet':
          updates.balance = String(Number(user.balance) - amount);
          break;
        case 'Win':
        case 'Jackpot':
          updates.balance = String(Number(user.balance) + amount);
          break;
      }

      await this.updateUser(insertTransaction.userId, updates);
    }

    return transaction;
  }

  async getRecentActivity(limit = 20): Promise<Array<Transaction & { username: string; gameName?: string }>> {
    const results = await db
      .select({
        id: transactions.id,
        userId: transactions.userId,
        gameId: transactions.gameId,
        type: transactions.type,
        amount: transactions.amount,
        timestamp: transactions.timestamp,
        username: users.username,
        gameName: games.name,
      })
      .from(transactions)
      .leftJoin(users, eq(transactions.userId, users.id))
      .leftJoin(games, eq(transactions.gameId, games.id))
      .orderBy(desc(transactions.timestamp))
      .limit(limit);

    return results.map(r => ({
      id: r.id,
      userId: r.userId,
      gameId: r.gameId,
      type: r.type,
      amount: r.amount,
      timestamp: r.timestamp,
      username: r.username || 'Unknown',
      gameName: r.gameName || undefined,
    }));
  }

  // Analytics
  async getDashboardStats(): Promise<{ activeUsers: number; totalGGR: number; totalNGR: number; newSignupsToday: number }> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const activeUsersResult = await db.select({ count: sql<number>`COUNT(*)` })
      .from(users)
      .where(eq(users.status, 'Active'));

    const newSignupsResult = await db.select({ count: sql<number>`COUNT(*)` })
      .from(users)
      .where(gte(users.joinDate, todayStart));

    const betsTotal = await db.select({ total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)` })
      .from(transactions)
      .where(eq(transactions.type, 'Bet'));

    const winsTotal = await db.select({ total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)` })
      .from(transactions)
      .where(sql`${transactions.type} IN ('Win', 'Jackpot')`);

    const ggr = Number(betsTotal[0]?.total || 0) - Number(winsTotal[0]?.total || 0);

    return {
      activeUsers: Number(activeUsersResult[0]?.count || 0),
      totalGGR: ggr,
      totalNGR: ggr * 0.85, // Simplified: NGR = GGR - bonuses/taxes (15%)
      newSignupsToday: Number(newSignupsResult[0]?.count || 0),
    };
  }
}

export const storage = new DatabaseStorage();
