import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { GAMES } from "@/lib/mockData";
import { Gamepad2, Users, Coins, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export default function GamesPage() {
  const topGame = GAMES.reduce((prev, current) => (prev.ngr > current.ngr) ? prev : current);

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Game Performance</h1>
          <p className="text-muted-foreground">Analyze game revenue, popularity, and player engagement.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {GAMES.map((game) => {
            const isTopPerformer = game.id === topGame.id;
            // Calculate pseudo-RTP (Return to Player)
            const rtp = (game.payout / game.wagered) * 100;
            
            return (
              <Card key={game.id} className={cn("overflow-hidden border-border", isTopPerformer && "border-primary/50 shadow-md shadow-primary/10")}>
                <div className="h-2 bg-secondary w-full relative">
                  <div 
                    className={cn("absolute inset-y-0 left-0", isTopPerformer ? "bg-primary" : "bg-muted-foreground/30")} 
                    style={{ width: `${Math.min(100, (game.ngr / topGame.ngr) * 100)}%` }} 
                  />
                </div>
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-lg font-bold">{game.name}</CardTitle>
                    <CardDescription>{game.type}</CardDescription>
                  </div>
                  <Badge variant={game.status === 'Active' ? 'default' : 'secondary'} className={game.status === 'Active' ? 'bg-success hover:bg-success/90' : ''}>
                    {game.status}
                  </Badge>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" /> Unique Players
                      </p>
                      <p className="text-xl font-mono font-medium">{game.uniquePlayers}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Coins className="h-3 w-3" /> Net Revenue
                      </p>
                      <p className={cn("text-xl font-mono font-medium", game.ngr > 0 ? "text-success" : "text-destructive")}>
                        {game.ngr > 0 ? '+' : ''}{(game.ngr / 1000).toFixed(1)}k
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">RTP (Return to Player)</span>
                        <span className={cn("font-medium", rtp > 98 ? "text-destructive" : rtp < 90 ? "text-success" : "text-foreground")}>
                          {rtp.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={rtp} className="h-1.5" indicatorClassName={rtp > 98 ? "bg-destructive" : "bg-primary"} />
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Plays Volume</span>
                        <span className="font-medium">{game.plays.toLocaleString()}</span>
                      </div>
                      <Progress value={(game.plays / 50000) * 100} className="h-1.5 bg-secondary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
