import { useMemo } from "react";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { CheckCircle2, Clock, Loader2, TicketIcon, TrendingUp } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  new: "#3b82f6",
  in_progress: "#06b6d4",
  stuck: "#ef4444",
  completed: "#22c55e",
  closed: "#94a3b8",
};

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  in_progress: "In Progress",
  stuck: "Stuck",
  completed: "Completed",
  closed: "Closed",
};

export default function AdminReports() {
  const now = useMemo(() => new Date(), []);
  const { data: monthStats, isLoading: loadingMonth } = trpc.reports.monthly.useQuery({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  });
  const { data: volumeData, isLoading: loadingVolume } = trpc.reports.volume.useQuery({ months: 6 });

  const pieData = monthStats
    ? Object.entries(monthStats.byStatus)
        .filter(([, count]) => count > 0)
        .map(([status, count]) => ({
          name: STATUS_LABELS[status] ?? status,
          value: count,
          color: STATUS_COLORS[status] ?? "#94a3b8",
        }))
    : [];

  const avgHours = monthStats?.avgResolveHours;
  const avgDisplay = avgHours != null
    ? avgHours < 24
      ? `${avgHours.toFixed(1)}h`
      : `${(avgHours / 24).toFixed(1)}d`
    : "—";

  const summaryCards = [
    {
      label: "Total Tickets",
      value: monthStats?.total ?? 0,
      icon: TicketIcon,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Resolved",
      value: monthStats?.resolvedCount ?? 0,
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Completion Rate",
      value: monthStats ? `${monthStats.completionRate.toFixed(1)}%` : "—",
      icon: TrendingUp,
      color: "text-primary",
      bg: "bg-accent",
    },
    {
      label: "Avg Time to Resolve",
      value: avgDisplay,
      icon: Clock,
      color: "text-cyan-600",
      bg: "bg-cyan-50",
    },
  ];

  const monthName = now.toLocaleString("default", { month: "long", year: "numeric" });

  return (
    <AdminLayout title="Reports">
      <div className="mb-2">
        <p className="text-sm text-muted-foreground">Showing data for <span className="font-medium text-foreground">{monthName}</span></p>
      </div>

      {/* Summary Cards */}
      {loadingMonth ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5 mt-4">
            {summaryCards.map((card) => (
              <div key={card.label} className="bg-white rounded-xl border border-border/60 shadow-sm p-4">
                <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center mb-3`}>
                  <card.icon className={`w-4.5 h-4.5 ${card.color}`} />
                </div>
                <p className="text-2xl font-bold text-foreground">{card.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{card.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Status Breakdown Pie */}
            <div className="bg-white rounded-xl border border-border/60 shadow-sm p-4 sm:p-6">
              <h2 className="text-sm font-semibold text-foreground mb-4">Status Breakdown</h2>
              {pieData.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                  No data for this month
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                    />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: "12px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Status Table */}
            <div className="bg-white rounded-xl border border-border/60 shadow-sm p-4 sm:p-6">
              <h2 className="text-sm font-semibold text-foreground mb-4">Tickets by Status</h2>
              <div className="overflow-x-auto"><table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/40">
                    <th className="text-left pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                    <th className="text-right pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Count</th>
                    <th className="text-right pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Share</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(monthStats?.byStatus ?? {}).map(([status, count]) => (
                    <tr key={status} className="border-b border-border/20 last:border-0">
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: STATUS_COLORS[status] }}
                          />
                          <span className="text-foreground">{STATUS_LABELS[status] ?? status}</span>
                        </div>
                      </td>
                      <td className="py-2.5 text-right font-semibold text-foreground">{count}</td>
                      <td className="py-2.5 text-right text-muted-foreground">
                        {monthStats && monthStats.total > 0
                          ? `${((count / monthStats.total) * 100).toFixed(0)}%`
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table></div>
            </div>
          </div>
        </>
      )}

      {/* Volume Chart */}
      <div className="bg-white rounded-xl border border-border/60 shadow-sm p-4 sm:p-6">
        <h2 className="text-sm font-semibold text-foreground mb-4">Monthly Ticket Volume (Last 6 Months)</h2>
        {loadingVolume ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={volumeData ?? []} margin={{ top: 4, right: 4, bottom: 4, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px" }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Bar dataKey="total" name="Total" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="resolved" name="Resolved" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </AdminLayout>
  );
}
