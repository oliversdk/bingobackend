import { Layout } from "@/components/layout/Layout";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useQuery } from "@tanstack/react-query";
import { usersQueryOptions, type User } from "@/lib/api";
import { useState, useMemo } from "react";
import { MoreHorizontal, Search, Filter, Loader2, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

type RiskFilter = 'All' | 'Low' | 'Medium' | 'High' | 'VIP';
type StatusFilter = 'All' | 'Active' | 'Blocked' | 'Self-Excluded';

export default function PlayersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState<RiskFilter>('All');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [, navigate] = useLocation();
  const { data: users = [], isLoading, error } = useQuery(usersQueryOptions(searchTerm || undefined));

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesRisk = riskFilter === 'All' || user.riskLevel === riskFilter;
      const matchesStatus = statusFilter === 'All' || user.status === statusFilter;
      return matchesRisk && matchesStatus;
    });
  }, [users, riskFilter, statusFilter]);

  const highRiskCount = users.filter(u => u.riskLevel === 'High').length;
  const activeFiltersCount = (riskFilter !== 'All' ? 1 : 0) + (statusFilter !== 'All' ? 1 : 0);

  const handleRowClick = (userId: string) => {
    navigate(`/players/${userId}`);
  };

  const clearFilters = () => {
    setRiskFilter('All');
    setStatusFilter('All');
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Player Management</h1>
            <p className="text-muted-foreground">View and manage user accounts, risk levels, and financial history.</p>
          </div>
          <div className="flex items-center gap-2">
            {highRiskCount > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm animate-pulse">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-medium">{highRiskCount} High Risk</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Players flagged as high risk require monitoring</p>
                </TooltipContent>
              </Tooltip>
            )}
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              Export CSV
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 bg-card p-4 rounded-lg border border-border">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by username or email..."
              className="pl-9 bg-background border-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="input-search"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Risk Level
                {riskFilter !== 'All' && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5">{riskFilter}</Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Filter by Risk</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(['All', 'Low', 'Medium', 'High', 'VIP'] as RiskFilter[]).map((level) => (
                <DropdownMenuCheckboxItem
                  key={level}
                  checked={riskFilter === level}
                  onCheckedChange={() => setRiskFilter(level)}
                >
                  {level === 'All' ? 'All Levels' : level}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Status
                {statusFilter !== 'All' && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5">{statusFilter}</Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(['All', 'Active', 'Blocked', 'Self-Excluded'] as StatusFilter[]).map((status) => (
                <DropdownMenuCheckboxItem
                  key={status}
                  checked={statusFilter === status}
                  onCheckedChange={() => setStatusFilter(status)}
                >
                  {status === 'All' ? 'All Status' : status}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-muted-foreground hover:text-foreground">
              <X className="h-3 w-3" />
              Clear filters
            </Button>
          )}

          <div className="flex-1" />
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Info className="h-3.5 w-3.5" />
                Showing {filteredUsers.length} of {users.length}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Net Profit = Total Wins - Total Bets (from player perspective)</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="rounded-md border border-border bg-card overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-16 text-destructive">
              Failed to load players
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[250px]">User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>
                    <Tooltip>
                      <TooltipTrigger className="flex items-center gap-1">
                        Risk Level
                        <Info className="h-3 w-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Risk levels: Low, Medium, High (requires monitoring), VIP (high-value player)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead className="text-right">
                    <Tooltip>
                      <TooltipTrigger className="flex items-center gap-1 justify-end">
                        Net Profit
                        <Info className="h-3 w-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Player's net profit: Wins - Bets. Positive = player winning, Negative = house winning.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableHead>
                  <TableHead className="text-right">Total Deposited</TableHead>
                  <TableHead className="text-right">Last Active</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow 
                    key={user.id} 
                    className={cn(
                      "cursor-pointer transition-all duration-200 hover:bg-muted/50 group",
                      user.riskLevel === 'High' && "bg-destructive/5 hover:bg-destructive/10"
                    )}
                    onClick={() => handleRowClick(user.id)}
                    data-testid={`row-user-${user.id}`}
                  >
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-primary group-hover:underline transition-all">{user.username}</span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={user.status === 'Active' ? 'default' : 'destructive'} 
                        className={cn(
                          "capitalize transition-transform group-hover:scale-105", 
                          user.status === 'Active' ? 'bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25 border-emerald-500/20' : ''
                        )}
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "transition-transform group-hover:scale-105",
                          user.riskLevel === 'High' ? 'border-destructive text-destructive animate-pulse' :
                          user.riskLevel === 'VIP' ? 'border-amber-500 text-amber-500' : 
                          'border-border text-muted-foreground'
                        )}
                      >
                        {user.riskLevel === 'High' && <AlertTriangle className="h-3 w-3 mr-1" />}
                        {user.riskLevel}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {Number(user.balance).toFixed(2)} DKK
                    </TableCell>
                    <TableCell className={cn("text-right font-mono font-medium", (user.netProfit || 0) > 0 ? "text-success" : "text-destructive")}>
                      {(user.netProfit || 0) > 0 ? '+' : ''}{(user.netProfit || 0).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground">
                      {Number(user.totalDeposited).toFixed(0)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground text-xs">
                      {new Date(user.lastActive).toLocaleDateString()}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleRowClick(user.id)}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">Ban User</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </Layout>
  );
}
