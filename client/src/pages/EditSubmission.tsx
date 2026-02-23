import { useState, useMemo, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Link, useParams, useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Mountain, CheckCircle, ArrowLeft, Send, Building2, MapPin, User, Globe,
  MessageSquare, Tag, X, AlertTriangle, RefreshCw, Clock, Loader2
} from "lucide-react";

const RETAILER_TYPE_NAMES = ["Bike Retailer", "Bike Shop", "Running Store", "Ski Shop", "Supplement Retailer"];

export default function EditSubmission() {
  const { id } = useParams<{ id: string }>();
  const submissionId = parseInt(id || "0", 10);
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [resubmitted, setResubmitted] = useState(false);

  // Fetch the submission
  const { data: submissionData, isLoading, error } = (trpc.submission as any).getById.useQuery(
    { id: submissionId },
    { enabled: submissionId > 0 && isAuthenticated }
  );

  // Form state
  const [businessName, setBusinessName] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [sportCategoryIds, setSportCategoryIds] = useState<number[]>([]);
  const [businessTypeIds, setBusinessTypeIds] = useState<number[]>([]);
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("");
  const [hub, setHub] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [brandsCarried, setBrandsCarried] = useState("");
  const [newBrand, setNewBrand] = useState("");
  const [formLoaded, setFormLoaded] = useState(false);

  const { data: sportCategories } = trpc.categories.sportCategories.useQuery();
  const { data: businessTypes } = trpc.categories.businessTypes.useQuery();
  const { data: regions } = trpc.categories.regions.useQuery();
  const { data: hubs } = trpc.categories.hubs.useQuery();

  // Populate form when submission data loads
  useEffect(() => {
    if (submissionData && !formLoaded) {
      const s = submissionData.submission;
      setBusinessName(s.businessName || "");
      setBusinessDescription(s.businessDescription || "");
      setCity(s.city || "");
      setState(s.state || "");
      setCountry(s.country || "");
      setRegion(s.region || "");
      setHub(s.hub || "");
      setContactName(s.contactName || "");
      setContactEmail(s.contactEmail || "");
      setContactPhone(s.contactPhone || "");
      setWebsite(s.website || "");
      setInstagram(s.instagram || "");
      setFacebook(s.facebook || "");
      setAdditionalNotes(s.additionalNotes || "");

      // Parse sport category IDs
      try {
        const ids = s.sportCategoryIds ? JSON.parse(s.sportCategoryIds) : [s.sportCategoryId];
        setSportCategoryIds(Array.isArray(ids) ? ids : [s.sportCategoryId]);
      } catch { setSportCategoryIds([s.sportCategoryId]); }

      // Parse business type IDs
      try {
        const ids = s.businessTypeIds ? JSON.parse(s.businessTypeIds) : [s.businessTypeId];
        setBusinessTypeIds(Array.isArray(ids) ? ids : [s.businessTypeId]);
      } catch { setBusinessTypeIds([s.businessTypeId]); }

      setFormLoaded(true);
    }
  }, [submissionData, formLoaded]);

  const isRetailerType = useMemo(() => {
    if (businessTypeIds.length === 0 || !businessTypes) return false;
    return businessTypeIds.some(id => {
      const t = businessTypes.find((bt: any) => bt.id === id);
      return t ? RETAILER_TYPE_NAMES.includes(t.name) : false;
    });
  }, [businessTypeIds, businessTypes]);

  const toggleSportCategory = (catId: number) => {
    setSportCategoryIds(prev => prev.includes(catId) ? prev.filter(x => x !== catId) : [...prev, catId]);
  };
  const toggleBusinessType = (typeId: number) => {
    setBusinessTypeIds(prev => prev.includes(typeId) ? prev.filter(x => x !== typeId) : [...prev, typeId]);
  };

  const filteredHubs = useMemo(() => {
    if (!hubs) return [];
    const filtered = !region ? hubs : hubs.filter((h: any) => h.region === region);
    const seen = new Set<string>();
    return filtered.filter((h: any) => {
      if (seen.has(h.hub)) return false;
      seen.add(h.hub);
      return true;
    });
  }, [hubs, region]);

  const brandsList = useMemo(() => {
    if (!brandsCarried) return [];
    return brandsCarried.split(",").map((b: string) => b.trim()).filter(Boolean);
  }, [brandsCarried]);

  const addBrand = () => {
    const brand = newBrand.trim();
    if (!brand) return;
    if (brandsList.includes(brand)) { toast.info("Brand already added"); return; }
    setBrandsCarried([...brandsList, brand].join(", "));
    setNewBrand("");
  };

  const removeBrand = (brand: string) => {
    setBrandsCarried(brandsList.filter((b: string) => b !== brand).join(", "));
  };

  const utils = trpc.useUtils();
  const resubmitMutation = (trpc.submission as any).resubmit.useMutation({
    onSuccess: () => {
      setResubmitted(true);
      toast.success("Your submission has been resubmitted for review!");
      try { (utils.submission as any).mySubmissions.invalidate(); } catch {}
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to resubmit. Please try again.");
    },
  });

  const handleResubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!businessName.trim()) { toast.error("Business name is required"); return; }
    if (sportCategoryIds.length === 0) { toast.error("Please select at least one sport category"); return; }
    if (businessTypeIds.length === 0) { toast.error("Please select at least one business type"); return; }
    if (!website.trim()) { toast.error("Website is required for verification"); return; }
    if (!contactName.trim()) { toast.error("Contact name is required"); return; }
    if (!contactEmail.trim()) { toast.error("Contact email is required"); return; }

    resubmitMutation.mutate({
      id: submissionId,
      businessName: businessName.trim(),
      businessDescription: businessDescription.trim() || undefined,
      sportCategoryId: sportCategoryIds[0],
      businessTypeId: businessTypeIds[0],
      sportCategoryIds,
      businessTypeIds,
      city: city.trim() || undefined,
      state: state.trim() || undefined,
      country: country.trim() || undefined,
      region: region || undefined,
      hub: hub || undefined,
      contactName: contactName.trim(),
      contactEmail: contactEmail.trim(),
      contactPhone: contactPhone.trim() || undefined,
      website: website.trim(),
      instagram: instagram.trim() || undefined,
      facebook: facebook.trim() || undefined,
      additionalNotes: additionalNotes.trim() || undefined,
    });
  };

  // Parse previous review notes for history
  const reviewHistory = useMemo(() => {
    if (!submissionData?.submission) return [];
    const s = submissionData.submission;
    const history: Array<{ notes: string; reviewedAt: string; resubmissionNumber: number }> = [];
    try {
      if (s.previousReviewNotes) {
        const parsed = JSON.parse(s.previousReviewNotes);
        if (Array.isArray(parsed)) history.push(...parsed);
      }
    } catch { /* ignore */ }
    // Add current review notes if they exist
    if (s.reviewNotes) {
      history.push({
        notes: s.reviewNotes,
        reviewedAt: s.reviewedAt?.toISOString?.() || (typeof s.reviewedAt === 'string' ? s.reviewedAt : new Date().toISOString()),
        resubmissionNumber: s.resubmissionCount || 0,
      });
    }
    return history;
  }, [submissionData]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 py-20">
          <Card className="max-w-md w-full text-center">
            <CardContent className="pt-10 pb-10 space-y-4">
              <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
              <h2 className="text-xl font-heading font-bold">Sign In Required</h2>
              <p className="text-muted-foreground" style={{ textTransform: "none" }}>
                You need to be signed in to edit a submission.
              </p>
              <Link href="/dashboard">
                <Button className="gap-2"><ArrowLeft className="w-4 h-4" /> Go to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 py-20">
          <Card className="max-w-md w-full text-center">
            <CardContent className="pt-10 pb-10 space-y-4">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
              <h2 className="text-xl font-heading font-bold">Submission Not Found</h2>
              <p className="text-muted-foreground" style={{ textTransform: "none" }}>
                {(error as any)?.message || "This submission doesn't exist or you don't have permission to edit it."}
              </p>
              <Link href="/dashboard">
                <Button className="gap-2"><ArrowLeft className="w-4 h-4" /> Back to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (submissionData?.submission?.status !== 'rejected' && !resubmitted) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 py-20">
          <Card className="max-w-md w-full text-center">
            <CardContent className="pt-10 pb-10 space-y-4">
              <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
              <h2 className="text-xl font-heading font-bold">Cannot Edit This Submission</h2>
              <p className="text-muted-foreground" style={{ textTransform: "none" }}>
                Only rejected submissions can be edited and resubmitted. This submission is currently <strong>{submissionData?.submission?.status}</strong>.
              </p>
              <Link href="/dashboard">
                <Button className="gap-2"><ArrowLeft className="w-4 h-4" /> Back to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (resubmitted) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 py-20">
          <Card className="max-w-lg w-full text-center">
            <CardContent className="pt-10 pb-10 space-y-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
                  Resubmitted Successfully!
                </h2>
                <p className="text-muted-foreground leading-relaxed" style={{ textTransform: "none", letterSpacing: "normal" }}>
                  <strong>{businessName}</strong> has been resubmitted for review. Our team will take another look at it. You'll be notified when there's an update.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Link href="/dashboard">
                  <Button className="gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-card border-b border-border py-12 md:py-16">
          <div className="container max-w-4xl">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground tracking-tight">
                  EDIT & RESUBMIT
                </h1>
                <p className="text-muted-foreground" style={{ textTransform: "none" }}>
                  Make changes and submit again for review
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Rejection Feedback */}
        <section className="py-6">
          <div className="container max-w-4xl">
            {/* Current rejection reason */}
            {submissionData?.submission?.reviewNotes && (
              <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/20 dark:border-red-900/50 mb-4">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-heading font-bold text-red-800 dark:text-red-300 mb-1">
                        Why This Was Rejected
                      </h3>
                      <p className="text-sm text-red-700 dark:text-red-400 leading-relaxed" style={{ textTransform: "none", letterSpacing: "normal" }}>
                        {submissionData.submission.reviewNotes}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Previous review history */}
            {reviewHistory.length > 1 && (
              <Card className="border-muted mb-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-heading flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    Review History
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {reviewHistory.slice(0, -1).map((entry, i) => (
                      <div key={i} className="text-sm border-l-2 border-muted-foreground/20 pl-3">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                          <span>Review #{i + 1}</span>
                          <span className="text-muted-foreground/40">&bull;</span>
                          <span>{new Date(entry.reviewedAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-muted-foreground" style={{ textTransform: "none", letterSpacing: "normal" }}>
                          {entry.notes}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {submissionData?.submission?.resubmissionCount > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <RefreshCw className="w-4 h-4" />
                <span style={{ textTransform: "none" }}>
                  This is resubmission attempt #{submissionData.submission.resubmissionCount + 1}
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Form Section */}
        <section className="pb-10 md:pb-14">
          <div className="container max-w-4xl">
            <form onSubmit={handleResubmit} className="space-y-8">

              {/* Business Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl font-heading">
                    <Building2 className="w-5 h-5 text-primary" />
                    Business Information
                  </CardTitle>
                  <CardDescription>Update your business details as needed.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="businessName" className="font-medium">
                      Business Name <span className="text-red-500">*</span>
                    </Label>
                    <Input id="businessName" placeholder="e.g., Peak Performance Coaching" value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-medium">
                      Sport Categories <span className="text-red-500">*</span>
                      <span className="text-xs text-muted-foreground font-normal ml-2">Select all that apply</span>
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {sportCategories?.map((cat: any) => (
                        <button key={cat.id} type="button" onClick={() => toggleSportCategory(cat.id)}
                          className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                            sportCategoryIds.includes(cat.id) ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground border-border hover:border-primary/50"
                          }`}
                        >{cat.name}</button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-medium">
                      Business Types <span className="text-red-500">*</span>
                      <span className="text-xs text-muted-foreground font-normal ml-2">Select all that apply</span>
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {businessTypes?.map((type: any) => (
                        <button key={type.id} type="button" onClick={() => toggleBusinessType(type.id)}
                          className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                            businessTypeIds.includes(type.id) ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground border-border hover:border-primary/50"
                          }`}
                        >{type.name}</button>
                      ))}
                    </div>
                  </div>

                  {isRetailerType && (
                    <div className="space-y-3 p-4 rounded-lg border border-border bg-muted/20">
                      <Label className="flex items-center gap-2 font-medium" style={{ textTransform: "none" }}>
                        <Tag className="w-4 h-4" /> Brands Carried
                      </Label>
                      {brandsList.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {brandsList.map((brand: string) => (
                            <Badge key={brand} variant="secondary" className="text-xs gap-1 pr-1" style={{ textTransform: "none" }}>
                              {brand}
                              <button type="button" onClick={() => removeBrand(brand)} className="ml-0.5 hover:bg-destructive/20 rounded-full p-0.5">
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Input placeholder="e.g., Specialized, Trek, Shimano..." value={newBrand} onChange={(e) => setNewBrand(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addBrand(); } }} className="flex-1" />
                        <Button type="button" variant="outline" size="sm" onClick={addBrand} style={{ textTransform: "none" }}>Add</Button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="businessDescription" className="font-medium">Business Description</Label>
                    <Textarea id="businessDescription" placeholder="Describe your business..." value={businessDescription} onChange={(e) => setBusinessDescription(e.target.value)} rows={4} />
                  </div>
                </CardContent>
              </Card>

              {/* Location */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl font-heading">
                    <MapPin className="w-5 h-5 text-primary" />
                    Location
                  </CardTitle>
                  <CardDescription>Help customers and partner businesses find you.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="city" className="font-medium">City</Label>
                      <Input id="city" placeholder="e.g., Boulder" value={city} onChange={(e) => setCity(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state" className="font-medium">State / Province</Label>
                      <Input id="state" placeholder="e.g., Colorado" value={state} onChange={(e) => setState(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country" className="font-medium">Country</Label>
                      <Input id="country" placeholder="e.g., USA" value={country} onChange={(e) => setCountry(e.target.value)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label className="font-medium">Region</Label>
                      <Select value={region} onValueChange={(v) => { setRegion(v); setHub(""); }}>
                        <SelectTrigger><SelectValue placeholder="Select region" /></SelectTrigger>
                        <SelectContent>
                          {regions?.map((r: string) => (<SelectItem key={r} value={r}>{r}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-medium">Hub / Area</Label>
                      <Select value={hub} onValueChange={setHub}>
                        <SelectTrigger><SelectValue placeholder="Select hub" /></SelectTrigger>
                        <SelectContent>
                          {filteredHubs.map((h: any) => (<SelectItem key={h.hub} value={h.hub}>{h.hub}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl font-heading">
                    <User className="w-5 h-5 text-primary" />
                    Contact Information
                  </CardTitle>
                  <CardDescription>Your contact details for the review process.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="contactName" className="font-medium">Contact Name <span className="text-red-500">*</span></Label>
                      <Input id="contactName" placeholder="Your full name" value={contactName} onChange={(e) => setContactName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail" className="font-medium">Email Address <span className="text-red-500">*</span></Label>
                      <Input id="contactEmail" type="email" placeholder="you@yourbusiness.com" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} required />
                      <p className="text-xs text-muted-foreground" style={{ textTransform: "none" }}>Must match your business website domain for verification.</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone" className="font-medium">Phone Number</Label>
                    <Input id="contactPhone" type="tel" placeholder="+1 (555) 000-0000" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
                  </div>
                </CardContent>
              </Card>

              {/* Online Presence */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl font-heading">
                    <Globe className="w-5 h-5 text-primary" />
                    Online Presence
                  </CardTitle>
                  <CardDescription>Share your website and social media.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="website" className="font-medium">Website <span className="text-red-500">*</span></Label>
                    <Input id="website" placeholder="yourbusiness.com" value={website} onChange={(e) => setWebsite(e.target.value)} required />
                    <p className="text-xs text-muted-foreground" style={{ textTransform: "none" }}>Required for verification.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="instagram" className="font-medium">Instagram</Label>
                      <Input id="instagram" placeholder="@yourbusiness" value={instagram} onChange={(e) => setInstagram(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="facebook" className="font-medium">Facebook</Label>
                      <Input id="facebook" placeholder="facebook.com/yourbusiness" value={facebook} onChange={(e) => setFacebook(e.target.value)} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Notes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl font-heading">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    Additional Notes
                  </CardTitle>
                  <CardDescription>Anything else you'd like us to know.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea placeholder="Tell us about any changes you've made or additional context..." value={additionalNotes} onChange={(e) => setAdditionalNotes(e.target.value)} rows={4} />
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <p className="text-sm text-muted-foreground">
                  <span className="text-red-500">*</span> Required fields. Resubmissions are reviewed within 48 hours.
                </p>
                <Button type="submit" size="lg" className="gap-2 bg-amber-600 hover:bg-amber-700 text-white font-heading text-base px-8" disabled={resubmitMutation.isPending}>
                  {resubmitMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Resubmitting...</>
                  ) : (
                    <><RefreshCw className="w-4 h-4" /> Resubmit for Review</>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
