import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import PlayersPage from "@/pages/players";
import PlayerDetailPage from "@/pages/player-detail";
import GamesPage from "@/pages/games";
import GameDetailPage from "@/pages/game-detail";
import AffiliatesPage from "@/pages/affiliates";
import AffiliateDetailPage from "@/pages/affiliate-detail";
import LiveMonitorPage from "@/pages/live-monitor";
import SettingsPage from "@/pages/settings";
import LeaderboardPage from "@/pages/leaderboard";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/players" component={PlayersPage} />
      <Route path="/players/:id" component={PlayerDetailPage} />
      <Route path="/games" component={GamesPage} />
      <Route path="/games/:id" component={GameDetailPage} />
      <Route path="/affiliates" component={AffiliatesPage} />
      <Route path="/affiliates/:id" component={AffiliateDetailPage} />
      <Route path="/live" component={LiveMonitorPage} />
      <Route path="/leaderboard" component={LeaderboardPage} />
      <Route path="/settings" component={SettingsPage} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
