import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { userQueryOptions } from "@/lib/api";
import { useParams, Link } from "wouter";
import { ArrowLeft, User, DollarSign, TrendingUp, TrendingDown, Calendar, Mail, Shield, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function PlayerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: user, isLoading, error } = useQuery(userQueryOptions(id || ""));

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
          <Skeleton className="h-96" />
        </div>
      </Layout>
    );
  }

  if (error || !user) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-96">
          <h2 className="text-2xl font-bold text-destructive">Player not found</h2>
          <Link href="/players">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Players
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const netProfit = user.stats.netProfit;
  const houseLoss = -netProfit; // House perspective

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/players">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight" data-testid="text-username">{user.username}</h1>
              <Badge variant={user.status === 'Active' ? 'default' : 'destructive'} className={cn(user.status === 'Active' ? 'bg-emerald-500/15 text-emerald-500' : '')}>
                {user.status}
              </Badge>
              <Badge variant="outline" className={cn(
                user.riskLevel === 'High' ? 'border-destructive text-destructive' :
                user.riskLevel === 'VIP' ? 'border-amber-500 text-amber-500' : ''
              )}>
                {user.riskLevel} Risk
              </Badge>
            </div>
            <p className="text-muted-foreground flex items-center gap-2 mt-1">
              <Mail className="h-4 w-4" /> {user.email}
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono" data-testid="text-balance">{Number(user.balance).toFixed(2)} DKK</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Profit (Player)</CardTitle>
              {netProfit > 0 ? <TrendingUp className="h-4 w-4 text-success" /> : <TrendingDown className="h-4 w-4 text-destructive" />}
            </CardHeader>
            <CardContent>
              <div className={cn("text-2xl font-bold font-mono", netProfit > 0 ? "text-success" : "text-destructive")} data-testid="text-net-profit">
                {netProfit > 0 ? '+' : ''}{netProfit.toFixed(2)} DKK
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                House {houseLoss > 0 ? 'earned' : 'lost'} {Math.abs(houseLoss).toFixed(2)} DKK
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Deposited</CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-emerald-500" data-testid="text-deposited">
                +{Number(user.totalDeposited).toFixed(2)} DKK
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Withdrawn</CardTitle>
              <TrendingDown className="h-4 w-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-rose-500" data-testid="text-withdrawn">
                -{Number(user.totalWithdrawn).toFixed(2)} DKK
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Info & Transactions */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* User Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Player Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-2"><Calendar className="h-4 w-4" /> Member Since</span>
                <span className="font-medium">{new Date(user.joinDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-2"><Shield className="h-4 w-4" /> Last Active</span>
                <span className="font-medium">{new Date(user.lastActive).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-2"><Users className="h-4 w-4" /> Affiliate</span>
                <span className="font-medium">
                  {user.affiliateId ? (
                    <Link href={`/affiliates/${user.affiliateId}`} className="text-primary hover:underline">
                      View Affiliate
                    </Link>
                  ) : (
                    'Organic'
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Bets</span>
                <span className="font-medium font-mono">{user.stats.totalBets.toFixed(2)} DKK</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Wins</span>
                <span className="font-medium font-mono">{user.stats.totalWins.toFixed(2)} DKK</span>
              </div>
            </CardContent>
          </Card>

          {/* Transaction History */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Last 50 transactions for this player</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[400px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="text-right">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {user.recentTransactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>
                          <Badge variant="outline" className={cn(
                            tx.type === 'Win' || tx.type === 'Jackpot' ? 'text-success border-success' :
                            tx.type === 'Deposit' ? 'text-emerald-500 border-emerald-500' :
                            tx.type === 'Withdrawal' ? 'text-rose-500 border-rose-500' :
                            'text-blue-500 border-blue-500'
                          )}>
                            {tx.type}
                          </Badge>
                        </TableCell>
                        <TableCell className={cn(
                          "font-mono font-medium",
                          (tx.type === 'Win' || tx.type === 'Jackpot' || tx.type === 'Deposit') ? "text-success" : "text-foreground"
                        )}>
                          {(tx.type === 'Bet' || tx.type === 'Withdrawal') ? '-' : '+'}{Number(tx.amount).toFixed(2)} DKK
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground text-sm">
                          {new Date(tx.timestamp).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
