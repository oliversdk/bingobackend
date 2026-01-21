import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { seedDemoDataIfEmpty } from "./seed-demo";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Seed demo data if database is empty (works in both dev and production)
  await seedDemoDataIfEmpty();

  // USERS API
  app.get("/api/users", async (req: Request, res: Response) => {
    try {
      const { limit = "100", offset = "0", search } = req.query;
      const users = await storage.getUsers(
        parseInt(limit as string),
        parseInt(offset as string),
        search as string | undefined
      );

      // Calculate net profit for each user
      const usersWithStats = await Promise.all(
        users.map(async (user) => {
          const stats = await storage.getUserStats(user.id);
          return {
            ...user,
            netProfit: stats.netProfit,
          };
        })
      );

      res.json(usersWithStats);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const stats = await storage.getUserStats(id);
      const transactions = await storage.getTransactions(50, id);

      res.json({
        ...user,
        stats,
        recentTransactions: transactions,
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // GAMES API
  app.get("/api/games", async (req: Request, res: Response) => {
    try {
      const games = await storage.getGames();

      const gamesWithStats = await Promise.all(
        games.map(async (game) => {
          const stats = await storage.getGameStats(game.id);
          return {
            ...game,
            ...stats,
          };
        })
      );

      res.json(gamesWithStats);
    } catch (error) {
      console.error("Error fetching games:", error);
      res.status(500).json({ error: "Failed to fetch games" });
    }
  });

  app.get("/api/games/:id", async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const game = await storage.getGame(id);

      if (!game) {
        return res.status(404).json({ error: "Game not found" });
      }

      const stats = await storage.getGameStats(id);

      res.json({
        ...game,
        ...stats,
      });
    } catch (error) {
      console.error("Error fetching game:", error);
      res.status(500).json({ error: "Failed to fetch game" });
    }
  });

  // AFFILIATES API
  app.get("/api/affiliates", async (req: Request, res: Response) => {
    try {
      const affiliates = await storage.getAffiliates();

      const affiliatesWithStats = await Promise.all(
        affiliates.map(async (affiliate) => {
          const stats = await storage.getAffiliateStats(affiliate.id);
          return {
            ...affiliate,
            ...stats,
            commission: stats.totalNGR * 0.3, // 30% commission
          };
        })
      );

      res.json(affiliatesWithStats);
    } catch (error) {
      console.error("Error fetching affiliates:", error);
      res.status(500).json({ error: "Failed to fetch affiliates" });
    }
  });

  app.get("/api/affiliates/:id", async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const affiliate = await storage.getAffiliate(id);

      if (!affiliate) {
        return res.status(404).json({ error: "Affiliate not found" });
      }

      const stats = await storage.getAffiliateStats(id);

      // Get referred users
      const allUsers = await storage.getUsers(1000);
      const referredUsers = allUsers.filter((u) => u.affiliateId === id);

      res.json({
        ...affiliate,
        ...stats,
        commission: stats.totalNGR * 0.3,
        referredUsers,
      });
    } catch (error) {
      console.error("Error fetching affiliate:", error);
      res.status(500).json({ error: "Failed to fetch affiliate" });
    }
  });

  // TRANSACTIONS / ACTIVITY API
  app.get("/api/activity", async (req: Request, res: Response) => {
    try {
      const { limit = "20" } = req.query;
      const activity = await storage.getRecentActivity(parseInt(limit as string));
      res.json(activity);
    } catch (error) {
      console.error("Error fetching activity:", error);
      res.status(500).json({ error: "Failed to fetch activity" });
    }
  });

  // DASHBOARD ANALYTICS API
  app.get("/api/dashboard/stats", async (req: Request, res: Response) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  app.get("/api/dashboard/top-users", async (req: Request, res: Response) => {
    try {
      const users = await storage.getUsers(100);
      
      const usersWithProfit = await Promise.all(
        users.map(async (user) => {
          const stats = await storage.getUserStats(user.id);
          return { ...user, netProfit: stats.netProfit };
        })
      );

      // Sort by net profit (highest winners)
      usersWithProfit.sort((a, b) => b.netProfit - a.netProfit);
      
      const topWinners = usersWithProfit.slice(0, 5);
      const topLosers = usersWithProfit.slice(-5).reverse();

      res.json({ topWinners, topLosers });
    } catch (error) {
      console.error("Error fetching top users:", error);
      res.status(500).json({ error: "Failed to fetch top users" });
    }
  });

  // LEADERBOARD - Top 50 Winners and Losers
  app.get("/api/leaderboard", async (req: Request, res: Response) => {
    try {
      const users = await storage.getUsers(200);
      
      const usersWithProfit = await Promise.all(
        users.map(async (user) => {
          const stats = await storage.getUserStats(user.id);
          return { ...user, netProfit: stats.netProfit };
        })
      );

      // Sort by net profit (highest winners first)
      usersWithProfit.sort((a, b) => b.netProfit - a.netProfit);
      
      const topWinners = usersWithProfit.slice(0, 50);
      const topLosers = usersWithProfit.slice(-50).reverse();

      res.json({ topWinners, topLosers });
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  return httpServer;
}
