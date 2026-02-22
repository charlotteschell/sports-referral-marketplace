import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useParams, Link, useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BusinessLogo from "@/components/BusinessLogo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { useState, useMemo, useRef } from "react";
import {
  MapPin, Phone, Mail, Globe, Shield, ArrowLeft,
  Bike, Mountain, Snowflake, Star, Handshake, Compass,
  Instagram, Facebook, Pencil, Gift, Send, ExternalLink,
  Users, Info, Sparkles, Heart, Loader2, CheckCircle2, AlertCircle,
  Upload, Camera, Tag, MessageSquare, Bookmark, BookmarkCheck
} from "lucide-react";

const sportIcons: Record<string, React.ReactNode> = {
  cycling: <Bike className="w-5 h-5" />,
  running: <Mountain className="w-5 h-5" />,
  "trail-running": <Mountain className="w-5 h-5" />,
  snowsports: <Snowflake className="w-5 h-5" />,
  "sport-vacations": <Compass className="w-5 h-5" />,
};

// Phone number formatting utility
function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  // North American: +1 (XXX) XXX-XXXX
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  // International with country code
  if (digits.length > 10) {
    // Try common formats
    if (digits.startsWith('34') && digits.length === 11) {
      // Spain: +34 XXX XXX XXX
      return `+34 ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
    }
    if (digits.startsWith('44') && digits.length >= 12) {
      // UK: +44 XXXX XXXXXX
      return `+44 ${digits.slice(2, 6)} ${digits.slice(6)}`;
    }
    // Generic international
    return `+${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
  }
  // Return original if can't parse
  return phone;
}

export default function BusinessProfile() {
  const params = useParams<{ slug: string }>();
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();

  // Claim state
  const [showClaimConfirm, setShowClaimConfirm] = useState(false);

  const { data, isLoading, error } = trpc.business.getBySlug.useQuery(
    { slug: params.slug || "" },
    { enabled: !!params.slug }
  );

  const { data: offers } = trpc.referralOffer.getByBusiness.useQuery(
    { businessId: data?.business.id || 0 },
    { enabled: !!data?.business.id }
  );

  const claimMutation = trpc.business.claim.useMutation({
    onSuccess: (result) => {
      toast.success(result.message || "Claim submitted for approval!");
      setShowClaimConfirm(false);
      utils.business.getBySlug.invalidate({ slug: params.slug });
    },
    onError: (err) => {
      toast.error(err.message || "Failed to claim business");
    },
  });

  // Partnership email state
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const sendPartnershipEmail = trpc.partnershipEmail.send.useMutation({
    onSuccess: () => {
      toast.success("Email sent! They'll receive it in their inbox.");
      setEmailDialogOpen(false);
      setEmailSubject('');
      setEmailBody('');
    },
    onError: (err: any) => toast.error(err.message || "Failed to send email"),
  });

  // Consumer offer claiming
  const [claimingOfferId, setClaimingOfferId] = useState<number | null>(null);
  const [showClaimSuccess, setShowClaimSuccess] = useState(false);
  const [lastClaimCode, setLastClaimCode] = useState('');
  const { data: myClaims } = trpc.consumerClaim.myClaims.useQuery(undefined, { enabled: isAuthenticated });
  const claimOfferMut = trpc.consumerClaim.claim.useMutation({
    onSuccess: (result: any) => {
      setLastClaimCode(result?.claimCode || '');
      setShowClaimSuccess(true);
      setClaimingOfferId(null);
      utils.consumerClaim.myClaims.invalidate();
      toast.success('Offer claimed! Show the code to the business.');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to claim offer');
      setClaimingOfferId(null);
    },
  });

  // Save business functionality (must be before early returns to maintain hook order)
  const { data: savedList } = trpc.savedBusiness.list.useQuery(undefined, { enabled: isAuthenticated });
  const saveMutation = trpc.savedBusiness.save.useMutation({
    onSuccess: () => {
      utils.savedBusiness.list.invalidate();
      toast.success("Business saved!");
    },
    onError: (err: any) => toast.error(err.message || "Failed to save"),
  });
  const unsaveMutation = trpc.savedBusiness.unsave.useMutation({
    onSuccess: () => {
      utils.savedBusiness.list.invalidate();
      toast.success("Business removed from saved list.");
    },
    onError: (err: any) => toast.error(err.message || "Failed to unsave"),
  });

  // Logo upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const uploadLogo = trpc.logoUpload.upload.useMutation({
    onSuccess: () => {
      toast.success("Logo updated!");
      utils.business.getBySlug.invalidate({ slug: params.slug });
    },
    onError: (err: any) => toast.error(err.message || "Failed to upload logo"),
  });

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !data?.business.id) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo must be under 2MB");
      return;
    }
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        uploadLogo.mutate({
          businessId: data.business.id,
          logoData: base64,
          contentType: file.type,
        });
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setUploading(false);
      toast.error("Failed to read file");
    }
  };

  // Google Maps URL for reviews - generate search URL as fallback
  const googleMapsUrl = useMemo(() => {
    if (!data?.business) return null;
    if ((data.business as any).googleMapsUrl) return (data.business as any).googleMapsUrl;
    // Generate a Google Maps search URL from business name + city
    if (data.business.name && data.business.city) {
      const query = encodeURIComponent(`${data.business.name} ${data.business.city}${data.business.country ? ` ${data.business.country}` : ''}`);
      return `https://www.google.com/maps/search/?api=1&query=${query}`;
    }
    return null;
  }, [data?.business]);

  const handleSubmitClaim = () => {
    if (!data?.business.id) return;
    claimMutation.mutate({ businessId: data.business.id });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="container py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-4" />
            <div className="h-4 bg-muted rounded w-2/3 mb-8" />
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-4">
                <div className="h-40 bg-muted rounded" />
                <div className="h-40 bg-muted rounded" />
              </div>
              <div className="h-60 bg-muted rounded" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="container py-20 text-center">
          <h2 className="text-2xl font-bold mb-4">Business Not Found</h2>
          <p className="text-muted-foreground mb-6" style={{ textTransform: "none", letterSpacing: "normal" }}>
            The business you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/directory">
            <Button className="bg-primary text-primary-foreground">Back to Directory</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const { business, sportCategory, businessType } = data;
  const isOwner = isAuthenticated && user?.id === business.claimedByUserId;
  const isAdmin = user?.role === 'admin';
  const isClaimed = business.isClaimed;
  const isApproved = business.approvalStatus === 'approved';
  const canEdit = (isOwner && isApproved) || isAdmin;
  const isPendingApproval = isOwner && business.approvalStatus === 'pending';
  const isReallyVerified = isClaimed && !!business.claimedByUserId;
  const canSeePrivateInfo = isOwner || isAdmin;

  const b2bOffers = offers?.filter(o => o.offerType === "b2b") || [];
  const consumerOffers = offers?.filter(o => o.offerType === "consumer") || [];
  const isSaved = savedList?.some((s: any) => s.business.id === business.id) || false;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-card border-b border-border">
        <div className="container py-3">
          <Link href="/directory">
            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground cursor-pointer" style={{ textTransform: "none" }}>
              <ArrowLeft className="w-4 h-4" /> Back to Directory
            </span>
          </Link>
        </div>
      </div>

      {/* Business Header */}
      <section className="bg-[oklch(0.22_0.02_50)] text-white py-10">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            {/* Logo or icon */}
            <BusinessLogo
              logoUrl={(business as any).logoUrl}
              businessName={business.name}
              sportSlug={sportCategory?.slug}
              size="w-16 h-16"
              iconSize="w-8 h-8"
              roundedXl
            />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold">{business.name}</h1>
                {isReallyVerified && isApproved ? (
                  <Badge className="bg-primary/20 text-primary border-primary/30" style={{ textTransform: "none" }}>
                    <Shield className="w-3 h-3 mr-1" /> Verified
                  </Badge>
                ) : isReallyVerified && business.approvalStatus === 'pending' ? (
                  <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30" style={{ textTransform: "none" }}>
                    <AlertCircle className="w-3 h-3 mr-1" /> Pending Approval
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-white/30 text-white/60" style={{ textTransform: "none" }}>
                    Unclaimed
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-white/70 text-sm" style={{ textTransform: "none" }}>
                {businessType && <span className="bg-white/10 px-2 py-0.5 rounded">{businessType.name}</span>}
                {sportCategory && (
                  <span className="flex items-center gap-1">
                    {sportIcons[sportCategory.slug]} {sportCategory.name}
                  </span>
                )}
                {business.hub && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {business.hub}, {business.country}
                  </span>
                )}
                {!business.hub && business.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {business.city}{business.state ? `, ${business.state}` : ""}{business.country ? `, ${business.country}` : ""}
                  </span>
                )}
                {business.region && (
                  <span className="flex items-center gap-1 text-[oklch(0.55_0.15_45)]">
                    <Globe className="w-3 h-3" /> {business.region}
                  </span>
                )}
              </div>
              {/* Google Rating with link */}
              {business.googleRating && (
                <div className="flex items-center gap-2 mt-3">
                  {googleMapsUrl ? (
                    <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                      <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.round(parseFloat(business.googleRating || "0"))
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-white/20"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-white">{business.googleRating}</span>
                      {business.googleReviewCount && business.googleReviewCount > 0 && (
                        <span className="text-sm text-white/50">({business.googleReviewCount.toLocaleString()} Google reviews)</span>
                      )}
                      <ExternalLink className="w-3 h-3 text-white/40" />
                    </a>
                  ) : (
                    <div className="flex items-center gap-2">
                      <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.round(parseFloat(business.googleRating || "0"))
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-white/20"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-white">{business.googleRating}</span>
                      {business.googleReviewCount && business.googleReviewCount > 0 && (
                        <span className="text-sm text-white/50">({business.googleReviewCount.toLocaleString()} Google reviews)</span>
                      )}
                    </div>
                  )}
                </div>
              )}
              {/* Website link - visible for all businesses */}
              {business.website && (
                <div className="mt-2">
                  <a
                    href={business.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-[oklch(0.55_0.15_45)] hover:text-[oklch(0.65_0.15_45)] transition-colors"
                    style={{ textTransform: "none" }}
                  >
                    <Globe className="w-3.5 h-3.5" /> Visit Website <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 shrink-0">
              {/* Save/Unsave Button */}
              {isAuthenticated && !isOwner && (
                <Button
                  variant="outline"
                  className={`border-white/30 hover:bg-white/10 bg-transparent ${
                    isSaved ? "text-primary border-primary/40" : "text-white"
                  }`}
                  style={{ textTransform: "none" }}
                  onClick={() => {
                    if (isSaved) {
                      unsaveMutation.mutate({ businessId: business.id });
                    } else {
                      saveMutation.mutate({ businessId: business.id });
                    }
                  }}
                  disabled={saveMutation.isPending || unsaveMutation.isPending}
                >
                  {isSaved ? (
                    <><BookmarkCheck className="w-4 h-4 mr-2" /> Saved</>
                  ) : (
                    <><Bookmark className="w-4 h-4 mr-2" /> Save</>
                  )}
                </Button>
              )}
              {(!isReallyVerified) && isAuthenticated && (
                <Button
                  onClick={() => setShowClaimConfirm(true)}
                  className="bg-[oklch(0.55_0.15_45)] hover:bg-[oklch(0.50_0.15_45)] text-white"
                  style={{ textTransform: "none" }}
                  disabled={claimMutation.isPending}
                >
                  {claimMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Claiming...</>
                  ) : (
                    <><Handshake className="w-4 h-4 mr-2" /> Claim Business</>
                  )}
                </Button>
              )}
              {(!isReallyVerified) && !isAuthenticated && (
                <a href={getLoginUrl()}>
                  <Button className="bg-[oklch(0.55_0.15_45)] hover:bg-[oklch(0.50_0.15_45)] text-white" style={{ textTransform: "none" }}>
                    <Handshake className="w-4 h-4 mr-2" /> Sign In to Claim
                  </Button>
                </a>
              )}
              {isPendingApproval && (
                <div className="flex items-center gap-2 bg-amber-500/20 border border-amber-500/40 rounded-lg px-4 py-2 text-amber-200">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm" style={{ textTransform: 'none', letterSpacing: 'normal' }}>Your claim is pending admin approval. You'll be able to edit this listing once approved.</span>
                </div>
              )}
              {canEdit && (
                <>
                  <Link href={`/dashboard/edit/${business.id}`}>
                    <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 bg-transparent" style={{ textTransform: "none" }}>
                      <Pencil className="w-4 h-4 mr-2" /> Edit Info
                    </Button>
                  </Link>
                  <Link href={`/dashboard/offers/${business.id}`}>
                    <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 bg-transparent" style={{ textTransform: "none" }}>
                      <Gift className="w-4 h-4 mr-2" /> Update Offers
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10 bg-transparent"
                    style={{ textTransform: "none" }}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Camera className="w-4 h-4 mr-2" />}
                    {uploading ? "Uploading..." : "Upload Logo"}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Claim Confirmation Dialog */}
      <Dialog open={showClaimConfirm} onOpenChange={setShowClaimConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Handshake className="w-5 h-5 text-[oklch(0.55_0.15_45)]" />
              Claim {business.name}?
            </DialogTitle>
            <DialogDescription style={{ textTransform: "none", letterSpacing: "normal" }}>
              You're about to claim ownership of <strong>{business.name}</strong>. Your claim will be reviewed by our admin team to verify you are the rightful owner. You'll be notified once your claim is approved.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-4 text-sm text-amber-800 dark:text-amber-200" style={{ textTransform: "none", letterSpacing: "normal" }}>
            <p className="font-medium mb-1">What happens next:</p>
            <ul className="list-disc list-inside space-y-1 text-amber-700 dark:text-amber-300">
              <li>Your claim is sent to our admin team for review</li>
              <li>We'll verify your account matches this business</li>
              <li>Once approved, you'll have full control of this listing</li>
              <li>You can then manage offers, edit info, and upload your logo</li>
            </ul>
          </div>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setShowClaimConfirm(false)} style={{ textTransform: "none" }}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitClaim}
              disabled={claimMutation.isPending}
              className="bg-[oklch(0.55_0.15_45)] hover:bg-[oklch(0.50_0.15_45)] text-white"
              style={{ textTransform: "none" }}
            >
              {claimMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
              ) : (
                <><Handshake className="w-4 h-4 mr-2" /> Yes, Claim This Business</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Content */}
      <section className="py-10">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-8">
              {/* About */}
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground leading-relaxed" style={{ textTransform: "none", letterSpacing: "normal" }}>
                    {business.description || business.shortDescription || "No description available."}
                  </p>
                </CardContent>
              </Card>

              {/* B2B Referral Offers */}
              {b2bOffers.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Handshake className="w-5 h-5 text-[oklch(0.55_0.15_45)]" /> B2B Referral Offers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4" style={{ textTransform: "none", letterSpacing: "normal" }}>
                      For businesses looking to collaborate or send customers. Referred customers can still claim eligible athlete offers.
                    </p>
                    <div className="space-y-4">
                      {b2bOffers.map((offer) => (
                        <div key={offer.id} className="border border-[oklch(0.55_0.15_45)]/20 rounded-lg p-4 bg-[oklch(0.55_0.15_45)]/5">
                          {(offer as any).isSample && (
                            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md px-3 py-2 mb-3 flex items-start gap-2">
                              <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                              <p className="text-xs text-amber-700 dark:text-amber-300" style={{ textTransform: "none", letterSpacing: "normal" }}>
                                <strong>Sample offer for demonstrative purposes.</strong> Is this your business? Claim your listing to publish your own real incentives — completely free.
                              </p>
                            </div>
                          )}
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-semibold text-foreground">{offer.title}</h4>
                              <Badge variant="secondary" className="bg-[oklch(0.55_0.15_45)]/10 text-[oklch(0.55_0.15_45)] text-xs" style={{ textTransform: "none" }}>
                                <Handshake className="w-3 h-3 mr-1" /> B2B
                              </Badge>
                              {(offer as any).isSample && (
                                <Badge variant="outline" className="bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700 text-[10px]" style={{ textTransform: "none" }}>
                                  <Sparkles className="w-3 h-3 mr-1" /> Sample
                                </Badge>
                              )}
                            </div>
                            <Badge className="bg-[oklch(0.55_0.15_45)] text-white" style={{ textTransform: "none" }}>
                              {offer.incentiveType === "percentage" ? `${(offer.incentiveValue || '').replace(/^\$+/, '')}%` :
                               offer.incentiveType === "fixed" ? `$${(offer.incentiveValue || '').replace(/^\$+/, '')}` :
                               offer.incentiveType}
                            </Badge>
                          </div>
                          {offer.description && (
                            <p className="text-sm text-muted-foreground mb-2" style={{ textTransform: "none", letterSpacing: "normal" }}>
                              {offer.description}
                            </p>
                          )}
                          {offer.incentiveDescription && (
                            <p className="text-sm text-foreground" style={{ textTransform: "none", letterSpacing: "normal" }}>
                              <strong>Incentive:</strong> {offer.incentiveDescription}
                            </p>
                          )}
                          {isAuthenticated && (
                            <Link href={`/dashboard/send-referral?to=${business.id}&offer=${offer.id}`}>
                              <Button size="sm" className="mt-3 bg-primary text-primary-foreground" style={{ textTransform: "none" }}>
                                <Send className="w-3 h-3 mr-1" /> Send a Referral
                              </Button>
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Athlete Offers */}
              {consumerOffers.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" /> Athlete Offers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4" style={{ textTransform: "none", letterSpacing: "normal" }}>
                      Special offers for individual athletes and enthusiasts — discounts, free sessions, and more.
                    </p>
                    <div className="space-y-4">
                      {consumerOffers.map((offer) => (
                        <div key={offer.id} className="border border-primary/20 rounded-lg p-4 bg-primary/5">
                          {(offer as any).isSample && (
                            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md px-3 py-2 mb-3 flex items-start gap-2">
                              <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                              <p className="text-xs text-amber-700 dark:text-amber-300" style={{ textTransform: "none", letterSpacing: "normal" }}>
                                <strong>Sample offer for demonstrative purposes.</strong> Is this your business? Claim your listing to publish your own real incentives — completely free.
                              </p>
                            </div>
                          )}
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-semibold text-foreground">{offer.title}</h4>
                              <Badge variant="secondary" className="bg-primary/10 text-primary text-xs" style={{ textTransform: "none" }}>
                                <Users className="w-3 h-3 mr-1" /> Athlete
                              </Badge>
                              {(offer as any).isSample && (
                                <Badge variant="outline" className="bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700 text-[10px]" style={{ textTransform: "none" }}>
                                  <Sparkles className="w-3 h-3 mr-1" /> Sample
                                </Badge>
                              )}
                            </div>
                            <Badge className="bg-primary text-primary-foreground" style={{ textTransform: "none" }}>
                              {offer.incentiveType === "percentage" ? `${(offer.incentiveValue || '').replace(/^\$+/, '')}%` :
                               offer.incentiveType === "fixed" ? `$${(offer.incentiveValue || '').replace(/^\$+/, '')}` :
                               offer.incentiveType}
                            </Badge>
                          </div>
                          {offer.description && (
                            <p className="text-sm text-muted-foreground mb-2" style={{ textTransform: "none", letterSpacing: "normal" }}>
                              {offer.description}
                            </p>
                          )}
                          {offer.incentiveDescription && (
                            <p className="text-sm text-foreground" style={{ textTransform: "none", letterSpacing: "normal" }}>
                              <strong>Offer details:</strong> {offer.incentiveDescription}
                            </p>
                          )}
                          {/* Claim / Already Claimed */}
                          <div className="mt-3 pt-3 border-t border-primary/10">
                            {(() => {
                              const alreadyClaimed = myClaims?.some((c: any) => c.claim.referralOfferId === offer.id && ['claimed', 'redeemed'].includes(c.claim.status));
                              const existingClaim = myClaims?.find((c: any) => c.claim.referralOfferId === offer.id && ['claimed', 'redeemed'].includes(c.claim.status));
                              if (alreadyClaimed) {
                                return (
                                  <div className="flex items-center gap-2 text-sm">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    <span className="text-green-600 dark:text-green-400 font-medium" style={{ textTransform: 'none' }}>
                                      {existingClaim?.claim.status === 'redeemed' ? 'Redeemed' : 'Claimed'}
                                    </span>
                                    {existingClaim?.claim.claimCode && (
                                      <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono">{existingClaim.claim.claimCode}</code>
                                    )}
                                  </div>
                                );
                              }
                              if (!isAuthenticated) {
                                return (
                                  <a href={getLoginUrl()}>
                                    <Button size="sm" className="gap-1.5" style={{ textTransform: 'none' }}>
                                      <Gift className="w-3.5 h-3.5" /> Sign In to Claim
                                    </Button>
                                  </a>
                                );
                              }
                              return (
                                <Button
                                  size="sm"
                                  className="gap-1.5"
                                  style={{ textTransform: 'none' }}
                                  disabled={claimOfferMut.isPending && claimingOfferId === offer.id}
                                  onClick={() => {
                                    setClaimingOfferId(offer.id);
                                    claimOfferMut.mutate({ referralOfferId: offer.id, businessId: data!.business.id });
                                  }}
                                >
                                  {claimOfferMut.isPending && claimingOfferId === offer.id ? (
                                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Claiming...</>
                                  ) : (
                                    <><Gift className="w-3.5 h-3.5" /> Claim This Offer</>
                                  )}
                                </Button>
                              );
                            })()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Unclaimed notice */}
              {!isReallyVerified && (
                <Card className="border-dashed border-2 border-muted">
                  <CardContent className="p-8 text-center">
                    <Shield className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-lg font-bold mb-2">This Business Hasn't Been Claimed Yet</h3>
                    <p className="text-muted-foreground mb-4 max-w-md mx-auto" style={{ textTransform: "none", letterSpacing: "normal" }}>
                      Is this your business? Claim it to unlock your full profile, post referral offers, and start getting customers from partner businesses. It's free. Like, actually free. No asterisks.
                    </p>
                    <p className="text-xs text-muted-foreground/70 mb-4" style={{ textTransform: "none", letterSpacing: "normal" }}>
                      Your claim will be reviewed by our admin team. Quick and painless.
                    </p>
                    {isAuthenticated ? (
                      <Button
                        onClick={() => setShowClaimConfirm(true)}
                        disabled={claimMutation.isPending}
                        className="bg-primary text-primary-foreground"
                        style={{ textTransform: "none" }}
                      >
                        <Handshake className="w-4 h-4 mr-2" />
                        Claim This Business
                      </Button>
                    ) : (
                      <a href={getLoginUrl()}>
                        <Button className="bg-primary text-primary-foreground" style={{ textTransform: "none" }}>
                          Sign In to Claim
                        </Button>
                      </a>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Contact & Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Website - always visible */}
                  {business.website && (
                    <a href={business.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-foreground hover:text-primary transition-colors" style={{ textTransform: "none" }}>
                      <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
                      Visit Website <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {/* Google Maps - always visible */}
                  {googleMapsUrl && (
                    <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-foreground hover:text-primary transition-colors" style={{ textTransform: "none" }}>
                      <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4 shrink-0" />
                      Google Maps <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {/* Social - always visible */}
                  {business.instagram && (
                    <a href={`https://instagram.com/${business.instagram}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-foreground hover:text-primary transition-colors" style={{ textTransform: "none" }}>
                      <Instagram className="w-4 h-4 text-muted-foreground shrink-0" />
                      @{business.instagram}
                    </a>
                  )}
                  {business.facebook && (
                    <a href={business.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-foreground hover:text-primary transition-colors" style={{ textTransform: "none" }}>
                      <Facebook className="w-4 h-4 text-muted-foreground shrink-0" />
                      Facebook
                    </a>
                  )}
                  {/* Phone & Email - only visible to owner and admin */}
                  {canSeePrivateInfo && business.phone && (
                    <a href={`tel:${business.phone}`} className="flex items-center gap-3 text-sm text-foreground hover:text-primary transition-colors" style={{ textTransform: "none" }}>
                      <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                      {formatPhone(business.phone)}
                    </a>
                  )}
                  {canSeePrivateInfo && business.email && (
                    <a href={`mailto:${business.email}`} className="flex items-center gap-3 text-sm text-foreground hover:text-primary transition-colors" style={{ textTransform: "none" }}>
                      <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                      {business.email}
                    </a>
                  )}
                  {!canSeePrivateInfo && (business.phone || business.email) && (
                    <p className="text-xs text-muted-foreground/60 italic" style={{ textTransform: "none" }}>
                      Phone and email are private. Use the website or social links above to reach this business.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Brands Carried (for retailers) */}
              {(business as any).brandsCarried && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Tag className="w-4 h-4" /> Brands Carried
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1.5">
                      {(business as any).brandsCarried.split(',').map((brand: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs" style={{ textTransform: "none" }}>
                          {brand.trim()}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Google Reviews / Google Maps Card */}
              {(business.googleRating || googleMapsUrl) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                      {business.googleRating ? 'Google Reviews' : 'Find on Google'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {business.googleRating && (
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl font-bold text-foreground">{business.googleRating}</span>
                        <div>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.round(parseFloat(business.googleRating || "0"))
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-muted-foreground/30"
                                }`}
                              />
                            ))}
                          </div>
                          {business.googleReviewCount && business.googleReviewCount > 0 && (
                            <p className="text-xs text-muted-foreground mt-0.5">{business.googleReviewCount.toLocaleString()} reviews</p>
                          )}
                        </div>
                      </div>
                    )}
                    {googleMapsUrl && (
                      <a
                        href={googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-[oklch(0.55_0.15_45)] hover:underline"
                        style={{ textTransform: "none" }}
                      >
                        View on Google Maps <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Location */}
              {(business.city || business.hub) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Location</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="text-sm" style={{ textTransform: "none" }}>
                        {business.address && <p>{business.address}</p>}
                        {business.hub && <p className="font-medium">{business.hub}</p>}
                        <p>
                          {business.city}{business.state ? `, ${business.state}` : ""}
                          {business.country ? `, ${business.country}` : ""}
                        </p>
                        {business.region && (
                          <p className="text-[oklch(0.55_0.15_45)] mt-1 flex items-center gap-1">
                            <Globe className="w-3 h-3" /> {business.region}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Send Referral CTA */}
              {isClaimed && isAuthenticated && !isOwner && (
                <Card className="bg-primary text-primary-foreground">
                  <CardContent className="p-6 text-center">
                    <Send className="w-8 h-8 mx-auto mb-3" />
                    <h4 className="font-bold mb-2">Send a Referral</h4>
                    <p className="text-sm text-primary-foreground/80 mb-4" style={{ textTransform: "none", letterSpacing: "normal" }}>
                      Have a customer who could benefit from this business? Send them a referral.
                    </p>
                    <Link href={`/dashboard/send-referral?to=${business.id}`}>
                      <Button className="bg-white text-primary hover:bg-white/90 w-full" style={{ textTransform: "none" }}>
                        Send Referral
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}

              {/* Direct Contact CTA */}
              {isClaimed && !isOwner && (
                <Card className="border-2 border-dashed border-[oklch(0.55_0.15_45)]/30 bg-[oklch(0.55_0.15_45)]/5">
                  <CardContent className="p-6 text-center">
                    <Mail className="w-8 h-8 mx-auto mb-3 text-[oklch(0.55_0.15_45)]" />
                    <h4 className="font-bold mb-2 text-foreground">Have a Better Idea?</h4>
                    <p className="text-sm text-muted-foreground mb-4" style={{ textTransform: "none", letterSpacing: "normal" }}>
                      Don't see a referral program you like, or have a better partnership idea? Get in touch with {business.name} directly.
                    </p>
                    {isAuthenticated ? (
                      <Button
                        onClick={() => setEmailDialogOpen(true)}
                        className="bg-[oklch(0.55_0.15_45)] hover:bg-[oklch(0.50_0.15_45)] text-white w-full"
                        style={{ textTransform: "none" }}
                      >
                        <Mail className="w-4 h-4 mr-2" /> Send a Message
                      </Button>
                    ) : (
                      <a href={getLoginUrl()} className="block">
                        <Button className="bg-[oklch(0.55_0.15_45)] hover:bg-[oklch(0.50_0.15_45)] text-white w-full" style={{ textTransform: "none" }}>
                          <Mail className="w-4 h-4 mr-2" /> Sign In to Get in Touch
                        </Button>
                      </a>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Partnership Email Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Email {business.name}</DialogTitle>
            <DialogDescription style={{ textTransform: "none", letterSpacing: "normal" }}>
              Send a partnership inquiry or message. They'll receive this in their registered email.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Subject</label>
              <Input
                placeholder="Partnership inquiry, referral question, etc."
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Message</label>
              <Textarea
                placeholder="Hi! I'd love to discuss a referral partnership..."
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailDialogOpen(false)} style={{ textTransform: "none" }}>Cancel</Button>
            <Button
              onClick={() => sendPartnershipEmail.mutate({
                recipientBusinessId: business.id,
                subject: emailSubject,
                message: emailBody,
              })}
              disabled={sendPartnershipEmail.isPending || !emailSubject.trim() || !emailBody.trim()}
              className="bg-primary text-primary-foreground"
              style={{ textTransform: "none" }}
            >
              {sendPartnershipEmail.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Claim Success Dialog */}
      <Dialog open={showClaimSuccess} onOpenChange={setShowClaimSuccess}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              Offer Claimed!
            </DialogTitle>
            <DialogDescription style={{ textTransform: 'none', letterSpacing: 'normal' }}>
              Show this code when you visit the business to redeem your offer.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-3 py-4">
            {lastClaimCode && (
              <div className="bg-muted rounded-lg px-6 py-3 text-center">
                <div className="text-xs text-muted-foreground mb-1" style={{ textTransform: 'none' }}>Your Claim Code</div>
                <code className="text-2xl font-bold font-mono tracking-wider">{lastClaimCode}</code>
              </div>
            )}
            <p className="text-xs text-muted-foreground text-center" style={{ textTransform: 'none', letterSpacing: 'normal' }}>
              You can also find this code in your Athlete Dashboard under "My Offers".
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowClaimSuccess(false)} style={{ textTransform: 'none' }}>Got It</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
