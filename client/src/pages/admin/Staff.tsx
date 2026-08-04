import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Users, Plus, Trash2, Eye, EyeOff, Mail, ShieldCheck, UserCog } from "lucide-react";
import { toast } from "sonner";

const ROLE_LABELS: Record<string, string> = { admin: "Admin", staff: "Staff", user: "User" };
const ROLE_COLORS: Record<string, string> = {
  admin: "bg-violet-100 text-violet-700",
  staff: "bg-blue-100 text-blue-700",
  user: "bg-slate-100 text-slate-600",
};

export default function AdminStaff() {
  const utils = trpc.useUtils();
  const { data: staffList, isLoading } = trpc.staff.list.useQuery();
  const { data: currentUser } = trpc.auth.me.useQuery();
  const isAdmin = currentUser?.role === "admin";

  const [addOpen, setAddOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", role: "staff" as "staff" | "admin" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string | null } | null>(null);

  const addMutation = trpc.staff.addToTenant.useMutation({
    onSuccess: (data) => {
      utils.staff.list.invalidate();
      toast.success(`${data.user.name} has been added to your team`);
      setAddOpen(false);
      setForm({ firstName: "", lastName: "", email: "", password: "", role: "staff" });
      setErrors({});
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.staff.removeFromTenant.useMutation({
    onSuccess: () => {
      utils.staff.list.invalidate();
      toast.success("Team member removed");
      setDeleteTarget(null);
    },
    onError: (e) => toast.error(e.message),
  });

  const updateRoleMutation = trpc.staff.updateRole.useMutation({
    onSuccess: () => { utils.staff.list.invalidate(); toast.success("Role updated"); },
    onError: () => toast.error("Failed to update role"),
  });

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.firstName.trim()) errs.firstName = "First name is required";
    if (!form.lastName.trim()) errs.lastName = "Last name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid email";
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 8) errs.password = "Minimum 8 characters";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const initials = (name: string | null, email: string | null) =>
    name ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : (email ?? "?")[0].toUpperCase();

  return (
    <AdminLayout title="Staff Management">
      <div className="bg-white rounded-xl border border-border/60 shadow-sm overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-border/50 flex flex-col sm:flex-row sm:items-center gap-3">
          <p className="text-sm text-muted-foreground">Manage your support team. Admins can add, remove, and change roles.</p>
          {isAdmin && (
            <Button onClick={() => setAddOpen(true)} size="sm" className="gap-2">
              <Plus className="w-4 h-4" /> Add Team Member
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : !staffList || staffList.length === 0 ? (
          <div className="text-center py-14 px-6">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="font-medium text-foreground">No team members yet</p>
            <p className="text-sm text-muted-foreground mt-1">Add staff so they can log in and manage tickets.</p>
            {isAdmin && (
              <Button onClick={() => setAddOpen(true)} variant="outline" size="sm" className="mt-4 gap-2">
                <Plus className="w-4 h-4" /> Add First Team Member
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {staffList.map((member) => (
              <div key={member.id} className="flex items-center gap-3 px-4 sm:px-6 py-4 flex-wrap">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-primary">{initials(member.name, member.email)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{member.name || "—"}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Mail className="w-3 h-3" />{member.email}
                  </p>
                </div>
                {isAdmin && member.id !== currentUser?.id ? (
                  <Select
                    value={member.role}
                    onValueChange={(v) => updateRoleMutation.mutate({ userId: member.id, role: v as "user"|"admin"|"staff" })}
                    disabled={updateRoleMutation.isPending}
                  >
                    <SelectTrigger className="w-28 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${ROLE_COLORS[member.role] ?? "bg-slate-100 text-slate-600"}`}>
                    {ROLE_LABELS[member.role] ?? member.role}{member.id === currentUser?.id ? " (you)" : ""}
                  </span>
                )}
                {isAdmin && member.id !== currentUser?.id && (
                  <Button
                    variant="ghost" size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0 ml-1"
                    onClick={() => setDeleteTarget({ id: member.id, name: member.name })}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Team Member Dialog */}
      <Dialog open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (!o) { setForm({ firstName: "", lastName: "", email: "", password: "", role: "staff" }); setErrors({}); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>
              Create login credentials for a new staff member. They can sign in at <strong>/login</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="sa-fn">First Name <span className="text-destructive">*</span></Label>
                <Input id="sa-fn" placeholder="Jane" value={form.firstName}
                  onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                  className={errors.firstName ? "border-destructive" : ""} />
                {errors.firstName && <p className="text-xs text-destructive">{errors.firstName}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sa-ln">Last Name <span className="text-destructive">*</span></Label>
                <Input id="sa-ln" placeholder="Smith" value={form.lastName}
                  onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                  className={errors.lastName ? "border-destructive" : ""} />
                {errors.lastName && <p className="text-xs text-destructive">{errors.lastName}</p>}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sa-email">Email <span className="text-destructive">*</span></Label>
              <Input id="sa-email" type="email" placeholder="jane@company.com" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className={errors.email ? "border-destructive" : ""} />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sa-pw">Password <span className="text-destructive">*</span></Label>
              <div className="relative">
                <Input id="sa-pw" type={showPassword ? "text" : "password"} placeholder="Min. 8 characters"
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className={`pr-10 ${errors.password ? "border-destructive" : ""}`} />
                <button type="button" onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Role <span className="text-destructive">*</span></Label>
              <Select value={form.role} onValueChange={(v) => setForm(f => ({ ...f, role: v as "staff" | "admin" }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">
                    <div className="flex items-center gap-2">
                      <UserCog className="w-4 h-4 text-blue-500" />
                      <span>Staff — can view and manage tickets</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-violet-500" />
                      <span>Admin — full access including team management</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)} disabled={addMutation.isPending}>Cancel</Button>
            <Button onClick={() => validate() && addMutation.mutate(form)} disabled={addMutation.isPending} className="gap-2">
              {addMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Add Team Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{deleteTarget?.name ?? "this user"}</strong>?
              They will immediately lose access to the admin panel. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && deleteMutation.mutate({ userId: deleteTarget.id })}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
