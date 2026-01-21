import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { gameQueryOptions } from "@/lib/api";
import { useParams, Link } from "wouter";
import { ArrowLeft, Gamepad2, Users, Coins, TrendingUp, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function GameDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: game, isLoading, error } = useQuery(gameQueryOptions(id || ""));

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !game) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-96">
          <h2 className="text-2xl font-bold text-destructive">Game not found</h2>
          <Link href="/games">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Games
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const rtp = game.wagered > 0 ? (game.payout / game.wagered) * 100 : 0;
  const houseEdge = 100 - rtp;

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/games">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight" data-testid="text-game-name">{game.name}</h1>
              <Badge variant={game.status === 'Active' ? 'default' : 'secondary'} className={game.status === 'Active' ? 'bg-success hover:bg-success/90' : ''}>
                {game.status}
              </Badge>
              <Badge variant="outline">{game.type}</Badge>
            </div>
            <p className="text-muted-foreground mt-1">Created {new Date(game.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Plays</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono" data-testid="text-plays">{game.plays.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique Players</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono" data-testid="text-players">{game.uniquePlayers.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Wagered</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono" data-testid="text-wagered">{(game.wagered / 1000).toFixed(1)}k DKK</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-success">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Gaming Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={cn("text-2xl font-bold font-mono", game.ngr >= 0 ? "text-success" : "text-destructive")} data-testid="text-ngr">
                {game.ngr >= 0 ? '+' : ''}{(game.ngr / 1000).toFixed(1)}k DKK
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Metrics */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Financial Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Wagered</span>
                  <span className="font-mono font-medium">{game.wagered.toLocaleString()} DKK</span>
                </div>
                <Progress value={100} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Payouts</span>
                  <span className="font-mono font-medium text-amber-500">{game.payout.toLocaleString()} DKK</span>
                </div>
                <Progress value={(game.payout / game.wagered) * 100} className="h-2" indicatorClassName="bg-amber-500" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Net Revenue (Wagered - Payouts)</span>
                  <span className={cn("font-mono font-medium", game.ngr >= 0 ? "text-success" : "text-destructive")}>
                    {game.ngr >= 0 ? '+' : ''}{game.ngr.toLocaleString()} DKK
                  </span>
                </div>
                <Progress value={Math.abs(game.ngr / game.wagered) * 100} className="h-2" indicatorClassName={game.ngr >= 0 ? "bg-success" : "bg-destructive"} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Return to Player (RTP)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8">
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="hsl(var(--secondary))"
                      strokeWidth="12"
                      fill="none"
                    />
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke={rtp > 98 ? "hsl(var(--destructive))" : "hsl(var(--primary))"}
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${(rtp / 100) * 553} 553`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold font-mono">{rtp.toFixed(1)}%</span>
                    <span className="text-sm text-muted-foreground">RTP</span>
                  </div>
                </div>
                <p className="mt-6 text-center text-muted-foreground">
                  House Edge: <span className="font-medium text-foreground">{houseEdge.toFixed(2)}%</span>
                </p>
                {rtp > 98 && (
                  <Badge variant="destructive" className="mt-2">
                    Warning: High RTP - Review game settings
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
