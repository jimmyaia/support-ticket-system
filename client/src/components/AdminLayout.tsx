import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
  import {
  BarChart3,
  HeadphonesIcon,
  LayoutDashboard,
  Loader2,
  LogOut,
  Ticket,
  Users,
  Shield,
} from "lucide-react";
import { Settings, UserCircle, AlertTriangle, ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

function TenantBranding() {
  const { data: tenant } = trpc.tenants.getMyTenant.useQuery(undefined, {
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
  if (!tenant?.name) return null;
  return (
    <div className="flex items-center gap-2.5">
      {tenant.logoUrl ? (
        <img
          src={tenant.logoUrl}
          alt={tenant.name}
          className="h-8 w-8 rounded-lg object-contain border border-border/40 bg-white p-0.5"
        />
      ) : (
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-primary">
            {tenant.name[0].toUpperCase()}
          </span>
        </div>
      )}
      <span className="font-semibold text-foreground text-base leading-none">{tenant.name}</span>
    </div>
  );
}

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/tickets", label: "Tickets", icon: Ticket },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/staff", label: "Staff", icon: Users },
];

// Settings nav item shown only to tenant admins
const TENANT_ADMIN_NAV = [
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

interface Props {
  children: React.ReactNode;
  title?: string;
}

  export default function AdminLayout({ children, title }: Props) {
  const { user, loading, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const utils = trpc.useUtils();

  const { data: impStatus } = trpc.tenants.impersonationStatus.useQuery(undefined, {
    enabled: !!user,
    refetchOnWindowFocus: false,
  });

  const exitImpersonation = trpc.tenants.exitImpersonation.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
      toast.success("Exited impersonation mode");
      window.location.href = "/superadmin/tenants";
    },
    onError: (e) => toast.error(e.message),
  });

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
          {user?.role === "admin" && (user as any).tenantId && TENANT_ADMIN_NAV.map((item) => {
            const isActive = location.startsWith(item.href);
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
          {user?.role === "admin" && !(user as any).tenantId && (
            <Link href="/superadmin">
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-violet-600 hover:bg-violet-50 transition-colors cursor-pointer mb-1">
                <Shield className="w-4 h-4" />
                Super Admin
              </div>
            </Link>
          )}
          <Link href="/admin/profile">
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer mb-1">
              <UserCircle className="w-4 h-4" />
              My Profile
            </div>
          </Link>
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
        {impStatus?.isImpersonating && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-medium">
                Viewing as <strong>{impStatus.tenantName}</strong> — you are in impersonation mode
              </span>
            </div>
            <button
              onClick={() => exitImpersonation.mutate()}
              disabled={exitImpersonation.isPending}
              className="flex items-center gap-1.5 text-xs font-medium text-amber-700 hover:text-amber-900 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-md transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Exit — Return to Super Admin
            </button>
          </div>
        )}
        {title && (
          <header className="bg-white border-b border-border/50 px-8 py-5">
            <div className="flex items-center justify-between">
              <h1 className="font-display text-xl font-medium text-foreground">{title}</h1>
              <TenantBranding />
            </div>
          </header>
        )}
        <div className="flex-1 p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
