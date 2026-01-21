import { Sidebar } from "./Sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-8 overflow-y-auto w-full">
        <div className="max-w-7xl mx-auto space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
}
