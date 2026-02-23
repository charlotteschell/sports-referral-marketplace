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
  Settings, Bell, BellRing, BellOff, Mail, Save, X as XIcon, User,
  Check, Circle
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

  // Welcome checklist for first-time business owners
  const [showWelcome, setShowWelcome] = useState(false);
  const updateWelcomeProgress = trpc.auth.updateWelcomeProgress.useMutation({
    onSuccess: () => utils.auth.me.invalidate(),
  });
  const dismissWelcome = trpc.auth.dismissWelcome.useMutation({
    onSuccess: () => utils.auth.me.invalidate(),
  });
  const welcomeProgress: Record<string, boolean> = useMemo(() => {
    try { return user?.welcomeProgress ? JSON.parse(user.welcomeProgress as string) : {}; } catch { return {}; }
  }, [user?.welcomeProgress]);
  const allWelcomeStepsDone = welcomeProgress.directory && welcomeProgress.addBusiness && welcomeProgress.offers;
  useEffect(() => {
    if (!loading && user && user.onboardingComplete && !user.hasSeenWelcome && !allWelcomeStepsDone) {
      setShowWelcome(true);
    }
  }, [loading, user, allWelcomeStepsDone]);
  const handleWelcomeStep = (stepKey: string, navigateTo: string) => {
    updateWelcomeProgress.mutate({ stepKey });
    setShowWelcome(false);
    navigate(navigateTo);
  };
  const handleSkipWelcome = () => {
    setShowWelcome(false);
  };
  const handleDismissAllWelcome = () => {
    setShowWelcome(false);
    dismissWelcome.mutate();
  };

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
                Welcome back, {user?.contactName || user?.name || "there"}. Here's what's happening with your referrals and businesses.
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

          {/* Verified Scorecard */}
          {analytics?.verifiedScorecard && (
            <Card className="mb-8 border-blue-200/50 bg-gradient-to-r from-blue-50/50 to-transparent">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="w-5 h-5 text-blue-600" />
                  Verified Scorecard
                </CardTitle>
                <CardDescription style={{ textTransform: "none", letterSpacing: "normal" }}>
                  Dual-verified referral amounts confirmed by both sender and receiver
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-white/60 rounded-lg">
                    <p className="text-2xl font-bold text-blue-700" style={{ fontFamily: "var(--font-heading)" }}>
                      {analytics.verifiedScorecard.verifiedCount || 0}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1" style={{ textTransform: "none" }}>Verified Referrals</p>
                  </div>
                  <div className="text-center p-3 bg-white/60 rounded-lg">
                    <p className="text-2xl font-bold text-emerald-700" style={{ fontFamily: "var(--font-heading)" }}>
                      ${analytics.verifiedScorecard.totalVerifiedIncentive || '0.00'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1" style={{ textTransform: "none" }}>Verified Incentives</p>
                  </div>
                  <div className="text-center p-3 bg-white/60 rounded-lg">
                    <p className="text-2xl font-bold text-amber-700" style={{ fontFamily: "var(--font-heading)" }}>
                      {analytics.verifiedScorecard.pendingVerification || 0}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1" style={{ textTransform: "none" }}>Pending Verification</p>
                  </div>
                  <div className="text-center p-3 bg-white/60 rounded-lg">
                    <p className="text-2xl font-bold text-blue-700" style={{ fontFamily: "var(--font-heading)" }}>
                      {analytics.verifiedScorecard.verificationRate || '0'}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-1" style={{ textTransform: "none" }}>Verification Rate</p>
                    <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${analytics.verifiedScorecard.verificationRate || 0}%` }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

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
                              {/* Dual-verification badge */}
                              {r.senderCashedOut && r.receiverHonored ? (
                                r.senderConfirmedIncentiveAmount && r.receiverConfirmedIncentiveAmount && r.isIncentiveVerified ? (
                                  <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs" style={{ textTransform: "none" }}>
                                    <Shield className="w-3 h-3 mr-1" /> Verified ${r.senderConfirmedIncentiveAmount}
                                  </Badge>
                                ) : r.senderConfirmedIncentiveAmount ? (
                                  <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs" style={{ textTransform: "none" }}>
                                    <Shield className="w-3 h-3 mr-1" /> You confirmed ${r.senderConfirmedIncentiveAmount}
                                  </Badge>
                                ) : r.receiverConfirmedIncentiveAmount ? (
                                  <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs" style={{ textTransform: "none" }}>
                                    <Shield className="w-3 h-3 mr-1" /> Receiver confirmed ${r.receiverConfirmedIncentiveAmount}
                                  </Badge>
                                ) : null
                              ) : null}
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
                              {/* Dual-verification badge (received) */}
                              {r.senderCashedOut && r.receiverHonored ? (
                                r.senderConfirmedIncentiveAmount && r.receiverConfirmedIncentiveAmount && r.isIncentiveVerified ? (
                                  <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs" style={{ textTransform: "none" }}>
                                    <Shield className="w-3 h-3 mr-1" /> Verified ${r.receiverConfirmedIncentiveAmount}
                                  </Badge>
                                ) : r.receiverConfirmedIncentiveAmount ? (
                                  <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs" style={{ textTransform: "none" }}>
                                    <Shield className="w-3 h-3 mr-1" /> You confirmed ${r.receiverConfirmedIncentiveAmount}
                                  </Badge>
                                ) : r.senderConfirmedIncentiveAmount ? (
                                  <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs" style={{ textTransform: "none" }}>
                                    <Shield className="w-3 h-3 mr-1" /> Sender confirmed ${r.senderConfirmedIncentiveAmount}
                                  </Badge>
                                ) : null
                              ) : null}
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
                    <p className="text-2xl font-bold text-emerald-600">{analytics.conversionRate || 0}%</p>
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
                              Referral to <Link href={`/business/${ref.receivingBusiness?.slug || ''}`}><span className="text-primary cursor-pointer hover:underline">{ref.receivingBusiness?.name || 'Unknown'}</span></Link>
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

          {/* Athlete Claims Management */}
          {(user?.role === 'admin' || (myBusinesses && myBusinesses.length > 0)) && (
            <AthleteClaimsSection businesses={myBusinesses || []} isAdmin={user?.role === 'admin'} />
          )}

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

      {/* First-Time Business Owner Welcome Checklist */}
      <Dialog open={showWelcome} onOpenChange={(open) => { if (!open) handleSkipWelcome(); }}>
        <DialogContent className="sm:max-w-lg bg-[oklch(0.25_0.02_50)] border-primary/30 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
              Welcome to Your Business Dashboard!
            </DialogTitle>
            <DialogDescription className="text-white/70 text-base" style={{ textTransform: "none", letterSpacing: "normal" }}>
              Great to have you here, {user?.contactName || user?.name}! Complete these steps to get set up on SportConnect.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-2 mb-1">
              <div className="text-xs text-white/50" style={{ textTransform: "none" }}>
                {Object.values(welcomeProgress).filter(Boolean).length} of 3 completed
              </div>
              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${(Object.values(welcomeProgress).filter(Boolean).length / 3) * 100}%` }} />
              </div>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => handleWelcomeStep('directory', '/directory')}
                className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-all text-left group ${
                  welcomeProgress.directory
                    ? 'bg-primary/10 border-primary/30'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-primary/40'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  welcomeProgress.directory ? 'bg-primary/30' : 'bg-primary/20'
                }`}>
                  {welcomeProgress.directory ? <Check className="w-5 h-5 text-primary" /> : <Building2 className="w-5 h-5 text-primary" />}
                </div>
                <div>
                  <p className={`font-semibold transition-colors ${welcomeProgress.directory ? 'text-primary' : 'text-white group-hover:text-primary'}`} style={{ textTransform: "none" }}>
                    {welcomeProgress.directory ? 'Browsed the Directory' : 'Browse the Directory'}
                  </p>
                  <p className="text-xs text-white/60" style={{ textTransform: "none", letterSpacing: "normal" }}>Search for your business — if it's already listed, you can claim it.</p>
                </div>
                {welcomeProgress.directory
                  ? <CheckCircle2 className="w-5 h-5 text-primary ml-auto shrink-0" />
                  : <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-primary ml-auto shrink-0 transition-colors" />}
              </button>
              <button
                onClick={() => handleWelcomeStep('addBusiness', '/dashboard/add-business')}
                className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-all text-left group ${
                  welcomeProgress.addBusiness
                    ? 'bg-primary/10 border-primary/30'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-primary/40'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  welcomeProgress.addBusiness ? 'bg-primary/30' : 'bg-primary/20'
                }`}>
                  {welcomeProgress.addBusiness ? <Check className="w-5 h-5 text-primary" /> : <Plus className="w-5 h-5 text-primary" />}
                </div>
                <div>
                  <p className={`font-semibold transition-colors ${welcomeProgress.addBusiness ? 'text-primary' : 'text-white group-hover:text-primary'}`} style={{ textTransform: "none" }}>
                    {welcomeProgress.addBusiness ? 'Added Your Business' : 'Add Your Business'}
                  </p>
                  <p className="text-xs text-white/60" style={{ textTransform: "none", letterSpacing: "normal" }}>Not listed yet? Add your business and start receiving referrals.</p>
                </div>
                {welcomeProgress.addBusiness
                  ? <CheckCircle2 className="w-5 h-5 text-primary ml-auto shrink-0" />
                  : <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-primary ml-auto shrink-0 transition-colors" />}
              </button>
              <button
                onClick={() => handleWelcomeStep('offers', '/referral-offers')}
                className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-all text-left group ${
                  welcomeProgress.offers
                    ? 'bg-primary/10 border-primary/30'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-primary/40'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  welcomeProgress.offers ? 'bg-primary/30' : 'bg-primary/20'
                }`}>
                  {welcomeProgress.offers ? <Check className="w-5 h-5 text-primary" /> : <Gift className="w-5 h-5 text-primary" />}
                </div>
                <div>
                  <p className={`font-semibold transition-colors ${welcomeProgress.offers ? 'text-primary' : 'text-white group-hover:text-primary'}`} style={{ textTransform: "none" }}>
                    {welcomeProgress.offers ? 'Explored Referral Offers' : 'Explore Referral Offers'}
                  </p>
                  <p className="text-xs text-white/60" style={{ textTransform: "none", letterSpacing: "normal" }}>See what other businesses are offering for referrals.</p>
                </div>
                {welcomeProgress.offers
                  ? <CheckCircle2 className="w-5 h-5 text-primary ml-auto shrink-0" />
                  : <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-primary ml-auto shrink-0 transition-colors" />}
              </button>
            </div>
          </div>
          <DialogFooter className="flex gap-2 sm:gap-2">
            {allWelcomeStepsDone ? (
              <Button
                className="bg-primary hover:bg-primary/90 text-white"
                style={{ textTransform: "none" }}
                onClick={handleDismissAllWelcome}
              >
                All done — let's go!
              </Button>
            ) : (
              <Button
                variant="outline"
                className="bg-transparent border-white/30 text-white hover:bg-white/10"
                style={{ textTransform: "none" }}
                onClick={handleSkipWelcome}
              >
                I'll come back to this later
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}

// ─── Athlete Claims Management Section ─────────────────────────────
function AthleteClaimsSection({ businesses, isAdmin }: { businesses: any[]; isAdmin?: boolean }) {
  const utils = trpc.useUtils();
  const hasBiz = businesses.length > 0;
  const [viewMode, setViewMode] = useState<'all' | 'per_business'>(isAdmin ? 'all' : 'per_business');
  const [selectedBizId, setSelectedBizId] = useState<number | null>(
    hasBiz ? (businesses[0].business?.id ?? businesses[0].id) : null
  );

  // Admin: all claims across all businesses
  const { data: allClaims, isLoading: allClaimsLoading } = (trpc.admin as any).allConsumerClaims.useQuery(
    undefined,
    { enabled: !!isAdmin && viewMode === 'all' }
  );
  const { data: allAnalytics } = (trpc.admin as any).allClaimAnalytics.useQuery(
    undefined,
    { enabled: !!isAdmin && viewMode === 'all' }
  );

  // Per-business claims
  const { data: bizClaims, isLoading: bizClaimsLoading } = (trpc.consumerClaim as any).forBusiness.useQuery(
    { businessId: selectedBizId! },
    { enabled: viewMode === 'per_business' && !!selectedBizId }
  );
  const { data: bizAnalytics } = (trpc.consumerClaim as any).businessAnalytics.useQuery(
    { businessId: selectedBizId! },
    { enabled: viewMode === 'per_business' && !!selectedBizId }
  );

  // Merged data based on view mode
  const claims = viewMode === 'all' ? allClaims : bizClaims;
  const claimsLoading = viewMode === 'all' ? allClaimsLoading : bizClaimsLoading;
  const claimAnalytics = viewMode === 'all' ? allAnalytics : bizAnalytics;

  const honorMut = (trpc.consumerClaim as any).businessHonor.useMutation({
    onSuccess: () => {
      toast.success("Claim marked as redeemed!");
      if (viewMode === 'all') {
        (utils.admin as any).allConsumerClaims.invalidate();
        (utils.admin as any).allClaimAnalytics.invalidate();
      }
      utils.consumerClaim.forBusiness.invalidate();
      (utils.consumerClaim as any).businessAnalytics.invalidate();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const rejectMut = (trpc.consumerClaim as any).businessReject.useMutation({
    onSuccess: () => {
      toast.success("Claim marked as expired/not redeemed.");
      if (viewMode === 'all') {
        (utils.admin as any).allConsumerClaims.invalidate();
        (utils.admin as any).allClaimAnalytics.invalidate();
      }
      utils.consumerClaim.forBusiness.invalidate();
      (utils.consumerClaim as any).businessAnalytics.invalidate();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const claimStatusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    claimed: { label: "Pending", color: "bg-amber-100 text-amber-800 border-amber-200", icon: <Clock className="w-3 h-3" /> },
    redeemed: { label: "Redeemed", color: "bg-green-100 text-green-800 border-green-200", icon: <CheckCircle2 className="w-3 h-3" /> },
    expired: { label: "Expired", color: "bg-gray-100 text-gray-600 border-gray-200", icon: <XCircle className="w-3 h-3" /> },
    disputed: { label: "Disputed", color: "bg-red-100 text-red-800 border-red-200", icon: <AlertTriangle className="w-3 h-3" /> },
  };

  return (
    <Card className="mb-8">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Gift className="w-5 h-5 text-primary" />
              Athlete Offer Claims
            </CardTitle>
            <CardDescription style={{ textTransform: "none", letterSpacing: "normal" }}>
              {isAdmin ? 'View and manage all athlete claims across all businesses.' : 'Track and manage athlete claims on your consumer offers. Mark claims as redeemed when athletes visit.'}
            </CardDescription>
          </div>
          {isAdmin && hasBiz && (
            <div className="flex gap-1 bg-muted rounded-lg p-0.5">
              <Button
                size="sm"
                variant={viewMode === 'all' ? 'default' : 'ghost'}
                className="text-xs h-7 px-3"
                style={{ textTransform: "none" }}
                onClick={() => setViewMode('all')}
              >
                All Claims
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'per_business' ? 'default' : 'ghost'}
                className="text-xs h-7 px-3"
                style={{ textTransform: "none" }}
                onClick={() => setViewMode('per_business')}
              >
                Per Business
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Business selector for per-business view */}
        {viewMode === 'per_business' && hasBiz && businesses.length > 1 && (
          <div className="mb-4">
            <Select
              value={String(selectedBizId || "")}
              onValueChange={(v) => setSelectedBizId(Number(v))}
            >
              <SelectTrigger className="w-full md:w-64">
                <SelectValue placeholder="Select business" />
              </SelectTrigger>
              <SelectContent>
                {businesses.map((b: any) => {
                  const biz = b.business || b;
                  return <SelectItem key={biz.id} value={String(biz.id)}>{biz.name}</SelectItem>;
                })}
              </SelectContent>
            </Select>
          </div>
        )}
        {viewMode === 'per_business' && !hasBiz && (
          <div className="text-center py-4 text-muted-foreground mb-4">
            <p style={{ textTransform: "none" }}>No claimed businesses yet. Switch to "All Claims" to see claims across all businesses.</p>
          </div>
        )}

        {/* Claim Analytics Summary */}
        {claimAnalytics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="p-3 rounded-lg bg-primary/5 text-center">
              <p className="text-2xl font-bold text-primary">{claimAnalytics.totalClaims}</p>
              <p className="text-xs text-muted-foreground" style={{ textTransform: "none" }}>Total Claims</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-50 text-center">
              <p className="text-2xl font-bold text-amber-600">{claimAnalytics.pending}</p>
              <p className="text-xs text-muted-foreground" style={{ textTransform: "none" }}>Pending Redemption</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50 text-center">
              <p className="text-2xl font-bold text-green-600">{claimAnalytics.redeemed}</p>
              <p className="text-xs text-muted-foreground" style={{ textTransform: "none" }}>Redeemed</p>
            </div>
            <div className="p-3 rounded-lg bg-gray-50 text-center">
              <p className="text-2xl font-bold text-gray-500">{claimAnalytics.expired}</p>
              <p className="text-xs text-muted-foreground" style={{ textTransform: "none" }}>Expired</p>
            </div>
          </div>
        )}

        {/* Claims List */}
        {claimsLoading ? (
          <div className="space-y-3">
            {[1, 2].map(i => <div key={i} className="animate-pulse p-3 border rounded-lg"><div className="h-4 bg-muted rounded w-3/4 mb-2" /><div className="h-3 bg-muted rounded w-1/2" /></div>)}
          </div>
        ) : !claims || claims.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Gift className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p style={{ textTransform: "none" }}>No athlete claims yet. When athletes claim your offers, they'll appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {(claims as any[]).map((c: any) => {
              const status = claimStatusConfig[c.claim?.status || 'claimed'] || claimStatusConfig.claimed;
              return (
                <div key={c.claim?.id} className="p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold" style={{ textTransform: "none" }}>
                          {c.offer?.title || 'Offer'}
                        </span>
                        <Badge variant="outline" className={`text-xs ${status.color}`}>
                          {status.icon}
                          <span className="ml-1">{status.label}</span>
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-0.5" style={{ textTransform: "none" }}>
                        {viewMode === 'all' && c.business && (
                          <p>Business: <span className="font-medium text-foreground">{c.business.name}</span></p>
                        )}
                        <p>Claimed by: <span className="font-medium text-foreground">{c.user?.name || 'Athlete'}</span></p>
                        <p>Claim Code: <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">{c.claim?.claimCode || 'N/A'}</code></p>
                        <p>Date: {c.claim?.createdAt ? new Date(c.claim.createdAt).toLocaleDateString() : 'N/A'}</p>
                      </div>
                    </div>
                    {c.claim?.status === 'claimed' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          style={{ textTransform: "none" }}
                          disabled={honorMut.isPending}
                          onClick={() => honorMut.mutate({ claimId: c.claim.id, businessId: c.claim?.businessId || c.business?.id || selectedBizId! })}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          {honorMut.isPending ? 'Processing...' : 'Mark Redeemed'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-transparent text-muted-foreground"
                          style={{ textTransform: "none" }}
                          disabled={rejectMut.isPending}
                          onClick={() => rejectMut.mutate({ claimId: c.claim.id, businessId: c.claim?.businessId || c.business?.id || selectedBizId!, reason: 'Not redeemed in person' })}
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1" />
                          Not Redeemed
                        </Button>
                      </div>
                    )}
                    {c.claim?.status === 'redeemed' && (
                      <div className="text-sm text-green-600 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span style={{ textTransform: "none" }}>Redeemed{c.claim.honoredAt ? ` on ${new Date(c.claim.honoredAt).toLocaleDateString()}` : ''}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
