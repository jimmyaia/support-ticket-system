import { useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Building2, Package, Plus, Trash2, GripVertical, Settings, KeyRound, ChevronDown, ChevronUp } from "lucide-react";

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

const settingsSchema = z.object({
  name: z.string().min(1, "Company name is required").max(255),
  logoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});
type SettingsForm = z.infer<typeof settingsSchema>;

export default function TenantSettings() {
  const { user } = useAuth();
  const tenantId = user?.tenantId ?? null;
  const [newProduct, setNewProduct] = useState("");
  const [draggedProductId, setDraggedProductId] = useState<number | null>(null);
  const hasPassword = !!user?.passwordHash;

  const { data: tenant, isLoading: tenantLoading, refetch: refetchTenant } = trpc.tenants.getMyTenant.useQuery(undefined, {
    enabled: !!tenantId,
  });

  const { data: products, isLoading: productsLoading, refetch: refetchProducts } = trpc.tenants.getProducts.useQuery(
    { tenantId: tenantId ?? 0 },
    { enabled: !!tenantId }
  );

  const updateMyTenant = trpc.tenants.updateMyTenant.useMutation({
    onSuccess: () => { toast.success("Settings saved"); refetchTenant(); },
    onError: (e) => toast.error(e.message),
  });

  const addProduct = trpc.tenants.addProduct.useMutation({
    onSuccess: () => { setNewProduct(""); refetchProducts(); toast.success("Product added"); },
    onError: (e) => toast.error(e.message),
  });

  const updateProduct = trpc.tenants.updateProduct.useMutation({
    onSuccess: () => refetchProducts(),
    onError: (e) => toast.error(e.message),
  });

  const deleteProduct = trpc.tenants.deleteProduct.useMutation({
    onSuccess: () => { refetchProducts(); toast.success("Product removed"); },
    onError: (e) => toast.error(e.message),
  });

  const reorderProducts = trpc.tenants.reorderProducts.useMutation({
    onSuccess: () => { refetchProducts(); toast.success("Product order saved"); },
    onError: (e) => toast.error(e.message),
  });

  const saveProductOrder = (productIds: number[]) => {
    if (!tenantId || reorderProducts.isPending) return;
    reorderProducts.mutate({ tenantId, productIds });
  };

  const moveProduct = (productId: number, direction: -1 | 1) => {
    if (!products) return;
    const sourceIndex = products.findIndex((product) => product.id === productId);
    const targetIndex = sourceIndex + direction;
    if (sourceIndex < 0 || targetIndex < 0 || targetIndex >= products.length) return;
    const reordered = [...products];
    const [movedProduct] = reordered.splice(sourceIndex, 1);
    reordered.splice(targetIndex, 0, movedProduct);
    saveProductOrder(reordered.map((product) => product.id));
  };

  const handleProductDrop = (targetProductId: number) => {
    if (!products || draggedProductId === null || draggedProductId === targetProductId) return;
    const sourceIndex = products.findIndex((product) => product.id === draggedProductId);
    const targetIndex = products.findIndex((product) => product.id === targetProductId);
    if (sourceIndex < 0 || targetIndex < 0) return;
    const reordered = [...products];
    const [movedProduct] = reordered.splice(sourceIndex, 1);
    reordered.splice(targetIndex, 0, movedProduct);
    setDraggedProductId(null);
    saveProductOrder(reordered.map((product) => product.id));
  };

  const {
    register: regPwd,
    handleSubmit: handlePwdSubmit,
    reset: resetPwd,
    formState: { errors: pwdErrors },
  } = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  const setPassword = trpc.auth.setPassword.useMutation({
    onSuccess: () => {
      toast.success(hasPassword ? "Password updated successfully" : "Password set — you can now log in with email/password");
      resetPwd();
    },
    onError: (e) => toast.error(e.message),
  });

  const onSetPassword = (data: PasswordForm) => {
    setPassword.mutate({ newPassword: data.newPassword, currentPassword: data.currentPassword });
  };

  const { register, handleSubmit, formState: { errors } } = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    values: tenant ? { name: tenant.name, logoUrl: tenant.logoUrl ?? "" } : undefined,
  });

  const onSave = (data: SettingsForm) => {
    updateMyTenant.mutate({ name: data.name, logoUrl: data.logoUrl || "" });
  };

  if (!tenantId) {
    return (
      <AdminLayout title="Tenant Settings">
        <div className="max-w-2xl mx-auto text-center py-16 text-muted-foreground">
          <Settings className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>Tenant settings are only available for tenant admin accounts.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Tenant Settings">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Branding */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Company Branding
            </CardTitle>
            <CardDescription>
              Update your company name and logo. These appear on your support portal.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tenantLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSave)} className="space-y-4">
                <div className="flex items-center gap-4 mb-4">
                  {tenant?.logoUrl ? (
                    <img src={tenant.logoUrl} alt={tenant.name} className="w-14 h-14 rounded-xl object-cover border" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Building2 className="w-7 h-7 text-primary" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-foreground">{tenant?.name}</p>
                    <p className="text-xs text-muted-foreground">https://{tenant?.slug}.aia-supportdesk.com</p>
                    <Badge variant={tenant?.isActive ? "default" : "secondary"} className="text-xs mt-1">
                      {tenant?.isActive ? "Active" : "Suspended"}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Company Name <span className="text-destructive">*</span></Label>
                    <Input id="name" {...register("name")} className={errors.name ? "border-destructive" : ""} />
                    {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="logoUrl">Logo URL</Label>
                    <Input id="logoUrl" placeholder="https://example.com/logo.png" {...register("logoUrl")} className={errors.logoUrl ? "border-destructive" : ""} />
                    {errors.logoUrl && <p className="text-xs text-destructive">{errors.logoUrl.message}</p>}
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <Button type="submit" disabled={updateMyTenant.isPending}>
                    {updateMyTenant.isPending ? "Saving..." : "Save Branding"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Product Dropdown */}

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="w-5 h-5" />
              {hasPassword ? "Change Password" : "Set a Password"}
            </CardTitle>
            <CardDescription>
              {hasPassword
                ? "Update your login password. You'll need your current password to make changes."
                : "Set a password so you can log in with your email address in addition to Google."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePwdSubmit(onSetPassword)} className="space-y-4 max-w-md">
              {hasPassword && (
                <div className="space-y-1.5">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" {...regPwd("currentPassword")} />
                  {pwdErrors.currentPassword && <p className="text-xs text-destructive">{pwdErrors.currentPassword.message}</p>}
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" {...regPwd("newPassword")} />
                {pwdErrors.newPassword && <p className="text-xs text-destructive">{pwdErrors.newPassword.message}</p>}
                <p className="text-xs text-muted-foreground">Min 8 characters, 1 uppercase letter, 1 number.</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" {...regPwd("confirmPassword")} />
                {pwdErrors.confirmPassword && <p className="text-xs text-destructive">{pwdErrors.confirmPassword.message}</p>}
              </div>
              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={setPassword.isPending}>
                  {setPassword.isPending ? "Saving..." : hasPassword ? "Update Password" : "Set Password"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Product / Service Dropdown
            </CardTitle>
            <CardDescription>
              These options appear in the "Which product are you having trouble with?" dropdown on your customer ticket form.
              Drag to reorder, or use the arrow controls on mobile. Toggle to show or hide without deleting.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Add new product */}
            <div className="flex gap-2 mb-6">
              <Input
                placeholder="Add a product or service name..."
                value={newProduct}
                onChange={e => setNewProduct(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && newProduct.trim() && tenantId) {
                    e.preventDefault();
                    addProduct.mutate({ tenantId, label: newProduct.trim(), sortOrder: products?.length ?? 0 });
                  }
                }}
              />
              <Button
                onClick={() => {
                  if (newProduct.trim() && tenantId) {
                    addProduct.mutate({ tenantId, label: newProduct.trim(), sortOrder: products?.length ?? 0 });
                  }
                }}
                disabled={addProduct.isPending || !newProduct.trim()}
                className="gap-2"
              >
                <Plus className="w-4 h-4" /> Add
              </Button>
            </div>

            {/* Product list */}
            {productsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : !products || products.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p>No products added yet. Add your first product above.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {products.map((product, idx) => (
                  <div
                    key={product.id}
                    draggable={!reorderProducts.isPending}
                    onDragStart={() => setDraggedProductId(product.id)}
                    onDragEnd={() => setDraggedProductId(null)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => handleProductDrop(product.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${draggedProductId === product.id ? "opacity-40 border-primary" : ""} ${!product.isActive ? "opacity-50" : ""}`}
                  >
                    <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" aria-hidden="true" />
                    <span className="flex-1 font-medium text-sm">{product.label}</span>
                    <div className="flex items-center gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7"
                        aria-label={`Move ${product.label} up`}
                        onClick={() => moveProduct(product.id, -1)}
                        disabled={idx === 0 || reorderProducts.isPending}
                      >
                        <ChevronUp className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7"
                        aria-label={`Move ${product.label} down`}
                        onClick={() => moveProduct(product.id, 1)}
                        disabled={idx === products.length - 1 || reorderProducts.isPending}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </div>
                    <Badge variant="outline" className="text-xs">#{idx + 1}</Badge>
                    <Switch
                      checked={product.isActive}
                      onCheckedChange={v => updateProduct.mutate({ id: product.id, isActive: v })}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 text-destructive hover:bg-destructive/10"
                      onClick={() => deleteProduct.mutate({ id: product.id })}
                      disabled={deleteProduct.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
