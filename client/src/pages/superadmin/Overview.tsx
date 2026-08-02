import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Plus, TicketCheck, Users, Activity, ChevronRight, TrendingUp } from "lucide-react";

export default function SuperAdminOverview() {
  const { data: tenants, isLoading } = trpc.tenants.list.useQuery();

  const totalTickets = tenants?.reduce((s, t) => s + t.ticketCount, 0) ?? 0;
  const totalStaff = tenants?.reduce((s, t) => s + t.staffCount, 0) ?? 0;
  const activeCount = tenants?.filter(t => t.isActive).length ?? 0;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Platform Overview</h1>
        <p className="text-muted-foreground mt-1">AIA SupportDesk — Super Admin Dashboard</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Clients", value: tenants?.length ?? 0, icon: Building2, color: "text-primary", bg: "bg-primary/10" },
          { label: "Active Clients", value: activeCount, icon: Activity, color: "text-emerald-600", bg: "bg-emerald-500/10" },
          { label: "Total Tickets", value: totalTickets, icon: TicketCheck, color: "text-blue-600", bg: "bg-blue-500/10" },
          { label: "Total Staff", value: totalStaff, icon: Users, color: "text-violet-600", bg: "bg-violet-500/10" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${bg}`}><Icon className={`w-5 h-5 ${color}`} /></div>
                <div>
                  {isLoading ? <Skeleton className="h-7 w-12" /> : <p className="text-2xl font-bold">{value}</p>}
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* MRR Card */}
      <Card className="mb-8 border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl"><TrendingUp className="w-6 h-6 text-primary" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Recurring Revenue</p>
                <p className="text-3xl font-bold">${(activeCount * 149).toLocaleString()}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
              </div>
            </div>
            <Link href="/superadmin/tenants/new">
              <Button className="gap-2"><Plus className="w-4 h-4" />Add Client</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Clients */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">All Clients</h2>
          <Link href="/superadmin/tenants">
            <Button variant="ghost" size="sm" className="gap-1">View All <ChevronRight className="w-4 h-4" /></Button>
          </Link>
        </div>
        {isLoading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
        ) : tenants?.length === 0 ? (
          <Card className="text-center py-10">
            <CardContent>
              <Building2 className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium">No clients yet</p>
              <p className="text-sm text-muted-foreground mb-4">Add your first client to start generating revenue</p>
              <Link href="/superadmin/tenants/new"><Button><Plus className="w-4 h-4 mr-2" />Add First Client</Button></Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {tenants?.slice(0, 5).map(t => (
              <Link key={t.id} href={`/superadmin/tenants/${t.id}`}>
                <Card className="cursor-pointer hover:shadow-md transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{t.name}</p>
                          <p className="text-xs text-muted-foreground">{t.slug}.aia-supportdesk.com · {t.ticketCount} tickets</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={t.isActive ? "default" : "secondary"} className="text-xs">
                          {t.isActive ? "Active" : "Suspended"}
                        </Badge>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
