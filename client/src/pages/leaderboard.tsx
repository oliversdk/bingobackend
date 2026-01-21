import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { leaderboardQueryOptions, type User } from "@/lib/api";
import { Trophy, TrendingDown, Loader2, Medal, Crown, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

function getRankIcon(rank: number) {
  if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
  if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
  return <span className="w-5 text-center font-mono text-muted-foreground">{rank}</span>;
}

function UserRow({ user, rank, type }: { user: User & { netProfit: number }; rank: number; type: 'winner' | 'loser' }) {
  const isTopThree = rank <= 3;
  
  return (
    <Link href={`/players/${user.id}`}>
      <div 
        className={cn(
          "flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all hover:bg-muted/50",
          isTopThree && type === 'winner' && "bg-gradient-to-r from-yellow-500/5 to-transparent",
          isTopThree && type === 'loser' && "bg-gradient-to-r from-red-500/5 to-transparent"
        )}
        data-testid={`row-leaderboard-${type}-${rank}`}
      >
        <div className="flex items-center justify-center w-8">
          {getRankIcon(rank)}
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn("font-medium truncate", isTopThree && "text-primary")}>{user.username}</p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={cn(
            "text-xs",
            user.riskLevel === 'High' ? 'border-destructive text-destructive' :
            user.riskLevel === 'VIP' ? 'border-amber-500 text-amber-500' : ''
          )}>
            {user.riskLevel}
          </Badge>
        </div>
        <div className={cn(
          "text-right font-mono font-medium min-w-[120px]",
          type === 'winner' ? "text-success" : "text-destructive"
        )}>
          {type === 'winner' ? '+' : ''}{user.netProfit.toFixed(2)} DKK
        </div>
      </div>
    </Link>
  );
}

export default function LeaderboardPage() {
  const { data, isLoading, error } = useQuery(leaderboardQueryOptions());

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96 text-destructive">
          Failed to load leaderboard
        </div>
      </Layout>
    );
  }

  const { topWinners = [], topLosers = [] } = data || {};

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
          <p className="text-muted-foreground">Top 50 winners and losers ranked by net profit.</p>
        </div>

        <Tabs defaultValue="winners" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="winners" className="gap-2" data-testid="tab-winners">
              <Trophy className="h-4 w-4" />
              Top 50 Winners
            </TabsTrigger>
            <TabsTrigger value="losers" className="gap-2" data-testid="tab-losers">
              <TrendingDown className="h-4 w-4" />
              Top 50 Losers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="winners" className="mt-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Top Winners (Highest Net Profit)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {topWinners.map((user: any, index: number) => (
                    <UserRow 
                      key={user.id} 
                      user={user} 
                      rank={index + 1} 
                      type="winner" 
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="losers" className="mt-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-destructive" />
                  Top Losers (Lowest Net Profit = House Win)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {topLosers.map((user: any, index: number) => (
                    <UserRow 
                      key={user.id} 
                      user={user} 
                      rank={index + 1} 
                      type="loser" 
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
