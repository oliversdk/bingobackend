import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Wallet, Clock, CheckCircle, RotateCcw, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { format } from "date-fns";
import { da } from "date-fns/locale";

interface Withdrawal {
  id: string;
  userId: string;
  amount: string;
  timestamp: string;
  withdrawalStatus: 'Pending' | 'Approved' | 'Reversed' | null;
  username: string;
  email: string;
}

async function fetchWithdrawals(): Promise<Withdrawal[]> {
  const res = await fetch('/api/withdrawals');
  if (!res.ok) throw new Error('Failed to fetch withdrawals');
  return res.json();
}

async function updateWithdrawalStatus(id: string, status: string): Promise<any> {
  const res = await fetch(`/api/withdrawals/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Failed to update withdrawal');
  return res.json();
}

function WithdrawalRow({ withdrawal, onApprove, onReverse }: { 
  withdrawal: Withdrawal; 
  onApprove: (id: string) => void;
  onReverse: (id: string) => void;
}) {
  const amount = Number(withdrawal.amount);
  const isLarge = amount >= 20000;
  const status = withdrawal.withdrawalStatus || 'Pending';
  
  return (
    <div 
      className={cn(
        "flex items-center gap-4 p-4 rounded-lg border transition-all",
        isLarge && status === 'Pending' && "border-amber-500/50 bg-amber-500/5",
        status === 'Reversed' && "bg-muted/30",
        status === 'Approved' && "bg-success/5"
      )}
      data-testid={`row-withdrawal-${withdrawal.id}`}
    >
      <div className={cn(
        "p-2 rounded-lg",
        status === 'Pending' ? "bg-amber-500/10" : status === 'Approved' ? "bg-success/10" : "bg-muted"
      )}>
        {status === 'Pending' && <Clock className="h-5 w-5 text-amber-500" />}
        {status === 'Approved' && <CheckCircle className="h-5 w-5 text-success" />}
        {status === 'Reversed' && <RotateCcw className="h-5 w-5 text-muted-foreground" />}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Link href={`/players/${withdrawal.userId}`}>
            <span className="font-medium hover:text-primary cursor-pointer">{withdrawal.username}</span>
          </Link>
          {isLarge && <AlertTriangle className="h-4 w-4 text-amber-500" />}
        </div>
        <p className="text-xs text-muted-foreground truncate">{withdrawal.email}</p>
        <p className="text-xs text-muted-foreground">
          {format(new Date(withdrawal.timestamp), 'PPp', { locale: da })}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant={
          status === 'Pending' ? 'outline' : 
          status === 'Approved' ? 'default' : 
          'secondary'
        } className={cn(
          status === 'Pending' && "border-amber-500 text-amber-500",
          status === 'Reversed' && "bg-muted text-muted-foreground"
        )}>
          {status === 'Pending' && 'Afventer'}
          {status === 'Approved' && 'Udbetalt'}
          {status === 'Reversed' && 'Reverseret'}
        </Badge>
      </div>

      <div className={cn(
        "text-right font-mono font-medium min-w-[120px]",
        isLarge ? "text-amber-500" : ""
      )}>
        {amount.toLocaleString('da-DK')} DKK
      </div>

      {status === 'Pending' && (
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onApprove(withdrawal.id)}
            data-testid={`btn-approve-${withdrawal.id}`}
          >
            Udbetal
          </Button>
          <Button 
            size="sm" 
            variant="ghost"
            onClick={() => onReverse(withdrawal.id)}
            data-testid={`btn-reverse-${withdrawal.id}`}
          >
            Reverser
          </Button>
        </div>
      )}
    </div>
  );
}

export default function WithdrawalsPage() {
  const queryClient = useQueryClient();
  const { data: withdrawals = [], isLoading, error } = useQuery({
    queryKey: ['withdrawals'],
    queryFn: fetchWithdrawals
  });

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateWithdrawalStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawals'] });
    }
  });

  const pendingWithdrawals = withdrawals.filter(w => w.withdrawalStatus === 'Pending' || !w.withdrawalStatus);
  const approvedWithdrawals = withdrawals.filter(w => w.withdrawalStatus === 'Approved');
  const reversedWithdrawals = withdrawals.filter(w => w.withdrawalStatus === 'Reversed');
  const largeWithdrawals = pendingWithdrawals.filter(w => Number(w.amount) >= 20000);

  const totalPending = pendingWithdrawals.reduce((sum, w) => sum + Number(w.amount), 0);
  const totalApproved = approvedWithdrawals.reduce((sum, w) => sum + Number(w.amount), 0);
  const totalReversed = reversedWithdrawals.reduce((sum, w) => sum + Number(w.amount), 0);

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
          Kunne ikke hente udbetalinger
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Wallet className="h-8 w-8 text-primary" />
              Udbetalinger
            </h1>
            <p className="text-muted-foreground mt-2">
              Administrer anmodninger om udbetaling
            </p>
          </div>
          {largeWithdrawals.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg animate-pulse">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <span className="font-medium text-amber-500">
                {largeWithdrawals.length} store udbetalinger (&gt;20.000 DKK)
              </span>
            </div>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Afventer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-500">{pendingWithdrawals.length}</div>
              <p className="text-xs text-muted-foreground">{totalPending.toLocaleString('da-DK')} DKK</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Udbetalt</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{approvedWithdrawals.length}</div>
              <p className="text-xs text-muted-foreground">{totalApproved.toLocaleString('da-DK')} DKK</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Reverseret</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reversedWithdrawals.length}</div>
              <p className="text-xs text-muted-foreground">{totalReversed.toLocaleString('da-DK')} DKK</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList>
            <TabsTrigger value="pending" className="gap-2" data-testid="tab-pending">
              <Clock className="h-4 w-4" />
              Afventer ({pendingWithdrawals.length})
            </TabsTrigger>
            <TabsTrigger value="approved" className="gap-2" data-testid="tab-approved">
              <CheckCircle className="h-4 w-4" />
              Udbetalt ({approvedWithdrawals.length})
            </TabsTrigger>
            <TabsTrigger value="reversed" className="gap-2" data-testid="tab-reversed">
              <RotateCcw className="h-4 w-4" />
              Reverseret ({reversedWithdrawals.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Afventende Udbetalinger</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pendingWithdrawals.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Ingen afventende udbetalinger</p>
                ) : (
                  pendingWithdrawals.map(w => (
                    <WithdrawalRow 
                      key={w.id} 
                      withdrawal={w}
                      onApprove={(id) => mutation.mutate({ id, status: 'Approved' })}
                      onReverse={(id) => mutation.mutate({ id, status: 'Reversed' })}
                    />
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approved" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Udbetalte</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {approvedWithdrawals.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Ingen udbetalinger endnu</p>
                ) : (
                  approvedWithdrawals.map(w => (
                    <WithdrawalRow 
                      key={w.id} 
                      withdrawal={w}
                      onApprove={() => {}}
                      onReverse={() => {}}
                    />
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reversed" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Reverserede Udbetalinger</CardTitle>
                <p className="text-sm text-muted-foreground">Spillere der fortrød og valgte at spille videre</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {reversedWithdrawals.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Ingen reverserede udbetalinger</p>
                ) : (
                  reversedWithdrawals.map(w => (
                    <WithdrawalRow 
                      key={w.id} 
                      withdrawal={w}
                      onApprove={() => {}}
                      onReverse={() => {}}
                    />
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
