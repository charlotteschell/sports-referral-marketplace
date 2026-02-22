import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2, Plus, Send, ArrowDownLeft, TrendingUp, Gift,
  Shield, MapPin, Pencil, ArrowRight, Bike, Mountain, Snowflake, Star,
  Loader2, BarChart3, Users, Percent, Clock, CheckCircle2,
  XCircle, AlertTriangle, Trash2, Unlink, ExternalLink,
  Palmtree, Activity, ArrowUpRight, ArrowDownRight, Eye, EyeOff,
  Settings, Bell, BellRing, BellOff, Mail, Save, X as XIcon, User
} from "lucide-react";
import { toast } from "sonner";
import { useState, useMemo, useEffect } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const sportIcons: Record<string, React.ReactNode> = {
  cycling: <Bike className="w-4 h-4" />,
  running: <Mountain className="w-4 h-4" />,
  "trail-running": <Mountain className="w-4 h-4" />,
  snowsports: <Snowflake className="w-4 h-4" />,
  "sport-vacations": <Palmtree className="w-4 h-4" />,
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: "Pending", color: "bg-amber-100 text-amber-800 border-amber-200", icon: <Clock className="w-3 h-3" /> },
  contacted: { label: "Contacted", color: "bg-blue-100 text-blue-800 border-blue-200", icon: <Send className="w-3 h-3" /> },
  converted: { label: "Converted", color: "bg-green-100 text-green-800 border-green-200", icon: <CheckCircle2 className="w-3 h-3" /> },
  declined: { label: "Declined", color: "bg-red-100 text-red-800 border-red-200", icon: <XCircle className="w-3 h-3" /> },
  expired: { label: "Expired", color: "bg-gray-100 text-gray-800 border-gray-200", icon: <AlertTriangle className="w-3 h-3" /> },
};

export default function Dashboard() {
  const { user, loading } = useAuth({ redirectOnUnauthenticated: true });
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();

  // Route guard: athletes/consumers should use /athlete-dashboard, not business dashboard
  useEffect(() => {
    if (!loading && user && user.accountType === 'consumer' && user.role !== 'admin') {
      navigate('/athlete-dashboard');
    }
  }, [loading, user, navigate]);

  // Settings panel state
  type NotifPref = "in_app_only" | "email_only" | "both" | "none";
  const [showSettings, setShowSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState<{
    name: string;
    email: string;
    notificationPreference: NotifPref;
  }>({
    name: "",
    email: "",
    notificationPreference: "both",
  });

  const { data: userProfile } = trpc.userProfile.get.useQuery(undefined, { enabled: !!user });
  const updateProfile = trpc.userProfile.update.useMutation({
    onSuccess: () => {
      toast.success("Settings saved successfully!");
      utils.userProfile.get.invalidate();
      utils.auth.me.invalidate();
      setShowSettings(false);
    },
    onError: (err) => toast.error(err.message),
  });

  // Populate settings form when opening
  useEffect(() => {
    if (showSettings && userProfile) {
      setSettingsForm({
        name: userProfile.name || "",
        email: userProfile.email || "",
        notificationPreference: (userProfile.notificationPreference || "both") as NotifPref,
      });
    }
  }, [showSettings, userProfile]);

  const { data: myBusinesses, isLoading: bizLoading } = trpc.business.myBusinesses.useQuery(
    undefined,
    { enabled: !!user }
  );

  const { data: analytics, isLoading: analyticsLoading } = trpc.dashboard.analytics.useQuery(
    undefined,
    { enabled: !!user }
  );

  const { data: sentReferrals, isLoading: sentLoading } = trpc.referral.sent.useQuery(
    undefined,
    { enabled: !!user }
  );

  const { data: receivedReferrals, isLoading: receivedLoading } = trpc.referral.received.useQuery(
    undefined,
    { enabled: !!user }
  );

  const unclaimMutation = trpc.businessActions.unclaim.useMutation({
    onSuccess: () => {
      toast.success("Business unclaimed successfully. It will remain in the directory as an unclaimed listing.");
      utils.business.myBusinesses.invalidate();
      utils.dashboard.analytics.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.businessActions.delete.useMutation({
    onSuccess: () => {
      toast.success("Business profile deleted successfully.");
      utils.business.myBusinesses.invalidate();
      utils.dashboard.analytics.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const toggleVisibilityMutation = trpc.business.toggleVisibility.useMutation({
    onSuccess: (_, variables) => {
      toast.success(variables.isHidden ? "Business hidden from public view." : "Business is now visible in the directory.");
      utils.business.myBusinesses.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateStatusMutation = trpc.referral.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Referral status updated.");
      utils.referral.sent.invalidate();
      utils.referral.received.invalidate();
      utils.dashboard.analytics.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  // Referral verification mutations
  const honorMutation = trpc.referralVerification.honor.useMutation({
    onSuccess: () => {
      toast.success("Referral marked as honored! The referring business can now confirm their cashout.");
      utils.referral.received.invalidate();
      utils.referral.sent.invalidate();
      utils.dashboard.analytics.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const cashoutMutation = trpc.referralVerification.cashout.useMutation({
    onSuccess: () => {
      toast.success("Cashout confirmed! The incentive has been recorded.");
      utils.referral.sent.invalidate();
      utils.referral.received.invalidate();
      utils.dashboard.analytics.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const disputeMutation = trpc.referralVerification.dispute.useMutation({
    onSuccess: () => {
      toast.success("Dispute submitted. An admin will review this.");
      utils.referral.sent.invalidate();
      utils.referral.received.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  // Consumer claims
  const { data: myClaims, isLoading: claimsLoading } = trpc.consumerClaim.myClaims.useQuery(
    undefined,
    { enabled: !!user }
  );
  const { data: consumerAnalytics } = trpc.consumerClaim.myAnalytics.useQuery(
    undefined,
    { enabled: !!user }
  );

  const verifyClaimMutation = trpc.consumerClaim.verify.useMutation({
    onSuccess: () => {
      toast.success("Verification submitted. Thank you!");
      utils.consumerClaim.myClaims.invalidate();
      utils.consumerClaim.myAnalytics.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const [cashoutAmount, setCashoutAmount] = useState("");
  const [cashoutNotes, setCashoutNotes] = useState("");
  const [disputeReason, setDisputeReason] = useState("");
  const [verifyAmount, setVerifyAmount] = useState("");
  const [verifyNotes, setVerifyNotes] = useState("");

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const statusBreakdown = analytics?.statusBreakdown || { pending: 0, contacted: 0, converted: 0, declined: 0, expired: 0 };
  const totalStatusItems = Object.values(statusBreakdown).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Dashboard Header */}
      <section className="bg-[oklch(0.22_0.02_50)] text-white py-8 md:py-10">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-1" style={{ fontFamily: "var(--font-heading)" }}>
                Dashboard
              </h1>
              <p className="text-white/70" style={{ textTransform: "none", letterSpacing: "normal" }}>
                Welcome back, {user?.name || "there"}. Here's what's happening with your referrals and businesses.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard/add-business">
                <Button className="bg-primary text-primary-foreground" style={{ textTransform: "none" }}>
                  <Plus className="w-4 h-4 mr-2" /> Add Business
                </Button>
              </Link>
              <Link href="/directory">
                <Button variant="outline" className="bg-transparent border-white/30 text-white hover:bg-white/10" style={{ textTransform: "none" }}>
                  <Building2 className="w-4 h-4 mr-2" /> Browse Directory
                </Button>
              </Link>
              <Button
                variant="outline"
                className="bg-transparent border-white/30 text-white hover:bg-white/10"
                style={{ textTransform: "none" }}
                onClick={() => setShowSettings(true)}
              >
                <Settings className="w-4 h-4 mr-2" /> Settings
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-6 md:py-8">
        <div className="container">

          {/* KPI Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {[
              {
                label: "Referrals Sent",
                value: analytics?.totalReferralsSent || 0,
                icon: <ArrowUpRight className="w-5 h-5" />,
                color: "text-primary",
                bg: "bg-primary/10",
              },
              {
                label: "Referrals Received",
                value: analytics?.totalReferralsReceived || 0,
                icon: <ArrowDownRight className="w-5 h-5" />,
                color: "text-[oklch(0.55_0.15_45)]",
                bg: "bg-[oklch(0.55_0.15_45)]/10",
              },
              {
                label: "Conversion Rate",
                value: `${analytics?.conversionRate || 0}%`,
                icon: <Percent className="w-5 h-5" />,
                color: "text-green-600",
                bg: "bg-green-100",
              },
              {
                label: "Active Offers",
                value: analytics?.activeOffers || 0,
                icon: <Gift className="w-5 h-5" />,
                color: "text-blue-600",
                bg: "bg-blue-100",
              },
              {
                label: "Pending",
                value: statusBreakdown.pending,
                icon: <Clock className="w-5 h-5" />,
                color: "text-amber-600",
                bg: "bg-amber-100",
              },
            ].map((stat) => (
              <Card key={stat.label} className="relative overflow-hidden">
                <CardContent className="p-4 md:p-5">
                  <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center ${stat.color} mb-3`}>
                    {stat.icon}
                  </div>
                  <p className="text-2xl md:text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                    {analyticsLoading ? <span className="animate-pulse">—</span> : stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1" style={{ textTransform: "none" }}>{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-6 mb-8">

            {/* Referral Status Breakdown */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Referral Status Breakdown
                </CardTitle>
                <CardDescription style={{ textTransform: "none", letterSpacing: "normal" }}>
                  Overview of all your referral statuses
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-muted rounded w-full mb-2" />
                      </div>
                    ))}
                  </div>
                ) : totalStatusItems === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground" style={{ textTransform: "none", letterSpacing: "normal" }}>
                      No referral activity yet. Send your first referral to get started.
                    </p>
                    <Link href="/dashboard/send-referral">
                      <Button className="mt-4 bg-primary text-primary-foreground" size="sm" style={{ textTransform: "none" }}>
                        <Send className="w-4 h-4 mr-2" /> Send a Referral
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(statusBreakdown).map(([status, count]) => {
                      const config = statusConfig[status];
                      const percentage = totalStatusItems > 0 ? Math.round((count / totalStatusItems) * 100) : 0;
                      return (
                        <div key={status}>
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={`${config.color} text-xs px-2 py-0.5`} style={{ textTransform: "none" }}>
                                {config.icon}
                                <span className="ml-1">{config.label}</span>
                              </Badge>
                            </div>
                            <span className="text-sm font-semibold">{count} <span className="text-muted-foreground font-normal">({percentage}%)</span></span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2.5">
                            <div
                              className={`h-2.5 rounded-full transition-all duration-500 ${
                                status === 'converted' ? 'bg-green-500' :
                                status === 'contacted' ? 'bg-blue-500' :
                                status === 'pending' ? 'bg-amber-500' :
                                status === 'declined' ? 'bg-red-500' :
                                'bg-gray-400'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Referral Partners */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="w-5 h-5 text-primary" />
                  Top Partners
                </CardTitle>
                <CardDescription style={{ textTransform: "none", letterSpacing: "normal" }}>
                  Businesses that send you the most referrals
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="animate-pulse flex items-center gap-3">
                        <div className="w-8 h-8 bg-muted rounded-full" />
                        <div className="flex-1"><div className="h-4 bg-muted rounded w-3/4" /></div>
                      </div>
                    ))}
                  </div>
                ) : !analytics?.topPartners?.length ? (
                  <div className="text-center py-6">
                    <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground" style={{ textTransform: "none", letterSpacing: "normal" }}>
                      No referral partners yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {analytics.topPartners.map((partner, idx) => (
                      <div key={partner.businessId} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link href={`/business/${partner.businessSlug}`}>
                            <p className="text-sm font-medium truncate hover:text-primary transition-colors cursor-pointer" style={{ textTransform: "none" }}>
                              {partner.businessName}
                            </p>
                          </Link>
                        </div>
                        <Badge variant="outline" className="text-xs" style={{ textTransform: "none" }}>
                          {partner.referralCount} referral{partner.referralCount !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Referral Activity Tabs */}
          <Card className="mb-8">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="w-5 h-5 text-primary" />
                Referral Activity
              </CardTitle>
              <CardDescription style={{ textTransform: "none", letterSpacing: "normal" }}>
                Track and manage your sent and received referrals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="recent" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="recent" style={{ textTransform: "none" }}>Recent Activity</TabsTrigger>
                  <TabsTrigger value="sent" style={{ textTransform: "none" }}>
                    Sent ({sentReferrals?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="received" style={{ textTransform: "none" }}>
                    Received ({receivedReferrals?.length || 0})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="recent">
                  {analyticsLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="animate-pulse p-3 border rounded-lg">
                          <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                          <div className="h-3 bg-muted rounded w-1/2" />
                        </div>
                      ))}
                    </div>
                  ) : !analytics?.recentActivity?.length ? (
                    <div className="text-center py-8">
                      <Activity className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground mb-3" style={{ textTransform: "none", letterSpacing: "normal" }}>
                        No recent referral activity
                      </p>
                      <Link href="/dashboard/send-referral">
                        <Button className="bg-primary text-primary-foreground" size="sm" style={{ textTransform: "none" }}>
                          <Send className="w-4 h-4 mr-2" /> Send Your First Referral
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {analytics.recentActivity.map((item, idx) => {
                        const config = statusConfig[item.referral.status || 'pending'];
                        return (
                          <div key={idx} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              item.direction === 'sent' ? 'bg-primary/10 text-primary' : 'bg-[oklch(0.55_0.15_45)]/10 text-[oklch(0.55_0.15_45)]'
                            }`}>
                              {item.direction === 'sent' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium" style={{ textTransform: "none" }}>
                                {item.direction === 'sent' ? 'Sent to' : 'Received from'}{' '}
                                <span className="text-primary">{item.partnerBusiness?.name || 'Unknown'}</span>
                              </p>
                              <p className="text-xs text-muted-foreground" style={{ textTransform: "none" }}>
                                {item.referral.customerName && `Customer: ${item.referral.customerName} · `}
                                {item.referral.createdAt ? new Date(item.referral.createdAt).toLocaleDateString() : ''}
                              </p>
                            </div>
                            <Badge variant="outline" className={`${config.color} text-xs`} style={{ textTransform: "none" }}>
                              {config.icon}
                              <span className="ml-1">{config.label}</span>
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="sent">
                  {sentLoading ? (
                    <div className="space-y-3">
                      {[1, 2].map(i => <div key={i} className="animate-pulse p-3 border rounded-lg"><div className="h-4 bg-muted rounded w-3/4 mb-2" /><div className="h-3 bg-muted rounded w-1/2" /></div>)}
                    </div>
                  ) : !sentReferrals?.length ? (
                    <div className="text-center py-8">
                      <Send className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground" style={{ textTransform: "none", letterSpacing: "normal" }}>No referrals sent yet. Time to spread the love?</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {sentReferrals.map((item) => {
                        const config = statusConfig[item.referral.status || 'pending'];
                        const r = item.referral as any;
                        return (
                          <div key={item.referral.id} className="p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                <ArrowUpRight className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium" style={{ textTransform: "none" }}>
                                  Sent to <span className="text-primary">{item.receivingBusiness?.name || 'Unknown'}</span>
                                </p>
                                <p className="text-xs text-muted-foreground" style={{ textTransform: "none" }}>
                                  {item.referral.customerName && `${item.referral.customerName} · `}
                                  {item.referral.createdAt ? new Date(item.referral.createdAt).toLocaleDateString() : ''}
                                </p>
                              </div>
                              <Badge variant="outline" className={`${config.color} text-xs`} style={{ textTransform: "none" }}>
                                {config.icon}
                                <span className="ml-1">{config.label}</span>
                              </Badge>
                            </div>
                            {/* Verification status & cashout */}
                            <div className="mt-3 ml-12 flex flex-wrap items-center gap-2">
                              {r.receiverHonored ? (
                                <Badge className="bg-green-100 text-green-800 border-green-200 text-xs" style={{ textTransform: "none" }}>
                                  <CheckCircle2 className="w-3 h-3 mr-1" /> Honored by receiver
                                </Badge>
                              ) : (
                                <Badge className="bg-gray-100 text-gray-600 text-xs" style={{ textTransform: "none" }}>
                                  <Clock className="w-3 h-3 mr-1" /> Awaiting honor confirmation
                                </Badge>
                              )}
                              {r.senderCashedOut ? (
                                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs" style={{ textTransform: "none" }}>
                                  <CheckCircle2 className="w-3 h-3 mr-1" /> Cashed out{r.incentiveAmount ? ` $${r.incentiveAmount}` : ''}
                                </Badge>
                              ) : r.receiverHonored && !r.isDisputed ? (
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button size="sm" className="bg-emerald-600 text-white h-7 text-xs hover:bg-emerald-700" style={{ textTransform: "none" }}>
                                      Confirm Cashout
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Confirm Incentive Cashout</DialogTitle>
                                      <DialogDescription style={{ textTransform: "none", letterSpacing: "normal" }}>
                                        Confirm that you received the incentive from {item.receivingBusiness?.name}.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <Label style={{ textTransform: "none" }}>Amount received ($)</Label>
                                        <Input type="number" placeholder="e.g. 25.00" value={cashoutAmount} onChange={e => setCashoutAmount(e.target.value)} />
                                      </div>
                                      <div>
                                        <Label style={{ textTransform: "none" }}>Notes (optional)</Label>
                                        <Textarea placeholder="Any additional details..." value={cashoutNotes} onChange={e => setCashoutNotes(e.target.value)} />
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <Button className="bg-emerald-600 text-white hover:bg-emerald-700" style={{ textTransform: "none" }}
                                        onClick={() => { cashoutMutation.mutate({ referralId: item.referral.id, amount: cashoutAmount, notes: cashoutNotes }); setCashoutAmount(''); setCashoutNotes(''); }}
                                        disabled={cashoutMutation.isPending}
                                      >
                                        {cashoutMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                        Confirm Cashout
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              ) : null}
                              {r.isDisputed && (
                                <Badge className="bg-red-100 text-red-800 text-xs" style={{ textTransform: "none" }}>
                                  <AlertTriangle className="w-3 h-3 mr-1" /> Disputed
                                </Badge>
                              )}
                              {!r.isDisputed && !r.senderCashedOut && (
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700 h-7 text-xs" style={{ textTransform: "none" }}>
                                      Dispute
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Dispute Referral</DialogTitle>
                                      <DialogDescription style={{ textTransform: "none", letterSpacing: "normal" }}>
                                        Explain why you are disputing this referral.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <Textarea placeholder="Reason for dispute..." value={disputeReason} onChange={e => setDisputeReason(e.target.value)} />
                                    <DialogFooter>
                                      <Button className="bg-red-600 text-white hover:bg-red-700" style={{ textTransform: "none" }}
                                        onClick={() => { disputeMutation.mutate({ referralId: item.referral.id, reason: disputeReason }); setDisputeReason(''); }}
                                        disabled={disputeMutation.isPending || !disputeReason}
                                      >
                                        Submit Dispute
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="received">
                  {receivedLoading ? (
                    <div className="space-y-3">
                      {[1, 2].map(i => <div key={i} className="animate-pulse p-3 border rounded-lg"><div className="h-4 bg-muted rounded w-3/4 mb-2" /><div className="h-3 bg-muted rounded w-1/2" /></div>)}
                    </div>
                  ) : !receivedReferrals?.length ? (
                    <div className="text-center py-8">
                      <ArrowDownLeft className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground" style={{ textTransform: "none", letterSpacing: "normal" }}>No referrals received yet. They'll come. Patience, grasshopper.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {receivedReferrals.map((item) => {
                        const config = statusConfig[item.referral.status || 'pending'];
                        const r = item.referral as any;
                        return (
                          <div key={item.referral.id} className="p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="w-8 h-8 rounded-full bg-[oklch(0.55_0.15_45)]/10 text-[oklch(0.55_0.15_45)] flex items-center justify-center">
                                <ArrowDownRight className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium" style={{ textTransform: "none" }}>
                                  From <span className="text-primary">{item.referringBusiness?.name || 'Unknown'}</span>
                                </p>
                                <p className="text-xs text-muted-foreground" style={{ textTransform: "none" }}>
                                  {item.referral.customerName && `${item.referral.customerName} · `}
                                  {item.referral.createdAt ? new Date(item.referral.createdAt).toLocaleDateString() : ''}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className={`${config.color} text-xs`} style={{ textTransform: "none" }}>
                                  {config.icon}
                                  <span className="ml-1">{config.label}</span>
                                </Badge>
                                {item.referral.status === 'pending' && (
                                  <Button size="sm" variant="outline" className="bg-transparent h-7 text-xs" style={{ textTransform: "none" }}
                                    onClick={() => updateStatusMutation.mutate({ id: item.referral.id, status: 'contacted' })}>
                                    Mark Contacted
                                  </Button>
                                )}
                                {item.referral.status === 'contacted' && (
                                  <Button size="sm" className="bg-green-600 text-white h-7 text-xs hover:bg-green-700" style={{ textTransform: "none" }}
                                    onClick={() => updateStatusMutation.mutate({ id: item.referral.id, status: 'converted' })}>
                                    Mark Converted
                                  </Button>
                                )}
                              </div>
                            </div>
                            {/* Honor / Dispute actions */}
                            <div className="mt-3 ml-12 flex flex-wrap items-center gap-2">
                              {r.receiverHonored ? (
                                <Badge className="bg-green-100 text-green-800 border-green-200 text-xs" style={{ textTransform: "none" }}>
                                  <CheckCircle2 className="w-3 h-3 mr-1" /> You honored this referral
                                </Badge>
                              ) : !r.isDisputed ? (
                                <Button size="sm" className="bg-green-600 text-white h-7 text-xs hover:bg-green-700" style={{ textTransform: "none" }}
                                  onClick={() => honorMutation.mutate({ referralId: item.referral.id })}
                                  disabled={honorMutation.isPending}>
                                  {honorMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <CheckCircle2 className="w-3 h-3 mr-1" />}
                                  Honor Referral
                                </Button>
                              ) : null}
                              {r.senderCashedOut && (
                                <Badge className="bg-emerald-100 text-emerald-800 text-xs" style={{ textTransform: "none" }}>
                                  <CheckCircle2 className="w-3 h-3 mr-1" /> Sender cashed out{r.incentiveAmount ? ` $${r.incentiveAmount}` : ''}
                                </Badge>
                              )}
                              {r.isDisputed && (
                                <Badge className="bg-red-100 text-red-800 text-xs" style={{ textTransform: "none" }}>
                                  <AlertTriangle className="w-3 h-3 mr-1" /> Disputed
                                </Badge>
                              )}
                              {!r.isDisputed && !r.receiverHonored && (
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700 h-7 text-xs" style={{ textTransform: "none" }}>
                                      Dispute
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Dispute Referral</DialogTitle>
                                      <DialogDescription style={{ textTransform: "none", letterSpacing: "normal" }}>
                                        Explain why you are disputing this referral.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <Textarea placeholder="Reason for dispute..." value={disputeReason} onChange={e => setDisputeReason(e.target.value)} />
                                    <DialogFooter>
                                      <Button className="bg-red-600 text-white hover:bg-red-700" style={{ textTransform: "none" }}
                                        onClick={() => { disputeMutation.mutate({ referralId: item.referral.id, reason: disputeReason }); setDisputeReason(''); }}
                                        disabled={disputeMutation.isPending || !disputeReason}>
                                        Submit Dispute
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* My Businesses */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                My Businesses
              </h2>
              <Link href="/dashboard/add-business">
                <Button size="sm" variant="outline" className="bg-transparent" style={{ textTransform: "none" }}>
                  <Plus className="w-4 h-4 mr-1" /> Add New
                </Button>
              </Link>
            </div>

            {bizLoading ? (
              <div className="grid md:grid-cols-2 gap-4">
                {[1, 2].map(i => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-5 bg-muted rounded w-2/3 mb-3" />
                      <div className="h-4 bg-muted rounded w-full mb-2" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : !myBusinesses || myBusinesses.length === 0 ? (
              <Card className="border-dashed border-2">
                <CardContent className="p-8 text-center">
                  <Building2 className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-lg font-bold mb-2">No Businesses Yet</h3>
                  <p className="text-muted-foreground mb-4" style={{ textTransform: "none", letterSpacing: "normal" }}>
                    Add your business or claim an existing one from the directory to start receiving referrals.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/dashboard/add-business">
                      <Button className="bg-primary text-primary-foreground" style={{ textTransform: "none" }}>
                        <Plus className="w-4 h-4 mr-2" /> Add New Business
                      </Button>
                    </Link>
                    <Link href="/directory">
                      <Button variant="outline" className="bg-transparent" style={{ textTransform: "none" }}>
                        Claim Existing Business
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {myBusinesses.map((item) => (
                  <Card key={item.business.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          {sportIcons[item.sportCategory?.slug || ""] || <Star className="w-5 h-5" />}
                        </div>
                        <div className="flex items-center gap-2">
                          {item.business.approvalStatus === 'pending' && (
                            <Badge className="bg-amber-100 text-amber-800 border-amber-200" style={{ textTransform: "none" }}>
                              <Clock className="w-3 h-3 mr-1" /> Pending Approval
                            </Badge>
                          )}
                          {item.business.isHidden && (
                            <Badge className="bg-gray-100 text-gray-600" style={{ textTransform: "none" }}>
                              <EyeOff className="w-3 h-3 mr-1" /> Hidden
                            </Badge>
                          )}
                          {item.business.isAdminHidden && (
                            <Badge className="bg-red-100 text-red-800" style={{ textTransform: "none" }}>
                              <EyeOff className="w-3 h-3 mr-1" /> Admin Hidden
                            </Badge>
                          )}
                          {!item.business.isHidden && !item.business.isAdminHidden && item.business.approvalStatus !== 'pending' && (
                            <Badge className="bg-primary/10 text-primary" style={{ textTransform: "none" }}>
                              <Shield className="w-3 h-3 mr-1" /> Claimed
                            </Badge>
                          )}
                        </div>
                      </div>
                      <h3 className="font-bold text-foreground mb-1">{item.business.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2" style={{ textTransform: "none", letterSpacing: "normal" }}>
                        {item.business.shortDescription}
                      </p>
                      {item.business.city && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mb-4" style={{ textTransform: "none" }}>
                          <MapPin className="w-3 h-3" />
                          {item.business.city}{item.business.country ? `, ${item.business.country}` : ""}
                          {item.business.hub && <span className="text-primary/70 ml-1">· {item.business.hub}</span>}
                        </p>
                      )}

                      {/* Action Buttons */}
                      {item.business.approvalStatus === 'pending' ? (
                        <div className="flex items-center gap-2 mb-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                          <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                          <p className="text-sm text-amber-700 dark:text-amber-300" style={{ textTransform: 'none', letterSpacing: 'normal' }}>Awaiting admin approval. You'll be able to edit and manage offers once approved.</p>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Link href={`/dashboard/edit/${item.business.id}`}>
                            <Button size="sm" variant="outline" className="bg-transparent" style={{ textTransform: "none" }}>
                              <Pencil className="w-3 h-3 mr-1" /> Edit Info
                            </Button>
                          </Link>
                          <Link href={`/dashboard/offers/${item.business.id}`}>
                            <Button size="sm" variant="outline" className="bg-transparent" style={{ textTransform: "none" }}>
                              <Gift className="w-3 h-3 mr-1" /> Manage Offers
                            </Button>
                          </Link>
                          <Link href={`/business/${item.business.slug}`}>
                            <Button size="sm" variant="ghost" style={{ textTransform: "none" }}>
                              <ExternalLink className="w-3 h-3 mr-1" /> View Profile
                            </Button>
                          </Link>
                        </div>
                      )}

                      {/* Visibility, Unclaim & Delete Actions */}
                      <div className="flex flex-wrap gap-2 pt-3 border-t border-border/50">
                        {item.business.approvalStatus !== 'pending' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className={`text-xs ${item.business.isHidden ? 'text-emerald-600 hover:text-emerald-700' : 'text-muted-foreground hover:text-gray-600'}`}
                            style={{ textTransform: "none" }}
                            onClick={() => toggleVisibilityMutation.mutate({ businessId: item.business.id, isHidden: !item.business.isHidden })}
                            disabled={toggleVisibilityMutation.isPending}
                          >
                            {item.business.isHidden ? (
                              <><Eye className="w-3 h-3 mr-1" /> Show</>  
                            ) : (
                              <><EyeOff className="w-3 h-3 mr-1" /> Hide</>  
                            )}
                          </Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-amber-600 text-xs" style={{ textTransform: "none" }}>
                              <Unlink className="w-3 h-3 mr-1" /> Unclaim
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Unclaim this business?</AlertDialogTitle>
                              <AlertDialogDescription style={{ textTransform: "none", letterSpacing: "normal" }}>
                                This will release your ownership of <strong>{item.business.name}</strong>. The business will remain in the directory as an unclaimed listing, but your referral offers will be deactivated. Another user can claim it later.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel style={{ textTransform: "none" }}>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-amber-600 hover:bg-amber-700"
                                style={{ textTransform: "none" }}
                                onClick={() => unclaimMutation.mutate({ businessId: item.business.id })}
                              >
                                Yes, Unclaim
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-red-600 text-xs" style={{ textTransform: "none" }}>
                              <Trash2 className="w-3 h-3 mr-1" /> Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete this business?</AlertDialogTitle>
                              <AlertDialogDescription style={{ textTransform: "none", letterSpacing: "normal" }}>
                                This will permanently remove <strong>{item.business.name}</strong> from the directory. All referral offers and associated data will be deactivated. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel style={{ textTransform: "none" }}>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-600 hover:bg-red-700"
                                style={{ textTransform: "none" }}
                                onClick={() => deleteMutation.mutate({ businessId: item.business.id })}
                              >
                                Yes, Delete Permanently
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* B2B Referral Partnerships */}
          <Card className="mb-8">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Send className="w-5 h-5 text-primary" />
                B2B Referral Partnerships
              </CardTitle>
              <CardDescription style={{ textTransform: "none", letterSpacing: "normal" }}>
                Track referrals you've sent as a business partner and monitor their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* B2B Referral Summary */}
              {analytics && (analytics.totalReferralsSent > 0) && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  <div className="p-3 rounded-lg bg-primary/5 text-center">
                    <p className="text-2xl font-bold text-primary">{analytics.totalReferralsSent}</p>
                    <p className="text-xs text-muted-foreground" style={{ textTransform: "none" }}>Referrals Sent</p>
                  </div>
                  <div className="p-3 rounded-lg bg-green-50 text-center">
                    <p className="text-2xl font-bold text-green-600">{statusBreakdown.converted || 0}</p>
                    <p className="text-xs text-muted-foreground" style={{ textTransform: "none" }}>Converted</p>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-50 text-center">
                    <p className="text-2xl font-bold text-emerald-600">${analytics.conversionRate || 0}</p>
                    <p className="text-xs text-muted-foreground" style={{ textTransform: "none" }}>Conversion %</p>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-50 text-center">
                    <p className="text-2xl font-bold text-amber-600">{statusBreakdown.pending || 0}</p>
                    <p className="text-xs text-muted-foreground" style={{ textTransform: "none" }}>Pending</p>
                  </div>
                </div>
              )}

              {sentLoading ? (
                <div className="space-y-3">
                  {[1, 2].map(i => <div key={i} className="animate-pulse p-3 border rounded-lg"><div className="h-4 bg-muted rounded w-3/4 mb-2" /><div className="h-3 bg-muted rounded w-1/2" /></div>)}
                </div>
              ) : !sentReferrals?.length ? (
                <div className="text-center py-8">
                  <Send className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground mb-3" style={{ textTransform: "none", letterSpacing: "normal" }}>
                    You haven't sent any referrals yet. Know a business that could use some extra customers? Send them one. Karma's a real thing in this network.
                  </p>
                  <Link href="/dashboard/send-referral">
                    <Button className="bg-primary text-primary-foreground" size="sm" style={{ textTransform: "none" }}>
                      <Send className="w-4 h-4 mr-2" /> Send Your First Referral
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {sentReferrals.map((ref: any) => {
                    const status = statusConfig[ref.referral.status] || statusConfig.pending;
                    return (
                      <div key={ref.referral.id} className="p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                            <ArrowUpRight className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium" style={{ textTransform: "none" }}>
                              Referral to <Link href={`/business/${ref.toBusiness?.slug || ''}`}><span className="text-primary cursor-pointer hover:underline">{ref.toBusiness?.name || 'Unknown'}</span></Link>
                            </p>
                            <p className="text-xs text-muted-foreground" style={{ textTransform: "none" }}>
                              {ref.referral.customerName || 'Customer'}
                              {ref.referral.incentiveAmount ? ` · $${ref.referral.incentiveAmount} incentive` : ''}
                              {' · '}{ref.referral.createdAt ? new Date(ref.referral.createdAt).toLocaleDateString() : ''}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={`text-xs border ${status.color}`} style={{ textTransform: "none" }}>
                              {status.icon}
                              <span className="ml-1">{status.label}</span>
                            </Badge>
                            {ref.referral.status === 'pending' && (
                              <select
                                className="text-xs border rounded px-2 py-1 bg-background"
                                defaultValue=""
                                onChange={(e) => {
                                  if (e.target.value) {
                                    updateStatusMutation.mutate({ id: ref.referral.id, status: e.target.value as any });
                                    e.target.value = '';
                                  }
                                }}
                              >
                                <option value="" disabled>Update...</option>
                                <option value="contacted">Contacted</option>
                                <option value="converted">Converted</option>
                                <option value="declined">Declined</option>
                              </select>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions Footer */}
          <Card className="bg-[oklch(0.22_0.02_50)] text-white border-0">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-lg font-bold mb-1" style={{ fontFamily: "var(--font-heading)" }}>
                    Grow Your Network
                  </h3>
                  <p className="text-white/70 text-sm" style={{ textTransform: "none", letterSpacing: "normal" }}>
                    Send referrals to partner businesses and earn incentives. Community supporting community.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link href="/dashboard/send-referral">
                    <Button className="bg-primary text-primary-foreground" style={{ textTransform: "none" }}>
                      <Send className="w-4 h-4 mr-2" /> Send a Referral
                    </Button>
                  </Link>
                  <Link href="/referral-offers">
                    <Button variant="outline" className="bg-transparent border-white/30 text-white hover:bg-white/10" style={{ textTransform: "none" }}>
                      <Gift className="w-4 h-4 mr-2" /> Browse Offers
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </section>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" /> Profile & Settings
            </DialogTitle>
            <DialogDescription>
              Update your profile information and notification preferences.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Profile Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Profile Information</h3>
              <div className="space-y-2">
                <Label htmlFor="settings-name">Display Name</Label>
                <Input
                  id="settings-name"
                  value={settingsForm.name}
                  onChange={(e) => setSettingsForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="settings-email">Email Address</Label>
                <Input
                  id="settings-email"
                  type="email"
                  value={settingsForm.email}
                  onChange={(e) => setSettingsForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Notification Preferences</h3>
              <p className="text-sm text-muted-foreground">Choose how you'd like to receive notifications about referrals, offers, and updates.</p>
              <div className="space-y-3">
                {[
                  { value: "both", label: "Email & In-App", desc: "Get notified via email and in the app", icon: <BellRing className="w-4 h-4" /> },
                  { value: "email_only", label: "Email Only", desc: "Only receive email notifications", icon: <Mail className="w-4 h-4" /> },
                  { value: "in_app_only", label: "In-App Only", desc: "Only see notifications in the app", icon: <Bell className="w-4 h-4" /> },
                  { value: "none", label: "None", desc: "Don't send me any notifications", icon: <BellOff className="w-4 h-4" /> },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      settingsForm.notificationPreference === option.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    }`}
                    onClick={() => setSettingsForm(prev => ({ ...prev, notificationPreference: option.value as NotifPref }))}
                  >
                    <div className={`p-1.5 rounded-md ${
                      settingsForm.notificationPreference === option.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {option.icon}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{option.label}</div>
                      <div className="text-xs text-muted-foreground">{option.desc}</div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      settingsForm.notificationPreference === option.value
                        ? "border-primary bg-primary"
                        : "border-muted-foreground/30"
                    }`}>
                      {settingsForm.notificationPreference === option.value && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettings(false)} style={{ textTransform: "none" }}>
              Cancel
            </Button>
            <Button
              onClick={() => updateProfile.mutate(settingsForm)}
              disabled={updateProfile.isPending}
              style={{ textTransform: "none" }}
            >
              {updateProfile.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
              ) : (
                <><Save className="w-4 h-4 mr-2" /> Save Changes</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
