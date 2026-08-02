import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { Users, Plus, Trash2, Mail, Loader2, UserCheck } from "lucide-react";
import { toast } from "sonner";
import SuperAdminLayout from "@/components/SuperAdminLayout";

export default function GlobalStaff() {
  const utils = trpc.useUtils();
  const { data: staffList, isLoading } = trpc.staff.listGlobal.useQuery();

  const [addOpen, setAddOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<{ id: number; name: string | null } | null>(null);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addMutation = trpc.staff.addGlobal.useMutation({
    onSuccess: (data) => {
      utils.staff.listGlobal.invalidate();
      toast.success(`${data.staff.name} added to the global staff team`);
      setAddOpen(false);
      setForm({ firstName: "", lastName: "", email: "" });
      setErrors({});
    },
    onError: (e) => toast.error(e.message),
  });

  const removeMutation = trpc.staff.removeGlobal.useMutation({
    onSuccess: () => {
      utils.staff.listGlobal.invalidate();
      toast.success("Staff member removed");
      setRemoveTarget(null);
    },
    onError: (e) => toast.error(e.message),
  });

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.firstName.trim()) errs.firstName = "First name is required";
    if (!form.lastName.trim()) errs.lastName = "Last name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid email address";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAdd = () => {
    if (!validate()) return;
    addMutation.mutate(form);
  };

  const initials = (name: string | null) =>
    (name ?? "?").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <SuperAdminLayout>
      <div className="p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-1">Global Staff</h1>
            <p className="text-muted-foreground text-sm">
              Staff members added here are automatically available across all existing and new client tenants for ticket assignment and notifications.
            </p>
          </div>
          <Button onClick={() => setAddOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Staff Member
          </Button>
        </div>

        {/* Staff list */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Staff Members
              {staffList && (
                <span className="ml-auto text-sm font-normal text-muted-foreground">
                  {staffList.length} member{staffList.length !== 1 ? "s" : ""}
                </span>
              )}
            </CardTitle>
            <CardDescription>
              These staff members receive notifications for all tickets across every tenant and can be assigned to tickets.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : !staffList || staffList.length === 0 ? (
              <div className="text-center py-14 px-6">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                  <UserCheck className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="font-medium text-foreground">No global staff yet</p>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                  Add staff members here and they'll be available across all client tenants automatically.
                </p>
                <Button onClick={() => setAddOpen(true)} variant="outline" className="mt-4 gap-2">
                  <Plus className="w-4 h-4" />
                  Add First Staff Member
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {staffList.map((member) => (
                  <div key={member.id} className="flex items-center gap-4 px-6 py-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-primary">
                        {initials(member.name)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{member.name || "—"}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3" />
                        {member.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full">
                        Global Staff
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                        onClick={() => setRemoveTarget({ id: member.id, name: member.name })}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info box */}
        <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm font-medium text-blue-800 mb-1">How global staff works</p>
          <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
            <li>Staff added here are available for ticket assignment in every client tenant</li>
            <li>They receive email notifications for all new tickets across all tenants</li>
            <li>New tenants you create will automatically include all global staff</li>
            <li>Removing a staff member here removes them from the global pool (tenant-specific staff are unaffected)</li>
          </ul>
        </div>
      </div>

      {/* Add Staff Dialog */}
      <Dialog open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (!o) { setForm({ firstName: "", lastName: "", email: "" }); setErrors({}); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Global Staff Member</DialogTitle>
            <DialogDescription>
              This person will be available for ticket assignment and notifications across all client tenants.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">First Name <span className="text-destructive">*</span></Label>
                <Input
                  id="firstName"
                  placeholder="Jane"
                  value={form.firstName}
                  onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                  className={errors.firstName ? "border-destructive" : ""}
                />
                {errors.firstName && <p className="text-xs text-destructive">{errors.firstName}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Last Name <span className="text-destructive">*</span></Label>
                <Input
                  id="lastName"
                  placeholder="Smith"
                  value={form.lastName}
                  onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                  className={errors.lastName ? "border-destructive" : ""}
                />
                {errors.lastName && <p className="text-xs text-destructive">{errors.lastName}</p>}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
              <Input
                id="email"
                type="email"
                placeholder="jane@yourcompany.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)} disabled={addMutation.isPending}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={addMutation.isPending} className="gap-2">
              {addMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Add Staff Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Confirmation */}
      <AlertDialog open={!!removeTarget} onOpenChange={(o) => { if (!o) setRemoveTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Staff Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{removeTarget?.name}</strong> from the global staff pool?
              They will no longer receive notifications or be available for ticket assignment across tenants.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => removeTarget && removeMutation.mutate({ userId: removeTarget.id })}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SuperAdminLayout>
  );
}

