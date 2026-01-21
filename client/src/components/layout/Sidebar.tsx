import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Users, 
  Gamepad2, 
  HandCoins, 
  Settings, 
  LogOut,
  Activity,
  Menu,
  Trophy,
  BarChart3,
  BookOpen,
  Wallet
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

// Import Logo (mocked for now, assuming you have one or text)
import logoImage from '@assets/generated_images/minimalist_tech_logo_for_bingo.dk_analytics.png';

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "Players", icon: Users, href: "/players" },
  { label: "Leaderboard", icon: Trophy, href: "/leaderboard" },
  { label: "Withdrawals", icon: Wallet, href: "/withdrawals" },
  { label: "Analytics", icon: BarChart3, href: "/analytics" },
  { label: "Game Performance", icon: Gamepad2, href: "/games" },
  { label: "Affiliates", icon: HandCoins, href: "/affiliates" },
  { label: "Live Monitor", icon: Activity, href: "/live" },
  { label: "Glossary", icon: BookOpen, href: "/glossary" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

export function Sidebar() {
  const [location] = useLocation();

  const NavContent = () => (
    <div className="flex h-full flex-col gap-4">
      <div className="flex h-16 items-center px-6 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-3 font-display font-bold text-xl tracking-tight text-sidebar-primary-foreground">
          <img src={logoImage} alt="Bingo.dk" className="h-8 w-8 rounded-md" />
          <span>Bingo<span className="text-primary">.dk</span></span>
        </Link>
      </div>
      <div className="flex-1 px-4 py-4">
        <nav className="flex flex-col gap-2">
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm ring-1 ring-sidebar-border"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 rounded-md bg-sidebar-accent/30 p-3">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
            JD
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium text-sidebar-foreground">John Doe</p>
            <p className="truncate text-xs text-muted-foreground">Admin</p>
          </div>
          <LogOut className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="bg-sidebar border-sidebar-border">
              <Menu className="h-4 w-4 text-sidebar-foreground" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-sidebar border-r border-sidebar-border text-sidebar-foreground">
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex h-screen w-64 flex-col fixed inset-y-0 left-0 bg-sidebar border-r border-sidebar-border z-30">
        <NavContent />
      </div>
    </>
  );
}
