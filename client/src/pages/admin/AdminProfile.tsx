import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { UserCircle, KeyRound, Mail } from "lucide-react";

const passwordSchema = z.object({
  currentPassword: z.string().optional(),
  newPassword: z.string()
    .min(8, "Must be at least 8 characters")
    .max(128)
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});
type PasswordForm = z.infer<typeof passwordSchema>;

export default function AdminProfile() {
  const { user } = useAuth();
  const hasPassword = !!user?.passwordHash;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  const setPassword = trpc.auth.setPassword.useMutation({
    onSuccess: () => {
      toast.success(hasPassword ? "Password updated successfully" : "Password set — you can now log in with email and password");
      reset();
    },
    onError: (e) => toast.error(e.message),
  });

  const onSubmit = (data: PasswordForm) => {
    setPassword.mutate({ newPassword: data.newPassword, currentPassword: data.currentPassword });
  };

  return (
    <AdminLayout title="My Profile">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCircle className="w-5 h-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <UserCircle className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{user?.name}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  {user?.email}
                </p>
              </div>
              <Badge variant="outline" className="ml-auto capitalize">{user?.role}</Badge>
            </div>
            <div className="pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground">
                Login method: <span className="font-medium text-foreground capitalize">
                  {user?.loginMethod === "google" ? "Google OAuth" : "Email & Password"}
                </span>
                {user?.loginMethod === "google" && !hasPassword && (
                  <span className="ml-2 text-amber-600">— Set a password below to also enable email login</span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Set / Change Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="w-5 h-5" />
              {hasPassword ? "Change Password" : "Set a Password"}
            </CardTitle>
            <CardDescription>
              {hasPassword
                ? "Update your login password. You'll need your current password to make changes."
                : "You signed in with Google. Set a password to also be able to log in with your email address."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-sm">
              {hasPassword && (
                <div className="space-y-1.5">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" autoComplete="current-password" {...register("currentPassword")} />
                  {errors.currentPassword && <p className="text-xs text-destructive">{errors.currentPassword.message}</p>}
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" autoComplete="new-password" {...register("newPassword")} />
                {errors.newPassword && <p className="text-xs text-destructive">{errors.newPassword.message}</p>}
                <p className="text-xs text-muted-foreground">Min 8 characters, 1 uppercase letter, 1 number.</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" autoComplete="new-password" {...register("confirmPassword")} />
                {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
              </div>
              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={setPassword.isPending}>
                  {setPassword.isPending ? "Saving..." : hasPassword ? "Update Password" : "Set Password"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
