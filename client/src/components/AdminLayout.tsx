import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import {
  BarChart3,
  HeadphonesIcon,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Ticket,
  Users,
  Shield,
  X,
} from "lucide-react";
import { Settings, UserCircle, AlertTriangle, ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

function TenantBranding({ name, logoUrl }: { name: string; logoUrl?: string | null }) {
  return (
    <div className="flex items-center gap-2.5">
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={name}
          className="h-8 w-8 rounded-lg object-contain border border-border/40 bg-white p-0.5"
        />
      ) : (
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-primary">
            {name[0].toUpperCase()}
          </span>
        </div>
      )}
      <span className="font-semibold text-foreground text-base leading-none hidden sm:block">{name}</span>
    </div>
  );
}

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/tickets", label: "Tickets", icon: Ticket },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/staff", label: "Staff", icon: Users },
];

const TENANT_ADMIN_NAV = [
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

interface Props {
  children: React.ReactNode;
  title?: string;
}

function SidebarContent({
  user,
  location,
  onNavigate,
  logoutMutation,
}: {
  user: any;
  location: string;
  onNavigate?: () => void;
  logoutMutation: any;
}) {
  return (
    <>
      <nav className="flex-1 p-3 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact ? location === item.href : location.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} onClick={onNavigate}>
              <div
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
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
        {user?.role === "admin" && user.tenantId && TENANT_ADMIN_NAV.map((item) => {
          const isActive = location.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} onClick={onNavigate}>
              <div
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
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
        {user?.role === "admin" && !user.tenantId && (
          <Link href="/superadmin" onClick={onNavigate}>
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-violet-600 hover:bg-violet-50 transition-colors cursor-pointer mb-1">
              <Shield className="w-4 h-4" />
              Super Admin
            </div>
          </Link>
        )}
        <Link href="/admin/profile" onClick={onNavigate}>
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
    </>
  );
}

export default function AdminLayout({ children, title }: Props) {
  const { user, loading, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const utils = trpc.useUtils();

  const { data: tenantData } = trpc.tenants.getMyTenant.useQuery(undefined, {
    enabled: !!user?.tenantId,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

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
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-sm w-full">
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
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
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
      {/* ── Desktop sidebar ──────────────────────────────────────────── */}
      <aside className="hidden lg:flex w-60 flex-shrink-0 bg-white border-r border-border/60 flex-col">
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
        <SidebarContent user={user} location={location} logoutMutation={logoutMutation} />
      </aside>

      {/* ── Mobile sidebar overlay ───────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-border/60 flex flex-col transform transition-transform duration-250 ease-out lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 border-b border-border/50 flex items-center justify-between">
          <Link href="/" onClick={() => setMobileOpen(false)}>
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
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <SidebarContent
          user={user}
          location={location}
          onNavigate={() => setMobileOpen(false)}
          logoutMutation={logoutMutation}
        />
      </aside>

      {/* ── Main content ─────────────────────────────────────────────── */}
      <main className="flex-1 min-w-0 flex flex-col">
        {impStatus?.isImpersonating && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-amber-800 min-w-0">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-medium truncate">
                Viewing as <strong>{impStatus.tenantName}</strong>
              </span>
            </div>
            <button
              onClick={() => exitImpersonation.mutate()}
              disabled={exitImpersonation.isPending}
              className="flex-shrink-0 flex items-center gap-1.5 text-xs font-medium text-amber-700 hover:text-amber-900 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-md transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exit — Return to Super Admin</span>
              <span className="sm:hidden">Exit</span>
            </button>
          </div>
        )}

        {/* Mobile top bar */}
        <div className="lg:hidden bg-white border-b border-border/50 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center flex-shrink-0">
              <HeadphonesIcon className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold text-foreground truncate">
              {title || "SupportDesk"}
            </span>
          </div>
          {tenantData?.name && (
            <TenantBranding name={tenantData.name} logoUrl={tenantData.logoUrl} />
          )}
        </div>

        {/* Desktop page header */}
        {title && (
          <header className="hidden lg:block bg-white border-b border-border/50 px-8 py-5">
            <div className="flex items-center justify-between">
              <h1 className="font-display text-xl font-medium text-foreground">{title}</h1>
              {tenantData?.name && (
                <TenantBranding name={tenantData.name} logoUrl={tenantData.logoUrl} />
              )}
            </div>
          </header>
        )}

        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
