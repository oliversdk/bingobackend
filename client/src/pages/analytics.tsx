import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { activityQueryOptions, gamesQueryOptions, usersQueryOptions } from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { Loader2, TrendingUp, Calendar, BarChart3 } from "lucide-react";
import { useMemo } from "react";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))', '#8884d8', '#82ca9d'];

export default function AnalyticsPage() {
  const { data: activity = [], isLoading: activityLoading } = useQuery(activityQueryOptions(500));
  const { data: games = [], isLoading: gamesLoading } = useQuery(gamesQueryOptions());
  const { data: users = [], isLoading: usersLoading } = useQuery(usersQueryOptions());

  const weeklyData = useMemo(() => {
    const weeks: Record<string, { week: string; bets: number; wins: number; deposits: number; ggr: number }> = {};
    
    activity.forEach((tx: any) => {
      const date = new Date(tx.timestamp);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeks[weekKey]) {
        weeks[weekKey] = { week: weekKey, bets: 0, wins: 0, deposits: 0, ggr: 0 };
      }
      
      const amount = Number(tx.amount);
      if (tx.type === 'Bet') {
        weeks[weekKey].bets += amount;
        weeks[weekKey].ggr += amount;
      } else if (tx.type === 'Win' || tx.type === 'Jackpot') {
        weeks[weekKey].wins += amount;
        weeks[weekKey].ggr -= amount;
      } else if (tx.type === 'Deposit') {
        weeks[weekKey].deposits += amount;
      }
    });
    
    return Object.values(weeks)
      .sort((a, b) => a.week.localeCompare(b.week))
      .slice(-8)
      .map(w => ({
        ...w,
        week: new Date(w.week).toLocaleDateString('da-DK', { day: 'numeric', month: 'short' })
      }));
  }, [activity]);

  const dailyData = useMemo(() => {
    const days: Record<string, { day: string; bets: number; wins: number; ggr: number; transactions: number }> = {};
    
    activity.forEach((tx: any) => {
      const date = new Date(tx.timestamp);
      const dayKey = date.toISOString().split('T')[0];
      
      if (!days[dayKey]) {
        days[dayKey] = { day: dayKey, bets: 0, wins: 0, ggr: 0, transactions: 0 };
      }
      
      days[dayKey].transactions += 1;
      const amount = Number(tx.amount);
      if (tx.type === 'Bet') {
        days[dayKey].bets += amount;
        days[dayKey].ggr += amount;
      } else if (tx.type === 'Win' || tx.type === 'Jackpot') {
        days[dayKey].wins += amount;
        days[dayKey].ggr -= amount;
      }
    });
    
    return Object.values(days)
      .sort((a, b) => a.day.localeCompare(b.day))
      .slice(-14)
      .map(d => ({
        ...d,
        day: new Date(d.day).toLocaleDateString('da-DK', { day: 'numeric', month: 'short' })
      }));
  }, [activity]);

  const gameTypeData = useMemo(() => {
    const types: Record<string, { name: string; value: number; plays: number }> = {};
    
    games.forEach((game: any) => {
      if (!types[game.type]) {
        types[game.type] = { name: game.type, value: 0, plays: 0 };
      }
      types[game.type].value += Math.abs(game.ngr);
      types[game.type].plays += game.plays;
    });
    
    return Object.values(types);
  }, [games]);

  const riskDistribution = useMemo(() => {
    const risk: Record<string, number> = { Low: 0, Medium: 0, High: 0, VIP: 0 };
    users.forEach((u: any) => {
      if (risk[u.riskLevel] !== undefined) risk[u.riskLevel]++;
    });
    return Object.entries(risk).map(([name, value]) => ({ name, value }));
  }, [users]);

  const isLoading = activityLoading || gamesLoading || usersLoading;

  if (isLoading) {
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
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            Tidsbaseret Statistik
          </h1>
          <p className="text-muted-foreground mt-2">
            Detaljeret analyse af omsætning og aktivitet over tid.
          </p>
        </div>

        <Tabs defaultValue="weekly" className="w-full">
          <TabsList>
            <TabsTrigger value="weekly" className="gap-2" data-testid="tab-weekly">
              <Calendar className="h-4 w-4" />
              Ugentlig
            </TabsTrigger>
            <TabsTrigger value="daily" className="gap-2" data-testid="tab-daily">
              <TrendingUp className="h-4 w-4" />
              Daglig
            </TabsTrigger>
          </TabsList>

          <TabsContent value="weekly" className="mt-6 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Ugentlig Omsætning</CardTitle>
                  <CardDescription>Indsatser vs. Gevinster per uge</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))' }}
                          formatter={(value: number) => `${value.toFixed(0)} DKK`}
                        />
                        <Bar dataKey="bets" name="Indsatser" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="wins" name="Gevinster" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ugentlig GGR Trend</CardTitle>
                  <CardDescription>Gross Gaming Revenue udvikling</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={weeklyData}>
                        <defs>
                          <linearGradient id="ggrGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))' }}
                          formatter={(value: number) => `${value.toFixed(0)} DKK`}
                        />
                        <Area type="monotone" dataKey="ggr" name="GGR" stroke="hsl(var(--primary))" fill="url(#ggrGradient)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Ugentlige Indskud</CardTitle>
                <CardDescription>Total indskud per uge</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))' }}
                        formatter={(value: number) => `${value.toFixed(0)} DKK`}
                      />
                      <Line type="monotone" dataKey="deposits" name="Indskud" stroke="hsl(var(--success))" strokeWidth={2} dot={{ fill: 'hsl(var(--success))' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="daily" className="mt-6 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Daglig Aktivitet (14 dage)</CardTitle>
                  <CardDescription>Antal transaktioner per dag</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dailyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))' }}
                        />
                        <Bar dataKey="transactions" name="Transaktioner" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Daglig GGR (14 dage)</CardTitle>
                  <CardDescription>GGR trend per dag</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dailyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))' }}
                          formatter={(value: number) => `${value.toFixed(0)} DKK`}
                        />
                        <Line type="monotone" dataKey="ggr" name="GGR" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Omsætning per Spiltype</CardTitle>
              <CardDescription>NGR fordelt på spilkategorier</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={gameTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {gameTypeData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))' }}
                      formatter={(value: number) => `${value.toFixed(0)} DKK`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Spiller Risikofordeling</CardTitle>
              <CardDescription>Antal spillere per risikoniveau</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={riskDistribution} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={60} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))' }}
                    />
                    <Bar dataKey="value" name="Spillere" radius={[0, 4, 4, 0]}>
                      <Cell fill="hsl(var(--success))" />
                      <Cell fill="hsl(var(--warning))" />
                      <Cell fill="hsl(var(--destructive))" />
                      <Cell fill="#f59e0b" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
