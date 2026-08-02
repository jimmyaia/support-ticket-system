import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Search, AlertTriangle, CheckCircle2, Clock, Loader2, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  new: { label: "New", color: "bg-blue-100 text-blue-800 border-blue-200" },
  in_progress: { label: "In Progress", color: "bg-amber-100 text-amber-800 border-amber-200" },
  stuck: { label: "Stuck", color: "bg-red-100 text-red-800 border-red-200" },
  completed: { label: "Completed", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  closed: { label: "Closed", color: "bg-slate-100 text-slate-700 border-slate-200" },
};

interface Props {
  slug: string;
}

export default function TenantStatus({ slug }: Props) {
  const [ticketNumber, setTicketNumber] = useState("");
  const [submitted, setSubmitted] = useState("");

  const { data: tenant, isLoading: tenantLoading } = trpc.tickets.getTenantInfoBySlug.useQuery(
    { slug },
    { staleTime: 60_000 }
  );

  // Auto-load ticket from ?ticket= query param (from GHL webhook status links)
  const [autoLoaded, setAutoLoaded] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("ticket")?.toUpperCase() ?? "";
  });

  const { data: ticket, isLoading, error } = trpc.tickets.lookup.useQuery(
    { ticketNumber: submitted || autoLoaded, tenantId: tenant?.id },
    { enabled: !!(submitted || autoLoaded) && !!tenant?.id, retry: false }
  );

  // Sync input with auto-loaded value
  useState(() => {
    if (autoLoaded && !ticketNumber) setTicketNumber(autoLoaded);
  });

  const handleLookup = () => {
    const val = ticketNumber.trim().toUpperCase();
    if (val) { setSubmitted(val); setAutoLoaded(""); }
  };

  if (!tenantLoading && !tenant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Portal Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The support portal for <strong>{slug}</strong> could not be found or is currently inactive.
          </p>
          <a href="https://aia-supportdesk.com">
            <Button variant="outline">Go to AIA SupportDesk</Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b shadow-sm">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {tenantLoading ? (
              <Skeleton className="w-10 h-10 rounded-xl" />
            ) : tenant?.logoUrl ? (
              <img src={tenant.logoUrl} alt={tenant.name} className="w-10 h-10 rounded-xl object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
            )}
            <div>
              {tenantLoading ? (
                <Skeleton className="h-5 w-40" />
              ) : (
                <h1 className="font-semibold text-foreground">{tenant?.name} Support</h1>
              )}
              <p className="text-xs text-muted-foreground">Check your ticket status</p>
            </div>
          </div>
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
              <ArrowLeft className="w-4 h-4" />
              Submit a Ticket
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Search className="w-5 h-5" />
              Check Ticket Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                placeholder="Enter ticket number (e.g. TKT-ABC123-XYZ)"
                value={ticketNumber}
                onChange={e => setTicketNumber(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === "Enter" && handleLookup()}
                className="font-mono"
              />
              <Button onClick={handleLookup} disabled={!ticketNumber.trim() || isLoading} className="gap-2">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Look Up
              </Button>
            </div>
          </CardContent>
        </Card>

        {submitted && !isLoading && error && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="pt-6 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
              <p className="text-sm">Ticket <strong>{submitted}</strong> was not found. Please check the number and try again.</p>
            </CardContent>
          </Card>
        )}

        {ticket && (
          <Card className="shadow-lg">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-muted-foreground font-mono mb-1">{ticket.ticketNumber}</p>
                  <h2 className="text-lg font-semibold">{ticket.subject}</h2>
                </div>
                <Badge className={`${STATUS_CONFIG[ticket.status]?.color} border text-xs px-3 py-1 shrink-0`}>
                  {STATUS_CONFIG[ticket.status]?.label ?? ticket.status}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Product</p>
                  <p className="font-medium">{ticket.product}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Priority</p>
                  <p className="font-medium capitalize">{ticket.priority}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Submitted</p>
                  <p className="font-medium">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Last Updated</p>
                  <p className="font-medium">{new Date(ticket.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
              {(ticket.status === "completed" || ticket.status === "closed") && (
                <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-3">
                  <CheckCircle2 className="w-4 h-4" />
                  <p className="text-sm font-medium">This ticket has been resolved. Thank you!</p>
                </div>
              )}
              {(ticket.status === "new" || ticket.status === "in_progress") && (
                <div className="flex items-center gap-2 text-blue-600 bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3">
                  <Clock className="w-4 h-4" />
                  <p className="text-sm">Our team is working on your ticket. We'll update you soon.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>

      <footer className="text-center py-6 text-xs text-muted-foreground">
        Powered by <a href="https://aia-supportdesk.com" className="underline hover:text-foreground">AIA SupportDesk</a>
      </footer>
    </div>
  );
}
