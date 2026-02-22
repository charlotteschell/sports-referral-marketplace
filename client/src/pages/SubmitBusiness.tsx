import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Mountain, CheckCircle, ArrowLeft, Send, Building2, MapPin, User, Globe, MessageSquare, Tag, X } from "lucide-react";

// Business types that should show the brands field
const RETAILER_TYPE_NAMES = ["Bike Retailer", "Bike Shop", "Running Store", "Ski Shop", "Supplement Retailer"];

export default function SubmitBusiness() {
  const [submitted, setSubmitted] = useState(false);

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

  const { data: sportCategories } = trpc.categories.sportCategories.useQuery();
  const { data: businessTypes } = trpc.categories.businessTypes.useQuery();
  const { data: regions } = trpc.categories.regions.useQuery();
  const { data: hubs } = trpc.categories.hubs.useQuery();

  // Check if any selected business type is a retailer
  const isRetailerType = useMemo(() => {
    if (businessTypeIds.length === 0 || !businessTypes) return false;
    return businessTypeIds.some(id => {
      const t = businessTypes.find(bt => bt.id === id);
      return t ? RETAILER_TYPE_NAMES.includes(t.name) : false;
    });
  }, [businessTypeIds, businessTypes]);

  const toggleSportCategory = (id: number) => {
    setSportCategoryIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const toggleBusinessType = (id: number) => {
    setBusinessTypeIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  // Filter hubs by selected region (deduplicated)
  const filteredHubs = useMemo(() => {
    if (!hubs) return [];
    const filtered = !region ? hubs : hubs.filter((h: any) => h.region === region);
    // Deduplicate by hub name
    const seen = new Set<string>();
    return filtered.filter((h: any) => {
      if (seen.has(h.hub)) return false;
      seen.add(h.hub);
      return true;
    });
  }, [hubs, region]);

  // Brands management
  const brandsList = useMemo(() => {
    if (!brandsCarried) return [];
    return brandsCarried.split(",").map(b => b.trim()).filter(Boolean);
  }, [brandsCarried]);

  const addBrand = () => {
    const brand = newBrand.trim();
    if (!brand) return;
    if (brandsList.includes(brand)) {
      toast.info("Brand already added");
      return;
    }
    setBrandsCarried([...brandsList, brand].join(", "));
    setNewBrand("");
  };

  const removeBrand = (brand: string) => {
    setBrandsCarried(brandsList.filter(b => b !== brand).join(", "));
  };

  const setContactNameMut = trpc.userProfile.setContactName.useMutation();

  const submitMutation = trpc.submission.submit.useMutation({
    onSuccess: () => {
      // Also save the contact name as the user's display name across the platform
      if (contactName.trim()) {
        setContactNameMut.mutate({ contactName: contactName.trim() });
      }
      setSubmitted(true);
      toast.success("Your business has been submitted for review!");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to submit. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!businessName.trim()) {
      toast.error("Business name is required");
      return;
    }
    if (sportCategoryIds.length === 0) {
      toast.error("Please select at least one sport category");
      return;
    }
    if (businessTypeIds.length === 0) {
      toast.error("Please select at least one business type");
      return;
    }
    if (!website.trim()) {
      toast.error("Website is required for verification");
      return;
    }
    if (!contactName.trim()) {
      toast.error("Contact name is required");
      return;
    }
    if (!contactEmail.trim()) {
      toast.error("Contact email is required");
      return;
    }

    submitMutation.mutate({
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

  if (submitted) {
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
                  You're In the Queue!
                </h2>
                <p className="text-muted-foreground leading-relaxed" style={{ textTransform: "none", letterSpacing: "normal" }}>
                  <strong>{businessName}</strong> has been submitted. Our (volunteer) team will review it shortly. We're not going to pretend we have a 24-hour SLA, but we do check these regularly. Browse the directory while you wait!
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Link href="/directory">
                  <Button variant="outline" className="gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Browse Directory
                  </Button>
                </Link>
                <Button
                  onClick={() => {
                    setSubmitted(false);
                    setBusinessName("");
                    setBusinessDescription("");
                    setSportCategoryIds([]);
                    setBusinessTypeIds([]);
                    setCity("");
                    setState("");
                    setCountry("");
                    setRegion("");
                    setHub("");
                    setContactName("");
                    setContactEmail("");
                    setContactPhone("");
                    setWebsite("");
                    setInstagram("");
                    setFacebook("");
                    setAdditionalNotes("");
                    setBrandsCarried("");
                  }}
                  className="gap-2 bg-primary text-primary-foreground"
                >
                  <Send className="w-4 h-4" />
                  Submit Another
                </Button>
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
            <Link href="/directory" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Directory
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Mountain className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground tracking-tight">
                  SUBMIT YOUR BUSINESS
                </h1>
                <p className="text-muted-foreground" style={{ textTransform: "none" }}>
                  Get in the network. It takes 3 minutes.
                </p>
              </div>
            </div>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl" style={{ textTransform: "none", letterSpacing: "normal" }}>
              If your business serves cyclists, runners, or snow sports athletes in any capacity, you belong here. Fill out the form, we'll verify you're real (nothing personal), and you'll be in the directory.
              <span className="block mt-3 text-sm text-amber-500 font-medium" style={{ textTransform: "none" }}>Heads up: we need a website for verification, and all submissions get a quick human review.</span>
            </p>
          </div>
        </section>

        {/* Form Section */}
        <section className="py-10 md:py-14">
          <div className="container max-w-4xl">
            <form onSubmit={handleSubmit} className="space-y-8">

              {/* Business Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl font-heading">
                    <Building2 className="w-5 h-5 text-primary" />
                    Business Information
                  </CardTitle>
                  <CardDescription>
                    Tell us about your business and the services you offer.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="businessName" className="font-medium">
                      Business Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="businessName"
                      placeholder="e.g., Peak Performance Coaching"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-medium">
                      Sport Categories <span className="text-red-500">*</span>
                      <span className="text-xs text-muted-foreground font-normal ml-2">Select all that apply</span>
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {sportCategories?.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => toggleSportCategory(cat.id)}
                          className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                            sportCategoryIds.includes(cat.id)
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background text-foreground border-border hover:border-primary/50"
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-medium">
                      Business Types <span className="text-red-500">*</span>
                      <span className="text-xs text-muted-foreground font-normal ml-2">Select all that apply</span>
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {businessTypes?.map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => toggleBusinessType(type.id)}
                          className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                            businessTypeIds.includes(type.id)
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background text-foreground border-border hover:border-primary/50"
                          }`}
                        >
                          {type.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Brands field - shown for retailer types */}
                  {isRetailerType && (
                    <div className="space-y-3 p-4 rounded-lg border border-border bg-muted/20">
                      <Label className="flex items-center gap-2 font-medium" style={{ textTransform: "none" }}>
                        <Tag className="w-4 h-4" /> Brands Carried
                      </Label>
                      <p className="text-xs text-muted-foreground" style={{ textTransform: "none" }}>
                        Add the brands you stock or represent. This helps customers and partners find you.
                      </p>
                      {brandsList.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {brandsList.map((brand) => (
                            <Badge key={brand} variant="secondary" className="text-xs gap-1 pr-1" style={{ textTransform: "none" }}>
                              {brand}
                              <button
                                type="button"
                                onClick={() => removeBrand(brand)}
                                className="ml-0.5 hover:bg-destructive/20 rounded-full p-0.5"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Input
                          placeholder="e.g., Specialized, Trek, Shimano..."
                          value={newBrand}
                          onChange={(e) => setNewBrand(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addBrand();
                            }
                          }}
                          className="flex-1"
                        />
                        <Button type="button" variant="outline" size="sm" onClick={addBrand} style={{ textTransform: "none" }}>
                          Add
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="businessDescription" className="font-medium">
                      Business Description
                    </Label>
                    <Textarea
                      id="businessDescription"
                      placeholder="Describe your business, services, and what makes you unique..."
                      value={businessDescription}
                      onChange={(e) => setBusinessDescription(e.target.value)}
                      rows={4}
                    />
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
                  <CardDescription>
                    Help customers and partner businesses find you.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="city" className="font-medium">City</Label>
                      <Input
                        id="city"
                        placeholder="e.g., Boulder"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state" className="font-medium">State / Province</Label>
                      <Input
                        id="state"
                        placeholder="e.g., Colorado"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country" className="font-medium">Country</Label>
                      <Input
                        id="country"
                        placeholder="e.g., USA"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label className="font-medium">Region</Label>
                      <Select value={region} onValueChange={(v) => {
                        setRegion(v);
                        setHub(""); // Reset hub when region changes
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select region" />
                        </SelectTrigger>
                        <SelectContent>
                          {regions?.map((r: string) => (
                            <SelectItem key={r} value={r}>{r}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-medium">Hub / Area</Label>
                      <Select value={hub} onValueChange={setHub}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select hub" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredHubs.map((h: any) => (
                            <SelectItem key={h.hub} value={h.hub}>{h.hub}</SelectItem>
                          ))}
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
                  <CardDescription>
                    Your contact details for the review process and directory listing.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="contactName" className="font-medium">
                        Contact Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="contactName"
                        placeholder="Your full name"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail" className="font-medium">
                        Email Address <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        placeholder="you@yourbusiness.com"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        required
                      />
                      <p className="text-xs text-muted-foreground" style={{ textTransform: "none" }}>
                        Must match your business website domain for verification.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPhone" className="font-medium">Phone Number</Label>
                    <Input
                      id="contactPhone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                    />
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
                  <CardDescription>
                    Share your website and social media so we can learn more about your business.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="website" className="font-medium">
                      Website <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="website"
                      placeholder="yourbusiness.com"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground" style={{ textTransform: "none" }}>
                      Required for verification. Any format works — yourbusiness.com, www.yourbusiness.com, or https://yourbusiness.com.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="instagram" className="font-medium">Instagram</Label>
                      <Input
                        id="instagram"
                        placeholder="@yourbusiness"
                        value={instagram}
                        onChange={(e) => setInstagram(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="facebook" className="font-medium">Facebook</Label>
                      <Input
                        id="facebook"
                        placeholder="facebook.com/yourbusiness"
                        value={facebook}
                        onChange={(e) => setFacebook(e.target.value)}
                      />
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
                  <CardDescription>
                    Anything else you'd like us to know about your business or listing request.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Tell us about any specific referral partnerships you're looking for, your target audience, or anything else relevant..."
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    rows={4}
                  />
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <p className="text-sm text-muted-foreground">
                  <span className="text-red-500">*</span> Required fields. Submissions are reviewed within 48 hours.
                </p>
                <Button
                  type="submit"
                  size="lg"
                  className="gap-2 bg-primary text-primary-foreground font-heading text-base px-8"
                  disabled={submitMutation.isPending}
                >
                  {submitMutation.isPending ? (
                    <>Submitting...</>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit for Review
                    </>
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
