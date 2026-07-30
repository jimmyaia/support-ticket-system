import { getStatusConfig, getPriorityConfig } from "@/lib/ticketUtils";

export function StatusBadge({ status }: { status: string }) {
  const config = getStatusConfig(status);
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.badgeClass}`}>
      {config.label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  const config = getPriorityConfig(priority);
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.badgeClass}`}>
      {config.label}
    </span>
  );
}

