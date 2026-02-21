import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Shield,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Building2,
  MapPin,
  Mail,
  Phone,
  Globe,
  Instagram,
  User,
  FileText,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  Inbox,
} from "lucide-react";

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "pending":
      return (
        <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100">
          <Clock className="w-3 h-3 mr-1" /> Pending
        </Badge>
      );
    case "approved":
      return (
        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100">
          <CheckCircle2 className="w-3 h-3 mr-1" /> Approved
        </Badge>
      );
    case "rejected":
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-100">
          <XCircle className="w-3 h-3 mr-1" /> Rejected
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function SubmissionCard({
  submission,
  sportCategory,
  businessType,
  onReview,
  isReviewing,
}: {
  submission: any;
  sportCategory: any;
  businessType: any;
  onReview: (id: number, status: "approved" | "rejected", notes?: string) => void;
  isReviewing: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  const s = submission;
  const isPending = s.status === "pending";

  return (
    <Card className="border border-border/60 bg-card shadow-sm overflow-hidden">
      {/* Header Row */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-accent/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-[oklch(0.55_0.15_45)]/10 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 text-[oklch(0.55_0.15_45)]" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground truncate">{s.businessName}</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
              {sportCategory && <span>{sportCategory.name}</span>}
              {businessType && <span className="text-muted-foreground/40">•</span>}
              {businessType && <span>{businessType.name}</span>}
              {s.city && (
                <>
                  <span className="text-muted-foreground/40">•</span>
                  <span className="flex items-center gap-0.5">
                    <MapPin className="w-3 h-3" />
                    {s.city}{s.country ? `, ${s.country}` : ""}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <StatusBadge status={s.status} />
          <span className="text-xs text-muted-foreground hidden sm:inline">
            {new Date(s.createdAt).toLocaleDateString()}
          </span>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-border/40">
          <div className="p-4 space-y-4">
            {/* Contact Info */}
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Contact Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span>{s.contactName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                  <a href={`mailto:${s.contactEmail}`} className="text-[oklch(0.55_0.15_45)] hover:underline truncate">
                    {s.contactEmail}
                  </a>
                </div>
                {s.contactPhone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span>{s.contactPhone}</span>
                  </div>
                )}
                {s.website && (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
                    <a href={s.website} target="_blank" rel="noopener noreferrer" className="text-[oklch(0.55_0.15_45)] hover:underline truncate">
                      {s.website}
                    </a>
                  </div>
                )}
                {s.instagram && (
                  <div className="flex items-center gap-2 text-sm">
                    <Instagram className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span>{s.instagram}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Location */}
            {(s.region || s.hub || s.state) && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Location Details
                </h4>
                <div className="flex flex-wrap gap-2">
                  {s.region && (
                    <Badge variant="outline" className="text-xs">
                      <MapPin className="w-3 h-3 mr-1" /> {s.region}
                    </Badge>
                  )}
                  {s.hub && (
                    <Badge variant="outline" className="text-xs">{s.hub}</Badge>
                  )}
                  {s.state && (
                    <Badge variant="outline" className="text-xs">{s.state}</Badge>
                  )}
                  {s.country && (
                    <Badge variant="outline" className="text-xs">{s.country}</Badge>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            {s.businessDescription && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Business Description
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.businessDescription}</p>
              </div>
            )}

            {/* Additional Notes */}
            {s.additionalNotes && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Additional Notes
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed italic">{s.additionalNotes}</p>
              </div>
            )}

            {/* Review Notes (for already reviewed) */}
            {s.reviewNotes && (
              <div className="bg-muted/50 rounded-lg p-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Review Notes
                </h4>
                <p className="text-sm text-muted-foreground">{s.reviewNotes}</p>
              </div>
            )}

            {/* Submitted Info */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border/30">
              <span>Submitted: {new Date(s.createdAt).toLocaleString()}</span>
              {s.submittedByUserId && <span>User ID: {s.submittedByUserId}</span>}
            </div>

            {/* Admin Actions */}
            {isPending && (
              <div className="pt-2 border-t border-border/30">
                {showRejectForm ? (
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Reason for rejection (optional)..."
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      className="text-sm"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          onReview(s.id, "rejected", reviewNotes || undefined);
                          setShowRejectForm(false);
                          setReviewNotes("");
                        }}
                        disabled={isReviewing}
                      >
                        {isReviewing ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <XCircle className="w-3 h-3 mr-1" />}
                        Confirm Reject
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setShowRejectForm(false);
                          setReviewNotes("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => onReview(s.id, "approved")}
                      disabled={isReviewing}
                    >
                      {isReviewing ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <CheckCircle2 className="w-3 h-3 mr-1" />}
                      Approve & Add to Directory
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => setShowRejectForm(true)}
                      disabled={isReviewing}
                    >
                      <XCircle className="w-3 h-3 mr-1" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

export default function AdminPanel() {
  const { user, loading, isAuthenticated } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const categories = trpc.categories.sportCategories.useQuery();
  const businessTypes = trpc.categories.businessTypes.useQuery();

  const submissions = trpc.submission.list.useQuery(
    statusFilter === "all" ? undefined : { status: statusFilter },
    { enabled: isAuthenticated && user?.role === "admin" }
  );

  const reviewMutation = trpc.submission.review.useMutation({
    onSuccess: (_, variables) => {
      toast.success(
        variables.status === "approved"
          ? "Business approved and added to directory!"
          : "Submission rejected."
      );
      submissions.refetch();
    },
    onError: (error) => {
      toast.error(`Review failed: ${error.message}`);
    },
  });

  const handleReview = (id: number, status: "approved" | "rejected", notes?: string) => {
    reviewMutation.mutate({ id, status, reviewNotes: notes });
  };

  // Build lookup maps
  const categoryMap = useMemo(() => {
    const map: Record<number, any> = {};
    categories.data?.forEach((c: any) => { map[c.id] = c; });
    return map;
  }, [categories.data]);

  const typeMap = useMemo(() => {
    const map: Record<number, any> = {};
    businessTypes.data?.forEach((t: any) => { map[t.id] = t; });
    return map;
  }, [businessTypes.data]);

  // Count submissions by status
  const counts = useMemo(() => {
    if (!submissions.data) return { all: 0, pending: 0, approved: 0, rejected: 0 };
    // When filter is "all", we have all submissions
    // When filtered, we only have that subset
    return {
      all: submissions.data.length,
      pending: submissions.data.filter((s: any) => s.submission.status === "pending").length,
      approved: submissions.data.filter((s: any) => s.submission.status === "approved").length,
      rejected: submissions.data.filter((s: any) => s.submission.status === "rejected").length,
    };
  }, [submissions.data]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="p-8 text-center">
              <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Admin Access Required</h2>
              <p className="text-muted-foreground mb-6">Please sign in with an admin account to access this panel.</p>
              <a href={getLoginUrl()}>
                <Button className="bg-[oklch(0.55_0.15_45)] hover:bg-[oklch(0.50_0.15_45)] text-white">
                  Sign In
                </Button>
              </a>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="p-8 text-center">
              <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Access Denied</h2>
              <p className="text-muted-foreground mb-6">
                You don't have admin privileges. Contact the site owner if you believe this is an error.
              </p>
              <Link href="/dashboard">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const filterTabs = [
    { value: "all", label: "All", icon: FileText },
    { value: "pending", label: "Pending", icon: Clock },
    { value: "approved", label: "Approved", icon: CheckCircle2 },
    { value: "rejected", label: "Rejected", icon: XCircle },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero Banner */}
        <section className="bg-[oklch(0.22_0.02_50)] text-white py-8">
          <div className="container">
            <div className="flex items-center gap-2 mb-1">
              <Link href="/dashboard">
                <span className="text-white/60 hover:text-white text-sm cursor-pointer flex items-center gap-1">
                  <ArrowLeft className="w-4 h-4" /> Dashboard
                </span>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[oklch(0.55_0.15_45)] flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1
                  className="text-2xl md:text-3xl font-bold tracking-wide"
                  style={{ fontFamily: "var(--font-heading)", textTransform: "uppercase" }}
                >
                  Admin Panel
                </h1>
                <p className="text-white/60 text-sm">Review and manage business submissions</p>
              </div>
            </div>
          </div>
        </section>

        <div className="container py-8">
          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {filterTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = statusFilter === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setStatusFilter(tab.value)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[oklch(0.55_0.15_45)] text-white"
                      : "bg-card border border-border/60 text-muted-foreground hover:text-foreground hover:border-border"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {statusFilter === "all" && tab.value !== "all" && (
                    <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${
                      isActive ? "bg-white/20" : "bg-muted"
                    }`}>
                      {tab.value === "pending" ? counts.pending : tab.value === "approved" ? counts.approved : counts.rejected}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Stats Summary */}
          {statusFilter === "all" && submissions.data && submissions.data.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-amber-700">{counts.pending}</div>
                  <div className="text-xs text-amber-600 font-medium">Pending Review</div>
                </CardContent>
              </Card>
              <Card className="border-emerald-200 bg-emerald-50">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-emerald-700">{counts.approved}</div>
                  <div className="text-xs text-emerald-600 font-medium">Approved</div>
                </CardContent>
              </Card>
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-700">{counts.rejected}</div>
                  <div className="text-xs text-red-600 font-medium">Rejected</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Submissions List */}
          {submissions.isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : submissions.data && submissions.data.length > 0 ? (
            <div className="space-y-3">
              {submissions.data.map((item: any) => (
                <SubmissionCard
                  key={item.submission.id}
                  submission={item.submission}
                  sportCategory={categoryMap[item.submission.sportCategoryId]}
                  businessType={typeMap[item.submission.businessTypeId]}
                  onReview={handleReview}
                  isReviewing={reviewMutation.isPending}
                />
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-12 text-center">
                <Inbox className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                  {statusFilter === "all"
                    ? "No Submissions Yet"
                    : `No ${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Submissions`}
                </h3>
                <p className="text-sm text-muted-foreground/70">
                  {statusFilter === "pending"
                    ? "All submissions have been reviewed. Check back later for new ones."
                    : statusFilter === "all"
                    ? "When businesses submit listing requests, they'll appear here for review."
                    : `No submissions with "${statusFilter}" status found.`}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
