import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  description?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
}

export function StatCard({ title, value, icon: Icon, description, trend, trendValue, className }: StatCardProps) {
  return (
    <Card className={cn("border-l-4 border-l-transparent hover:border-l-primary transition-all", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold font-display tracking-tight">{value}</div>
        {(description || trendValue) && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            {trend && (
              <span
                className={cn(
                  "font-medium",
                  trend === "up" && "text-success",
                  trend === "down" && "text-destructive",
                  trend === "neutral" && "text-muted-foreground"
                )}
              >
                {trendValue}
              </span>
            )}
            <span className="opacity-80">{description}</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
