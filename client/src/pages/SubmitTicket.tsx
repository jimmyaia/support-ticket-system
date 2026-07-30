import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, HeadphonesIcon, Loader2, Paperclip, Video } from "lucide-react";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  email: z.string().email("Please enter a valid email").max(320),
  subject: z.string().min(1, "Subject is required").max(500),
  description: z.string().min(10, "Please provide at least 10 characters").max(5000),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  loomUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

export default function SubmitTicket() {
  const [, navigate] = useLocation();
  const [imageUrl, setImageUrl] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { priority: "medium" },
  });

  const submitMutation = trpc.tickets.submit.useMutation({
    onSuccess: (data) => {
      navigate(`/ticket-submitted/${data.ticketNumber}`);
    },
    onError: (err) => {
      toast.error("Failed to submit ticket. Please try again.");
    },
  });

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB");
      return;
    }
    setImageFile(file);
    // Create a local preview URL
    const localUrl = URL.createObjectURL(file);
    setImageUrl(localUrl);
  };

  const onSubmit = async (data: FormData) => {
    let finalImageUrl: string | undefined;

    if (imageFile) {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", imageFile);
        const res = await fetch("/api/upload-ticket-image", {
          method: "POST",
          body: formData,
        });
        if (res.ok) {
          const json = await res.json();
          finalImageUrl = json.url;
        }
      } catch {
        toast.error("Image upload failed, submitting without image.");
      } finally {
        setUploading(false);
      }
    }

    submitMutation.mutate({
      name: data.name,
      email: data.email,
      subject: data.subject,
      description: data.description,
      priority: data.priority,
      imageUrl: finalImageUrl,
      loomUrl: data.loomUrl || undefined,
    });
  };

  const isLoading = uploading || submitMutation.isPending;

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border/50 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <HeadphonesIcon className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground tracking-tight">SupportDesk</span>
            </div>
          </Link>
          <Link href="/check-status">
            <Button variant="ghost" size="sm" className="text-muted-foreground">Check Status</Button>
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground mb-8 -ml-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="font-display text-3xl font-medium text-foreground mb-2">Submit a Support Ticket</h1>
          <p className="text-muted-foreground">Describe your issue and we'll get back to you as soon as possible.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-white rounded-xl border border-border/60 shadow-sm p-6 space-y-5">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Contact Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name <span className="text-destructive">*</span></Label>
                <Input id="name" placeholder="Jane Smith" {...register("name")} className={errors.name ? "border-destructive" : ""} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
                <Input id="email" type="email" placeholder="jane@example.com" {...register("email")} className={errors.email ? "border-destructive" : ""} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border/60 shadow-sm p-6 space-y-5">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Issue Details</h2>
            <div className="space-y-1.5">
              <Label htmlFor="subject">Subject <span className="text-destructive">*</span></Label>
              <Input id="subject" placeholder="Brief description of your issue" {...register("subject")} className={errors.subject ? "border-destructive" : ""} />
              {errors.subject && <p className="text-xs text-destructive">{errors.subject.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description <span className="text-destructive">*</span></Label>
              <Textarea
                id="description"
                placeholder="Please provide as much detail as possible about your issue..."
                rows={6}
                {...register("description")}
                className={`resize-none ${errors.description ? "border-destructive" : ""}`}
              />
              {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select defaultValue="medium" onValueChange={(v) => setValue("priority", v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low — Not time-sensitive</SelectItem>
                  <SelectItem value="medium">Medium — Standard response</SelectItem>
                  <SelectItem value="high">High — Needs prompt attention</SelectItem>
                  <SelectItem value="urgent">Urgent — Critical issue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border/60 shadow-sm p-6 space-y-5">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Attachments (Optional)</h2>
            <div className="space-y-1.5">
              <Label htmlFor="image" className="flex items-center gap-2">
                <Paperclip className="w-4 h-4" />
                Attach an Image
              </Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="cursor-pointer file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-secondary file:text-secondary-foreground"
              />
              {imageFile && (
                <p className="text-xs text-muted-foreground">Selected: {imageFile.name}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="loomUrl" className="flex items-center gap-2">
                <Video className="w-4 h-4" />
                Loom Video URL
              </Label>
              <Input
                id="loomUrl"
                type="url"
                placeholder="https://www.loom.com/share/..."
                {...register("loomUrl")}
                className={errors.loomUrl ? "border-destructive" : ""}
              />
              {errors.loomUrl && <p className="text-xs text-destructive">{errors.loomUrl.message}</p>}
              <p className="text-xs text-muted-foreground">Paste a Loom recording link to help us understand your issue visually.</p>
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full h-12 text-base gap-2" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {uploading ? "Uploading..." : "Submitting..."}
              </>
            ) : (
              "Submit Ticket"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
