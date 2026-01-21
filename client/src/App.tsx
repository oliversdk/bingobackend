import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import PlayersPage from "@/pages/players";
import GamesPage from "@/pages/games";
import AffiliatesPage from "@/pages/affiliates";
import LiveMonitorPage from "@/pages/live-monitor";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/players" component={PlayersPage} />
      <Route path="/games" component={GamesPage} />
      <Route path="/affiliates" component={AffiliatesPage} />
      <Route path="/live" component={LiveMonitorPage} />
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
