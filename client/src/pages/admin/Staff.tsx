import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Users } from "lucide-react";
import { toast } from "sonner";

export default function AdminStaff() {
  const utils = trpc.useUtils();
  const { data: staffList, isLoading } = trpc.staff.list.useQuery();
  const { data: currentUser } = trpc.auth.me.useQuery();

  const updateRoleMutation = trpc.staff.updateRole.useMutation({
    onSuccess: () => {
      utils.staff.list.invalidate();
      toast.success("Role updated");
    },
    onError: () => toast.error("Failed to update role"),
  });

  const isAdmin = currentUser?.role === "admin";

  return (
    <AdminLayout title="Staff Management">
      <div className="bg-white rounded-xl border border-border/60 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border/50">
          <p className="text-sm text-muted-foreground">
            Manage support team members and their access levels. Only admins can change roles.
          </p>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : !staffList || staffList.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No staff members yet</p>
            <p className="text-xs text-muted-foreground mt-1">Users with admin or staff roles will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {staffList.map((member) => (
              <div key={member.id} className="flex items-center gap-4 px-6 py-4">
                <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-primary">
                    {(member.name || member.email || "?")[0].toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{member.name || "—"}</p>
                  <p className="text-xs text-muted-foreground">{member.email}</p>
                </div>
                {isAdmin ? (
                  <Select
                    value={member.role}
                    onValueChange={(v) =>
                      updateRoleMutation.mutate({ userId: member.id, role: v as any })
                    }
                    disabled={updateRoleMutation.isPending}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-accent text-accent-foreground font-medium capitalize">
                    {member.role}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

