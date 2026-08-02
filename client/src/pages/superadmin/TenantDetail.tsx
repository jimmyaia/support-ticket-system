import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useForm } from "react-hook-form";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
  import {
  ArrowLeft, Building2, Webhook, Package, Activity, Plus, Trash2,
  GripVertical, CheckCircle2, XCircle, Clock, Send, ExternalLink,
  AlertTriangle, StickyNote, Settings, Eye
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

export default function TenantDetail() {
  const [, params] = useRoute("/superadmin/tenants/:id");
  const tenantId = parseInt(params?.id ?? "0");
  const [newProduct, setNewProduct] = useState("");

  const { data, isLoading, refetch } = trpc.tenants.getById.useQuery({ id: tenantId });
  const utils = trpc.useUtils();

  const updateTenant = trpc.tenants.update.useMutation({
    onSuccess: () => { toast.success("Settings saved"); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const addProduct = trpc.tenants.addProduct.useMutation({
    onSuccess: () => { setNewProduct(""); refetch(); toast.success("Product added"); },
    onError: (e) => toast.error(e.message),
  });

  const updateProduct = trpc.tenants.updateProduct.useMutation({
    onSuccess: () => { refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const deleteProduct = trpc.tenants.deleteProduct.useMutation({
    onSuccess: () => { refetch(); toast.success("Product removed"); },
    onError: (e) => toast.error(e.message),
  });

  const testWebhook = trpc.tenants.testWebhook.useMutation({
    onSuccess: (r) => r.success ? toast.success("Webhook test successful! ✓") : toast.error(`Webhook test failed: ${r.statusCode ?? r.error}`),
    onError: (e) => toast.error(e.message),
  });

  const [ghlForm, setGhlForm] = useState<{
    ghlWebhookUrl?: string;
    ghlApiKey?: string;
    ghlWebhookNewTicket?: boolean;
    ghlWebhookStatusChange?: boolean;
    ghlWebhookAssignment?: boolean;
  }>({});

  const [settingsForm, setSettingsForm] = useState<{
    name?: string;
    logoUrl?: string;
    internalNotes?: string;
  }>({});
  const [slugValue, setSlugValue] = useState<string>("");
  // currentSlug computed after tenant is available (see below)

  const startImpersonation = trpc.tenants.startImpersonation.useMutation({
    onSuccess: (data) => {
      toast.success(`Now viewing as ${data.tenantName}`);
      window.location.href = "/admin";
    },
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!data) return <div className="p-8">Tenant not found</div>;

  const { tenant, products, webhookLogs } = data;
  const ghlConnected = !!tenant.ghlWebhookUrl;
  const currentSlug = slugValue || tenant.slug;

  const handleSaveSettings = () => {
    const slugToSave = slugValue || tenant?.slug;
    updateTenant.mutate({ id: tenantId, ...settingsForm, ...(slugToSave ? { slug: slugToSave } : {}) });
  };

  const handleSaveGhl = () => {
    updateTenant.mutate({ id: tenantId, ...ghlForm });
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <Link href="/superadmin/tenants">
          <Button variant="ghost" size="sm" className="gap-2 mb-4 -ml-2">
            <ArrowLeft className="w-4 h-4" /> Back to Clients
          </Button>
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {tenant.logoUrl ? (
              <img src={tenant.logoUrl} alt={tenant.name} className="w-12 h-12 rounded-xl object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold">{tenant.name}</h1>
              <p className="text-muted-foreground text-sm">{window.location.origin}/submit?tenantId={tenant.id}</p>
            </div>
          </div>
            <Badge variant={tenant.isActive ? "default" : "secondary"} className="text-sm px-3 py-1">
              {tenant.isActive ? "Active" : "Suspended"}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 ml-2"
              onClick={() => startImpersonation.mutate({ tenantId })}
              disabled={startImpersonation.isPending}
            >
              <Eye className="w-4 h-4" />
              View as Tenant
            </Button>
        </div>
      </div>

      <Tabs defaultValue="settings">
        <TabsList className="mb-6">
          <TabsTrigger value="settings" className="gap-2"><Settings className="w-4 h-4" />Settings</TabsTrigger>
          <TabsTrigger value="ghl" className="gap-2"><Webhook className="w-4 h-4" />GHL Integration</TabsTrigger>
          <TabsTrigger value="products" className="gap-2"><Package className="w-4 h-4" />Product Dropdown</TabsTrigger>
          <TabsTrigger value="logs" className="gap-2"><Activity className="w-4 h-4" />Webhook Logs</TabsTrigger>
        </TabsList>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Tenant Settings</CardTitle>
              <CardDescription>Update company information and internal notes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Company Name</Label>
                    <Input
                      defaultValue={tenant.name}
                      onChange={e => setSettingsForm(p => ({ ...p, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Logo URL</Label>
                    <Input
                      defaultValue={tenant.logoUrl ?? ""}
                      placeholder="https://example.com/logo.png"
                      onChange={e => setSettingsForm(p => ({ ...p, logoUrl: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    Subdomain / Slug
                    <span className="text-xs text-muted-foreground font-normal">(lowercase letters, numbers, hyphens only)</span>
                  </Label>
                  <Input
                    defaultValue={tenant.slug}
                    placeholder="e.g. onetouch"
                    onChange={e => {
                      const formatted = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
                      setSlugValue(formatted);
                      e.target.value = formatted;
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                  Portal URL preview: <span className="font-medium text-foreground">{window.location.origin}/submit?tenantId={tenant.id}</span>
                  </p>
                </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><StickyNote className="w-4 h-4" />Internal Notes (only visible to you)</Label>
                <Textarea
                  defaultValue={tenant.internalNotes ?? ""}
                  placeholder="Onboarding notes, special configs, billing notes, client preferences..."
                  rows={4}
                  onChange={e => setSettingsForm(p => ({ ...p, internalNotes: e.target.value }))}
                />
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={tenant.isActive}
                    onCheckedChange={v => updateTenant.mutate({ id: tenantId, isActive: v })}
                  />
                  <Label>{tenant.isActive ? "Tenant is Active" : "Tenant is Suspended"}</Label>
                </div>
                <Button onClick={handleSaveSettings} disabled={updateTenant.isPending}>
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* GHL Integration Tab */}
        <TabsContent value="ghl">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Webhook className="w-5 h-5" />
                  GoHighLevel Configuration
                  {ghlConnected
                    ? <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-200">Connected</Badge>
                    : <Badge variant="outline">Not Connected</Badge>
                  }
                </CardTitle>
                <CardDescription>
                  Configure the GHL sub-account webhook and API key for this client.
                  Events fire automatically when tickets are submitted, updated, or assigned.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label>Webhook URL</Label>
                  <Input
                    defaultValue={tenant.ghlWebhookUrl ?? ""}
                    placeholder="https://services.leadconnectorhq.com/hooks/..."
                    onChange={e => setGhlForm(p => ({ ...p, ghlWebhookUrl: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">In GHL: Automations → Webhooks → Create Webhook → copy URL here</p>
                </div>
                <div className="space-y-2">
                  <Label>API Key (optional)</Label>
                  <Input
                    type="password"
                    defaultValue={tenant.ghlApiKey ?? ""}
                    placeholder="GHL sub-account API key"
                    onChange={e => setGhlForm(p => ({ ...p, ghlApiKey: e.target.value }))}
                  />
                </div>

                <Separator />

                <div>
                  <p className="text-sm font-medium mb-3">Event Triggers</p>
                  <div className="space-y-3">
                    {[
                      { key: "ghlWebhookNewTicket" as const, label: "New Ticket Submitted", desc: "Fires when a customer submits a new support ticket" },
                      { key: "ghlWebhookStatusChange" as const, label: "Status Changed", desc: "Fires when a ticket status is updated (e.g. In Progress → Completed)" },
                      { key: "ghlWebhookAssignment" as const, label: "Ticket Assigned", desc: "Fires when a ticket is assigned to a staff member" },
                    ].map(({ key, label, desc }) => (
                      <div key={key} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <p className="text-sm font-medium">{label}</p>
                          <p className="text-xs text-muted-foreground">{desc}</p>
                        </div>
                        <Switch
                          defaultChecked={tenant[key] ?? true}
                          onCheckedChange={v => setGhlForm(p => ({ ...p, [key]: v }))}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Button
                    variant="outline"
                    onClick={() => testWebhook.mutate({ tenantId })}
                    disabled={testWebhook.isPending || !tenant.ghlWebhookUrl}
                    className="gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {testWebhook.isPending ? "Sending..." : "Send Test Webhook"}
                  </Button>
                  <Button onClick={handleSaveGhl} disabled={updateTenant.isPending}>
                    Save GHL Settings
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Webhook Payload Reference */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Webhook Payload Reference</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted rounded-lg p-4 overflow-auto">{JSON.stringify({
                  event: "ticket.submitted",
                  tenantId: tenant.id,
                  tenantName: tenant.name,
                  ticket: {
                    number: "TKT-M3X7K2A-9FZ",
                    subject: "Can't access my account",
                    product: "GoHighLevel",
                    priority: "high",
                    status: "new",
                    createdAt: new Date().toISOString(),
                    resolvedAt: null,
                  },
                  customer: { name: "Jane Smith", email: "jane@example.com", phone: "+1-555-0100" },
                  statusPageUrl: `${window.location.origin}/check-status?t=${tenant.slug}&ticket=TKT-M3X7K2A-9FZ`,
                }, null, 2)}</pre>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Product Dropdown Tab */}
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Package className="w-5 h-5" />Product / Service Dropdown</CardTitle>
              <CardDescription>
                These options appear in the "Which product are you having trouble with?" dropdown on the customer ticket form.
                Drag to reorder (coming soon), toggle to hide without deleting.
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
                    if (e.key === "Enter" && newProduct.trim()) {
                      addProduct.mutate({ tenantId, label: newProduct.trim(), sortOrder: products.length });
                    }
                  }}
                />
                <Button
                  onClick={() => {
                    if (newProduct.trim()) addProduct.mutate({ tenantId, label: newProduct.trim(), sortOrder: products.length });
                  }}
                  disabled={addProduct.isPending || !newProduct.trim()}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" /> Add
                </Button>
              </div>

              {/* Product list */}
              {products.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p>No products added yet. Add your first product above.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {products.map((product, idx) => (
                    <div key={product.id} className={`flex items-center gap-3 p-3 rounded-lg border ${!product.isActive ? "opacity-50" : ""}`}>
                      <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                      <span className="flex-1 font-medium">{product.label}</span>
                      <Badge variant="outline" className="text-xs">#{idx + 1}</Badge>
                      <Switch
                        checked={product.isActive}
                        onCheckedChange={v => updateProduct.mutate({ id: product.id, isActive: v })}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => deleteProduct.mutate({ id: product.id })}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Webhook Logs Tab */}
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Activity className="w-5 h-5" />Webhook Delivery Log</CardTitle>
              <CardDescription>Last 20 webhook attempts for this tenant</CardDescription>
            </CardHeader>
            <CardContent>
              {webhookLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p>No webhook events yet. They'll appear here once tickets are submitted.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {webhookLogs.map((log: any) => (
                    <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg border text-sm">
                      {log.success
                        ? <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                        : <XCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                      }
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs font-mono">{log.event}</Badge>
                          {log.statusCode && <span className="text-xs text-muted-foreground">HTTP {log.statusCode}</span>}
                          {log.errorMessage && <span className="text-xs text-destructive">{log.errorMessage}</span>}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 truncate">{log.webhookUrl}</p>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
