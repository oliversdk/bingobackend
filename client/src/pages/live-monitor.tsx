import { Layout } from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RecentActivityFeed } from "@/components/dashboard/RecentActivity";
import { generateActivity, generateUsers, GAMES } from "@/lib/mockData";
import { useMemo, useState, useEffect } from "react";
import { Users, MonitorPlay, Wifi, WifiOff, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock Live Tables
const LIVE_TABLES = [
  { id: 1, name: "Roulette VIP", type: "Roulette", minBet: 100, players: 42, status: "Active", dealer: "Sarah" },
  { id: 2, name: "Blackjack A", type: "Blackjack", minBet: 50, players: 7, status: "Active", dealer: "Mike" },
  { id: 3, name: "Blackjack B", type: "Blackjack", minBet: 50, players: 5, status: "Active", dealer: "Anna" },
  { id: 4, name: "Baccarat Squeeze", type: "Baccarat", minBet: 200, players: 12, status: "Active", dealer: "David" },
  { id: 5, name: "Speed Roulette", type: "Roulette", minBet: 10, players: 85, status: "Active", dealer: "Emma" },
  { id: 6, name: "Poker Hold'em", type: "Poker", minBet: 25, players: 18, status: "Dealer Change", dealer: "-" },
  { id: 7, name: "Mega Ball", type: "Game Show", minBet: 5, players: 450, status: "Active", dealer: "Host John" },
  { id: 8, name: "Blackjack C", type: "Blackjack", minBet: 50, players: 0, status: "Maintenance", dealer: "-" },
];

export default function LiveMonitorPage() {
  const users = useMemo(() => generateUsers(20), []);
  // Simulate live feed updates
  const [activities, setActivities] = useState(() => generateActivity(15, users));

  useEffect(() => {
    const interval = setInterval(() => {
      // Add a new activity every 3 seconds
      const newActivity = generateActivity(1, users)[0];
      setActivities(prev => [newActivity, ...prev].slice(0, 20));
    }, 3000);

    return () => clearInterval(interval);
  }, [users]);

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
            Live Casino Monitor
          </h1>
          <p className="text-muted-foreground">Real-time status of live dealer tables and game shows.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Main Table Grid */}
          <div className="lg:col-span-2 overflow-y-auto pr-2">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {LIVE_TABLES.map((table) => (
                  <Card key={table.id} className={cn(
                    "relative overflow-hidden transition-all hover:shadow-md",
                    table.status === 'Maintenance' ? "opacity-60 bg-muted/50 border-dashed" : "bg-card border-border"
                  )}>
                    {table.status === 'Active' && (
                      <div className="absolute top-0 right-0 p-3">
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 flex gap-1 items-center">
                          <Wifi className="h-3 w-3" /> Live
                        </Badge>
                      </div>
                    )}
                    {table.status === 'Maintenance' && (
                       <div className="absolute top-0 right-0 p-3">
                        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 flex gap-1 items-center">
                          <WifiOff className="h-3 w-3" /> Offline
                        </Badge>
                      </div>
                    )}
                    {table.status === 'Dealer Change' && (
                       <div className="absolute top-0 right-0 p-3">
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 flex gap-1 items-center">
                          <AlertTriangle className="h-3 w-3" /> Paused
                        </Badge>
                      </div>
                    )}

                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        {table.type === 'Roulette' ? <div className="h-2 w-2 rounded-full bg-red-500"/> : 
                         table.type === 'Blackjack' ? <div className="h-2 w-2 rounded-full bg-blue-500"/> :
                         <div className="h-2 w-2 rounded-full bg-purple-500"/>
                        }
                        {table.name}
                      </CardTitle>
                      <CardDescription>Min Bet: {table.minBet} DKK • Dealer: {table.dealer}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-end justify-between mt-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Active Players</span>
                          <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            <span className="text-2xl font-mono font-bold">{table.players}</span>
                          </div>
                        </div>
                        <div className="h-10 w-24">
                           {/* Tiny sparkline placeholder */}
                           <div className="flex items-end gap-1 h-full w-full justify-end opacity-50">
                              {[40, 60, 45, 70, 50, 80, 60].map((h, i) => (
                                <div key={i} className="w-2 bg-primary rounded-t-sm" style={{ height: `${h}%` }} />
                              ))}
                           </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
             </div>
          </div>

          {/* Live Feed Sidebar */}
          <div className="h-full flex flex-col gap-4">
            <Card className="flex-1 flex flex-col border-l-4 border-l-primary/50">
               <CardHeader className="pb-3 border-b border-border bg-muted/20">
                 <CardTitle className="text-sm font-medium flex items-center gap-2">
                   <MonitorPlay className="h-4 w-4 text-primary" />
                   Live Action Feed
                 </CardTitle>
               </CardHeader>
               <CardContent className="p-0 flex-1 overflow-hidden">
                 <RecentActivityFeed activities={activities} />
               </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
