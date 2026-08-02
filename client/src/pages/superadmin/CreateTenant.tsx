import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ArrowLeft, Building2, Globe, Key, Lock, User, Webhook } from "lucide-react";
import { Link } from "wouter";

const schema = z.object({
  name: z.string().min(1, "Company name is required"),
  slug: z.string().min(1).max(63).regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only"),
  adminName: z.string().min(1, "Admin name is required"),
  adminEmail: z.string().email("Valid email required"),
  adminPassword: z.string().min(8, "Password must be at least 8 characters"),
  ghlWebhookUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  ghlApiKey: z.string().optional(),
  logoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  internalNotes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function CreateTenant() {
  const [, navigate] = useLocation();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const createTenant = trpc.tenants.create.useMutation({
    onSuccess: (data) => {
      toast.success(`Client "${data.tenant.name}" created successfully!`);
      navigate("/superadmin/tenants");
    },
    onError: (e) => toast.error(e.message),
  });

  // Auto-generate slug from company name
  const slugValue = watch("slug") || "";
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue("name", val);
    const slug = val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    setValue("slug", slug);
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    setValue("slug", formatted, { shouldValidate: true });
    e.target.value = formatted;
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <Link href="/superadmin/tenants">
          <Button variant="ghost" size="sm" className="gap-2 mb-4 -ml-2">
            <ArrowLeft className="w-4 h-4" /> Back to Clients
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Add New Client</h1>
        <p className="text-muted-foreground mt-1">Create a new tenant workspace with their admin account and GHL integration</p>
      </div>

      <form onSubmit={handleSubmit(d => createTenant.mutate(d))} className="space-y-6">
        {/* Company Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Building2 className="w-4 h-4" />Company Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Company Name *</Label>
                <Input
                  placeholder="Acme Corp"
                  {...register("name")}
                  onChange={handleNameChange}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Subdomain Slug *</Label>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="acme"
                    {...register("slug")}
                    onChange={handleSlugChange}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Portal URL: <span className="font-medium text-foreground">https://{slugValue || "[slug]"}.aia-supportdesk.com</span>
                </p>
                {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Logo URL (optional)</Label>
              <Input placeholder="https://example.com/logo.png" {...register("logoUrl")} />
              {errors.logoUrl && <p className="text-sm text-destructive">{errors.logoUrl.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Internal Notes (only you see this)</Label>
              <Textarea placeholder="Onboarding notes, special configs, billing notes..." {...register("internalNotes")} rows={3} />
            </div>
          </CardContent>
        </Card>

        {/* Admin Account */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><User className="w-4 h-4" />Client Admin Account</CardTitle>
            <CardDescription>This person will manage their own support team and tickets</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Admin Full Name *</Label>
                <Input placeholder="Jane Smith" {...register("adminName")} />
                {errors.adminName && <p className="text-sm text-destructive">{errors.adminName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Admin Email *</Label>
                <Input type="email" placeholder="jane@acme.com" {...register("adminEmail")} />
                {errors.adminEmail && <p className="text-sm text-destructive">{errors.adminEmail.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Temporary Password *</Label>
              <Input type="password" placeholder="Min. 8 characters" {...register("adminPassword")} />
              {errors.adminPassword && <p className="text-sm text-destructive">{errors.adminPassword.message}</p>}
              <p className="text-xs text-muted-foreground">Share this with the client — they can change it after first login</p>
            </div>
          </CardContent>
        </Card>

        {/* GHL Integration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Webhook className="w-4 h-4" />GoHighLevel Integration (Optional)</CardTitle>
            <CardDescription>Connect their GHL sub-account to enable automated SMS, email, and WhatsApp notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>GHL Webhook URL</Label>
              <Input placeholder="https://services.leadconnectorhq.com/hooks/..." {...register("ghlWebhookUrl")} />
              {errors.ghlWebhookUrl && <p className="text-sm text-destructive">{errors.ghlWebhookUrl.message}</p>}
              <p className="text-xs text-muted-foreground">In GHL: Automations → Webhooks → Create Webhook → copy the URL here</p>
            </div>
            <div className="space-y-2">
              <Label>GHL API Key (optional)</Label>
              <Input type="password" placeholder="API key from GHL sub-account settings" {...register("ghlApiKey")} />
              <p className="text-xs text-muted-foreground">Used for pulling contact data and creating contacts in GHL</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Link href="/superadmin/tenants">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
          <Button type="submit" disabled={createTenant.isPending} className="min-w-32">
            {createTenant.isPending ? "Creating..." : "Create Client"}
          </Button>
        </div>
      </form>
    </div>
  );
}
