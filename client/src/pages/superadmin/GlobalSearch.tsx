import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Search, ExternalLink, Building2 } from "lucide-react";
import { format } from "date-fns";

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  in_progress: "bg-yellow-100 text-yellow-700",
  stuck: "bg-red-100 text-red-700",
  completed: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-600",
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-blue-100 text-blue-600",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");

  const { data, isLoading, isFetching } = trpc.tenants.searchAllTickets.useQuery(
    { query: submitted, limit: 50 },
    { enabled: submitted.length >= 2 }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length >= 2) setSubmitted(query.trim());
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Global Ticket Search</h1>
        <p className="text-muted-foreground text-sm">Search tickets across all client tenants by ticket number, customer name, email, or subject.</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by ticket #, name, email, or subject..."
            className="pl-9"
            autoFocus
          />
        </div>
        <Button type="submit" disabled={query.trim().length < 2}>Search</Button>
      </form>

      {submitted && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center justify-between">
              <span>Results for "{submitted}"</span>
              {data && <span className="text-muted-foreground font-normal text-sm">{data.length} ticket{data.length !== 1 ? "s" : ""} found</span>}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading || isFetching ? (
              <div className="p-6 space-y-3">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : !data || data.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No tickets found matching "{submitted}"</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket #</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((ticket) => (
                    <TableRow key={ticket.id} className="hover:bg-muted/40">
                      <TableCell className="font-mono text-xs font-semibold text-primary">
                        {ticket.ticketNumber}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm">
                          <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                          {ticket.tenantName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">{ticket.name}</div>
                        <div className="text-xs text-muted-foreground">{ticket.email}</div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="truncate text-sm">{ticket.subject}</p>
                      </TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[ticket.status] ?? ""}`}>
                          {ticket.status.replace("_", " ")}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[ticket.priority] ?? ""}`}>
                          {ticket.priority}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(ticket.createdAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <Link href={`/superadmin/tenants/${ticket.tenantId}`}>
                          <Button variant="ghost" size="icon" className="w-7 h-7">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {!submitted && (
        <div className="text-center py-16 text-muted-foreground">
          <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="text-sm">Enter at least 2 characters to search across all client tickets</p>
        </div>
      )}
    </div>
  );
}

