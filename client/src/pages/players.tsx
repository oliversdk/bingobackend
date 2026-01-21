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
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { usersQueryOptions, type User } from "@/lib/api";
import { useState } from "react";
import { MoreHorizontal, Search, Filter, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";

export default function PlayersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [, navigate] = useLocation();
  const { data: users = [], isLoading, error } = useQuery(usersQueryOptions(searchTerm || undefined));

  const handleRowClick = (userId: string) => {
    navigate(`/players/${userId}`);
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
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              Export CSV
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-card p-4 rounded-lg border border-border">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by username or email..."
              className="pl-9 bg-background border-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="input-search"
            />
          </div>
        </div>

        <div className="rounded-md border border-border bg-card">
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
                <TableRow>
                  <TableHead className="w-[250px]">User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead className="text-right">Net Profit (User)</TableHead>
                  <TableHead className="text-right">Total Deposited</TableHead>
                  <TableHead className="text-right">Last Active</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow 
                    key={user.id} 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleRowClick(user.id)}
                    data-testid={`row-user-${user.id}`}
                  >
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-primary hover:underline">{user.username}</span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'Active' ? 'default' : 'destructive'} className={cn("capitalize", user.status === 'Active' ? 'bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25 border-emerald-500/20' : '')}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(
                        user.riskLevel === 'High' ? 'border-destructive text-destructive' :
                        user.riskLevel === 'VIP' ? 'border-amber-500 text-amber-500' : 
                        'border-border text-muted-foreground'
                      )}>
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
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleRowClick(user.id)}>
                            View Details
                          </DropdownMenuItem>
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
