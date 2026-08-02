import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Search, Ticket, Building2, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import SuperAdminLayout from "@/components/SuperAdminLayout";

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  in_progress: "bg-amber-100 text-amber-700",
  stuck: "bg-red-100 text-red-700",
  completed: "bg-emerald-100 text-emerald-700",
  closed: "bg-slate-100 text-slate-600",
};

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  in_progress: "In Progress",
  stuck: "Stuck",
  completed: "Completed",
  closed: "Closed",
};

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");

  const { data, isLoading, isFetching } = trpc.tenants.searchTicketsGlobal.useQuery(
    { search: submittedQuery },
    { enabled: submittedQuery.length > 0 }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length > 0) setSubmittedQuery(query.trim());
  };

  return (
    <SuperAdminLayout>
      <div className="p-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">Global Ticket Search</h1>
          <p className="text-muted-foreground text-sm">Search tickets across all client tenants by ticket number, customer name, email, or subject.</p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by ticket number, name, email, or subject…"
              className="pl-10"
            />
          </div>
          <Button type="submit" disabled={query.trim().length === 0 || isFetching}>
            {isFetching ? "Searching…" : "Search"}
          </Button>
        </form>

        {submittedQuery && (
          <>
            {isLoading || isFetching ? (
              <div className="text-center py-16 text-muted-foreground">Searching across all tenants…</div>
            ) : !data || data.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <Ticket className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="font-medium text-foreground">No tickets found</p>
                  <p className="text-sm text-muted-foreground mt-1">No results for "{submittedQuery}"</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground mb-4">{data.length} ticket{data.length !== 1 ? "s" : ""} found for "{submittedQuery}"</p>
                {data.map(ticket => (
                  <Card key={ticket.id} className="hover:shadow-sm transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className="font-mono text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
                              {ticket.ticketNumber}
                            </span>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded ${STATUS_COLORS[ticket.status] ?? "bg-muted text-muted-foreground"}`}>
                              {STATUS_LABELS[ticket.status] ?? ticket.status}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                              <Building2 className="w-3 h-3" />
                              {ticket.tenantName}
                            </span>
                          </div>
                          <p className="font-medium text-foreground truncate">{ticket.subject}</p>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {ticket.name} · {ticket.email} · {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                        <Link href={`/admin/tickets/${ticket.id}`}>
                          <Button variant="outline" size="sm" className="gap-1.5 shrink-0">
                            <ExternalLink className="w-3.5 h-3.5" />
                            View
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {!submittedQuery && (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <Search className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium text-foreground">Enter a search term above</p>
              <p className="text-sm text-muted-foreground mt-1">Search by ticket number (e.g. TKT-ABC123), customer name, email, or subject line</p>
            </CardContent>
          </Card>
        )}
      </div>
    </SuperAdminLayout>
  );
}
