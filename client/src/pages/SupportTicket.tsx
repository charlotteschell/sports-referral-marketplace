import { useState } from "react";
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
  CheckCircle2, Rocket, ArrowLeft, ImagePlus
} from "lucide-react";

const ticketTypeOptions = [
  { value: "bug" as const, label: "Bug Report", icon: Bug, description: "Something's broken or not working right" },
  { value: "feature_request" as const, label: "Feature Request", icon: Lightbulb, description: "Got an idea to make things better?" },
  { value: "general" as const, label: "General Support", icon: HelpCircle, description: "Questions, feedback, or just saying hi" },
];

const statusLabels: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  new: { label: "New", color: "bg-blue-500/10 text-blue-600", icon: <Clock className="w-3 h-3" /> },
  in_backlog: { label: "In Backlog", color: "bg-gray-500/10 text-gray-600", icon: <Clock className="w-3 h-3" /> },
  in_progress: { label: "In Progress", color: "bg-yellow-500/10 text-yellow-600", icon: <Clock className="w-3 h-3" /> },
  in_testing: { label: "In Testing", color: "bg-purple-500/10 text-purple-600", icon: <Clock className="w-3 h-3" /> },
  done: { label: "Done", color: "bg-green-500/10 text-green-600", icon: <CheckCircle2 className="w-3 h-3" /> },
  launched: { label: "Launched", color: "bg-primary/10 text-primary", icon: <Rocket className="w-3 h-3" /> },
};

export default function SupportTicket() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<"create" | "my">("create");
  const [ticketType, setTicketType] = useState<"bug" | "feature_request" | "general">("bug");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState("");

  const createTicket = trpc.supportTicket.create.useMutation({
    onSuccess: () => {
      toast.success("Ticket submitted! We'll get back to you soon.");
      setTitle("");
      setDescription("");
      setScreenshotUrl("");
      setTab("my");
      myTickets.refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const myTickets = trpc.supportTicket.myTickets.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="p-8 text-center">
              <LifeBuoy className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Support Center</h2>
              <p className="text-muted-foreground mb-6" style={{ textTransform: "none", letterSpacing: "normal" }}>
                Log in to submit a support ticket or track your existing ones.
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
            Support Center
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

                {/* Screenshot URL */}
                <div>
                  <label className="text-sm font-medium flex items-center gap-2" style={{ textTransform: "none" }}>
                    <ImagePlus className="w-4 h-4" /> Screenshot URL (optional)
                  </label>
                  <Input
                    value={screenshotUrl}
                    onChange={(e) => setScreenshotUrl(e.target.value)}
                    placeholder="Paste a link to a screenshot (e.g. from Imgur, Google Drive)"
                    className="mt-1"
                    style={{ textTransform: "none" }}
                  />
                  <p className="text-xs text-muted-foreground mt-1" style={{ textTransform: "none" }}>
                    Upload your screenshot to any image hosting service and paste the link here.
                  </p>
                </div>

                <Button
                  onClick={() => {
                    createTicket.mutate({
                      title,
                      description,
                      ticketType,
                      screenshotUrls: screenshotUrl || undefined,
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
                      No tickets yet. Everything working perfectly? That's what we like to hear!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                myTickets.data.map((ticket: any) => {
                  const status = statusLabels[ticket.status] || statusLabels.new;
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
                            </div>
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
