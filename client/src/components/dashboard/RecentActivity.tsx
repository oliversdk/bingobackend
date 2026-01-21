import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity as ActivityType } from "@/lib/mockData";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Coins, Trophy, ArrowUpRight, ArrowDownLeft, AlertCircle, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecentActivityFeedProps {
  activities: ActivityType[];
}

export function RecentActivityFeed({ activities }: RecentActivityFeedProps) {
  const getIcon = (type: ActivityType['type']) => {
    switch (type) {
      case 'Bet': return <Coins className="h-4 w-4 text-blue-400" />;
      case 'Win': return <Trophy className="h-4 w-4 text-amber-400" />;
      case 'Deposit': return <ArrowDownLeft className="h-4 w-4 text-emerald-400" />;
      case 'Withdrawal': return <ArrowUpRight className="h-4 w-4 text-rose-400" />;
      case 'Jackpot': return <AlertCircle className="h-4 w-4 text-purple-500 animate-pulse" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Real-Time Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px] px-6 pb-6">
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0 animate-in slide-in-from-left-2 duration-300">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-full bg-secondary")}>
                    {getIcon(activity.type)}
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium leading-none">
                      <span className="text-primary">{activity.username}</span>
                      <span className="text-muted-foreground ml-1">
                        {activity.type === 'Bet' ? 'bet on' : 
                         activity.type === 'Win' ? 'won on' : 
                         activity.type === 'Deposit' ? 'deposited' :
                         activity.type === 'Withdrawal' ? 'withdrew' : 'hit jackpot on'}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.gameName || 'Account'} • {new Date(activity.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className={cn(
                  "font-mono font-medium text-sm",
                  activity.type === 'Win' || activity.type === 'Jackpot' ? "text-success" : 
                  activity.type === 'Deposit' ? "text-success" : "text-foreground"
                )}>
                  {activity.type === 'Bet' || activity.type === 'Withdrawal' ? '-' : '+'}
                  {activity.amount.toLocaleString()} DKK
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
