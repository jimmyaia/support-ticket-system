import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Building2, Send, AlertTriangle, Search, Paperclip, Video, X } from "lucide-react";
import { Link } from "wouter";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  email: z.string().email("Valid email required").max(320),
  phone: z.string().max(30).optional(),
  subject: z.string().min(1, "Subject is required").max(500),
  product: z.string().min(1, "Please select a product").max(255),
  description: z.string().min(10, "Please describe the issue (min 10 characters)").max(10000),
  priority: z.enum(["low", "medium", "high", "urgent"]),
});
const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8 MB (server limit is 10 MB)
type FormData = z.infer<typeof schema>;

interface Props {
  slug: string;
}

export default function TenantPortal({ slug }: Props) {
  const [, navigate] = useLocation();
  const [product, setProduct] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loomUrl, setLoomUrl] = useState("");
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: tenant, isLoading: tenantLoading } = trpc.tickets.getTenantInfoBySlug.useQuery(
    { slug },
    { staleTime: 60_000 }
  );

  const { data: products } = trpc.tickets.getProductsBySlug.useQuery(
    { slug },
    { staleTime: 60_000 }
  );

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { priority: "medium" },
  });

  const submit = trpc.tickets.submit.useMutation({
    onSuccess: (data) => navigate(`/ticket-submitted/${data.ticketNumber}`),
    onError: (e) => toast.error(e.message),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImageError(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setImageError("Only image files are allowed.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setImageError("Image must be under 5 MB.");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async (data: FormData) => {
    if (!tenant) return;
    let imageUrl: string | undefined;

    if (imageFile) {
      try {
        const res = await fetch("/api/upload-ticket-image", {
          method: "POST",
          headers: { "Content-Type": imageFile.type },
          body: imageFile,
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Upload failed");
        }
        const { url } = await res.json();
        imageUrl = url;
      } catch {
        toast.error("Failed to upload image. Please try again.");
        return;
      }
    }

    submit.mutate({
      ...data,
      tenantId: tenant.id,
      loomUrl: loomUrl.trim() || undefined,
      imageUrl,
    });
  };

  // Unknown or inactive tenant
  if (!tenantLoading && !tenant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Portal Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The support portal for <strong>{slug}</strong> could not be found or is currently inactive.
          </p>
          <a href="https://aia-supportdesk.com">
            <Button variant="outline">Go to AIA SupportDesk</Button>
          </a>
        </div>
      </div>
    );
  }

  const isSubmitting = submit.isPending;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b shadow-sm">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {tenantLoading ? (
              <Skeleton className="w-10 h-10 rounded-xl" />
            ) : tenant?.logoUrl ? (
              <img src={tenant.logoUrl} alt={tenant.name} className="w-10 h-10 rounded-xl object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
            )}
            <div>
              {tenantLoading ? (
                <Skeleton className="h-5 w-40" />
              ) : (
                <h1 className="font-semibold text-foreground">{tenant?.name} Support</h1>
              )}
              <p className="text-xs text-muted-foreground">Submit a support ticket</p>
            </div>
          </div>
          <Link href="/status">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
              <Search className="w-4 h-4" />
              Check Ticket Status
            </Button>
          </Link>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-3xl mx-auto px-6 py-10">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Submit a Support Request</CardTitle>
            <CardDescription>
              Fill out the form below and we'll get back to you as soon as possible.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Your Name <span className="text-destructive">*</span></Label>
                  <Input placeholder="Jane Smith" {...register("name")} />
                  {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Email Address <span className="text-destructive">*</span></Label>
                  <Input type="email" placeholder="jane@example.com" {...register("email")} />
                  {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Phone (optional)</Label>
                  <Input placeholder="+1 (555) 000-0000" {...register("phone")} />
                </div>
                <div className="space-y-1.5">
                  <Label>Priority <span className="text-destructive">*</span></Label>
                  <Select value={priority} onValueChange={(v) => { setPriority(v as any); setValue("priority", v as any); }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Subject <span className="text-destructive">*</span></Label>
                <Input placeholder="Brief description of your issue" {...register("subject")} />
                {errors.subject && <p className="text-xs text-destructive">{errors.subject.message}</p>}
              </div>

              {products && products.length > 0 && (
                <div className="space-y-1.5">
                  <Label>Product / Service <span className="text-destructive">*</span></Label>
                  <Select value={product} onValueChange={(v) => { setProduct(v); setValue("product", v); }}>
                    <SelectTrigger><SelectValue placeholder="Select a product..." /></SelectTrigger>
                    <SelectContent>
                      {products.filter(p => p.isActive).map(p => (
                        <SelectItem key={p.id} value={p.label}>{p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.product && <p className="text-xs text-destructive">{errors.product.message}</p>}
                </div>
              )}

              {(!products || products.length === 0) && (
                <input type="hidden" {...register("product")} value="General" />
              )}

              <div className="space-y-1.5">
                <Label>Describe Your Issue <span className="text-destructive">*</span></Label>
                <Textarea
                  placeholder="Please provide as much detail as possible..."
                  rows={5}
                  {...register("description")}
                />
                {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
              </div>

              {/* Attachments section */}
              <div className="border border-border/50 rounded-xl p-4 space-y-4 bg-muted/20">
                <p className="text-sm font-medium text-foreground">Attachments <span className="text-xs text-muted-foreground font-normal">(optional)</span></p>

                {/* Image upload */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5 text-sm">
                    <Paperclip className="w-3.5 h-3.5" />
                    Screenshot / Image
                  </Label>
                  {imagePreview ? (
                    <div className="relative inline-block">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-40 rounded-lg border border-border object-contain"
                      />
                      <button
                        type="button"
                        onClick={clearImage}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-white flex items-center justify-center hover:bg-destructive/80 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div
                      className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Paperclip className="w-5 h-5 text-muted-foreground mx-auto mb-1.5" />
                      <p className="text-sm text-muted-foreground">Click to upload a screenshot</p>
                      <p className="text-xs text-muted-foreground/60 mt-0.5">PNG, JPG, GIF up to 5 MB</p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  {imageError && <p className="text-xs text-destructive">{imageError}</p>}
                </div>

                {/* Loom URL */}
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5 text-sm">
                    <Video className="w-3.5 h-3.5" />
                    Loom Video URL
                  </Label>
                  <Input
                    placeholder="https://www.loom.com/share/..."
                    value={loomUrl}
                    onChange={(e) => setLoomUrl(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Paste a Loom link to include a screen recording with your ticket.</p>
                </div>
              </div>

              <Button type="submit" disabled={isSubmitting || tenantLoading || !tenant} className="w-full gap-2">
                <Send className="w-4 h-4" />
                {isSubmitting ? "Submitting..." : "Submit Ticket"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>

      <footer className="text-center py-6 text-xs text-muted-foreground">
        Powered by <a href="https://aia-supportdesk.com" className="underline hover:text-foreground">AIA SupportDesk</a>
      </footer>
    </div>
  );
}
