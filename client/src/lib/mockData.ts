import { faker } from '@faker-js/faker';

// Seed for consistency (optional, but good for dev)
// faker.seed(123);

export type User = {
  id: string;
  username: string;
  email: string;
  joinDate: string;
  balance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  netProfit: number; // User's profit (negative = House profit)
  riskLevel: 'Low' | 'Medium' | 'High' | 'VIP';
  affiliateId: string | null;
  status: 'Active' | 'Blocked' | 'Self-Excluded';
  lastActive: string;
};

export type Game = {
  id: string;
  name: string;
  type: 'Bingo' | 'Slot' | 'Table' | 'Live';
  plays: number;
  uniquePlayers: number;
  wagered: number;
  payout: number;
  ngr: number; // Net Gaming Revenue (Wagered - Payout)
  status: 'Active' | 'Maintenance';
};

export type Affiliate = {
  id: string;
  name: string;
  code: string;
  referredUsers: number;
  totalNGR: number;
  commission: number;
  status: 'Active' | 'Inactive';
};

export type Activity = {
  id: string;
  userId: string;
  username: string;
  type: 'Bet' | 'Win' | 'Deposit' | 'Withdrawal' | 'Jackpot';
  amount: number;
  gameName?: string;
  timestamp: string;
};

// Generate Mock Data
export const generateUsers = (count: number): User[] => {
  return Array.from({ length: count }).map(() => {
    const deposited = parseFloat(faker.finance.amount({ min: 100, max: 50000, dec: 2 }));
    const withdrawn = parseFloat(faker.finance.amount({ min: 0, max: deposited * 1.5, dec: 2 })); // Some win, some lose
    const netProfit = withdrawn - deposited; 
    
    let riskLevel: User['riskLevel'] = 'Low';
    if (netProfit > 5000) riskLevel = 'VIP';
    if (deposited > 20000 && netProfit < -10000) riskLevel = 'High';

    return {
      id: faker.string.uuid(),
      username: faker.internet.username(),
      email: faker.internet.email(),
      joinDate: faker.date.past({ years: 2 }).toISOString(),
      balance: parseFloat(faker.finance.amount({ min: 0, max: 5000, dec: 2 })),
      totalDeposited: deposited,
      totalWithdrawn: withdrawn,
      netProfit: netProfit,
      riskLevel,
      affiliateId: Math.random() > 0.5 ? `aff-${faker.number.int({ min: 1, max: 5 })}` : null,
      status: faker.helpers.arrayElement(['Active', 'Active', 'Active', 'Blocked', 'Self-Excluded']),
      lastActive: faker.date.recent().toISOString(),
    };
  });
};

export const GAMES: Game[] = [
  { id: 'g1', name: 'Mega Bingo Room', type: 'Bingo', plays: 12500, uniquePlayers: 850, wagered: 500000, payout: 420000, ngr: 80000, status: 'Active' },
  { id: 'g2', name: 'Starburst Slots', type: 'Slot', plays: 45000, uniquePlayers: 1200, wagered: 1200000, payout: 1150000, ngr: 50000, status: 'Active' },
  { id: 'g3', name: 'Live Roulette', type: 'Live', plays: 8000, uniquePlayers: 300, wagered: 800000, payout: 750000, ngr: 50000, status: 'Active' },
  { id: 'g4', name: 'Cosmic Bingo', type: 'Bingo', plays: 5000, uniquePlayers: 400, wagered: 150000, payout: 120000, ngr: 30000, status: 'Active' },
  { id: 'g5', name: 'Book of Dead', type: 'Slot', plays: 32000, uniquePlayers: 900, wagered: 950000, payout: 800000, ngr: 150000, status: 'Active' },
  { id: 'g6', name: 'Blackjack VIP', type: 'Table', plays: 1500, uniquePlayers: 150, wagered: 2000000, payout: 1980000, ngr: 20000, status: 'Active' },
];

export const AFFILIATES: Affiliate[] = [
  { id: 'aff-1', name: 'CasinoKing', code: 'KING', referredUsers: 150, totalNGR: 45000, commission: 15000, status: 'Active' },
  { id: 'aff-2', name: 'BingoBest', code: 'BINGO', referredUsers: 320, totalNGR: 12000, commission: 3000, status: 'Active' },
  { id: 'aff-3', name: 'SlotsMaster', code: 'SLOTS', referredUsers: 85, totalNGR: -5000, commission: 0, status: 'Active' }, // Negative NGR
  { id: 'aff-4', name: 'NordicGambler', code: 'NORDIC', referredUsers: 210, totalNGR: 68000, commission: 20000, status: 'Active' },
  { id: 'aff-5', name: 'BonusHunter', code: 'BONUS', referredUsers: 500, totalNGR: 2000, commission: 500, status: 'Inactive' },
];

export const generateActivity = (count: number, users: User[]): Activity[] => {
  return Array.from({ length: count }).map(() => {
    const user = faker.helpers.arrayElement(users);
    const type = faker.helpers.arrayElement(['Bet', 'Bet', 'Bet', 'Win', 'Win', 'Deposit', 'Withdrawal', 'Jackpot']) as Activity['type'];
    let amount = 0;
    
    switch (type) {
      case 'Bet': amount = parseFloat(faker.finance.amount({ min: 1, max: 100, dec: 2 })); break;
      case 'Win': amount = parseFloat(faker.finance.amount({ min: 5, max: 500, dec: 2 })); break;
      case 'Deposit': amount = parseFloat(faker.finance.amount({ min: 100, max: 1000, dec: 2 })); break;
      case 'Withdrawal': amount = parseFloat(faker.finance.amount({ min: 200, max: 2000, dec: 2 })); break;
      case 'Jackpot': amount = parseFloat(faker.finance.amount({ min: 5000, max: 50000, dec: 2 })); break;
    }

    return {
      id: faker.string.uuid(),
      userId: user.id,
      username: user.username,
      type,
      amount,
      gameName: (type === 'Bet' || type === 'Win' || type === 'Jackpot') ? faker.helpers.arrayElement(GAMES).name : undefined,
      timestamp: faker.date.recent().toISOString(),
    };
  });
};
