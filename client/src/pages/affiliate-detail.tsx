import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { affiliateQueryOptions } from "@/lib/api";
import { useParams, Link } from "wouter";
import { ArrowLeft, Users, HandCoins, TrendingUp, Calendar, Code } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function AffiliateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: affiliate, isLoading, error } = useQuery(affiliateQueryOptions(id || ""));

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </Layout>
    );
  }

  if (error || !affiliate) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-96">
          <h2 className="text-2xl font-bold text-destructive">Affiliate not found</h2>
          <Link href="/affiliates">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Affiliates
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const referredUsersList = Array.isArray(affiliate.referredUsers) ? affiliate.referredUsers : [];

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/affiliates">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight" data-testid="text-affiliate-name">{affiliate.name}</h1>
              <Badge variant="outline" className={affiliate.status === 'Active' ? 'text-success border-success' : 'text-muted-foreground'}>
                {affiliate.status}
              </Badge>
            </div>
            <p className="text-muted-foreground flex items-center gap-2 mt-1">
              <Code className="h-4 w-4" /> Referral Code: <code className="bg-secondary px-2 py-0.5 rounded font-mono">{affiliate.code}</code>
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Referred Players</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono" data-testid="text-referrals">{referredUsersList.length}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-success">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Generated NGR</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={cn("text-2xl font-bold font-mono", affiliate.totalNGR >= 0 ? "text-success" : "text-destructive")} data-testid="text-ngr">
                {affiliate.totalNGR >= 0 ? '+' : ''}{affiliate.totalNGR.toFixed(2)} DKK
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Commission (30%)</CardTitle>
              <HandCoins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-amber-500" data-testid="text-commission">
                {affiliate.commission.toFixed(2)} DKK
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Affiliate Info & Referred Users */}
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Affiliate Details */}
          <Card>
            <CardHeader>
              <CardTitle>Affiliate Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Member Since
                </span>
                <span className="font-medium">{new Date(affiliate.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg NGR/Player</span>
                <span className="font-medium font-mono">
                  {referredUsersList.length > 0 
                    ? (affiliate.totalNGR / referredUsersList.length).toFixed(2) 
                    : '0.00'} DKK
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Commission Rate</span>
                <span className="font-medium">30%</span>
              </div>
            </CardContent>
          </Card>

          {/* Referred Users Table */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Referred Players</CardTitle>
              <CardDescription>All players referred by this affiliate</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[400px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                      <TableHead className="text-right">Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {referredUsersList.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          No referred players yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      referredUsersList.map((user: any) => (
                        <TableRow key={user.id} className="cursor-pointer hover:bg-muted/50" onClick={() => window.location.href = `/players/${user.id}`}>
                          <TableCell className="font-medium">
                            <span className="text-primary hover:underline">{user.username}</span>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{user.email}</TableCell>
                          <TableCell>
                            <Badge variant={user.status === 'Active' ? 'default' : 'destructive'} className={cn(user.status === 'Active' ? 'bg-emerald-500/15 text-emerald-500' : '')}>
                              {user.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-mono">{Number(user.balance).toFixed(2)} DKK</TableCell>
                          <TableCell className="text-right text-muted-foreground text-sm">
                            {new Date(user.joinDate).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
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
