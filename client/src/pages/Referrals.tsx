import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Send, ArrowDownLeft, Loader2, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800", icon: <Clock className="w-3 h-3" /> },
  contacted: { label: "Contacted", color: "bg-blue-100 text-blue-800", icon: <AlertCircle className="w-3 h-3" /> },
  converted: { label: "Converted", color: "bg-green-100 text-green-800", icon: <CheckCircle className="w-3 h-3" /> },
  declined: { label: "Declined", color: "bg-red-100 text-red-800", icon: <XCircle className="w-3 h-3" /> },
  expired: { label: "Expired", color: "bg-gray-100 text-gray-800", icon: <Clock className="w-3 h-3" /> },
};

export default function Referrals() {
  const { user, loading: authLoading } = useAuth({ redirectOnUnauthenticated: true });
  const utils = trpc.useUtils();

  const { data: sent, isLoading: sentLoading } = trpc.referral.sent.useQuery(undefined, { enabled: !!user });
  const { data: received, isLoading: recvLoading } = trpc.referral.received.useQuery(undefined, { enabled: !!user });

  const updateStatusMutation = trpc.referral.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status updated");
      utils.referral.sent.invalidate();
      utils.referral.received.invalidate();
      utils.referral.stats.invalidate();
    },
    onError: (err) => toast.error(err.message || "Failed to update status"),
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <div className="bg-card border-b border-border">
        <div className="container py-3">
          <Link href="/dashboard">
            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground cursor-pointer" style={{ textTransform: "none" }}>
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </span>
          </Link>
        </div>
      </div>

      <section className="py-8">
        <div className="container max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Referral History</h1>

          <Tabs defaultValue="sent">
            <TabsList className="mb-6">
              <TabsTrigger value="sent" className="gap-2" style={{ textTransform: "none" }}>
                <Send className="w-4 h-4" /> Sent ({sent?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="received" className="gap-2" style={{ textTransform: "none" }}>
                <ArrowDownLeft className="w-4 h-4" /> Received ({received?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sent">
              {sentLoading ? (
                <div className="space-y-4">{[1, 2].map(i => <Card key={i} className="animate-pulse"><CardContent className="p-6"><div className="h-5 bg-muted rounded w-2/3 mb-3" /><div className="h-4 bg-muted rounded w-full" /></CardContent></Card>)}</div>
              ) : !sent || sent.length === 0 ? (
                <Card className="border-dashed border-2">
                  <CardContent className="p-8 text-center">
                    <Send className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-lg font-bold mb-2">No Referrals Sent</h3>
                    <p className="text-muted-foreground mb-4" style={{ textTransform: "none", letterSpacing: "normal" }}>
                      Browse the directory and send your first referral to a partner business.
                    </p>
                    <Link href="/directory">
                      <Button className="bg-primary text-primary-foreground" style={{ textTransform: "none" }}>Browse Directory</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {sent.map((item) => {
                    const status = statusConfig[item.referral.status] || statusConfig.pending;
                    return (
                      <Card key={item.referral.id}>
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold text-foreground" style={{ textTransform: "none" }}>
                                Referred to: {item.receivingBusiness?.name || "Unknown"}
                              </p>
                              {item.referral.customerName && (
                                <p className="text-sm text-muted-foreground" style={{ textTransform: "none" }}>
                                  Customer: {item.referral.customerName}
                                </p>
                              )}
                            </div>
                            <Badge className={`${status.color} gap-1`} style={{ textTransform: "none" }}>
                              {status.icon} {status.label}
                            </Badge>
                          </div>
                          {item.referral.notes && (
                            <p className="text-sm text-muted-foreground mt-2" style={{ textTransform: "none", letterSpacing: "normal" }}>{item.referral.notes}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-3" style={{ textTransform: "none" }}>
                            {new Date(item.referral.createdAt).toLocaleDateString()}
                          </p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="received">
              {recvLoading ? (
                <div className="space-y-4">{[1, 2].map(i => <Card key={i} className="animate-pulse"><CardContent className="p-6"><div className="h-5 bg-muted rounded w-2/3 mb-3" /><div className="h-4 bg-muted rounded w-full" /></CardContent></Card>)}</div>
              ) : !received || received.length === 0 ? (
                <Card className="border-dashed border-2">
                  <CardContent className="p-8 text-center">
                    <ArrowDownLeft className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-lg font-bold mb-2">No Referrals Received</h3>
                    <p className="text-muted-foreground mb-4" style={{ textTransform: "none", letterSpacing: "normal" }}>
                      Post referral offers to attract referrals from partner businesses.
                    </p>
                    <Link href="/dashboard">
                      <Button className="bg-primary text-primary-foreground" style={{ textTransform: "none" }}>Go to Dashboard</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {received.map((item) => {
                    const status = statusConfig[item.referral.status] || statusConfig.pending;
                    return (
                      <Card key={item.referral.id}>
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold text-foreground" style={{ textTransform: "none" }}>
                                From: {item.referringBusiness?.name || "Unknown"}
                              </p>
                              {item.referral.customerName && (
                                <p className="text-sm text-muted-foreground" style={{ textTransform: "none" }}>
                                  Customer: {item.referral.customerName}
                                  {item.referral.customerEmail && ` (${item.referral.customerEmail})`}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Select
                                value={item.referral.status}
                                onValueChange={(v) => updateStatusMutation.mutate({
                                  id: item.referral.id,
                                  status: v as "pending" | "contacted" | "converted" | "declined" | "expired",
                                })}
                              >
                                <SelectTrigger className="w-36 h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="contacted">Contacted</SelectItem>
                                  <SelectItem value="converted">Converted</SelectItem>
                                  <SelectItem value="declined">Declined</SelectItem>
                                  <SelectItem value="expired">Expired</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          {item.referral.notes && (
                            <p className="text-sm text-muted-foreground mt-2" style={{ textTransform: "none", letterSpacing: "normal" }}>{item.referral.notes}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-3" style={{ textTransform: "none" }}>
                            {new Date(item.referral.createdAt).toLocaleDateString()}
                          </p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
}
