import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link, useLocation, useRouter } from "wouter";
import {
  BarChart3,
  HeadphonesIcon,
  LayoutDashboard,
  Loader2,
  LogOut,
  Ticket,
  Users,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/tickets", label: "Tickets", icon: Ticket },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/staff", label: "Staff", icon: Users },
];

interface Props {
  children: React.ReactNode;
  title?: string;
}

export default function AdminLayout({ children, title }: Props) {
  const { user, loading, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const utils = trpc.useUtils();

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
      toast.success("Logged out successfully");
      window.location.href = "/login";
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center mx-auto mb-5">
            <HeadphonesIcon className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="font-display text-2xl font-medium text-foreground mb-2">Admin Access</h1>
          <p className="text-muted-foreground mb-6 text-sm">Sign in to access the support team dashboard.</p>
          <Link href="/login">
            <Button className="w-full gap-2">Sign In to Continue</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isStaffOrAdmin = user?.role === "admin" || user?.role === "staff";
  if (!isStaffOrAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-sm">
          <h1 className="font-display text-2xl font-medium text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6 text-sm">You don't have permission to access the admin area.</p>
          <Link href="/">
            <Button variant="outline" className="bg-white">Return to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 bg-white border-r border-border/60 flex flex-col">
        <div className="p-5 border-b border-border/50">
          <Link href="/">
            <div className="flex items-center gap-2.5 cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <HeadphonesIcon className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground leading-none">SupportDesk</p>
                <p className="text-xs text-muted-foreground mt-0.5">Admin Panel</p>
              </div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = item.exact ? location === item.href : location.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border/50">
          <div className="px-3 py-2 mb-1">
            <p className="text-xs font-medium text-foreground truncate">{user?.name || "Staff Member"}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            <span className="inline-block mt-1 text-xs px-1.5 py-0.5 rounded bg-accent text-accent-foreground font-medium capitalize">
              {user?.role}
            </span>
          </div>
          <button
            onClick={() => logoutMutation.mutate()}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 flex flex-col">
        {title && (
          <header className="bg-white border-b border-border/50 px-8 py-5">
            <h1 className="font-display text-xl font-medium text-foreground">{title}</h1>
          </header>
        )}
        <div className="flex-1 p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
