import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { StatusBadge, PriorityBadge } from "@/components/TicketBadges";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Clock, Loader2, Search, TicketIcon, X } from "lucide-react";

type SortField = "createdAt" | "updatedAt" | "priority" | "status";
type SortDir = "asc" | "desc";

export default function AdminTickets() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortField>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data: tickets, isLoading } = trpc.tickets.list.useQuery({
    status: statusFilter || undefined,
    priority: priorityFilter || undefined,
    search: search || undefined,
    sortBy,
    sortDir,
  });

  const toggleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDir("desc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortBy !== field) return null;
    return sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />;
  };

  const hasFilters = !!statusFilter || !!priorityFilter || !!searchInput;

  const clearFilters = () => {
    setStatusFilter("");
    setPriorityFilter("");
    setSearchInput("");
    setSearch("");
  };

  const ticketList = tickets ?? [];

  return (
    <AdminLayout title="Tickets">
      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by ticket #, subject, name or email…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 bg-white"
          />
          {searchInput && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => { setSearchInput(""); setSearch(""); }}
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter || "all"} onValueChange={(v) => setStatusFilter(v === "all" ? "" : v)}>
            <SelectTrigger className="flex-1 sm:w-36 bg-white">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="stuck">Stuck</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter || "all"} onValueChange={(v) => setPriorityFilter(v === "all" ? "" : v)}>
            <SelectTrigger className="flex-1 sm:w-36 bg-white">
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1.5 text-muted-foreground self-start sm:self-auto">
            <X className="w-3.5 h-3.5" />
            Clear
          </Button>
        )}
      </div>

      {/* ── Active filter chips ── */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          {searchInput && (
            <Badge variant="secondary" className="gap-1.5 pr-1.5">
              "{searchInput}"
              <button onClick={() => { setSearchInput(""); setSearch(""); }} className="hover:text-foreground transition-colors">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {statusFilter && (
            <Badge variant="secondary" className="gap-1.5 pr-1.5">
              {statusFilter.replace("_", " ")}
              <button onClick={() => setStatusFilter("")} className="hover:text-foreground transition-colors">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {priorityFilter && (
            <Badge variant="secondary" className="gap-1.5 pr-1.5">
              {priorityFilter}
              <button onClick={() => setPriorityFilter("")} className="hover:text-foreground transition-colors">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* ── Loading / empty ── */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : ticketList.length === 0 ? (
        <div className="text-center py-16">
          <TicketIcon className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            {hasFilters ? "No tickets match your search" : "No tickets yet"}
          </p>
          {hasFilters && (
            <button onClick={clearFilters} className="mt-2 text-xs text-primary hover:underline">
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* ── Mobile: card list ── */}
          <div className="md:hidden space-y-3">
            {ticketList.map((ticket) => (
              <Link key={ticket.id} href={`/admin/tickets/${ticket.id}`}>
                <div className="bg-white rounded-xl border border-border/60 shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-mono text-xs text-primary">{ticket.ticketNumber}</span>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <StatusBadge status={ticket.status} />
                      <PriorityBadge priority={ticket.priority} />
                    </div>
                  </div>
                  <p className="font-medium text-foreground text-sm leading-snug mb-1">{ticket.subject}</p>
                  <p className="text-xs text-muted-foreground mb-3">{ticket.name} · {ticket.email}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{ticket.assigneeName ?? (ticket.assigneeId ? `Staff #${ticket.assigneeId}` : "Unassigned")}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
            <p className="text-xs text-muted-foreground text-center pt-1">
              {ticketList.length} ticket{ticketList.length !== 1 ? "s" : ""}{hasFilters ? " matching filters" : ""}
            </p>
          </div>

          {/* ── Desktop: table ── */}
          <div className="hidden md:block bg-white rounded-xl border border-border/60 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/30">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ticket</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Subject</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground select-none" onClick={() => toggleSort("status")}>
                      <span className="flex items-center gap-1">Status <SortIcon field="status" /></span>
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground select-none" onClick={() => toggleSort("priority")}>
                      <span className="flex items-center gap-1">Priority <SortIcon field="priority" /></span>
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Assignee</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground select-none" onClick={() => toggleSort("createdAt")}>
                      <span className="flex items-center gap-1">Date <SortIcon field="createdAt" /></span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ticketList.map((ticket) => (
                    <tr key={ticket.id} className="border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-3.5">
                        <Link href={`/admin/tickets/${ticket.id}`}>
                          <span className="font-mono text-xs text-primary hover:underline cursor-pointer">{ticket.ticketNumber}</span>
                        </Link>
                      </td>
                      <td className="px-5 py-3.5">
                        <Link href={`/admin/tickets/${ticket.id}`}>
                          <div className="cursor-pointer">
                            <p className="font-medium text-foreground hover:text-primary transition-colors truncate max-w-xs">{ticket.subject}</p>
                            <p className="text-xs text-muted-foreground">{ticket.name}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-5 py-3.5"><StatusBadge status={ticket.status} /></td>
                      <td className="px-5 py-3.5"><PriorityBadge priority={ticket.priority} /></td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs text-muted-foreground">
                          {ticket.assigneeName ?? (ticket.assigneeId ? `Staff #${ticket.assigneeId}` : "Unassigned")}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs text-muted-foreground">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-border/30 bg-muted/20">
              <p className="text-xs text-muted-foreground">
                {ticketList.length} ticket{ticketList.length !== 1 ? "s" : ""}{hasFilters ? " matching filters" : ""}
              </p>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
