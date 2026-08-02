import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Building2,
  Plus,
  Search,
  TicketCheck,
  Users,
  Activity,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function TenantList() {
  const [search, setSearch] = useState("");
  const { data: tenants, isLoading, refetch } = trpc.tenants.list.useQuery();
  const toggleActive = trpc.tenants.toggleActive.useMutation({
    onSuccess: () => { refetch(); toast.success("Tenant status updated"); },
    onError: (e) => toast.error(e.message),
  });

  const filtered = tenants?.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.slug.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Client Tenants</h1>
          <p className="text-muted-foreground mt-1">Manage all client workspaces and their configurations</p>
        </div>
        <Link href="/superadmin/tenants/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add New Client
          </Button>
        </Link>
      </div>

      {/* Stats row */}
      {tenants && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg"><Building2 className="w-5 h-5 text-primary" /></div>
                <div>
                  <p className="text-2xl font-bold">{tenants.length}</p>
                  <p className="text-sm text-muted-foreground">Total Clients</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg"><Activity className="w-5 h-5 text-emerald-600" /></div>
                <div>
                  <p className="text-2xl font-bold">{tenants.filter(t => t.isActive).length}</p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg"><TicketCheck className="w-5 h-5 text-blue-600" /></div>
                <div>
                  <p className="text-2xl font-bold">{tenants.reduce((s, t) => s + t.ticketCount, 0)}</p>
                  <p className="text-sm text-muted-foreground">Total Tickets</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search clients by name or subdomain..."
          className="pl-10"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Tenant list */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium">No clients found</p>
            <p className="text-muted-foreground mb-4">Add your first client to get started</p>
            <Link href="/superadmin/tenants/new">
              <Button><Plus className="w-4 h-4 mr-2" />Add New Client</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(tenant => (
            <Card key={tenant.id} className={`transition-all hover:shadow-md ${!tenant.isActive ? "opacity-60" : ""}`}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {tenant.logoUrl ? (
                      <img src={tenant.logoUrl} alt={tenant.name} className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{tenant.name}</h3>
                        <Badge variant={tenant.isActive ? "default" : "secondary"}>
                          {tenant.isActive ? "Active" : "Suspended"}
                        </Badge>
                        {tenant.ghlWebhookUrl && (
                          <Badge variant="outline" className="text-emerald-600 border-emerald-300">GHL Connected</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        https://aia-supportdesk.com/submit?tenantId={tenant.id}
                        <span className="mx-2">·</span>
                        <span className="inline-flex items-center gap-1"><TicketCheck className="w-3 h-3" />{tenant.ticketCount} tickets</span>
                        <span className="mx-2">·</span>
                        <span className="inline-flex items-center gap-1"><Users className="w-3 h-3" />{tenant.staffCount} staff</span>
                        {tenant.lastActivity && (
                          <>
                            <span className="mx-2">·</span>
                            <span>Last active {formatDistanceToNow(new Date(tenant.lastActivity), { addSuffix: true })}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleActive.mutate({ id: tenant.id, isActive: !tenant.isActive })}
                      className="gap-1 text-muted-foreground"
                    >
                      {tenant.isActive
                        ? <><ToggleRight className="w-4 h-4 text-emerald-600" />Suspend</>
                        : <><ToggleLeft className="w-4 h-4" />Activate</>
                      }
                    </Button>
                    <Link href={`/superadmin/tenants/${tenant.id}`}>
                      <Button variant="outline" size="sm" className="gap-1">
                        Manage <ChevronRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
