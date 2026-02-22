import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Shield, Clock, CheckCircle2, XCircle, ChevronDown, ChevronUp,
  Building2, MapPin, Mail, Phone, Globe, Instagram, User, FileText,
  ArrowLeft, Loader2, AlertTriangle, Inbox, Eye, EyeOff, Gift,
  Search, RefreshCw, LifeBuoy, Bug, Lightbulb, HelpCircle, Rocket,
  Tags, Plus, Trash2, UserX, UserCheck,
} from "lucide-react";
import { Input } from "@/components/ui/input";

// ─── Users Tab ───────────────────────────────────────
function UsersTab() {
  const allUsers = trpc.admin.listUsers.useQuery();
  const hideUserMutation = trpc.admin.hideUser.useMutation({ onSuccess: () => { allUsers.refetch(); toast.success('User hidden'); } });
  const restoreUserMutation = trpc.admin.restoreUser.useMutation({ onSuccess: () => { allUsers.refetch(); toast.success('User restored'); } });
  const deleteUserMutation = trpc.admin.deleteUser.useMutation({ onSuccess: () => { allUsers.refetch(); toast.success('User deleted'); } });
  const [userSearch, setUserSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);
  const [retainData, setRetainData] = useState(true);

  const filteredUsers = useMemo(() => {
    if (!allUsers.data) return [];
    if (!userSearch) return allUsers.data;
    const q = userSearch.toLowerCase();
    return allUsers.data.filter((u: any) =>
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.contactName || '').toLowerCase().includes(q)
    );
  }, [allUsers.data, userSearch]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center gap-2"><User className="w-5 h-5 text-blue-500" /> User Management</h2>
        <Button size="sm" variant="ghost" onClick={() => allUsers.refetch()} style={{ textTransform: "none" }}><RefreshCw className="w-4 h-4 mr-1" /> Refresh</Button>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search users by name, email, or contact name..." value={userSearch} onChange={e => setUserSearch(e.target.value)} className="pl-9" style={{ textTransform: "none" }} />
      </div>
      {allUsers.isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="animate-pulse p-4 border rounded-lg"><div className="h-4 bg-muted rounded w-3/4 mb-2" /><div className="h-3 bg-muted rounded w-1/2" /></div>)}</div>
      ) : !filteredUsers.length ? (
        <div className="text-center py-8"><User className="w-10 h-10 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground" style={{ textTransform: "none" }}>No users found.</p></div>
      ) : (
        <div className="space-y-2">
          {filteredUsers.map((u: any) => (
            <Card key={u.id} className={`${u.isDeleted ? 'opacity-60 border-red-200' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                      {(u.contactName || u.name || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-sm" style={{ textTransform: "none" }}>
                        {u.contactName || u.name || 'Unknown'}
                        {u.isDeleted && <Badge className="ml-2 bg-red-100 text-red-800 text-[10px]" style={{ textTransform: "none" }}>{u.deletedBy === 'admin_hidden' ? 'Hidden' : 'Deleted'}</Badge>}
                      </p>
                      <p className="text-xs text-muted-foreground" style={{ textTransform: "none" }}>{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-[10px]" style={{ textTransform: "none" }}>{u.role}</Badge>
                    <Badge variant="outline" className="text-[10px]" style={{ textTransform: "none" }}>{u.accountType || 'none'}</Badge>
                    {u.isDeleted && u.deletedBy === 'admin_hidden' ? (
                      <Button size="sm" variant="outline" className="h-7 text-xs bg-transparent" style={{ textTransform: "none" }}
                        onClick={() => restoreUserMutation.mutate({ userId: u.id })} disabled={restoreUserMutation.isPending}>
                        <UserCheck className="w-3 h-3 mr-1" /> Restore
                      </Button>
                    ) : !u.isDeleted ? (
                      <Button size="sm" variant="outline" className="h-7 text-xs bg-transparent text-amber-600 border-amber-300" style={{ textTransform: "none" }}
                        onClick={() => hideUserMutation.mutate({ userId: u.id })} disabled={hideUserMutation.isPending}>
                        <UserX className="w-3 h-3 mr-1" /> Hide
                      </Button>
                    ) : null}
                    {!u.isDeleted || u.deletedBy === 'admin_hidden' ? (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline" className="h-7 text-xs bg-transparent text-red-600 border-red-300" style={{ textTransform: "none" }}
                            onClick={() => setDeleteTarget({ id: u.id, name: u.contactName || u.name })}>
                            <Trash2 className="w-3 h-3 mr-1" /> Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete User Account</AlertDialogTitle>
                            <AlertDialogDescription style={{ textTransform: "none", letterSpacing: "normal" }}>
                              Are you sure you want to permanently delete <strong>{u.contactName || u.name}</strong>'s account? This will anonymize their PII and deactivate all their businesses.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <div className="flex items-center gap-2 py-2">
                            <input type="checkbox" id={`retain-${u.id}`} checked={retainData} onChange={e => setRetainData(e.target.checked)} className="rounded" />
                            <label htmlFor={`retain-${u.id}`} className="text-sm" style={{ textTransform: "none" }}>Retain activity data (show as "Deleted Account")</label>
                          </div>
                          <AlertDialogFooter>
                            <AlertDialogCancel style={{ textTransform: "none" }}>Cancel</AlertDialogCancel>
                            <AlertDialogAction className="bg-red-600 hover:bg-red-700" style={{ textTransform: "none" }}
                              onClick={() => { deleteUserMutation.mutate({ userId: u.id, retainActivityData: retainData }); setDeleteTarget(null); }}>
                              Delete Permanently
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    ) : (
                      <Badge className="bg-red-100 text-red-800 text-[10px]" style={{ textTransform: "none" }}>Permanently Deleted</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "pending":
      return <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
    case "approved":
      return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100"><CheckCircle2 className="w-3 h-3 mr-1" /> Approved</Badge>;
    case "rejected":
      return <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-100"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

// ─── Submission Card ───────────────────────────────────────
function SubmissionCard({ submission, sportCategory, businessType, onReview, isReviewing }: {
  submission: any; sportCategory: any; businessType: any;
  onReview: (id: number, status: "approved" | "rejected", notes?: string) => void; isReviewing: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const s = submission;
  const isPending = s.status === "pending";

  return (
    <Card className="border border-border/60 bg-card shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-accent/30 transition-colors" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-[oklch(0.55_0.15_45)]/10 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 text-[oklch(0.55_0.15_45)]" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground truncate">{s.businessName}</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
              {sportCategory && <span>{sportCategory.name}</span>}
              {businessType && <><span className="text-muted-foreground/40">•</span><span>{businessType.name}</span></>}
              {s.city && <><span className="text-muted-foreground/40">•</span><span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{s.city}{s.country ? `, ${s.country}` : ""}</span></>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <StatusBadge status={s.status} />
          <span className="text-xs text-muted-foreground hidden sm:inline">{new Date(s.createdAt).toLocaleDateString()}</span>
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border/40 p-4 space-y-4">
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Contact Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex items-center gap-2 text-sm"><User className="w-4 h-4 text-muted-foreground shrink-0" /><span>{s.contactName}</span></div>
              <div className="flex items-center gap-2 text-sm"><Mail className="w-4 h-4 text-muted-foreground shrink-0" /><a href={`mailto:${s.contactEmail}`} className="text-[oklch(0.55_0.15_45)] hover:underline truncate">{s.contactEmail}</a></div>
              {s.contactPhone && <div className="flex items-center gap-2 text-sm"><Phone className="w-4 h-4 text-muted-foreground shrink-0" /><span>{s.contactPhone}</span></div>}
              {s.website && <div className="flex items-center gap-2 text-sm"><Globe className="w-4 h-4 text-muted-foreground shrink-0" /><a href={s.website} target="_blank" rel="noopener noreferrer" className="text-[oklch(0.55_0.15_45)] hover:underline truncate">{s.website}</a></div>}
              {s.instagram && <div className="flex items-center gap-2 text-sm"><Instagram className="w-4 h-4 text-muted-foreground shrink-0" /><span>{s.instagram}</span></div>}
            </div>
          </div>
          {(s.region || s.hub || s.state) && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Location Details</h4>
              <div className="flex flex-wrap gap-2">
                {s.region && <Badge variant="outline" className="text-xs"><MapPin className="w-3 h-3 mr-1" /> {s.region}</Badge>}
                {s.hub && <Badge variant="outline" className="text-xs">{s.hub}</Badge>}
                {s.state && <Badge variant="outline" className="text-xs">{s.state}</Badge>}
                {s.country && <Badge variant="outline" className="text-xs">{s.country}</Badge>}
              </div>
            </div>
          )}
          {s.businessDescription && <div><h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Business Description</h4><p className="text-sm text-muted-foreground leading-relaxed">{s.businessDescription}</p></div>}
          {s.additionalNotes && <div><h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Additional Notes</h4><p className="text-sm text-muted-foreground leading-relaxed italic">{s.additionalNotes}</p></div>}
          {s.reviewNotes && <div className="bg-muted/50 rounded-lg p-3"><h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Review Notes</h4><p className="text-sm text-muted-foreground">{s.reviewNotes}</p></div>}
          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border/30">
            <span>Submitted: {new Date(s.createdAt).toLocaleString()}</span>
            {s.submittedByUserId && <span>User ID: {s.submittedByUserId}</span>}
          </div>
          {isPending && (
            <div className="pt-2 border-t border-border/30">
              {showRejectForm ? (
                <div className="space-y-3">
                  <Textarea placeholder="Reason for rejection (optional)..." value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} className="text-sm" rows={3} />
                  <div className="flex gap-2">
                    <Button size="sm" variant="destructive" onClick={() => { onReview(s.id, "rejected", reviewNotes || undefined); setShowRejectForm(false); setReviewNotes(""); }} disabled={isReviewing}>
                      {isReviewing ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <XCircle className="w-3 h-3 mr-1" />} Confirm Reject
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => { setShowRejectForm(false); setReviewNotes(""); }}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => onReview(s.id, "approved")} disabled={isReviewing}>
                    {isReviewing ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <CheckCircle2 className="w-3 h-3 mr-1" />} Approve & Add to Directory
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => setShowRejectForm(true)} disabled={isReviewing}>
                    <XCircle className="w-3 h-3 mr-1" /> Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

export default function AdminPanel() {
  const { user, loading, isAuthenticated } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [bizSearch, setBizSearch] = useState("");
  const utils = trpc.useUtils();

  const categories = trpc.categories.sportCategories.useQuery();
  const businessTypes = trpc.categories.businessTypes.useQuery();

  const isAdmin = isAuthenticated && user?.role === "admin";

  const submissions = trpc.submission.list.useQuery(
    statusFilter === "all" ? undefined : { status: statusFilter },
    { enabled: isAdmin }
  );

  // Pending business approvals (claims + new businesses)
  const pendingApprovals = trpc.admin.pendingApproval.useQuery(undefined, { enabled: isAdmin });

  // All businesses for admin management
  const allBusinesses = trpc.admin.allBusinesses.useQuery(undefined, { enabled: isAdmin });

  // All offers for admin management
  const allOffers = trpc.admin.allOffers.useQuery(undefined, { enabled: isAdmin });

  // Support tickets
  const allTickets = trpc.supportTicket.all.useQuery(undefined, { enabled: isAdmin });

  // Category approvals
  const categoryApprovals = trpc.categoryApproval.all.useQuery(undefined, { enabled: isAdmin });

  const [ticketNotes, setTicketNotes] = useState<Record<number, string>>({});

  const reviewMutation = trpc.submission.review.useMutation({
    onSuccess: (_, variables) => {
      toast.success(variables.status === "approved" ? "Business approved and added to directory!" : "Submission rejected.");
      submissions.refetch();
    },
    onError: (error) => toast.error(`Review failed: ${error.message}`),
  });

  const approveBusinessMutation = trpc.admin.reviewBusiness.useMutation({
    onSuccess: (_, variables) => {
      toast.success(variables.status === "approved" ? "Business approved!" : "Business rejected.");
      pendingApprovals.refetch();
      allBusinesses.refetch();
    },
    onError: (error) => toast.error(`Review failed: ${error.message}`),
  });

  const toggleBizVisibility = trpc.admin.toggleBusinessVisibility.useMutation({
    onSuccess: () => {
      toast.success("Business visibility updated.");
      allBusinesses.refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const toggleOfferVisibility = trpc.admin.toggleOfferVisibility.useMutation({
    onSuccess: () => {
      toast.success("Offer visibility updated.");
      allOffers.refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateTicketStatus = trpc.supportTicket.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Ticket status updated!");
      allTickets.refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateCategoryApproval = trpc.categoryApproval.review.useMutation({
    onSuccess: () => {
      toast.success("Category request updated!");
      categoryApprovals.refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const handleReview = (id: number, status: "approved" | "rejected", notes?: string) => {
    reviewMutation.mutate({ id, status, reviewNotes: notes });
  };

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

  const submissionCounts = useMemo(() => {
    if (!submissions.data) return { all: 0, pending: 0, approved: 0, rejected: 0 };
    return {
      all: submissions.data.length,
      pending: submissions.data.filter((s: any) => s.submission.status === "pending").length,
      approved: submissions.data.filter((s: any) => s.submission.status === "approved").length,
      rejected: submissions.data.filter((s: any) => s.submission.status === "rejected").length,
    };
  }, [submissions.data]);

  // Filter businesses by search (case-insensitive)
  const filteredBusinesses = useMemo(() => {
    if (!allBusinesses.data?.businesses) return [];
    if (!bizSearch.trim()) return allBusinesses.data.businesses;
    const q = bizSearch.toLowerCase();
    return allBusinesses.data.businesses.filter((item: any) =>
      item.business.name.toLowerCase().includes(q) ||
      (item.business.city && item.business.city.toLowerCase().includes(q)) ||
      (item.business.region && item.business.region.toLowerCase().includes(q)) ||
      (item.business.hub && item.business.hub.toLowerCase().includes(q))
    );
  }, [allBusinesses.data, bizSearch]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md w-full mx-4"><CardContent className="p-8 text-center">
            <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Admin Access Required</h2>
            <p className="text-muted-foreground mb-6">Please sign in with an admin account to access this panel.</p>
            <a href={getLoginUrl()}><Button className="bg-[oklch(0.55_0.15_45)] hover:bg-[oklch(0.50_0.15_45)] text-white">Sign In</Button></a>
          </CardContent></Card>
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
          <Card className="max-w-md w-full mx-4"><CardContent className="p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-6">You don't have admin privileges.</p>
            <Link href="/dashboard"><Button variant="outline"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard</Button></Link>
          </CardContent></Card>
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
              <Link href="/dashboard"><span className="text-white/60 hover:text-white text-sm cursor-pointer flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Dashboard</span></Link>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[oklch(0.55_0.15_45)] flex items-center justify-center"><Shield className="w-5 h-5 text-white" /></div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-wide" style={{ fontFamily: "var(--font-heading)", textTransform: "uppercase" }}>Admin Panel</h1>
                <p className="text-white/60 text-sm">Manage submissions, approvals, businesses, and offers</p>
              </div>
            </div>
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold">{pendingApprovals.data?.length || 0}</div>
                <div className="text-xs text-white/70">Pending Approvals</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold">{submissionCounts.pending}</div>
                <div className="text-xs text-white/70">Pending Submissions</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold">{allBusinesses.data?.total || 0}</div>
                <div className="text-xs text-white/70">Total Businesses</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold">{allOffers.data?.length || 0}</div>
                <div className="text-xs text-white/70">Total Offers</div>
              </div>
            </div>
          </div>
        </section>

        <div className="container py-8">
          <Tabs defaultValue="approvals" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 sm:grid-cols-7 h-auto">
              <TabsTrigger value="approvals" className="text-xs sm:text-sm py-2" style={{ textTransform: "none" }}>
                Claims {(pendingApprovals.data?.length || 0) > 0 && <Badge className="ml-1 bg-amber-500 text-white text-[10px] px-1.5 py-0">{pendingApprovals.data?.length}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="submissions" className="text-xs sm:text-sm py-2" style={{ textTransform: "none" }}>
                New Submissions {submissionCounts.pending > 0 && <Badge className="ml-1 bg-amber-500 text-white text-[10px] px-1.5 py-0">{submissionCounts.pending}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="businesses" className="text-xs sm:text-sm py-2" style={{ textTransform: "none" }}>Businesses</TabsTrigger>
              <TabsTrigger value="offers" className="text-xs sm:text-sm py-2" style={{ textTransform: "none" }}>Offers</TabsTrigger>
              <TabsTrigger value="tickets" className="text-xs sm:text-sm py-2" style={{ textTransform: "none" }}>
                Tickets {(allTickets.data?.filter((t: any) => t.status === 'new').length || 0) > 0 && <Badge className="ml-1 bg-blue-500 text-white text-[10px] px-1.5 py-0">{allTickets.data?.filter((t: any) => t.status === 'new').length}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="categories" className="text-xs sm:text-sm py-2" style={{ textTransform: "none" }}>
                Categories {(categoryApprovals.data?.filter((c: any) => c.status === 'pending').length || 0) > 0 && <Badge className="ml-1 bg-purple-500 text-white text-[10px] px-1.5 py-0">{categoryApprovals.data?.filter((c: any) => c.status === 'pending').length}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="users" className="text-xs sm:text-sm py-2" style={{ textTransform: "none" }}>Users</TabsTrigger>
            </TabsList>

            {/* ─── Approvals Tab ─────────────────────────────── */}
            <TabsContent value="approvals" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2"><Clock className="w-5 h-5 text-amber-500" /> Claim Existing Businesses Pending Approval</h2>
                <Button size="sm" variant="ghost" onClick={() => pendingApprovals.refetch()} style={{ textTransform: "none" }}><RefreshCw className="w-4 h-4 mr-1" /> Refresh</Button>
              </div>
              <p className="text-sm text-muted-foreground" style={{ textTransform: "none", letterSpacing: "normal" }}>
                Business owners who have verified their email and claimed an existing listing. Review and approve to grant them ownership.
              </p>

              {pendingApprovals.isLoading ? (
                <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
              ) : !pendingApprovals.data?.length ? (
                <Card className="border-dashed"><CardContent className="p-12 text-center">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground mb-2">All Caught Up</h3>
                  <p className="text-sm text-muted-foreground/70" style={{ textTransform: "none", letterSpacing: "normal" }}>No businesses are waiting for approval right now.</p>
                </CardContent></Card>
              ) : (
                <div className="space-y-3">
                  {pendingApprovals.data.map((item: any) => (
                    <Card key={item.business.id} className="border border-amber-200 bg-amber-50/30 overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h3 className="font-bold text-foreground">{item.business.name}</h3>
                              {item.business.isClaimed && <Badge className="bg-blue-100 text-blue-800 text-[10px]">Claimed</Badge>}
                              {!item.business.isClaimed && <Badge className="bg-gray-100 text-gray-600 text-[10px]">New Listing</Badge>}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                              {item.sportCategory && <span>{item.sportCategory.name}</span>}
                              {item.businessType && <><span>•</span><span>{item.businessType.name}</span></>}
                              {item.business.city && <><span>•</span><span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{item.business.city}{item.business.country ? `, ${item.business.country}` : ""}</span></>}
                            </div>
                            {item.business.email && <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Mail className="w-3 h-3" /> {item.business.email}</p>}
                            {item.business.website && <p className="text-xs mt-1"><a href={item.business.website} target="_blank" rel="noopener noreferrer" className="text-[oklch(0.55_0.15_45)] hover:underline flex items-center gap-1"><Globe className="w-3 h-3" /> {item.business.website}</a></p>}
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" style={{ textTransform: "none" }}
                              onClick={() => approveBusinessMutation.mutate({ businessId: item.business.id, status: "approved" })}
                              disabled={approveBusinessMutation.isPending}>
                              <CheckCircle2 className="w-3 h-3 mr-1" /> Approve
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" style={{ textTransform: "none" }}>
                                  <XCircle className="w-3 h-3 mr-1" /> Reject
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Reject this business?</AlertDialogTitle>
                                  <AlertDialogDescription style={{ textTransform: "none", letterSpacing: "normal" }}>
                                    This will reject <strong>{item.business.name}</strong> and it will not appear in the public directory.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel style={{ textTransform: "none" }}>Cancel</AlertDialogCancel>
                                  <AlertDialogAction className="bg-red-600 hover:bg-red-700" style={{ textTransform: "none" }}
                                    onClick={() => approveBusinessMutation.mutate({ businessId: item.business.id, status: "rejected" })}>
                                    Reject
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* ─── Submissions Tab ───────────────────────────── */}
            <TabsContent value="submissions" className="space-y-4">
              <div className="flex flex-wrap gap-2 mb-4">
                {filterTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = statusFilter === tab.value;
                  return (
                    <button key={tab.value} onClick={() => setStatusFilter(tab.value)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-[oklch(0.55_0.15_45)] text-white" : "bg-card border border-border/60 text-muted-foreground hover:text-foreground hover:border-border"}`}>
                      <Icon className="w-4 h-4" />
                      {tab.label}
                      {statusFilter === "all" && tab.value !== "all" && (
                        <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${isActive ? "bg-white/20" : "bg-muted"}`}>
                          {tab.value === "pending" ? submissionCounts.pending : tab.value === "approved" ? submissionCounts.approved : submissionCounts.rejected}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {submissions.isLoading ? (
                <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
              ) : submissions.data && submissions.data.length > 0 ? (
                <div className="space-y-3">
                  {submissions.data.map((item: any) => (
                    <SubmissionCard key={item.submission.id} submission={item.submission}
                      sportCategory={categoryMap[item.submission.sportCategoryId]} businessType={typeMap[item.submission.businessTypeId]}
                      onReview={handleReview} isReviewing={reviewMutation.isPending} />
                  ))}
                </div>
              ) : (
                <Card className="border-dashed"><CardContent className="p-12 text-center">
                  <Inbox className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                    {statusFilter === "all" ? "No Submissions Yet" : `No ${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Submissions`}
                  </h3>
                  <p className="text-sm text-muted-foreground/70" style={{ textTransform: "none", letterSpacing: "normal" }}>
                    {statusFilter === "pending" ? "All new business submissions have been reviewed." : "When someone submits a new business to be added to the directory, it will appear here for approval."}
                  </p>
                </CardContent></Card>
              )}
            </TabsContent>

            {/* ─── Businesses Tab (Admin Controls) ────────────── */}
            <TabsContent value="businesses" className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="text-lg font-bold flex items-center gap-2"><Building2 className="w-5 h-5 text-primary" /> All Businesses</h2>
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="text" placeholder="Search businesses..." value={bizSearch}
                    onChange={(e) => setBizSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground" style={{ textTransform: "none", letterSpacing: "normal" }}>
                As super admin, you can hide any business from public view or restore it at any time.
              </p>

              {allBusinesses.isLoading ? (
                <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
              ) : (
                <div className="space-y-2">
                  {filteredBusinesses.map((item: any) => {
                    const isHidden = item.business.isAdminHidden || item.business.isHidden;
                    return (
                      <Card key={item.business.id} className={`overflow-hidden transition-opacity ${isHidden ? "opacity-60 border-dashed" : ""}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold text-foreground">{item.business.name}</h3>
                                <StatusBadge status={item.business.approvalStatus || "approved"} />
                                {item.business.isClaimed && <Badge className="bg-blue-100 text-blue-800 text-[10px]"><Shield className="w-2.5 h-2.5 mr-0.5" /> Claimed</Badge>}
                                {item.business.isAdminHidden && <Badge className="bg-red-100 text-red-800 text-[10px]"><EyeOff className="w-2.5 h-2.5 mr-0.5" /> Admin Hidden</Badge>}
                                {item.business.isHidden && !item.business.isAdminHidden && <Badge className="bg-gray-100 text-gray-600 text-[10px]"><EyeOff className="w-2.5 h-2.5 mr-0.5" /> Owner Hidden</Badge>}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 flex-wrap">
                                {item.sportCategory && <span>{item.sportCategory.name}</span>}
                                {item.businessType && <><span>•</span><span>{item.businessType.name}</span></>}
                                {item.business.city && <><span>•</span><span>{item.business.city}{item.business.country ? `, ${item.business.country}` : ""}</span></>}
                                {item.business.region && <><span>•</span><span className="text-primary/70">{item.business.region}</span></>}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <Link href={`/business/${item.business.slug}`}>
                                <Button size="sm" variant="ghost" className="text-xs" style={{ textTransform: "none" }}><Globe className="w-3 h-3 mr-1" /> View</Button>
                              </Link>
                              {item.business.isAdminHidden ? (
                                <Button size="sm" variant="outline" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 text-xs" style={{ textTransform: "none" }}
                                  onClick={() => toggleBizVisibility.mutate({ businessId: item.business.id, isAdminHidden: false })}
                                  disabled={toggleBizVisibility.isPending}>
                                  <Eye className="w-3 h-3 mr-1" /> Restore
                                </Button>
                              ) : (
                                <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 text-xs" style={{ textTransform: "none" }}
                                  onClick={() => toggleBizVisibility.mutate({ businessId: item.business.id, isAdminHidden: true })}
                                  disabled={toggleBizVisibility.isPending}>
                                  <EyeOff className="w-3 h-3 mr-1" /> Hide
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                  {filteredBusinesses.length === 0 && (
                    <Card className="border-dashed"><CardContent className="p-8 text-center">
                      <Search className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                      <p className="text-muted-foreground" style={{ textTransform: "none", letterSpacing: "normal" }}>No businesses match your search.</p>
                    </CardContent></Card>
                  )}
                </div>
              )}
            </TabsContent>

            {/* ─── Offers Tab (Admin Controls) ─────────────────── */}
            <TabsContent value="offers" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2"><Gift className="w-5 h-5 text-primary" /> All Referral Offers</h2>
                <Button size="sm" variant="ghost" onClick={() => allOffers.refetch()} style={{ textTransform: "none" }}><RefreshCw className="w-4 h-4 mr-1" /> Refresh</Button>
              </div>
              <p className="text-sm text-muted-foreground" style={{ textTransform: "none", letterSpacing: "normal" }}>
                As super admin, you can hide any referral offer from public view or restore it at any time.
              </p>

              {allOffers.isLoading ? (
                <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
              ) : !allOffers.data?.length ? (
                <Card className="border-dashed"><CardContent className="p-12 text-center">
                  <Gift className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground">No Offers Yet</h3>
                </CardContent></Card>
              ) : (
                <div className="space-y-2">
                  {allOffers.data.map((item: any) => {
                    const isHidden = item.offer.isAdminHidden || item.offer.isHidden;
                    return (
                      <Card key={item.offer.id} className={`overflow-hidden transition-opacity ${isHidden ? "opacity-60 border-dashed" : ""}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold text-foreground text-sm">{item.offer.title}</h3>
                                <Badge variant="outline" className="text-[10px]">{item.offer.offerType === "b2b" ? "B2B" : "Athlete"}</Badge>
                                {item.offer.isSample && <Badge className="bg-amber-100 text-amber-800 text-[10px]">Sample</Badge>}
                                {item.offer.isAdminHidden && <Badge className="bg-red-100 text-red-800 text-[10px]"><EyeOff className="w-2.5 h-2.5 mr-0.5" /> Admin Hidden</Badge>}
                                {item.offer.isHidden && !item.offer.isAdminHidden && <Badge className="bg-gray-100 text-gray-600 text-[10px]"><EyeOff className="w-2.5 h-2.5 mr-0.5" /> Owner Hidden</Badge>}
                                {!item.offer.isActive && <Badge className="bg-gray-100 text-gray-600 text-[10px]">Inactive</Badge>}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                by <span className="font-medium">{item.business?.name || "Unknown"}</span>
                                {item.offer.incentiveValue && <span> · {item.offer.incentiveValue}</span>}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {item.offer.isAdminHidden ? (
                                <Button size="sm" variant="outline" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 text-xs" style={{ textTransform: "none" }}
                                  onClick={() => toggleOfferVisibility.mutate({ offerId: item.offer.id, isAdminHidden: false })}
                                  disabled={toggleOfferVisibility.isPending}>
                                  <Eye className="w-3 h-3 mr-1" /> Restore
                                </Button>
                              ) : (
                                <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 text-xs" style={{ textTransform: "none" }}
                                  onClick={() => toggleOfferVisibility.mutate({ offerId: item.offer.id, isAdminHidden: true })}
                                  disabled={toggleOfferVisibility.isPending}>
                                  <EyeOff className="w-3 h-3 mr-1" /> Hide
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* ─── Support Tickets Tab ────────────────────────── */}
            <TabsContent value="tickets" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2"><LifeBuoy className="w-5 h-5 text-blue-500" /> Support Tickets</h2>
                <Button size="sm" variant="ghost" onClick={() => allTickets.refetch()} style={{ textTransform: "none" }}><RefreshCw className="w-4 h-4 mr-1" /> Refresh</Button>
              </div>

              {allTickets.isLoading ? (
                <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
              ) : !allTickets.data?.length ? (
                <Card className="border-dashed"><CardContent className="p-12 text-center">
                  <LifeBuoy className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground">No Tickets Yet</h3>
                  <p className="text-sm text-muted-foreground/70" style={{ textTransform: "none" }}>When users submit support tickets, they'll appear here.</p>
                </CardContent></Card>
              ) : (
                <div className="space-y-3">
                  {allTickets.data.map((ticket: any) => {
                    const typeIcon = ticket.ticketType === 'bug' ? <Bug className="w-4 h-4" /> : ticket.ticketType === 'feature_request' ? <Lightbulb className="w-4 h-4" /> : <HelpCircle className="w-4 h-4" />;
                    const statusOptions = ['new', 'in_backlog', 'in_progress', 'in_testing', 'done', 'launched'] as const;
                    return (
                      <Card key={ticket.id} className="border border-border/60">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                {typeIcon}
                                <h3 className="font-semibold text-sm" style={{ textTransform: "none" }}>{ticket.title}</h3>
                                <Badge variant="secondary" className="text-[10px]" style={{ textTransform: "none" }}>
                                  {ticket.ticketType === 'bug' ? 'Bug' : ticket.ticketType === 'feature_request' ? 'Feature' : 'General'}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2 mb-2" style={{ textTransform: "none" }}>{ticket.description}</p>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground" style={{ textTransform: "none" }}>
                                <span>#{ticket.id}</span>
                                <span>{ticket.userName || ticket.userEmail}</span>
                                <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                              </div>
                              {ticket.screenshotUrls && (
                                <a href={ticket.screenshotUrls} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline mt-1 inline-block" style={{ textTransform: "none" }}>View Screenshot</a>
                              )}
                            </div>
                            <div className="flex flex-col gap-2 shrink-0">
                              <select
                                value={ticket.status}
                                onChange={(e) => updateTicketStatus.mutate({ id: ticket.id, status: e.target.value as any, adminNotes: ticketNotes[ticket.id] || undefined })}
                                className="text-xs border rounded px-2 py-1 bg-background"
                                style={{ textTransform: "none" }}
                              >
                                {statusOptions.map(s => (
                                  <option key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t border-border/30">
                            <div className="flex gap-2">
                              <Input
                                placeholder="Admin notes..."
                                value={ticketNotes[ticket.id] || ''}
                                onChange={(e) => setTicketNotes(prev => ({ ...prev, [ticket.id]: e.target.value }))}
                                className="text-xs h-8"
                                style={{ textTransform: "none" }}
                              />
                              <Button size="sm" variant="outline" className="text-xs shrink-0 h-8" style={{ textTransform: "none" }}
                                onClick={() => updateTicketStatus.mutate({ id: ticket.id, status: ticket.status, adminNotes: ticketNotes[ticket.id] || undefined })}
                                disabled={updateTicketStatus.isPending}>
                                Save Note
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* ─── Category Approvals Tab ──────────────────────── */}
            <TabsContent value="categories" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2"><Tags className="w-5 h-5 text-purple-500" /> Category Approval Requests</h2>
                <Button size="sm" variant="ghost" onClick={() => categoryApprovals.refetch()} style={{ textTransform: "none" }}><RefreshCw className="w-4 h-4 mr-1" /> Refresh</Button>
              </div>
              <p className="text-sm text-muted-foreground" style={{ textTransform: "none", letterSpacing: "normal" }}>
                Users can suggest new sports, business types, regions, or hubs. Approved items become available site-wide.
              </p>

              {categoryApprovals.isLoading ? (
                <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
              ) : !categoryApprovals.data?.length ? (
                <Card className="border-dashed"><CardContent className="p-12 text-center">
                  <Tags className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground">No Category Requests</h3>
                  <p className="text-sm text-muted-foreground/70" style={{ textTransform: "none" }}>When users suggest new categories, they'll appear here.</p>
                </CardContent></Card>
              ) : (
                <div className="space-y-3">
                  {categoryApprovals.data.map((item: any) => (
                    <Card key={item.id} className={`border ${item.status === 'pending' ? 'border-purple-200 bg-purple-50/30' : 'border-border/60'}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h3 className="font-semibold text-sm" style={{ textTransform: "none" }}>{item.proposedName}</h3>
                              <Badge variant="outline" className="text-[10px]" style={{ textTransform: "none" }}>{item.categoryType}</Badge>
                              {item.status === 'pending' && <Badge className="bg-amber-100 text-amber-800 text-[10px]">Pending</Badge>}
                              {item.status === 'approved' && <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">Approved</Badge>}
                              {item.status === 'rejected' && <Badge className="bg-red-100 text-red-800 text-[10px]">Rejected</Badge>}
                            </div>
                            {item.description && <p className="text-xs text-muted-foreground" style={{ textTransform: "none" }}>{item.description}</p>}
                            {item.parentRegion && <p className="text-xs text-muted-foreground" style={{ textTransform: "none" }}>Parent Region: {item.parentRegion}</p>}
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1" style={{ textTransform: "none" }}>
                              <span>User #{item.userId}</span>
                              <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          {item.status === 'pending' && (
                            <div className="flex gap-2 shrink-0">
                              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs" style={{ textTransform: "none" }}
                                onClick={() => updateCategoryApproval.mutate({ id: item.id, status: 'approved' })}
                                disabled={updateCategoryApproval.isPending}>
                                <CheckCircle2 className="w-3 h-3 mr-1" /> Approve
                              </Button>
                              <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 text-xs" style={{ textTransform: "none" }}
                                onClick={() => updateCategoryApproval.mutate({ id: item.id, status: 'rejected' })}
                                disabled={updateCategoryApproval.isPending}>
                                <XCircle className="w-3 h-3 mr-1" /> Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* ─── Users Tab ─────────────────────────────── */}
            <TabsContent value="users" className="space-y-4">
              <UsersTab />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
