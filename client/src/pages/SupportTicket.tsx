import { useState, useRef, useCallback } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  LifeBuoy, Bug, Lightbulb, HelpCircle, Upload, Clock,
  CheckCircle2, Rocket, ArrowLeft, ImagePlus, X, Loader2, FileImage, Paperclip
} from "lucide-react";

const ticketTypeOptions = [
  { value: "bug" as const, label: "Bug Report", icon: Bug, description: "Something's broken. We're not surprised, but we are sorry." },
  { value: "feature_request" as const, label: "Feature Request", icon: Lightbulb, description: "Got an idea? We're all ears. Seriously." },
  { value: "general" as const, label: "General Support", icon: HelpCircle, description: "Questions, feedback, or just want to chat." },
];

const statusLabels: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  new: { label: "New", color: "bg-blue-500/10 text-blue-600", icon: <Clock className="w-3 h-3" /> },
  in_backlog: { label: "In Backlog", color: "bg-gray-500/10 text-gray-600", icon: <Clock className="w-3 h-3" /> },
  in_progress: { label: "In Progress", color: "bg-yellow-500/10 text-yellow-600", icon: <Clock className="w-3 h-3" /> },
  in_testing: { label: "In Testing", color: "bg-purple-500/10 text-purple-600", icon: <Clock className="w-3 h-3" /> },
  done: { label: "Done", color: "bg-green-500/10 text-green-600", icon: <CheckCircle2 className="w-3 h-3" /> },
  launched: { label: "Launched", color: "bg-primary/10 text-primary", icon: <Rocket className="w-3 h-3" /> },
};

type UploadedFile = {
  id: string;
  fileName: string;
  url: string;
  mimeType: string;
  fileSize: number;
  preview?: string; // local preview URL
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'application/pdf'];

export default function SupportTicket() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<"create" | "my">("create");
  const [ticketType, setTicketType] = useState<"bug" | "feature_request" | "general">("bug");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = (trpc as any).upload.image.useMutation();

  const createTicket = trpc.supportTicket.create.useMutation({
    onSuccess: () => {
      toast.success("Ticket submitted! We'll get back to you soon.");
      setTitle("");
      setDescription("");
      setUploadedFiles([]);
      setTab("my");
      myTickets.refetch();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const myTickets = trpc.supportTicket.myTickets.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const processFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(f => {
      if (!ALLOWED_TYPES.includes(f.type)) {
        toast.error(`${f.name}: Unsupported file type. Use PNG, JPEG, GIF, WebP, or PDF.`);
        return false;
      }
      if (f.size > MAX_FILE_SIZE) {
        toast.error(`${f.name}: File too large. Maximum size is 10MB.`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;
    if (uploadedFiles.length + validFiles.length > 5) {
      toast.error("Maximum 5 files per ticket.");
      return;
    }

    setIsUploading(true);

    for (const file of validFiles) {
      try {
        // Create local preview
        const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;

        // Convert to base64
        const buffer = await file.arrayBuffer();
        const base64 = btoa(
          new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
        );

        const result = await uploadMutation.mutateAsync({
          fileName: file.name,
          fileBase64: base64,
          mimeType: file.type,
          fileSize: file.size,
          purpose: 'support-ticket',
        });

        setUploadedFiles(prev => [...prev, {
          id: crypto.randomUUID(),
          fileName: file.name,
          url: result.url,
          mimeType: file.type,
          fileSize: file.size,
          preview,
        }]);
      } catch (err: any) {
        toast.error(`Failed to upload ${file.name}: ${err.message || 'Unknown error'}`);
      }
    }

    setIsUploading(false);
  }, [uploadedFiles, uploadMutation]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [processFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = ''; // Reset so same file can be selected again
    }
  }, [processFiles]);

  const removeFile = (id: string) => {
    setUploadedFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file?.preview) URL.revokeObjectURL(file.preview);
      return prev.filter(f => f.id !== id);
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="p-8 text-center">
              <LifeBuoy className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Need a Hand?</h2>
              <p className="text-muted-foreground mb-6" style={{ textTransform: "none", letterSpacing: "normal" }}>
                Log in to submit a ticket or check on one you've already sent. We read every single one. (Mostly during coffee breaks.)
              </p>
              <Button onClick={() => window.location.href = getLoginUrl()} style={{ textTransform: "none" }}>
                Log In to Continue
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <section className="bg-[oklch(0.22_0.02_50)] text-white py-12">
        <div className="container">
          <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ fontFamily: "var(--font-heading)" }}>
            Support
          </h1>
          <p className="text-white/70 max-w-2xl text-lg" style={{ textTransform: "none", letterSpacing: "normal" }}>
            Found a bug? Got a brilliant idea? Or just need a hand? We're all ears (and we promise our volunteers check this regularly... between rides).
          </p>
        </div>
      </section>

      <section className="py-8 flex-1">
        <div className="container max-w-3xl">
          {/* Tabs */}
          <div className="flex gap-2 mb-8">
            <Button
              variant={tab === "create" ? "default" : "outline"}
              onClick={() => setTab("create")}
              className={tab !== "create" ? "bg-transparent" : ""}
              style={{ textTransform: "none" }}
            >
              Submit a Ticket
            </Button>
            <Button
              variant={tab === "my" ? "default" : "outline"}
              onClick={() => setTab("my")}
              className={tab !== "my" ? "bg-transparent" : ""}
              style={{ textTransform: "none" }}
            >
              My Tickets {myTickets.data && myTickets.data.length > 0 && `(${myTickets.data.length})`}
            </Button>
          </div>

          {tab === "create" ? (
            <Card>
              <CardHeader>
                <CardTitle style={{ textTransform: "none" }}>What can we help with?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Ticket Type */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {ticketTypeOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setTicketType(opt.value)}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        ticketType === opt.value
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      <opt.icon className={`w-5 h-5 mb-2 ${ticketType === opt.value ? "text-primary" : "text-muted-foreground"}`} />
                      <div className="text-sm font-medium" style={{ textTransform: "none" }}>{opt.label}</div>
                      <div className="text-xs text-muted-foreground mt-1" style={{ textTransform: "none" }}>{opt.description}</div>
                    </button>
                  ))}
                </div>

                {/* Title */}
                <div>
                  <label className="text-sm font-medium" style={{ textTransform: "none" }}>Title</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Brief summary of the issue or idea"
                    className="mt-1"
                    style={{ textTransform: "none" }}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-sm font-medium" style={{ textTransform: "none" }}>Description</label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell us more. The more detail, the faster we can help. Steps to reproduce a bug, or why a feature would be awesome..."
                    rows={6}
                    className="mt-1"
                    style={{ textTransform: "none" }}
                  />
                </div>

                {/* Screenshot Upload - Drag & Drop Zone */}
                <div>
                  <label className="text-sm font-medium flex items-center gap-2 mb-2" style={{ textTransform: "none" }}>
                    <Paperclip className="w-4 h-4" /> Screenshots (optional)
                  </label>

                  {/* Drop Zone */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
                      isDragOver
                        ? "border-primary bg-primary/5 scale-[1.01]"
                        : "border-border hover:border-primary/40 hover:bg-muted/30"
                    } ${isUploading ? "pointer-events-none opacity-60" : ""}`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/png,image/jpeg,image/gif,image/webp,application/pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                    />

                    {isUploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground" style={{ textTransform: "none" }}>Uploading...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center">
                          <Upload className={`w-5 h-5 ${isDragOver ? "text-primary" : "text-muted-foreground"}`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium" style={{ textTransform: "none" }}>
                            {isDragOver ? "Drop files here" : "Drag & drop screenshots here"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1" style={{ textTransform: "none" }}>
                            or click to browse. PNG, JPEG, GIF, WebP, PDF up to 10MB. Max 5 files.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Uploaded Files Preview */}
                  {uploadedFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {uploadedFiles.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center gap-3 p-2 rounded-lg border border-border bg-muted/20"
                        >
                          {file.preview ? (
                            <img
                              src={file.preview}
                              alt={file.fileName}
                              className="w-10 h-10 rounded object-cover border border-border"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                              <FileImage className="w-5 h-5 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" style={{ textTransform: "none" }}>{file.fileName}</p>
                            <p className="text-xs text-muted-foreground" style={{ textTransform: "none" }}>
                              {formatFileSize(file.fileSize)}
                            </p>
                          </div>
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline shrink-0"
                            style={{ textTransform: "none" }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            View
                          </a>
                          <button
                            onClick={() => removeFile(file.id)}
                            className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => {
                    const screenshotUrls = uploadedFiles.map(f => f.url).join('\n');
                    createTicket.mutate({
                      title,
                      description,
                      ticketType,
                      screenshotUrls: screenshotUrls || undefined,
                    });
                  }}
                  disabled={createTicket.isPending || !title || !description}
                  className="w-full"
                  style={{ textTransform: "none" }}
                >
                  {createTicket.isPending ? "Submitting..." : "Submit Ticket"}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {myTickets.isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-4">
                        <div className="h-5 bg-muted rounded w-3/4 mb-2" />
                        <div className="h-4 bg-muted rounded w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : !myTickets.data || myTickets.data.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <LifeBuoy className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground" style={{ textTransform: "none" }}>
                       No tickets yet. Either everything's working perfectly, or you're very patient. Either way, we appreciate you.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                myTickets.data.map((ticket: any) => {
                  const status = statusLabels[ticket.status] || statusLabels.new;
                  const screenshots = ticket.screenshotUrls ? ticket.screenshotUrls.split('\n').filter(Boolean) : [];
                  return (
                    <Card key={ticket.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-sm truncate" style={{ textTransform: "none" }}>{ticket.title}</h3>
                              <Badge variant="secondary" className="text-[10px] shrink-0" style={{ textTransform: "none" }}>
                                {ticket.ticketType === 'bug' ? 'Bug' : ticket.ticketType === 'feature_request' ? 'Feature' : 'General'}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2" style={{ textTransform: "none" }}>
                              {ticket.description}
                            </p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground" style={{ textTransform: "none" }}>
                              <span>#{ticket.id}</span>
                              <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                              {screenshots.length > 0 && (
                                <span className="flex items-center gap-1">
                                  <Paperclip className="w-3 h-3" /> {screenshots.length} attachment{screenshots.length > 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                            {/* Attachment thumbnails */}
                            {screenshots.length > 0 && (
                              <div className="flex gap-2 mt-2 flex-wrap">
                                {screenshots.map((url: string, i: number) => (
                                  <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                                    className="block w-12 h-12 rounded border border-border overflow-hidden hover:ring-2 ring-primary transition-all">
                                    <img src={url} alt={`Attachment ${i + 1}`} className="w-full h-full object-cover"
                                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full shrink-0 ${status.color}`} style={{ textTransform: "none" }}>
                            {status.icon} {status.label}
                          </div>
                        </div>
                        {ticket.adminNotes && (
                          <div className="mt-3 pt-3 border-t border-border">
                            <p className="text-xs text-muted-foreground" style={{ textTransform: "none" }}>
                              <span className="font-medium">Team response:</span> {ticket.adminNotes}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
