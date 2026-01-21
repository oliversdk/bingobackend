import { db } from "../server/db";
import { users, games, affiliates, transactions, type InsertUser, type InsertTransaction } from "../shared/schema";
import { faker } from '@faker-js/faker';
import { eq } from "drizzle-orm";

async function seed() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  console.log('Clearing existing data...');
  await db.delete(transactions);
  await db.delete(users);
  await db.delete(games);
  await db.delete(affiliates);

  // Create affiliates
  console.log('Creating affiliates...');
  const affiliateData = [
    { name: 'CasinoKing', code: 'KING', status: 'Active' as const },
    { name: 'BingoBest', code: 'BINGO', status: 'Active' as const },
    { name: 'SlotsMaster', code: 'SLOTS', status: 'Active' as const },
    { name: 'NordicGambler', code: 'NORDIC', status: 'Active' as const },
    { name: 'BonusHunter', code: 'BONUS', status: 'Inactive' as const },
  ];

  const createdAffiliates = await db.insert(affiliates).values(affiliateData).returning();
  console.log(`✓ Created ${createdAffiliates.length} affiliates`);

  // Create games
  console.log('Creating games...');
  const gameData = [
    { name: 'Mega Bingo Room', type: 'Bingo' as const, status: 'Active' as const },
    { name: 'Starburst Slots', type: 'Slot' as const, status: 'Active' as const },
    { name: 'Live Roulette', type: 'Live' as const, status: 'Active' as const },
    { name: 'Cosmic Bingo', type: 'Bingo' as const, status: 'Active' as const },
    { name: 'Book of Dead', type: 'Slot' as const, status: 'Active' as const },
    { name: 'Blackjack VIP', type: 'Table' as const, status: 'Active' as const },
    { name: 'Gonzo Quest', type: 'Slot' as const, status: 'Active' as const },
    { name: 'Speed Bingo', type: 'Bingo' as const, status: 'Maintenance' as const },
  ];

  const createdGames = await db.insert(games).values(gameData).returning();
  console.log(`✓ Created ${createdGames.length} games`);

  // Create users
  console.log('Creating users...');
  const userCount = 100;
  const usersToCreate: InsertUser[] = [];

  for (let i = 0; i < userCount; i++) {
    const affiliateId = Math.random() > 0.4 ? faker.helpers.arrayElement(createdAffiliates).id : undefined;
    
    usersToCreate.push({
      username: faker.internet.username(),
      email: faker.internet.email(),
      riskLevel: faker.helpers.arrayElement(['Low', 'Low', 'Low', 'Medium', 'Medium', 'High', 'VIP']) as any,
      affiliateId,
      status: faker.helpers.arrayElement(['Active', 'Active', 'Active', 'Active', 'Blocked', 'Self-Excluded']) as any,
    });
  }

  const createdUsers = await db.insert(users).values(usersToCreate).returning();
  console.log(`✓ Created ${createdUsers.length} users`);

  // Create transactions (deposits, bets, wins, withdrawals, jackpots)
  console.log('Creating transactions...');
  const transactionsToCreate: Array<InsertTransaction & { timestamp: Date }> = [];
  const transactionCount = 5000;

  for (let i = 0; i < transactionCount; i++) {
    const user = faker.helpers.arrayElement(createdUsers);
    const game = faker.helpers.arrayElement(createdGames.filter(g => g.status === 'Active'));
    
    // Distribution: more bets and wins, fewer deposits/withdrawals
    const type = faker.helpers.arrayElement([
      'Bet', 'Bet', 'Bet', 'Bet', 'Bet', 'Bet',
      'Win', 'Win', 'Win', 'Win',
      'Deposit', 'Deposit',
      'Withdrawal',
      'Jackpot', // rare
    ]) as any;

    let amount = '0';
    let gameId: string | undefined = undefined;

    switch (type) {
      case 'Bet':
        amount = faker.finance.amount({ min: 5, max: 500, dec: 2 });
        gameId = game.id;
        break;
      case 'Win':
        amount = faker.finance.amount({ min: 10, max: 1000, dec: 2 });
        gameId = game.id;
        break;
      case 'Deposit':
        amount = faker.finance.amount({ min: 100, max: 2000, dec: 2 });
        break;
      case 'Withdrawal':
        amount = faker.finance.amount({ min: 50, max: 1500, dec: 2 });
        break;
      case 'Jackpot':
        amount = faker.finance.amount({ min: 5000, max: 50000, dec: 2 });
        gameId = game.id;
        break;
    }

    transactionsToCreate.push({
      userId: user.id,
      gameId,
      type,
      amount,
      timestamp: faker.date.recent({ days: 30 }),
    });
  }

  // Insert in batches to avoid overwhelming the database
  const batchSize = 500;
  for (let i = 0; i < transactionsToCreate.length; i += batchSize) {
    const batch = transactionsToCreate.slice(i, i + batchSize);
    await db.insert(transactions).values(batch);
    console.log(`✓ Inserted transaction batch ${i / batchSize + 1}/${Math.ceil(transactionsToCreate.length / batchSize)}`);
  }

  console.log(`✓ Created ${transactionsToCreate.length} transactions`);

  // Update user balances based on transactions (this is normally done by createTransaction)
  console.log('Updating user balances...');
  
  for (const user of createdUsers) {
    const userTransactions = transactionsToCreate.filter(t => t.userId === user.id);
    
    let balance = 0;
    let totalDeposited = 0;
    let totalWithdrawn = 0;

    for (const t of userTransactions) {
      const amt = Number(t.amount);
      switch (t.type) {
        case 'Deposit':
          balance += amt;
          totalDeposited += amt;
          break;
        case 'Withdrawal':
          balance -= amt;
          totalWithdrawn += amt;
          break;
        case 'Bet':
          balance -= amt;
          break;
        case 'Win':
        case 'Jackpot':
          balance += amt;
          break;
      }
    }

    await db.update(users)
      .set({
        balance: Math.max(0, balance).toFixed(2),
        totalDeposited: totalDeposited.toFixed(2),
        totalWithdrawn: totalWithdrawn.toFixed(2),
      })
      .where(eq(users.id, user.id));
  }

  console.log('✅ Database seeded successfully!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
