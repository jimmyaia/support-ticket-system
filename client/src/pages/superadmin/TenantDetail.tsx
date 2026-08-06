import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
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
  GripVertical, CheckCircle2, XCircle, Send,
  StickyNote, Settings, Eye
} from "lucide-react";
import { ExternalLink, Zap } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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
    ghlLocationId?: string;
    ghlPipelineId?: string;
    ghlStageNew?: string;
    ghlStageInProgress?: string;
    ghlStageStuck?: string;
    ghlStageCompleted?: string;
    ghlStageClosed?: string;
    ghlSendEmail?: boolean;
    ghlSendSms?: boolean;
    ghlFieldTicketNumber?: string;
    ghlFieldDescription?: string;
    ghlFieldPriority?: string;
    ghlFieldProduct?: string;
    ghlFieldStatus?: string;
    ghlFieldTicketUrl?: string;
    ghlFieldLoomUrl?: string;
  }>({
    ghlFieldTicketNumber: "",
    ghlFieldDescription: "",
    ghlFieldPriority: "",
    ghlFieldProduct: "",
    ghlFieldStatus: "",
    ghlFieldTicketUrl: "",
    ghlFieldLoomUrl: "",
  });


  const [pipelineData, setPipelineData] = useState<{ id: string; name: string; stages: { id: string; name: string }[] }[]>([]);
  const [fetchingPipelines, setFetchingPipelines] = useState(false);
  const getPipelines = trpc.tenants.getGhlPipelines.useQuery(
    { tenantId },
    { enabled: false }
  );
  const saveGhlConfig = trpc.tenants.saveGhlConfig.useMutation({
    onSuccess: () => { toast.success("GHL pipeline config saved"); refetch(); },
    onError: (e) => toast.error(e.message),
  });
  const handleFetchPipelines = async () => {
    setFetchingPipelines(true);
    try {
      const result = await getPipelines.refetch();
      if (result.data?.pipelines) {
        setPipelineData(result.data.pipelines);
        toast.success(`Loaded ${result.data.pipelines.length} pipeline(s) from GHL`);
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to fetch pipelines");
    } finally {
      setFetchingPipelines(false);
    }
  };
  const selectedPipeline = pipelineData.find(p => p.id === (ghlForm.ghlPipelineId ?? data?.tenant?.ghlPipelineId));
  const stageOptions = selectedPipeline?.stages ?? [];

  const [settingsForm, setSettingsForm] = useState<{
    name?: string;
    logoUrl?: string;
    internalNotes?: string;
  }>({});
  const [slugValue, setSlugValue] = useState<string>("");
  // currentSlug computed after tenant is available (see below)

  // ClickUp integration state
  const [clickupApiKey, setClickupApiKey] = useState("");
  const [clickupListId, setClickupListId] = useState("");
  const [clickupWebhookSecret, setClickupWebhookSecret] = useState("");
  const [clickupTesting, setClickupTesting] = useState(false);
  const saveClickUpConfig = trpc.tenants.saveClickUpConfig.useMutation({
    onSuccess: () => { toast.success("ClickUp config saved"); refetch(); },
    onError: (e) => toast.error(e.message),
  });
  const testClickUpConn = trpc.tenants.testClickUpConnection.useMutation({
    onSuccess: (r) => r.ok ? toast.success(`ClickUp connected ✓ — List: "${r.listName}"`) : toast.error(`ClickUp test failed: ${r.error}`),
    onError: (e) => toast.error(e.message),
  });

  const startImpersonation = trpc.tenants.startImpersonation.useMutation({
    onSuccess: (data) => {
      toast.success(`Now viewing as ${data.tenantName}`);
      window.location.href = "/admin";
    },
    onError: (e) => toast.error(e.message),
  });

  // Sync saved GHL custom field keys from DB into controlled form state on load
  useEffect(() => {
    if (!data?.tenant) return;
    const t = data.tenant;
    setGhlForm(p => ({
      ...p,
      ghlFieldTicketNumber: t.ghlFieldTicketNumber ?? "",
      ghlFieldDescription: t.ghlFieldDescription ?? "",
      ghlFieldPriority: t.ghlFieldPriority ?? "",
      ghlFieldProduct: t.ghlFieldProduct ?? "",
      ghlFieldStatus: t.ghlFieldStatus ?? "",
      ghlFieldTicketUrl: t.ghlFieldTicketUrl ?? "",
      ghlFieldLoomUrl: t.ghlFieldLoomUrl ?? "",
    }));
    if (t.clickupApiKey) setClickupApiKey(t.clickupApiKey);
    if (t.clickupListId) setClickupListId(t.clickupListId);
    if ((t as any).clickupWebhookSecret) setClickupWebhookSecret((t as any).clickupWebhookSecret);
  }, [data?.tenant?.id]);

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
              <p className="text-muted-foreground text-sm">https://{tenant.slug}.aia-supportdesk.com</p>
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
          <TabsTrigger value="clickup" className="gap-2"><Zap className="w-4 h-4" />ClickUp</TabsTrigger>
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
                  Portal URL: <span className="font-medium text-foreground">https://{currentSlug}.aia-supportdesk.com</span>
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
                  <Label>API Key</Label>
                  <Input
                    type="password"
                    defaultValue={tenant.ghlApiKey ?? ""}
                    placeholder="GHL sub-account API key"
                    onChange={e => setGhlForm(p => ({ ...p, ghlApiKey: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Location ID</Label>
                  <Input
                    defaultValue={tenant.ghlLocationId ?? ""}
                    placeholder="GHL sub-account location ID"
                    onChange={e => setGhlForm(p => ({ ...p, ghlLocationId: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">Found in GHL: Settings → Business Profile → Location ID</p>
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

            {/* GHL Pipeline & Stage Mapping */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  Pipeline & Stage Mapping
                </CardTitle>
                <CardDescription>
                  Map each ticket status to a GHL opportunity stage. Save the API key and Location ID above first, then click "Fetch Pipelines".
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={handleFetchPipelines}
                    disabled={fetchingPipelines || (!tenant.ghlApiKey && !ghlForm.ghlApiKey) || (!tenant.ghlLocationId && !ghlForm.ghlLocationId)}
                    className="gap-2"
                  >
                    {fetchingPipelines ? "Fetching..." : "Fetch Pipelines from GHL"}
                  </Button>
                  {pipelineData.length > 0 && (
                    <span className="text-xs text-emerald-600 font-medium">{pipelineData.length} pipeline(s) loaded</span>
                  )}
                </div>
                {pipelineData.length > 0 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Pipeline</Label>
                      <select
                        className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                        value={ghlForm.ghlPipelineId ?? tenant.ghlPipelineId ?? ""}
                        onChange={e => setGhlForm(p => ({ ...p, ghlPipelineId: e.target.value, ghlStageNew: undefined, ghlStageInProgress: undefined, ghlStageStuck: undefined, ghlStageCompleted: undefined, ghlStageClosed: undefined }))}
                      >
                        <option value="">Select a pipeline...</option>
                        {pipelineData.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                    {stageOptions.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-sm font-medium">Stage Mapping</p>
                        {[
                          { key: "ghlStageNew" as const, dbKey: "ghlStageNew", label: "New", color: "bg-blue-500/10 text-blue-700" },
                          { key: "ghlStageInProgress" as const, dbKey: "ghlStageInProgress", label: "In Progress", color: "bg-yellow-500/10 text-yellow-700" },
                          { key: "ghlStageStuck" as const, dbKey: "ghlStageStuck", label: "Stuck", color: "bg-red-500/10 text-red-700" },
                          { key: "ghlStageCompleted" as const, dbKey: "ghlStageCompleted", label: "Completed", color: "bg-emerald-500/10 text-emerald-700" },
                          { key: "ghlStageClosed" as const, dbKey: "ghlStageClosed", label: "Closed", color: "bg-gray-500/10 text-gray-700" },
                        ].map(({ key, dbKey, label, color }) => (
                          <div key={key} className="flex items-center gap-3">
                            <span className={`text-xs font-semibold px-2 py-1 rounded w-28 text-center ${color}`}>{label}</span>
                            <select
                              className="flex-1 border rounded-md px-3 py-2 text-sm bg-background"
                              value={ghlForm[key] ?? (tenant[dbKey as keyof typeof tenant] as string) ?? ""}
                              onChange={e => setGhlForm(p => ({ ...p, [key]: e.target.value }))}
                            >
                              <option value="">— No stage —</option>
                              {stageOptions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                          </div>
                        ))}
                      </div>
                    )}
                    <Separator />
                    <div>
                      <p className="text-sm font-medium mb-3">Notification Channels</p>
                      <div className="space-y-3">
                        {[
                          { key: "ghlSendEmail" as const, dbKey: "ghlSendEmail", label: "Send Email via GHL", desc: "Sends an email to the customer on every status change" },
                          { key: "ghlSendSms" as const, dbKey: "ghlSendSms", label: "Send SMS via GHL", desc: "Sends an SMS to the customer on every status change (requires phone number)" },
                        ].map(({ key, dbKey, label, desc }) => (
                          <div key={key} className="flex items-center justify-between p-3 rounded-lg border">
                            <div>
                              <p className="text-sm font-medium">{label}</p>
                              <p className="text-xs text-muted-foreground">{desc}</p>
                            </div>
                            <Switch
                            defaultChecked={(tenant[dbKey as keyof typeof tenant] as boolean) ?? true}
                              onCheckedChange={v => setGhlForm(p => ({ ...p, [key]: v }))}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-end pt-2">
                      <Button
                        onClick={() => {
                          const cfg = {
                            tenantId,
                            ghlApiKey: ghlForm.ghlApiKey ?? tenant.ghlApiKey ?? "",
                            ghlLocationId: ghlForm.ghlLocationId ?? tenant.ghlLocationId ?? "",
                            ghlPipelineId: ghlForm.ghlPipelineId ?? tenant.ghlPipelineId ?? "",
                            ghlStageNew: ghlForm.ghlStageNew ?? tenant.ghlStageNew ?? undefined,
                            ghlStageInProgress: ghlForm.ghlStageInProgress ?? tenant.ghlStageInProgress ?? undefined,
                            ghlStageStuck: ghlForm.ghlStageStuck ?? tenant.ghlStageStuck ?? undefined,
                            ghlStageCompleted: ghlForm.ghlStageCompleted ?? tenant.ghlStageCompleted ?? undefined,
                            ghlStageClosed: ghlForm.ghlStageClosed ?? tenant.ghlStageClosed ?? undefined,
                            ghlSendEmail: ghlForm.ghlSendEmail ?? tenant.ghlSendEmail ?? true,
                            ghlSendSms: ghlForm.ghlSendSms ?? tenant.ghlSendSms ?? true,
                          };
                          if (!cfg.ghlApiKey || !cfg.ghlLocationId || !cfg.ghlPipelineId) {
                            toast.error("API key, Location ID, and Pipeline are required");
                            return;
                          }
                          saveGhlConfig.mutate(cfg);
                        }}
                        disabled={saveGhlConfig.isPending}
                      >
                        {saveGhlConfig.isPending ? "Saving..." : "Save Pipeline Config"}
                      </Button>
                    </div>
                  </div>
                )}
                {pipelineData.length === 0 && (tenant.ghlPipelineId) && (
                  <div className="p-3 rounded-lg border bg-muted/40 text-sm text-muted-foreground">
                    Pipeline already configured (ID: {tenant.ghlPipelineId}). Click "Fetch Pipelines" to update the mapping.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* GHL Opportunity Custom Field Keys */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Opportunity Custom Field Keys</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Enter the GHL custom field IDs for each piece of ticket data to push into the opportunity.
                  Find these in GHL: Settings → Custom Fields → Opportunities. Leave blank to skip that field.
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {([
                  { key: "ghlFieldTicketNumber", label: "Ticket Number" },
                  { key: "ghlFieldDescription", label: "Issue Description" },
                  { key: "ghlFieldPriority", label: "Priority" },
                  { key: "ghlFieldProduct", label: "Product / Service" },
                  { key: "ghlFieldStatus", label: "Ticket Status" },
                  { key: "ghlFieldTicketUrl", label: "Ticket Status URL" },
                  { key: "ghlFieldLoomUrl", label: "Loom Video URL" },
                ] as { key: keyof typeof ghlForm; label: string }[]).map(({ key, label }) => (
                  <div key={key} className="grid grid-cols-2 gap-3 items-center">
                    <Label className="text-xs">{label}</Label>
                    <Input
                      className="h-8 text-xs"
                      placeholder="GHL custom field ID"
                      value={(ghlForm[key] as string) ?? ""}
                      onChange={e => setGhlForm(p => ({ ...p, [key]: e.target.value }))}
                    />
                  </div>
                ))}
                <div className="pt-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      saveGhlConfig.mutate({
                        tenantId,
                        ghlApiKey: ghlForm.ghlApiKey ?? tenant.ghlApiKey ?? "",
                        ghlLocationId: ghlForm.ghlLocationId ?? tenant.ghlLocationId ?? "",
                        ghlPipelineId: ghlForm.ghlPipelineId ?? tenant.ghlPipelineId ?? "",
                        ghlSendEmail: ghlForm.ghlSendEmail ?? tenant.ghlSendEmail ?? true,
                        ghlSendSms: ghlForm.ghlSendSms ?? tenant.ghlSendSms ?? true,
                        ghlFieldTicketNumber: ghlForm.ghlFieldTicketNumber ?? tenant.ghlFieldTicketNumber ?? "",
                        ghlFieldDescription: ghlForm.ghlFieldDescription ?? tenant.ghlFieldDescription ?? "",
                        ghlFieldPriority: ghlForm.ghlFieldPriority ?? tenant.ghlFieldPriority ?? "",
                        ghlFieldProduct: ghlForm.ghlFieldProduct ?? tenant.ghlFieldProduct ?? "",
                        ghlFieldStatus: ghlForm.ghlFieldStatus ?? tenant.ghlFieldStatus ?? "",
                        ghlFieldTicketUrl: ghlForm.ghlFieldTicketUrl ?? tenant.ghlFieldTicketUrl ?? "",
                        ghlFieldLoomUrl: ghlForm.ghlFieldLoomUrl ?? tenant.ghlFieldLoomUrl ?? "",
                      });
                    }}
                    disabled={saveGhlConfig.isPending}
                  >
                    {saveGhlConfig.isPending ? "Saving..." : "Save Custom Field Keys"}
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
                  statusPageUrl: `https://${tenant.slug}.aia-supportdesk.com/status?ticket=TKT-M3X7K2A-9FZ`,
                }, null, 2)}</pre>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Product Dropdown Tab */}
        <TabsContent value="products">
        {/* ClickUp Integration Tab */}
        <TabsContent value="clickup">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-violet-500" />
                ClickUp Integration
                {tenant.clickupListId
                  ? <Badge className="bg-violet-500/10 text-violet-700 border-violet-200">Configured</Badge>
                  : <Badge variant="outline">Not Configured</Badge>
                }
              </CardTitle>
              <CardDescription>
                When a new ticket is submitted, a task is automatically created in the specified ClickUp list.
                Enter your Personal API Token and the List ID where tasks should land.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {tenant.clickupListId && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-violet-600 shrink-0" />
                  <span className="text-violet-700 dark:text-violet-300">
                    ClickUp is configured. List ID: <span className="font-mono font-semibold">{tenant.clickupListId}</span>
                  </span>
                </div>
              )}
              <div className="space-y-2">
                <Label>Personal API Token</Label>
                <Input
                  type="password"
                  placeholder="pk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={clickupApiKey}
                  onChange={e => setClickupApiKey(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Find your token at{" "}
                  <a href="https://app.clickup.com/settings/apps" target="_blank" rel="noopener noreferrer" className="underline text-primary inline-flex items-center gap-0.5">
                    ClickUp → Settings → Apps <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
              </div>
              <div className="space-y-2">
                <Label>List ID</Label>
                <Input
                  placeholder="e.g. 901234567890"
                  value={clickupListId}
                  onChange={e => setClickupListId(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Open the target list in ClickUp → click the "…" menu → "Copy link". The numeric ID is the last segment of the URL.
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  disabled={!clickupApiKey || !clickupListId || testClickUpConn.isPending || clickupTesting}
                  onClick={async () => {
                    setClickupTesting(true);
                    try {
                      await testClickUpConn.mutateAsync({ apiKey: clickupApiKey, listId: clickupListId });
                    } finally {
                      setClickupTesting(false);
                    }
                  }}
                >
                  {clickupTesting ? "Testing…" : "Test Connection"}
                </Button>
                <Button
                  disabled={!clickupApiKey || !clickupListId || saveClickUpConfig.isPending}
                  onClick={() => saveClickUpConfig.mutate({ tenantId, clickupApiKey, clickupListId, ...(clickupWebhookSecret ? { clickupWebhookSecret } : {}) })}
                >
                  {saveClickUpConfig.isPending ? "Saving…" : "Save ClickUp Config"}
                </Button>
              </div>
              <Separator />
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-1">Status Sync — ClickUp → SupportDesk</h4>
                  <p className="text-xs text-muted-foreground mb-3">
                    When you change a task status in ClickUp, it automatically updates the ticket status here.
                    Register the webhook URL below in your ClickUp workspace settings.
                  </p>
                  <div className="space-y-2">
                    <Label>Your Webhook URL (paste this into ClickUp)</Label>
                    <div className="flex gap-2">
                      <Input
                        readOnly
                        value={`https://${tenant.slug}.aia-supportdesk.com/api/webhooks/clickup`}
                        className="font-mono text-xs bg-muted"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(`https://${tenant.slug}.aia-supportdesk.com/api/webhooks/clickup`);
                          toast.success("Webhook URL copied!");
                        }}
                      >
                        Copy
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      In ClickUp: Settings → Integrations → Webhooks → Add Webhook → paste this URL and select the <strong>taskStatusUpdated</strong> event.
                    </p>
                  </div>
                  <div className="space-y-2 mt-4">
                    <Label>Webhook Secret (optional but recommended)</Label>
                    <Input
                      type="password"
                      placeholder="Paste the secret ClickUp shows after creating the webhook"
                      value={clickupWebhookSecret}
                      onChange={e => setClickupWebhookSecret(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      ClickUp shows this secret once when you create the webhook. Paste it here to enable signature verification.
                    </p>
                  </div>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Status mapping</h4>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>ClickUp statuses are mapped automatically:</p>
                  <ul className="list-disc list-inside space-y-0.5 mt-1">
                    <li><strong>complete / done</strong> → Completed</li>
                    <li><strong>in progress</strong> → In Progress</li>
                    <li><strong>stuck</strong> → Stuck</li>
                    <li><strong>close / closed</strong> → Closed</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

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
