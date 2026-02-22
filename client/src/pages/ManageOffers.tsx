import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useParams, Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { ArrowLeft, Gift, Plus, Trash2, Loader2, Handshake, Users, Pencil, Check, X, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useState } from "react";

type OfferForm = {
  title: string;
  description: string;
  offerType: "b2b" | "consumer";
  incentiveType: "percentage" | "fixed" | "service" | "other";
  incentiveValue: string;
  incentiveDescription: string;
  termsAndConditions: string;
};

const emptyForm: OfferForm = {
  title: "",
  description: "",
  offerType: "b2b",
  incentiveType: "percentage",
  incentiveValue: "",
  incentiveDescription: "",
  termsAndConditions: "",
};

function OfferFormFields({ form, updateField }: { form: OfferForm; updateField: (field: string, value: string) => void }) {
  return (
    <>
      <div>
        <Label style={{ textTransform: "none" }}>Offer Type *</Label>
        <Select value={form.offerType} onValueChange={(v) => updateField("offerType", v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="b2b">B2B — For partner businesses</SelectItem>
            <SelectItem value="consumer">Athlete — For individual athletes & enthusiasts</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-1" style={{ textTransform: "none", letterSpacing: "normal" }}>
          {form.offerType === "b2b"
            ? "B2B offers are for businesses that send you customers. Referred customers can still claim athlete offers."
            : "Athlete offers are visible to individual enthusiasts browsing the marketplace."
          }
        </p>
      </div>
      <div>
        <Label style={{ textTransform: "none" }}>Offer Title *</Label>
        <Input
          value={form.title}
          onChange={(e) => updateField("title", e.target.value)}
          placeholder={form.offerType === "b2b"
            ? "e.g., 10% commission for client referrals"
            : "e.g., 15% off first session for new customers"
          }
        />
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
    </>
  );
}

export default function ManageOffers() {
  const { user, loading: authLoading } = useAuth({ redirectOnUnauthenticated: true });
  const params = useParams<{ id: string }>();
  const businessId = parseInt(params.id || "0");
  const utils = trpc.useUtils();

  const { data: bizData } = trpc.business.getById.useQuery(
    { id: businessId },
    { enabled: businessId > 0 }
  );

  const { data: offers, isLoading } = trpc.referralOffer.getByBusinessAll.useQuery(
    { businessId },
    { enabled: businessId > 0 && !!user }
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<OfferForm>({ ...emptyForm });

  // Edit state
  const [editingOfferId, setEditingOfferId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<OfferForm>({ ...emptyForm });

  const createMutation = trpc.referralOffer.create.useMutation({
    onSuccess: () => {
      toast.success("Referral offer created!");
      utils.referralOffer.getByBusinessAll.invalidate({ businessId });
      setDialogOpen(false);
      setForm({ ...emptyForm });
    },
    onError: (err) => toast.error(err.message || "Failed to create offer"),
  });

  const updateMutation = trpc.referralOffer.update.useMutation({
    onSuccess: () => {
      toast.success("Offer updated successfully!");
      utils.referralOffer.getByBusinessAll.invalidate({ businessId });
      setEditingOfferId(null);
    },
    onError: (err) => toast.error(err.message || "Failed to update offer"),
  });

  const deleteMutation = trpc.referralOffer.delete.useMutation({
    onSuccess: () => {
      toast.success("Offer removed");
      utils.referralOffer.getByBusinessAll.invalidate({ businessId });
    },
    onError: (err) => toast.error(err.message || "Failed to delete offer"),
  });

  const toggleOfferVisibility = trpc.referralOffer.toggleVisibility.useMutation({
    onSuccess: (_, variables) => {
      toast.success(variables.isHidden ? "Offer hidden from public view." : "Offer is now visible.");
      utils.referralOffer.getByBusinessAll.invalidate({ businessId });
    },
    onError: (err: any) => toast.error(err.message || "Failed to toggle visibility"),
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) { toast.error("Title is required"); return; }
    createMutation.mutate({ businessId, ...form });
  };

  const handleStartEdit = (offer: NonNullable<typeof offers>[number]) => {
    setEditingOfferId(offer.id);
    setEditForm({
      title: offer.title,
      description: offer.description || "",
      offerType: (offer.offerType as "b2b" | "consumer") || "b2b",
      incentiveType: (offer.incentiveType as "percentage" | "fixed" | "service" | "other") || "percentage",
      incentiveValue: offer.incentiveValue || "",
      incentiveDescription: offer.incentiveDescription || "",
      termsAndConditions: offer.termsAndConditions || "",
    });
  };

  const handleSaveEdit = () => {
    if (!editingOfferId) return;
    if (!editForm.title) { toast.error("Title is required"); return; }
    updateMutation.mutate({
      id: editingOfferId,
      ...editForm,
    });
  };

  const handleCancelEdit = () => {
    setEditingOfferId(null);
    setEditForm({ ...emptyForm });
  };

  const updateField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const updateEditField = (field: string, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      </div>
    );
  }

  if (bizData && bizData.business.approvalStatus !== 'approved' && user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="container py-20 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/20 mb-6">
            <AlertCircle className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Claim Pending Approval</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto" style={{ textTransform: "none", letterSpacing: "normal" }}>Your claim on <strong>{bizData.business.name}</strong> is currently being reviewed by our admin team. You'll be able to manage offers once your claim is approved.</p>
          <Link href="/dashboard"><Button className="bg-primary text-primary-foreground" style={{ textTransform: "none" }}>Back to Dashboard</Button></Link>
        </div>
        <Footer />
      </div>
    );
  }

  const b2bOffers = offers?.filter(o => o.offerType === "b2b") || [];
  const consumerOffers = offers?.filter(o => o.offerType === "consumer") || [];

  const renderOfferCard = (offer: NonNullable<typeof offers>[number], type: "b2b" | "consumer") => {
    const isEditing = editingOfferId === offer.id;
    const TypeIcon = type === "b2b" ? Handshake : Users;
    const typeColor = type === "b2b" ? "oklch(0.55_0.15_45)" : "";

    if (isEditing) {
      return (
        <Card key={offer.id} className="border-primary/50 ring-1 ring-primary/20">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-sm text-primary flex items-center gap-2">
                <Pencil className="w-4 h-4" /> Editing Offer
              </h3>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleSaveEdit}
                  disabled={updateMutation.isPending}
                  className="text-primary hover:text-primary hover:bg-primary/10"
                >
                  {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelEdit}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <OfferFormFields form={editForm} updateField={updateEditField} />
          </CardContent>
        </Card>
      );
    }

    return (
      <Card key={offer.id}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <h3 className="font-bold text-foreground">{offer.title}</h3>
                <Badge variant="secondary" className={`${type === "b2b" ? "bg-[oklch(0.55_0.15_45)]/10 text-[oklch(0.55_0.15_45)]" : "bg-primary/10 text-primary"} text-xs`} style={{ textTransform: "none" }}>
                  <TypeIcon className="w-3 h-3 mr-1" /> {type === "b2b" ? "B2B" : "Athlete"}
                </Badge>
                {(offer as any).isHidden && (
                  <Badge className="bg-gray-100 text-gray-600 text-xs" style={{ textTransform: "none" }}>
                    <EyeOff className="w-3 h-3 mr-1" /> Hidden
                  </Badge>
                )}
                {(offer as any).isAdminHidden && (
                  <Badge className="bg-red-100 text-red-800 text-xs" style={{ textTransform: "none" }}>
                    <EyeOff className="w-3 h-3 mr-1" /> Admin Hidden
                  </Badge>
                )}
                <Badge className={`${type === "b2b" ? "bg-[oklch(0.55_0.15_45)]" : "bg-primary"} text-white`} style={{ textTransform: "none" }}>
                  {offer.incentiveType === "percentage" ? `${offer.incentiveValue}%` :
                   offer.incentiveType === "fixed" ? `$${offer.incentiveValue}` :
                   offer.incentiveType}
                </Badge>
              </div>
              {offer.description && (
                <p className="text-sm text-muted-foreground mb-1" style={{ textTransform: "none", letterSpacing: "normal" }}>{offer.description}</p>
              )}
              {offer.incentiveDescription && (
                <p className="text-sm text-foreground" style={{ textTransform: "none", letterSpacing: "normal" }}>
                  <strong>{type === "b2b" ? "Incentive:" : "Offer details:"}</strong> {offer.incentiveDescription}
                </p>
              )}
              {offer.termsAndConditions && (
                <p className="text-xs text-muted-foreground mt-1" style={{ textTransform: "none", letterSpacing: "normal" }}>
                  <strong>Terms:</strong> {offer.termsAndConditions}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className={`${(offer as any).isHidden ? 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50' : 'text-muted-foreground hover:text-gray-600 hover:bg-gray-50'}`}
                onClick={() => toggleOfferVisibility.mutate({ offerId: offer.id, isHidden: !(offer as any).isHidden })}
                disabled={toggleOfferVisibility.isPending}
                title={(offer as any).isHidden ? 'Show offer' : 'Hide offer'}
              >
                {(offer as any).isHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                onClick={() => handleStartEdit(offer)}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => deleteMutation.mutate({ id: offer.id })}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

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
                <Gift className="w-6 h-6 text-[oklch(0.55_0.15_45)]" /> Manage Referral Offers
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
                  <OfferFormFields form={form} updateField={updateField} />
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
                  Create B2B offers for partner businesses or athlete offers for individual enthusiasts.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {/* B2B Offers */}
              {b2bOffers.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                    <Handshake className="w-5 h-5 text-[oklch(0.55_0.15_45)]" /> B2B Offers
                  </h2>
                  <div className="space-y-3">
                    {b2bOffers.map((offer) => renderOfferCard(offer, "b2b"))}
                  </div>
                </div>
              )}

              {/* Athlete Offers */}
              {consumerOffers.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                    <Users className="w-5 h-5 text-primary" /> Athlete Offers
                  </h2>
                  <div className="space-y-3">
                    {consumerOffers.map((offer) => renderOfferCard(offer, "consumer"))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
