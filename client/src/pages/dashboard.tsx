import { Layout } from "@/components/layout/Layout";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentActivityFeed } from "@/components/dashboard/RecentActivity";
import { Users, DollarSign, Trophy, UserPlus } from "lucide-react";
import { generateUsers, generateActivity, GAMES } from "@/lib/mockData";
import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Mock Chart Data
const REVENUE_DATA = [
  { name: '00:00', ggr: 4000, ngr: 3200 },
  { name: '04:00', ggr: 3000, ngr: 2400 },
  { name: '08:00', ggr: 2000, ngr: 1500 },
  { name: '12:00', ggr: 2780, ngr: 2000 },
  { name: '16:00', ggr: 1890, ngr: 1400 },
  { name: '20:00', ggr: 2390, ngr: 1900 },
  { name: '23:59', ggr: 3490, ngr: 2800 },
];

const GAME_PERFORMANCE_DATA = GAMES.map(g => ({
  name: g.name,
  plays: g.plays,
  revenue: g.ngr
})).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

export default function Dashboard() {
  const users = useMemo(() => generateUsers(50), []);
  const activities = useMemo(() => generateActivity(20, users), [users]);
  
  // Quick Stats Calculations
  const activePlayers = users.filter(u => u.status === 'Active').length;
  const totalGGR = GAMES.reduce((acc, game) => acc + (game.wagered - game.payout), 0);
  const todaysSignups = 124; // Mocked
  const topWinner = users.reduce((prev, current) => (prev.netProfit > current.netProfit) ? prev : current);

  return (
    <Layout>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Executive Overview</h1>
          <p className="text-muted-foreground">Real-time monitoring of casino operations and performance metrics.</p>
        </div>

        {/* KPI Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Active Players"
            value={activePlayers.toString()}
            icon={Users}
            description="Currently online"
            trend="up"
            trendValue="+12%"
          />
          <StatCard
            title="Gross Gaming Revenue (Today)"
            value={`${(totalGGR / 1000).toFixed(1)}k DKK`}
            icon={DollarSign}
            description="Daily target: 150k"
            trend="up"
            trendValue="+5.2%"
            className="border-l-primary"
          />
          <StatCard
            title="Top Winner (24h)"
            value={`${topWinner.netProfit.toFixed(0)} DKK`}
            icon={Trophy}
            description={`User: ${topWinner.username}`}
            className="border-l-amber-500"
          />
          <StatCard
            title="New Sign-ups"
            value={todaysSignups.toString()}
            icon={UserPlus}
            description="Since midnight"
            trend="down"
            trendValue="-2.1%"
          />
        </div>

        {/* Charts & Feed Row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Revenue Overview (GGR vs NGR)</CardTitle>
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
            <RecentActivityFeed activities={activities} />
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
                  <BarChart data={GAME_PERFORMANCE_DATA} layout="vertical" margin={{ left: 40 }}>
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
              <CardTitle>Player Risk Distribution</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="space-y-4">
                  {['Low', 'Medium', 'High', 'VIP'].map((risk) => {
                    const count = users.filter(u => u.riskLevel === risk).length;
                    const percentage = (count / users.length) * 100;
                    const color = risk === 'High' ? 'bg-destructive' : risk === 'VIP' ? 'bg-amber-500' : risk === 'Medium' ? 'bg-orange-400' : 'bg-success';
                    
                    return (
                      <div key={risk} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{risk} Risk</span>
                          <span className="text-muted-foreground">{count} Users ({percentage.toFixed(0)}%)</span>
                        </div>
                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                          <div className={cn("h-full rounded-full", color)} style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    )
                  })}
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
