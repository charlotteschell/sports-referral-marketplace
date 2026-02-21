import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useLocation, useSearch, Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { useState, useMemo } from "react";

export default function SendReferral() {
  const { user, loading: authLoading } = useAuth({ redirectOnUnauthenticated: true });
  const [, navigate] = useLocation();
  const searchString = useSearch();
  const urlParams = useMemo(() => new URLSearchParams(searchString), [searchString]);

  const preselectedTo = urlParams.get("to") || "";
  const preselectedOffer = urlParams.get("offer") || "";

  const { data: myBusinesses } = trpc.business.myBusinesses.useQuery(undefined, { enabled: !!user });

  const [form, setForm] = useState({
    referringBusinessId: "",
    receivingBusinessId: preselectedTo,
    referralOfferId: preselectedOffer,
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    notes: "",
  });

  const receivingBizId = parseInt(form.receivingBusinessId || "0");
  const { data: receivingBiz } = trpc.business.getById.useQuery(
    { id: receivingBizId },
    { enabled: receivingBizId > 0 }
  );

  const { data: offers } = trpc.referralOffer.getByBusiness.useQuery(
    { businessId: receivingBizId },
    { enabled: receivingBizId > 0 }
  );

  const sendMutation = trpc.referral.send.useMutation({
    onSuccess: () => {
      toast.success("Referral sent successfully!");
      navigate("/dashboard/referrals");
    },
    onError: (err) => toast.error(err.message || "Failed to send referral"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.referringBusinessId || !form.receivingBusinessId) {
      toast.error("Please select both referring and receiving businesses");
      return;
    }
    sendMutation.mutate({
      referringBusinessId: parseInt(form.referringBusinessId),
      receivingBusinessId: parseInt(form.receivingBusinessId),
      referralOfferId: form.referralOfferId ? parseInt(form.referralOfferId) : undefined,
      customerName: form.customerName || undefined,
      customerEmail: form.customerEmail || undefined,
      customerPhone: form.customerPhone || undefined,
      notes: form.notes || undefined,
    });
  };

  const updateField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

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
        <div className="container max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5 text-[oklch(0.55_0.15_45)]" /> Send a Referral
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* From */}
                <div>
                  <Label style={{ textTransform: "none" }}>From (Your Business) *</Label>
                  <Select value={form.referringBusinessId} onValueChange={(v) => updateField("referringBusinessId", v)}>
                    <SelectTrigger><SelectValue placeholder="Select your business" /></SelectTrigger>
                    <SelectContent>
                      {myBusinesses?.map(item => (
                        <SelectItem key={item.business.id} value={String(item.business.id)}>
                          {item.business.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {(!myBusinesses || myBusinesses.length === 0) && (
                    <p className="text-xs text-destructive mt-1" style={{ textTransform: "none" }}>
                      You need to claim or add a business first to send referrals.
                    </p>
                  )}
                </div>

                {/* To */}
                <div>
                  <Label style={{ textTransform: "none" }}>To (Receiving Business) *</Label>
                  {receivingBiz ? (
                    <div className="bg-secondary/50 rounded-lg p-3 text-sm">
                      <p className="font-semibold">{receivingBiz.business.name}</p>
                      <p className="text-muted-foreground" style={{ textTransform: "none" }}>{receivingBiz.business.shortDescription}</p>
                    </div>
                  ) : (
                    <Input
                      value={form.receivingBusinessId}
                      onChange={(e) => updateField("receivingBusinessId", e.target.value)}
                      placeholder="Enter business ID or browse directory"
                    />
                  )}
                </div>

                {/* Offer */}
                {offers && offers.length > 0 && (
                  <div>
                    <Label style={{ textTransform: "none" }}>Referral Offer (Optional)</Label>
                    <Select value={form.referralOfferId} onValueChange={(v) => updateField("referralOfferId", v === "none" ? "" : v)}>
                      <SelectTrigger><SelectValue placeholder="Select an offer" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No specific offer</SelectItem>
                        {offers.map(offer => (
                          <SelectItem key={offer.id} value={String(offer.id)}>
                            {offer.title} ({offer.incentiveType === "percentage" ? `${offer.incentiveValue}%` : offer.incentiveType === "fixed" ? `$${offer.incentiveValue}` : offer.incentiveType})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Customer Info */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Customer Information</h3>
                  <div>
                    <Label style={{ textTransform: "none" }}>Customer Name</Label>
                    <Input value={form.customerName} onChange={(e) => updateField("customerName", e.target.value)} placeholder="Customer's name" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label style={{ textTransform: "none" }}>Email</Label>
                      <Input type="email" value={form.customerEmail} onChange={(e) => updateField("customerEmail", e.target.value)} placeholder="customer@email.com" />
                    </div>
                    <div>
                      <Label style={{ textTransform: "none" }}>Phone</Label>
                      <Input value={form.customerPhone} onChange={(e) => updateField("customerPhone", e.target.value)} placeholder="+1 (555) 000-0000" />
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <Label style={{ textTransform: "none" }}>Notes</Label>
                  <Textarea value={form.notes} onChange={(e) => updateField("notes", e.target.value)} placeholder="Any additional context about this referral..." rows={3} />
                </div>

                <Button type="submit" className="w-full bg-[oklch(0.55_0.15_45)] hover:bg-[oklch(0.50_0.15_45)] text-white" disabled={sendMutation.isPending} style={{ textTransform: "none" }}>
                  {sendMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</> : <><Send className="w-4 h-4 mr-2" /> Send Referral</>}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
