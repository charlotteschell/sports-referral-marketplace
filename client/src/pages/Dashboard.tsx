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
  Palmtree, Activity, ArrowUpRight, ArrowDownRight, Eye, EyeOff
} from "lucide-react";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

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
                Welcome back, {user?.name || "there"}. Track your referrals and manage your businesses.
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
                      <p className="text-muted-foreground" style={{ textTransform: "none", letterSpacing: "normal" }}>No referrals sent yet</p>
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
                      <p className="text-muted-foreground" style={{ textTransform: "none", letterSpacing: "normal" }}>No referrals received yet</p>
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

                      {/* Visibility, Unclaim & Delete Actions */}
                      <div className="flex flex-wrap gap-2 pt-3 border-t border-border/50">
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

          {/* Consumer Claims & Savings */}
          <Card className="mb-8">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Gift className="w-5 h-5 text-primary" />
                My Claimed Offers
              </CardTitle>
              <CardDescription style={{ textTransform: "none", letterSpacing: "normal" }}>
                Track offers you've claimed as a consumer and verify if businesses honored them
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Consumer Analytics Summary */}
              {consumerAnalytics && (consumerAnalytics.totalClaims > 0) && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  <div className="p-3 rounded-lg bg-primary/5 text-center">
                    <p className="text-2xl font-bold text-primary">{consumerAnalytics.totalClaims}</p>
                    <p className="text-xs text-muted-foreground" style={{ textTransform: "none" }}>Total Claims</p>
                  </div>
                  <div className="p-3 rounded-lg bg-green-50 text-center">
                    <p className="text-2xl font-bold text-green-600">{consumerAnalytics.redeemed}</p>
                    <p className="text-xs text-muted-foreground" style={{ textTransform: "none" }}>Redeemed</p>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-50 text-center">
                    <p className="text-2xl font-bold text-emerald-600">${consumerAnalytics.totalSaved}</p>
                    <p className="text-xs text-muted-foreground" style={{ textTransform: "none" }}>Total Saved</p>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-50 text-center">
                    <p className="text-2xl font-bold text-amber-600">{consumerAnalytics.pending}</p>
                    <p className="text-xs text-muted-foreground" style={{ textTransform: "none" }}>Pending</p>
                  </div>
                </div>
              )}

              {claimsLoading ? (
                <div className="space-y-3">
                  {[1, 2].map(i => <div key={i} className="animate-pulse p-3 border rounded-lg"><div className="h-4 bg-muted rounded w-3/4 mb-2" /><div className="h-3 bg-muted rounded w-1/2" /></div>)}
                </div>
              ) : !myClaims?.length ? (
                <div className="text-center py-8">
                  <Gift className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground mb-3" style={{ textTransform: "none", letterSpacing: "normal" }}>
                    You haven't claimed any consumer offers yet.
                  </p>
                  <Link href="/referral-offers">
                    <Button className="bg-primary text-primary-foreground" size="sm" style={{ textTransform: "none" }}>
                      <Gift className="w-4 h-4 mr-2" /> Browse Consumer Offers
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {myClaims.map((item) => (
                    <div key={item.claim.id} className="p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                          <Gift className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium" style={{ textTransform: "none" }}>
                            {item.offer.title}
                          </p>
                          <p className="text-xs text-muted-foreground" style={{ textTransform: "none" }}>
                            from <Link href={`/business/${item.business.slug}`}><span className="text-primary cursor-pointer hover:underline">{item.business.name}</span></Link>
                            {' · '}{item.claim.createdAt ? new Date(item.claim.createdAt).toLocaleDateString() : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.claim.claimCode && (
                            <Badge variant="outline" className="font-mono text-xs" style={{ textTransform: "none" }}>
                              {item.claim.claimCode}
                            </Badge>
                          )}
                          {item.claim.isHonored ? (
                            <Badge className="bg-green-100 text-green-800 text-xs" style={{ textTransform: "none" }}>
                              <CheckCircle2 className="w-3 h-3 mr-1" /> Verified{item.claim.amountSaved ? ` · Saved $${item.claim.amountSaved}` : ''}
                            </Badge>
                          ) : item.claim.isDisputed ? (
                            <Badge className="bg-red-100 text-red-800 text-xs" style={{ textTransform: "none" }}>
                              <AlertTriangle className="w-3 h-3 mr-1" /> Disputed
                            </Badge>
                          ) : (
                            <div className="flex gap-1">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" className="bg-green-600 text-white h-7 text-xs hover:bg-green-700" style={{ textTransform: "none" }}>
                                    <CheckCircle2 className="w-3 h-3 mr-1" /> Verify Honored
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Verify Offer Was Honored</DialogTitle>
                                    <DialogDescription style={{ textTransform: "none", letterSpacing: "normal" }}>
                                      Confirm that {item.business.name} honored the offer "{item.offer.title}".
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <Label style={{ textTransform: "none" }}>Amount saved ($)</Label>
                                      <Input type="number" placeholder="e.g. 15.00" value={verifyAmount} onChange={e => setVerifyAmount(e.target.value)} />
                                    </div>
                                    <div>
                                      <Label style={{ textTransform: "none" }}>Notes (optional)</Label>
                                      <Textarea placeholder="How was your experience?" value={verifyNotes} onChange={e => setVerifyNotes(e.target.value)} />
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button className="bg-green-600 text-white hover:bg-green-700" style={{ textTransform: "none" }}
                                      onClick={() => { verifyClaimMutation.mutate({ claimId: item.claim.id, honored: true, amountSaved: verifyAmount, notes: verifyNotes }); setVerifyAmount(''); setVerifyNotes(''); }}
                                      disabled={verifyClaimMutation.isPending}>
                                      Confirm Honored
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                              <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700 h-7 text-xs" style={{ textTransform: "none" }}
                                onClick={() => verifyClaimMutation.mutate({ claimId: item.claim.id, honored: false, notes: 'Business did not honor the offer' })}>
                                Not Honored
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
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

      <Footer />
    </div>
  );
}
