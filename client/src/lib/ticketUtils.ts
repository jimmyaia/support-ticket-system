export const STATUS_CONFIG = {
  new: { label: "New", badgeClass: "bg-blue-50 text-blue-700 border-blue-200" },
  in_progress: { label: "In Progress", badgeClass: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  stuck: { label: "Stuck", badgeClass: "bg-red-50 text-red-700 border-red-200" },
  completed: { label: "Completed", badgeClass: "bg-green-50 text-green-700 border-green-200" },
  closed: { label: "Closed", badgeClass: "bg-slate-100 text-slate-600 border-slate-200" },
} as const;

export const PRIORITY_CONFIG = {
  low: { label: "Low", badgeClass: "bg-green-50 text-green-700 border-green-200" },
  medium: { label: "Medium", badgeClass: "bg-blue-50 text-blue-700 border-blue-200" },
  high: { label: "High", badgeClass: "bg-orange-50 text-orange-700 border-orange-200" },
  urgent: { label: "Urgent", badgeClass: "bg-red-50 text-red-700 border-red-200" },
} as const;

export type TicketStatus = keyof typeof STATUS_CONFIG;
export type TicketPriority = keyof typeof PRIORITY_CONFIG;

export function getStatusConfig(status: string) {
  return STATUS_CONFIG[status as TicketStatus] ?? { label: status, badgeClass: "bg-gray-100 text-gray-600 border-gray-200" };
}

export function getPriorityConfig(priority: string) {
  return PRIORITY_CONFIG[priority as TicketPriority] ?? { label: priority, badgeClass: "bg-gray-100 text-gray-600 border-gray-200" };
}
