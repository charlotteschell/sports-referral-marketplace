import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useParams, Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { ArrowLeft, Gift, Plus, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";

export default function ManageOffers() {
  const { user, loading: authLoading } = useAuth({ redirectOnUnauthenticated: true });
  const params = useParams<{ id: string }>();
  const businessId = parseInt(params.id || "0");
  const utils = trpc.useUtils();

  const { data: bizData } = trpc.business.getById.useQuery(
    { id: businessId },
    { enabled: businessId > 0 }
  );

  const { data: offers, isLoading } = trpc.referralOffer.getByBusiness.useQuery(
    { businessId },
    { enabled: businessId > 0 }
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    incentiveType: "percentage" as "percentage" | "fixed" | "service" | "other",
    incentiveValue: "",
    incentiveDescription: "",
    termsAndConditions: "",
  });

  const createMutation = trpc.referralOffer.create.useMutation({
    onSuccess: () => {
      toast.success("Referral offer created!");
      utils.referralOffer.getByBusiness.invalidate({ businessId });
      setDialogOpen(false);
      setForm({ title: "", description: "", incentiveType: "percentage", incentiveValue: "", incentiveDescription: "", termsAndConditions: "" });
    },
    onError: (err) => toast.error(err.message || "Failed to create offer"),
  });

  const deleteMutation = trpc.referralOffer.delete.useMutation({
    onSuccess: () => {
      toast.success("Offer removed");
      utils.referralOffer.getByBusiness.invalidate({ businessId });
    },
    onError: (err) => toast.error(err.message || "Failed to delete offer"),
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) { toast.error("Title is required"); return; }
    createMutation.mutate({ businessId, ...form });
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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Gift className="w-6 h-6 text-[oklch(0.55_0.15_45)]" /> B2B Referral Offers
              </h1>
              {bizData && (
                <p className="text-sm text-muted-foreground mt-1" style={{ textTransform: "none" }}>
                  for {bizData.business.name}
                </p>
              )}
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground" style={{ textTransform: "none" }}>
                  <Plus className="w-4 h-4 mr-2" /> New Offer
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create Referral Offer</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <Label style={{ textTransform: "none" }}>Offer Title *</Label>
                    <Input value={form.title} onChange={(e) => updateField("title", e.target.value)} placeholder="e.g., 10% commission for client referrals" />
                  </div>
                  <div>
                    <Label style={{ textTransform: "none" }}>Description</Label>
                    <Textarea value={form.description} onChange={(e) => updateField("description", e.target.value)} placeholder="Describe the referral offer..." rows={3} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label style={{ textTransform: "none" }}>Incentive Type</Label>
                      <Select value={form.incentiveType} onValueChange={(v) => updateField("incentiveType", v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">Percentage</SelectItem>
                          <SelectItem value="fixed">Fixed Amount</SelectItem>
                          <SelectItem value="service">Service Exchange</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label style={{ textTransform: "none" }}>Value</Label>
                      <Input value={form.incentiveValue} onChange={(e) => updateField("incentiveValue", e.target.value)} placeholder={form.incentiveType === "percentage" ? "e.g., 10" : "e.g., 50"} />
                    </div>
                  </div>
                  <div>
                    <Label style={{ textTransform: "none" }}>Incentive Details</Label>
                    <Input value={form.incentiveDescription} onChange={(e) => updateField("incentiveDescription", e.target.value)} placeholder="e.g., $50 per converted referral" />
                  </div>
                  <div>
                    <Label style={{ textTransform: "none" }}>Terms & Conditions</Label>
                    <Textarea value={form.termsAndConditions} onChange={(e) => updateField("termsAndConditions", e.target.value)} placeholder="Any terms or conditions..." rows={2} />
                  </div>
                  <Button type="submit" className="w-full bg-primary text-primary-foreground" disabled={createMutation.isPending} style={{ textTransform: "none" }}>
                    {createMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</> : "Create Offer"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6"><div className="h-5 bg-muted rounded w-2/3 mb-3" /><div className="h-4 bg-muted rounded w-full" /></CardContent>
                </Card>
              ))}
            </div>
          ) : !offers || offers.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="p-8 text-center">
                <Gift className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-bold mb-2">No Referral Offers Yet</h3>
                <p className="text-muted-foreground mb-4" style={{ textTransform: "none", letterSpacing: "normal" }}>
                  Create your first B2B referral offer to start attracting referrals from partner businesses.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {offers.map((offer) => (
                <Card key={offer.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-foreground">{offer.title}</h3>
                          <Badge className="bg-[oklch(0.55_0.15_45)] text-white" style={{ textTransform: "none" }}>
                            {offer.incentiveType === "percentage" ? `${offer.incentiveValue}%` :
                             offer.incentiveType === "fixed" ? `$${offer.incentiveValue}` :
                             offer.incentiveType}
                          </Badge>
                        </div>
                        {offer.description && (
                          <p className="text-sm text-muted-foreground mb-2" style={{ textTransform: "none", letterSpacing: "normal" }}>{offer.description}</p>
                        )}
                        {offer.incentiveDescription && (
                          <p className="text-sm text-foreground" style={{ textTransform: "none", letterSpacing: "normal" }}>
                            <strong>Incentive:</strong> {offer.incentiveDescription}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                        onClick={() => deleteMutation.mutate({ id: offer.id })}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
