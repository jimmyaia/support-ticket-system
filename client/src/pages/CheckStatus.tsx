import { useState, useEffect } from "react";
import { Link, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, HeadphonesIcon, Loader2, Search, TicketIcon } from "lucide-react";
import { toast } from "sonner";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  new: { label: "New", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
  in_progress: { label: "In Progress", color: "text-cyan-700", bg: "bg-cyan-50 border-cyan-200" },
  stuck: { label: "Stuck", color: "text-red-700", bg: "bg-red-50 border-red-200" },
  completed: { label: "Completed", color: "text-green-700", bg: "bg-green-50 border-green-200" },
  closed: { label: "Closed", color: "text-slate-600", bg: "bg-slate-50 border-slate-200" },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  low: { label: "Low", color: "text-green-600" },
  medium: { label: "Medium", color: "text-blue-600" },
  high: { label: "High", color: "text-orange-600" },
  urgent: { label: "Urgent", color: "text-red-600" },
};

export default function CheckStatus() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const initialTicket = params.get("ticket") || "";

  const [ticketNumber, setTicketNumber] = useState(initialTicket);
  const [queryTicket, setQueryTicket] = useState(initialTicket);

  const { data, isLoading, error, refetch } = trpc.tickets.lookup.useQuery(
    { ticketNumber: queryTicket },
    { enabled: !!queryTicket, retry: false }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketNumber.trim()) {
      toast.error("Please enter a ticket number");
      return;
    }
    setQueryTicket(ticketNumber.trim().toUpperCase());
  };

  const status = data ? STATUS_CONFIG[data.status] : null;
  const priority = data ? PRIORITY_CONFIG[data.priority] : null;

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border/50 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <HeadphonesIcon className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground tracking-tight">SupportDesk</span>
            </div>
          </Link>
          <Link href="/submit">
            <Button size="sm" className="gap-1.5">Submit Ticket</Button>
          </Link>
        </div>
      </nav>

      <div className="max-w-xl mx-auto px-6 py-12">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground mb-8 -ml-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="font-display text-3xl font-medium text-foreground mb-2">Check Ticket Status</h1>
          <p className="text-muted-foreground">Enter your ticket number to view the current status of your support request.</p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 mb-8">
          <Input
            value={ticketNumber}
            onChange={(e) => setTicketNumber(e.target.value.toUpperCase())}
            placeholder="e.g. TKT-M0ABCDEF-XYZ"
            className="font-mono flex-1 h-11"
          />
          <Button type="submit" className="h-11 px-5 gap-2" disabled={isLoading}>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Search
          </Button>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-center">
            <TicketIcon className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="font-medium text-red-700 mb-1">Ticket not found</p>
            <p className="text-sm text-red-600">Please check your ticket number and try again.</p>
          </div>
        )}

        {data && status && (
          <div className="bg-white rounded-xl border border-border/60 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border/50">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Ticket Number</p>
                  <p className="font-mono font-bold text-lg text-foreground">{data.ticketNumber}</p>
                </div>
                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${status.bg} ${status.color}`}>
                  {status.label}
                </span>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Subject</p>
                <p className="text-foreground font-medium">{data.subject}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Priority</p>
                  <p className={`text-sm font-semibold ${priority?.color}`}>{priority?.label}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Submitted</p>
                  <p className="text-sm text-foreground">{new Date(data.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Last Updated</p>
                <p className="text-sm text-foreground">{new Date(data.updatedAt).toLocaleString()}</p>
              </div>
            </div>
            {(data.status === "completed" || data.status === "closed") && (
              <div className="px-6 pb-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <p className="text-sm font-medium text-green-700">
                    {data.status === "completed" ? "✓ Your issue has been resolved." : "✓ This ticket has been closed."}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

