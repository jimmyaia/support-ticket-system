import { useState, type JSX } from "react";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { StatusBadge, PriorityBadge } from "@/components/TicketBadges";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";
import {
  ArrowLeft, ExternalLink, Loader2, MessageSquare, Paperclip,
  Send, User, Video, Clock, CheckCircle2, AlertCircle, UserCheck,
  StickyNote, Tag, Activity,
} from "lucide-react";
import { Zap } from "lucide-react";
import { toast } from "sonner";

interface Props {
  params: { id: string };
}

type ActivityEvent = "ticket.created" | "status.changed" | "assignee.changed" | "note.added" | "attachment.added";

const STATUS_LABELS: Record<string, string> = {
  new: "New", in_progress: "In Progress", stuck: "Stuck", completed: "Completed", closed: "Closed",
};

function ActivityIcon({ event }: { event: ActivityEvent }) {
  const cls = "w-3.5 h-3.5";
  if (event === "ticket.created") return <Tag className={cls} />;
  if (event === "status.changed") return <CheckCircle2 className={cls} />;
  if (event === "assignee.changed") return <UserCheck className={cls} />;
  if (event === "note.added") return <StickyNote className={cls} />;
  if (event === "attachment.added") return <Paperclip className={cls} />;
  return <AlertCircle className={cls} />;
}

function activityColor(event: ActivityEvent) {
  if (event === "ticket.created") return "bg-blue-100 text-blue-600";
  if (event === "status.changed") return "bg-green-100 text-green-600";
  if (event === "assignee.changed") return "bg-purple-100 text-purple-600";
  if (event === "note.added") return "bg-amber-100 text-amber-600";
  return "bg-muted text-muted-foreground";
}

function activityLabel(event: ActivityEvent, meta: Record<string, unknown> | null, actorName: string | null): string {
  const actor = actorName ?? "System";
  if (event === "ticket.created") return `Ticket submitted by ${actor}`;
  if (event === "status.changed") {
    const from = STATUS_LABELS[meta?.from as string] ?? meta?.from;
    const to = STATUS_LABELS[meta?.to as string] ?? meta?.to;
    return `${actor} changed status from ${from} → ${to}`;
  }
  if (event === "assignee.changed") {
    const name = meta?.assigneeName as string | null;
    return name ? `${actor} assigned to ${name}` : `${actor} unassigned the ticket`;
  }
  if (event === "note.added") return `${actor} added a note`;
  if (event === "attachment.added") return `${actor} added an attachment`;
  return event;
}

export default function AdminTicketDetail({ params }: Props) {
  const ticketId = parseInt(params.id);
  const utils = trpc.useUtils();
  const [noteContent, setNoteContent] = useState("");

  const { data, isLoading } = trpc.tickets.getById.useQuery({ id: ticketId });
  const { data: staffList } = trpc.staff.list.useQuery();

  const updateStatusMutation = trpc.tickets.updateStatus.useMutation({
    onSuccess: () => {
      utils.tickets.getById.invalidate({ id: ticketId });
      utils.tickets.list.invalidate();
      toast.success("Status updated");
    },
    onError: () => toast.error("Failed to update status"),
  });

  const assignMutation = trpc.tickets.assign.useMutation({
    onSuccess: () => {
      utils.tickets.getById.invalidate({ id: ticketId });
      utils.tickets.list.invalidate();
      toast.success("Ticket assigned");
    },
    onError: () => toast.error("Failed to assign ticket"),
  });

  const addNoteMutation = trpc.tickets.addNote.useMutation({
    onSuccess: () => {
      utils.tickets.getById.invalidate({ id: ticketId });
      setNoteContent("");
      toast.success("Note added");
    },
    onError: () => toast.error("Failed to add note"),
  });

  const handleAddNote = () => {
    if (!noteContent.trim()) return;
    addNoteMutation.mutate({ ticketId, content: noteContent.trim() });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  if (!data) {
    return (
      <AdminLayout title="Ticket Not Found">
        <div className="text-center py-20">
          <p className="text-muted-foreground mb-4">This ticket could not be found.</p>
          <Link href="/admin/tickets">
            <Button variant="outline" className="bg-white">Back to Tickets</Button>
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const { ticket, notes, activity } = data;

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
        <div>
          <Link href="/admin/tickets">
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground -ml-2 mb-3">
              <ArrowLeft className="w-4 h-4" />
              All Tickets
            </Button>
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-mono text-sm text-muted-foreground">{ticket.ticketNumber}</span>
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
          </div>
          <h1 className="font-display text-2xl font-medium text-foreground mt-2">{ticket.subject}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Sidebar - shown first on mobile, right on desktop */}
        <div className="space-y-4 order-first lg:order-last lg:col-start-3">
          {/* Description */}
          <div className="bg-white rounded-xl border border-border/60 shadow-sm p-4 sm:p-6">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">Description</h2>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
          </div>

          {/* Attachments */}
          {(ticket.imageUrl || ticket.loomUrl) && (
            <div className="bg-white rounded-xl border border-border/60 shadow-sm p-4 sm:p-6">
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">Attachments</h2>
              <div className="space-y-3">
                {ticket.imageUrl && (
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-2">
                      <Paperclip className="w-3.5 h-3.5" /> Image Attachment
                    </p>
                    <img
                      src={ticket.imageUrl}
                      alt="Ticket attachment"
                      className="max-w-full rounded-lg border border-border/50 max-h-80 object-contain"
                    />
                  </div>
                )}
                {ticket.loomUrl && (
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-2">
                      <Video className="w-3.5 h-3.5" /> Loom Recording
                    </p>
                    <a
                      href={ticket.loomUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Loom Recording
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Internal Notes */}
          <div className="bg-white rounded-xl border border-border/60 shadow-sm p-4 sm:p-6">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Internal Notes
              <span className="ml-auto text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                Staff only
              </span>
            </h2>

            {notes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No notes yet. Add the first note below.</p>
            ) : (
              <div className="space-y-4 mb-5">
                {notes.map((note) => {
                  const author = staffList?.find((s) => s.id === note.authorId);
                  return (
                    <div key={note.id} className="flex gap-3">
                      <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                        <User className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-foreground">
                            {author?.name || `Staff #${note.authorId}`}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(note.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="bg-muted/40 rounded-lg px-4 py-3">
                          <p className="text-sm text-foreground whitespace-pre-wrap">{note.content}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add note */}
            <div className="border-t border-border/40 pt-4">
              <Textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Add an internal note visible only to the support team..."
                rows={3}
                className="resize-none mb-3"
              />
              <Button
                onClick={handleAddNote}
                disabled={!noteContent.trim() || addNoteMutation.isPending}
                size="sm"
                className="gap-2"
              >
                {addNoteMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                Add Note
              </Button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:col-span-2 space-y-5 order-last lg:order-first">
          {/* Status */}
          <div className="bg-white rounded-xl border border-border/60 shadow-sm p-5">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Status</h3>
            <Select
              value={ticket.status}
              onValueChange={(v) => updateStatusMutation.mutate({ id: ticketId, status: v as "new"|"in_progress"|"stuck"|"completed"|"closed" })}
              disabled={updateStatusMutation.isPending}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="stuck">Stuck</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Assignee */}
          <div className="bg-white rounded-xl border border-border/60 shadow-sm p-5">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Assignee</h3>
            <Select
              value={ticket.assigneeId?.toString() ?? "unassigned"}
              onValueChange={(v) =>
                assignMutation.mutate({ id: ticketId, assigneeId: v === "unassigned" ? null : parseInt(v) })
              }
              disabled={assignMutation.isPending}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Unassigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {staffList?.map((staff) => (
                  <SelectItem key={staff.id} value={staff.id.toString()}>
                    {staff.name || staff.email || `Staff #${staff.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ticket Info */}
          <div className="bg-white rounded-xl border border-border/60 shadow-sm p-5">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">Ticket Info</h3>
            <dl className="space-y-3">
              {[
                { label: "Submitted by", value: ticket.name },
                { label: "Email", value: ticket.email },
                { label: "Product", value: ticket.product },
                { label: "Created", value: new Date(ticket.createdAt).toLocaleString() },
                { label: "Last Updated", value: new Date(ticket.updatedAt).toLocaleString() },
                ...(ticket.resolvedAt ? [{ label: "Resolved", value: new Date(ticket.resolvedAt).toLocaleString() }] : []),
              ].map(({ label, value }) => (
                <div key={label}>
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="text-sm text-foreground font-medium mt-0.5 break-all">{value}</dd>
                </div>
              ))}
            </dl>
            {/* ClickUp task link */}
            {ticket.clickupTaskId && (
              <div className="mt-4 pt-4 border-t border-border/50">
                <a
                  href={`https://app.clickup.com/t/${ticket.clickupTaskId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-violet-600 hover:text-violet-700 hover:underline font-medium"
                >
                  <Zap className="w-4 h-4" />
                  View in ClickUp
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>

          {/* Activity Log */}
          <div className="bg-white rounded-xl border border-border/60 shadow-sm p-5">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Activity Log
            </h3>

            {!activity || activity.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Clock className="w-8 h-8 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Events will appear here as the ticket progresses.</p>
              </div>
            ) : (
              <ol className="relative border-l border-border/40 ml-3 space-y-0">
                {activity.map((item, idx): JSX.Element => {
                  let meta: Record<string, unknown> | null = null;
                  try { meta = item.meta ? (JSON.parse(item.meta) as Record<string, unknown>) : null; } catch { /* ignore */ }
                  const isLast = idx === activity.length - 1;
                  const preview = item.event === "note.added" && meta?.preview ? String(meta.preview) : null;
                  return (
                    <li key={item.id} className={`ml-5 ${isLast ? "pb-0" : "pb-5"}`}>
                      <span className={`absolute -left-[1.1rem] flex items-center justify-center w-7 h-7 rounded-full ring-4 ring-white ${activityColor(item.event as ActivityEvent)}`}>
                        <ActivityIcon event={item.event as ActivityEvent} />
                      </span>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-3">
                        <p className="text-sm text-foreground leading-snug">
                          {activityLabel(item.event as ActivityEvent, meta, item.actorName ?? null)}
                        </p>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(item.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {preview && (
                        <p className="text-xs text-muted-foreground mt-1 italic truncate max-w-sm">
                          &ldquo;{preview}{preview.length >= 80 ? "…" : ""}&rdquo;
                        </p>
                      )}
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
