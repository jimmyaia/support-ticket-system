import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building2,
  LayoutDashboard,
  LogOut,
  Shield,
  ChevronRight,
  Home,
} from "lucide-react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { useLocation as useWouterLocation } from "wouter";

interface SuperAdminLayoutProps {
  children: React.ReactNode;
}

export default function SuperAdminLayout({ children }: SuperAdminLayoutProps) {
  const { user, loading } = useAuth();
  const [location, navigate] = useLocation();
  const logout = trpc.auth.logout.useMutation({
    onSuccess: () => { window.location.href = "/login"; },
  });

  if (loading) {
    return (
      <div className="flex h-screen">
        <div className="w-64 border-r p-4 space-y-2">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
        <div className="flex-1 p-8"><Skeleton className="h-64 w-full" /></div>
      </div>
    );
  }

  if (!user || user.role !== "admin" || (user as any).tenantId !== null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Super Admin Access Only</h2>
          <p className="text-muted-foreground mb-4">This area is restricted to the platform owner.</p>
          <Link href="/admin"><Button>Go to Admin Panel</Button></Link>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: "/superadmin", label: "Overview", icon: LayoutDashboard },
    { href: "/superadmin/tenants", label: "Client Tenants", icon: Building2 },
    { href: "/superadmin/search", label: "Global Search", icon: Search },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col shrink-0">
        <div className="p-5 border-b">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-primary rounded-md">
              <Shield className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-sm">Super Admin</span>
          </div>
          <p className="text-xs text-muted-foreground pl-8">Platform Management</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = location === href || (href !== "/superadmin" && location.startsWith(href));
            return (
              <Link key={href} href={href}>
                <button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}>
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </button>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t space-y-1">
          <Link href="/admin">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
              <Home className="w-4 h-4" />
              Back to Admin
            </button>
          </Link>
          <button
            onClick={() => logout.mutate()}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
          <div className="px-3 pt-2">
            <p className="text-xs font-medium truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
