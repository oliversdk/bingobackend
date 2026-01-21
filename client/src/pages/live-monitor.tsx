import { Layout } from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RecentActivityFeed } from "@/components/dashboard/RecentActivity";
import { useQuery } from "@tanstack/react-query";
import { gamesQueryOptions } from "@/lib/api";
import { Users, MonitorPlay, Wifi, WifiOff, AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

export default function LiveMonitorPage() {
  const { data: games = [], isLoading } = useQuery(gamesQueryOptions());

  // Filter to only show live-type games or active games as "tables"
  const liveTables = games.filter(g => g.type === 'Live' || g.type === 'Table' || g.type === 'Bingo');

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
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
            Live Casino Monitor
          </h1>
          <p className="text-muted-foreground">Real-time status of games and player activity. Click any game for details.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Main Table Grid */}
          <div className="lg:col-span-2 overflow-y-auto pr-2">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {liveTables.map((game) => (
                  <Link key={game.id} href={`/games/${game.id}`}>
                    <Card className={cn(
                      "relative overflow-hidden transition-all hover:shadow-lg cursor-pointer hover:scale-[1.02]",
                      game.status === 'Maintenance' ? "opacity-60 bg-muted/50 border-dashed" : "bg-card border-border"
                    )} data-testid={`card-live-${game.id}`}>
                      {game.status === 'Active' && (
                        <div className="absolute top-0 right-0 p-3">
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 flex gap-1 items-center">
                            <Wifi className="h-3 w-3" /> Live
                          </Badge>
                        </div>
                      )}
                      {game.status === 'Maintenance' && (
                        <div className="absolute top-0 right-0 p-3">
                          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 flex gap-1 items-center">
                            <WifiOff className="h-3 w-3" /> Offline
                          </Badge>
                        </div>
                      )}

                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-lg text-primary hover:underline">
                          {game.type === 'Live' ? <div className="h-2 w-2 rounded-full bg-red-500"/> : 
                          game.type === 'Table' ? <div className="h-2 w-2 rounded-full bg-blue-500"/> :
                          <div className="h-2 w-2 rounded-full bg-purple-500"/>
                          }
                          {game.name}
                        </CardTitle>
                        <CardDescription>{game.type} Game • {game.plays.toLocaleString()} plays</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-end justify-between mt-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Unique Players</span>
                            <div className="flex items-center gap-2">
                              <Users className="h-5 w-5 text-primary" />
                              <span className="text-2xl font-mono font-bold">{game.uniquePlayers}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-muted-foreground">NGR</span>
                            <p className={cn("text-lg font-mono font-bold", game.ngr >= 0 ? "text-success" : "text-destructive")}>
                              {game.ngr >= 0 ? '+' : ''}{(game.ngr / 1000).toFixed(1)}k
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
             </div>
          </div>

          {/* Live Feed Sidebar */}
          <div className="h-full flex flex-col gap-4">
            <RecentActivityFeed />
          </div>
        </div>
      </div>
    </Layout>
  );
}
