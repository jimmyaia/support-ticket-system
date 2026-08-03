import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { StatusBadge, PriorityBadge } from "@/components/TicketBadges";
import { Link } from "wouter";
import { ArrowRight, CheckCircle2, Clock, Loader2, TicketIcon, TrendingUp } from "lucide-react";
import { useMemo } from "react";

export default function AdminDashboard() {
  const now = useMemo(() => new Date(), []);
  const { data: tickets, isLoading } = trpc.tickets.list.useQuery({});
  const { data: monthStats } = trpc.reports.monthly.useQuery({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  });

  const recentTickets = tickets?.slice(0, 5) ?? [];

  const stats = [
    {
      label: "Total This Month",
      value: monthStats?.total ?? 0,
      icon: TicketIcon,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "In Progress",
      value: monthStats?.byStatus.in_progress ?? 0,
      icon: Clock,
      color: "text-cyan-600",
      bg: "bg-cyan-50",
    },
    {
      label: "Completed",
      value: monthStats?.byStatus.completed ?? 0,
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Completion Rate",
      value: monthStats ? `${monthStats.completionRate.toFixed(0)}%` : "—",
      icon: TrendingUp,
      color: "text-primary",
      bg: "bg-accent",
    },
  ];

  return (
    <AdminLayout title="Dashboard">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-border/60 shadow-sm p-4">
            <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-4.5 h-4.5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Tickets */}
      <div className="bg-white rounded-xl border border-border/60 shadow-sm">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border/50">
          <h2 className="font-semibold text-foreground">Recent Tickets</h2>
          <Link href="/admin/tickets">
            <span className="text-sm text-primary hover:underline flex items-center gap-1 cursor-pointer">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : recentTickets.length === 0 ? (
          <div className="text-center py-12">
            <TicketIcon className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No tickets yet</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {recentTickets.map((ticket) => (
              <Link key={ticket.id} href={`/admin/tickets/${ticket.id}`}>
                <div className="flex items-center gap-3 px-4 sm:px-6 py-3.5 hover:bg-muted/30 transition-colors cursor-pointer">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-muted-foreground">{ticket.ticketNumber}</span>
                      <StatusBadge status={ticket.status} />
                      <PriorityBadge priority={ticket.priority} />
                    </div>
                    <p className="text-sm font-medium text-foreground truncate">{ticket.subject}</p>
                    <p className="text-xs text-muted-foreground"><span>{ticket.name}</span><span className="hidden sm:inline"> · {ticket.email}</span></p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-muted-foreground">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
