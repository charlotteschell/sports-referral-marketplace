import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Mountain, CheckCircle, ArrowLeft, Send, Building2, MapPin, User, Globe, MessageSquare } from "lucide-react";

const REGIONS = [
  "Western Canada", "Eastern Canada", "Western US", "Eastern US",
  "Dolomites", "Pyrenees", "Mallorca", "Alps", "Scandinavia", "UK & Ireland"
];

export default function SubmitBusiness() {
  const [submitted, setSubmitted] = useState(false);

  // Form state
  const [businessName, setBusinessName] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [sportCategoryId, setSportCategoryId] = useState<number | null>(null);
  const [businessTypeId, setBusinessTypeId] = useState<number | null>(null);
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

  const { data: sportCategories } = trpc.categories.sportCategories.useQuery();
  const { data: businessTypes } = trpc.categories.businessTypes.useQuery();

  const submitMutation = trpc.submission.submit.useMutation({
    onSuccess: () => {
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
    if (!sportCategoryId) {
      toast.error("Please select a sport category");
      return;
    }
    if (!businessTypeId) {
      toast.error("Please select a business type");
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
      sportCategoryId,
      businessTypeId,
      city: city.trim() || undefined,
      state: state.trim() || undefined,
      country: country.trim() || undefined,
      region: region || undefined,
      hub: hub.trim() || undefined,
      contactName: contactName.trim(),
      contactEmail: contactEmail.trim(),
      contactPhone: contactPhone.trim() || undefined,
      website: website.trim() || undefined,
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
                  Submission Received!
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Thank you for submitting <strong>{businessName}</strong> to the SportConnect directory.
                  Your submission is now <strong>pending admin approval</strong>. We'll review it shortly and send you an email confirmation once it's approved. In the meantime, feel free to browse the directory!
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
                    setSportCategoryId(null);
                    setBusinessTypeId(null);
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
                <p className="text-muted-foreground">
                  Join the endurance sports community network
                </p>
              </div>
            </div>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
              Whether you're a coach, bike shop, sport psychologist, vacation provider, or any business serving
              cyclists, runners, and snowsports enthusiasts — submit your business to be listed in
              the SportConnect directory and start receiving referrals.
              <span className="block mt-3 text-sm text-amber-500 font-medium">All submissions are subject to admin approval. You'll receive an email confirmation once submitted, and another when approved.</span>
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label className="font-medium">
                        Sport Category <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={sportCategoryId?.toString() || ""}
                        onValueChange={(v) => setSportCategoryId(Number(v))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select sport category" />
                        </SelectTrigger>
                        <SelectContent>
                          {sportCategories?.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-medium">
                        Business Type <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={businessTypeId?.toString() || ""}
                        onValueChange={(v) => setBusinessTypeId(Number(v))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select business type" />
                        </SelectTrigger>
                        <SelectContent>
                          {businessTypes?.map((type) => (
                            <SelectItem key={type.id} value={type.id.toString()}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

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
                      <Select value={region} onValueChange={setRegion}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select region" />
                        </SelectTrigger>
                        <SelectContent>
                          {REGIONS.map((r) => (
                            <SelectItem key={r} value={r}>{r}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hub" className="font-medium">Hub / Area</Label>
                      <Input
                        id="hub"
                        placeholder="e.g., Boulder, Whistler, Cortina"
                        value={hub}
                        onChange={(e) => setHub(e.target.value)}
                      />
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
                    <Label htmlFor="website" className="font-medium">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      placeholder="https://www.yourbusiness.com"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                    />
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
