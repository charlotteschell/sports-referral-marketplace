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
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { ArrowLeft, Send, Loader2, Search, MapPin, X, Building2 } from "lucide-react";
import { useState, useMemo, useRef, useEffect } from "react";

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

  // Searchable dropdown state
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<{
    id: number; name: string; city: string | null; region: string | null; hub: string | null; country: string | null;
  } | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debounced search query
  const [debouncedQuery, setDebouncedQuery] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: autocompleteResults, isLoading: isSearching } = trpc.business.autocomplete.useQuery(
    { query: debouncedQuery },
    { enabled: debouncedQuery.length >= 1 }
  );

  // If preselected, load that business
  const receivingBizId = parseInt(form.receivingBusinessId || "0");
  const { data: receivingBiz } = trpc.business.getById.useQuery(
    { id: receivingBizId },
    { enabled: receivingBizId > 0 && !selectedBusiness }
  );

  // Set selected business from preselected data
  useEffect(() => {
    if (receivingBiz && !selectedBusiness && receivingBizId > 0) {
      setSelectedBusiness({
        id: receivingBiz.business.id,
        name: receivingBiz.business.name,
        city: receivingBiz.business.city,
        region: receivingBiz.business.region,
        hub: receivingBiz.business.hub,
        country: receivingBiz.business.country,
      });
    }
  }, [receivingBiz, selectedBusiness, receivingBizId]);

  const { data: offers } = trpc.referralOffer.getByBusiness.useQuery(
    { businessId: selectedBusiness?.id || receivingBizId },
    { enabled: (selectedBusiness?.id || receivingBizId) > 0 }
  );

  const sendMutation = trpc.referral.send.useMutation({
    onSuccess: () => {
      toast.success("Referral sent successfully!");
      navigate("/dashboard/referrals");
    },
    onError: (err) => toast.error(err.message || "Failed to send referral"),
  });

  const handleSelectBusiness = (biz: { id: number; name: string; city: string | null; region: string | null; hub: string | null; country: string | null; slug: string; sportCategoryId: number; businessTypeId: number }) => {
    setSelectedBusiness(biz);
    setForm(prev => ({ ...prev, receivingBusinessId: String(biz.id), referralOfferId: "" }));
    setSearchQuery("");
    setDropdownOpen(false);
  };

  const handleClearSelection = () => {
    setSelectedBusiness(null);
    setForm(prev => ({ ...prev, receivingBusinessId: "", referralOfferId: "" }));
    setSearchQuery("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const bizId = selectedBusiness?.id || receivingBizId;
    if (!form.referringBusinessId || !bizId) {
      toast.error("Please select both referring and receiving businesses");
      return;
    }
    sendMutation.mutate({
      referringBusinessId: parseInt(form.referringBusinessId),
      receivingBusinessId: bizId,
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

                {/* To - Searchable Dropdown */}
                <div>
                  <Label style={{ textTransform: "none" }}>To (Receiving Business) *</Label>
                  {selectedBusiness ? (
                    <div className="bg-secondary/50 rounded-lg p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[oklch(0.55_0.15_45)]/10 flex items-center justify-center shrink-0">
                          <Building2 className="w-5 h-5 text-[oklch(0.55_0.15_45)]" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{selectedBusiness.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1" style={{ textTransform: "none" }}>
                            <MapPin className="w-3 h-3" />
                            {[selectedBusiness.hub || selectedBusiness.city, selectedBusiness.region || selectedBusiness.country].filter(Boolean).join(", ")}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleClearSelection}
                        className="text-muted-foreground hover:text-foreground shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <Popover open={dropdownOpen} onOpenChange={setDropdownOpen}>
                      <PopoverTrigger asChild>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            ref={searchInputRef}
                            value={searchQuery}
                            onChange={(e) => {
                              setSearchQuery(e.target.value);
                              if (!dropdownOpen && e.target.value.length >= 1) setDropdownOpen(true);
                            }}
                            onFocus={() => {
                              if (searchQuery.length >= 1) setDropdownOpen(true);
                            }}
                            placeholder="Search by business name, city, or region..."
                            className="pl-9"
                          />
                        </div>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-[var(--radix-popover-trigger-width)] p-0 max-h-[300px] overflow-y-auto"
                        align="start"
                        onOpenAutoFocus={(e) => e.preventDefault()}
                      >
                        {isSearching ? (
                          <div className="flex items-center justify-center py-6">
                            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                          </div>
                        ) : autocompleteResults && autocompleteResults.length > 0 ? (
                          <div className="py-1">
                            {autocompleteResults.map((biz) => (
                              <button
                                key={biz.id}
                                type="button"
                                className="w-full text-left px-3 py-2.5 hover:bg-accent transition-colors flex items-center gap-3 border-b border-border/50 last:border-0"
                                onClick={() => handleSelectBusiness(biz)}
                              >
                                <div className="w-8 h-8 rounded-md bg-[oklch(0.55_0.15_45)]/10 flex items-center justify-center shrink-0">
                                  <Building2 className="w-4 h-4 text-[oklch(0.55_0.15_45)]" />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium text-sm truncate">{biz.name}</p>
                                  <p className="text-xs text-muted-foreground flex items-center gap-1" style={{ textTransform: "none" }}>
                                    <MapPin className="w-3 h-3 shrink-0" />
                                    {[biz.hub || biz.city, biz.region || biz.country].filter(Boolean).join(", ") || "No location"}
                                  </p>
                                </div>
                              </button>
                            ))}
                          </div>
                        ) : debouncedQuery.length >= 1 ? (
                          <div className="py-6 text-center text-sm text-muted-foreground" style={{ textTransform: "none" }}>
                            <Search className="w-5 h-5 mx-auto mb-2 opacity-50" />
                            No businesses found for "{debouncedQuery}"
                          </div>
                        ) : null}
                      </PopoverContent>
                    </Popover>
                  )}
                  <p className="text-xs text-muted-foreground mt-1" style={{ textTransform: "none", letterSpacing: "normal" }}>
                    Start typing a business name, city, or region to search the directory.
                  </p>
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
