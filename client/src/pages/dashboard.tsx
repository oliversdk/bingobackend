import { Layout } from "@/components/layout/Layout";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentActivityFeed } from "@/components/dashboard/RecentActivity";
import { Users, DollarSign, Trophy, UserPlus, Loader2, AlertTriangle, Wallet } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { dashboardStatsQueryOptions, activityQueryOptions, topUsersQueryOptions, gamesQueryOptions, usersQueryOptions, withdrawalsQueryOptions } from "@/lib/api";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery(dashboardStatsQueryOptions());
  const { data: activity = [] } = useQuery(activityQueryOptions(20));
  const { data: topUsers } = useQuery(topUsersQueryOptions());
  const { data: games = [] } = useQuery(gamesQueryOptions());
  const { data: users = [] } = useQuery(usersQueryOptions());
  const { data: withdrawals = [] } = useQuery(withdrawalsQueryOptions());

  // Calculate alert counts
  const highRiskUsers = users.filter(u => u.riskLevel === 'High');
  const largeTransactions = activity.filter(a => Number(a.amount) > 10000);
  const largePendingWithdrawals = withdrawals.filter(w => 
    (w.withdrawalStatus === 'Pending' || !w.withdrawalStatus) && Number(w.amount) >= 20000
  );

  // Transform games data for chart
  const gamePerformanceData = games
    .map(g => ({ name: g.name.length > 15 ? g.name.slice(0, 15) + '...' : g.name, revenue: g.ngr }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Mock revenue trend data (would come from API in production)
  const REVENUE_DATA = [
    { name: '00:00', ggr: 4000, ngr: 3200 },
    { name: '04:00', ggr: 3000, ngr: 2400 },
    { name: '08:00', ggr: 2000, ngr: 1500 },
    { name: '12:00', ggr: 2780, ngr: 2000 },
    { name: '16:00', ggr: 1890, ngr: 1400 },
    { name: '20:00', ggr: 2390, ngr: 1900 },
    { name: '23:59', ggr: 3490, ngr: 2800 },
  ];

  const topWinner = topUsers?.topWinners?.[0];

  if (statsLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Executive Overview</h1>
            <p className="text-muted-foreground">Real-time monitoring of casino operations and performance metrics.</p>
          </div>
          
          {/* Alert Indicators */}
          {(highRiskUsers.length > 0 || largeTransactions.length > 0 || largePendingWithdrawals.length > 0) && (
            <div className="flex items-center gap-3 flex-wrap">
              {largePendingWithdrawals.length > 0 && (
                <Link href="/withdrawals" className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-500 text-sm animate-pulse hover:bg-amber-500/20 transition-colors" data-testid="alert-large-withdrawals">
                  <Wallet className="h-4 w-4" />
                  <span className="font-medium">{largePendingWithdrawals.length} Store Udbetalinger (&gt;20k)</span>
                </Link>
              )}
              {highRiskUsers.length > 0 && (
                <Link href="/players" className="flex items-center gap-2 px-3 py-2 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm animate-pulse hover:bg-destructive/20 transition-colors" data-testid="alert-high-risk-players">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">{highRiskUsers.length} High Risk Players</span>
                </Link>
              )}
              {largeTransactions.length > 0 && (
                <Link href="/live" className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-500 text-sm hover:bg-amber-500/20 transition-colors" data-testid="alert-large-transactions">
                  <DollarSign className="h-4 w-4" />
                  <span className="font-medium">{largeTransactions.length} Large Transactions</span>
                </Link>
              )}
            </div>
          )}
        </div>

        {/* KPI Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Active Players"
            value={stats?.activeUsers?.toString() || '0'}
            icon={Users}
            description="Total active accounts"
            trend="up"
            trendValue="+12%"
            tooltip="Number of players with 'Active' status who can place bets"
          />
          <StatCard
            title="Gross Gaming Revenue"
            value={`${((stats?.totalGGR || 0) / 1000).toFixed(1)}k DKK`}
            icon={DollarSign}
            description="Total GGR"
            trend="up"
            trendValue="+5.2%"
            className="border-l-primary"
            tooltip="GGR = Total Bets - Total Wins. This is the gross revenue before deducting operational costs."
          />
          <div onClick={() => topWinner && window.location.assign(`/players/${topWinner.id}`)} className="cursor-pointer">
            <StatCard
              title="Top Winner"
              value={topWinner ? `${(topWinner.netProfit || 0).toFixed(0)} DKK` : 'N/A'}
              icon={Trophy}
              description={topWinner ? `User: ${topWinner.username}` : 'No data'}
              className="border-l-amber-500 cursor-pointer hover:bg-muted/50 transition-colors"
              tooltip="Player with the highest net winnings. Click to view player details."
            />
          </div>
          <StatCard
            title="New Sign-ups (Today)"
            value={stats?.newSignupsToday?.toString() || '0'}
            icon={UserPlus}
            description="Since midnight"
            tooltip="Number of new player registrations today"
          />
        </div>

        {/* Charts & Feed Row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Revenue Overview 
                <Badge variant="outline" className="font-normal text-xs">GGR vs NGR</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={REVENUE_DATA}>
                    <defs>
                      <linearGradient id="colorGgr" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorNgr" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(value) => `${value}`} 
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Area type="monotone" dataKey="ggr" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorGgr)" strokeWidth={2} name="GGR" />
                    <Area type="monotone" dataKey="ngr" stroke="hsl(var(--success))" fillOpacity={1} fill="url(#colorNgr)" strokeWidth={2} name="NGR" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className="col-span-3">
            <RecentActivityFeed />
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Top Performing Games (Revenue)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={gamePerformanceData} layout="vertical" margin={{ left: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={true} vertical={false} />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      width={100}
                      stroke="hsl(var(--foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip 
                      cursor={{fill: 'hsl(var(--muted)/0.5)'}}
                      contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))' }}
                    />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Winners & Losers</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="space-y-4">
                  <div>
                    <h4 className="text-xs uppercase text-muted-foreground font-semibold mb-2">Top Winners</h4>
                    {topUsers?.topWinners?.slice(0, 3).map((user) => (
                      <Link key={user.id} href={`/players/${user.id}`} className="flex justify-between items-center py-2 border-b border-border last:border-0 cursor-pointer hover:bg-muted/50 px-2 rounded transition-colors">
                        <span className="text-sm text-primary hover:underline">{user.username}</span>
                        <span className="text-sm font-mono text-success">+{(user.netProfit || 0).toFixed(0)} DKK</span>
                      </Link>
                    ))}
                  </div>
                  <div>
                    <h4 className="text-xs uppercase text-muted-foreground font-semibold mb-2">Top Losers (House Win)</h4>
                    {topUsers?.topLosers?.slice(0, 3).map((user) => (
                      <Link key={user.id} href={`/players/${user.id}`} className="flex justify-between items-center py-2 border-b border-border last:border-0 cursor-pointer hover:bg-muted/50 px-2 rounded transition-colors">
                        <span className="text-sm text-primary hover:underline">{user.username}</span>
                        <span className="text-sm font-mono text-destructive">{(user.netProfit || 0).toFixed(0)} DKK</span>
                      </Link>
                    ))}
                  </div>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
