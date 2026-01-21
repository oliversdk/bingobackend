import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { affiliatesQueryOptions, type Affiliate } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { HandCoins, TrendingUp, Users, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

export default function AffiliatesPage() {
  const [, navigate] = useLocation();
  const { data: affiliates = [], isLoading, error } = useQuery(affiliatesQueryOptions());

  const totalCommission = affiliates.reduce((acc, aff) => acc + aff.commission, 0);
  const totalReferrals = affiliates.reduce((acc, aff) => acc + aff.referredUsers, 0);

  const handleRowClick = (affiliateId: string) => {
    navigate(`/affiliates/${affiliateId}`);
  };

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
          Failed to load affiliates
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Affiliate Program</h1>
          <p className="text-muted-foreground">Track partner performance, referrals, and commission payouts. Click on any affiliate for details.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Active Affiliates</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{affiliates.filter(a => a.status === 'Active').length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Referred Players</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalReferrals}</div>
            </CardContent>
          </Card>
          <Card>
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Commissions</CardTitle>
              <HandCoins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCommission.toLocaleString()} DKK</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Affiliate Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Affiliate Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead className="text-right">Referrals</TableHead>
                  <TableHead className="text-right">Generated NGR</TableHead>
                  <TableHead className="text-right">Commission (30%)</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {affiliates.map((affiliate) => (
                  <TableRow 
                    key={affiliate.id} 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleRowClick(affiliate.id)}
                    data-testid={`row-affiliate-${affiliate.id}`}
                  >
                    <TableCell className="font-medium text-primary hover:underline">{affiliate.name}</TableCell>
                    <TableCell>
                      <code className="font-mono text-xs bg-secondary/50 px-2 py-1 rounded">{affiliate.code}</code>
                    </TableCell>
                    <TableCell className="text-right">{affiliate.referredUsers}</TableCell>
                    <TableCell className={cn("text-right font-medium", affiliate.totalNGR >= 0 ? "text-success" : "text-destructive")}>
                      {affiliate.totalNGR.toLocaleString()} DKK
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {affiliate.commission.toLocaleString()} DKK
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={affiliate.status === 'Active' ? 'text-success border-success' : 'text-muted-foreground'}>
                        {affiliate.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
