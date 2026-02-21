import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useParams, Link, useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import {
  MapPin, Phone, Mail, Globe, Shield, ArrowLeft,
  Bike, Mountain, Snowflake, Star, Handshake, Compass,
  Instagram, Facebook, Pencil, Gift, Send, ExternalLink,
  Users, Info, Sparkles, Heart
} from "lucide-react";

const sportIcons: Record<string, React.ReactNode> = {
  cycling: <Bike className="w-5 h-5" />,
  running: <Mountain className="w-5 h-5" />,
  "trail-running": <Mountain className="w-5 h-5" />,
  snowsports: <Snowflake className="w-5 h-5" />,
  "sport-vacations": <Compass className="w-5 h-5" />,
};

export default function BusinessProfile() {
  const params = useParams<{ slug: string }>();
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();

  const { data, isLoading, error } = trpc.business.getBySlug.useQuery(
    { slug: params.slug || "" },
    { enabled: !!params.slug }
  );

  const { data: offers } = trpc.referralOffer.getByBusiness.useQuery(
    { businessId: data?.business.id || 0 },
    { enabled: !!data?.business.id && data.business.isClaimed }
  );

  const claimMutation = trpc.business.claim.useMutation({
    onSuccess: () => {
      toast.success("Business claimed successfully! You can now edit your profile.");
      utils.business.getBySlug.invalidate({ slug: params.slug });
    },
    onError: (err) => {
      toast.error(err.message || "Failed to claim business");
    },
  });

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
  const isClaimed = business.isClaimed;

  const b2bOffers = offers?.filter(o => o.offerType === "b2b") || [];
  const consumerOffers = offers?.filter(o => o.offerType === "consumer") || [];

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
            <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center text-[oklch(0.55_0.15_45)] shrink-0">
              {sportIcons[sportCategory?.slug || ""] || <Star className="w-8 h-8" />}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold">{business.name}</h1>
                {isClaimed ? (
                  <Badge className="bg-primary/20 text-primary border-primary/30" style={{ textTransform: "none" }}>
                    <Shield className="w-3 h-3 mr-1" /> Verified
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
              {/* Google Rating */}
              {business.googleRating && (
                <div className="flex items-center gap-2 mt-3">
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

            {/* Action Buttons - Only show Edit/Update after claiming */}
            <div className="flex flex-wrap gap-2 shrink-0">
              {!isClaimed && isAuthenticated && (
                <Button
                  onClick={() => claimMutation.mutate({ businessId: business.id })}
                  disabled={claimMutation.isPending}
                  className="bg-[oklch(0.55_0.15_45)] hover:bg-[oklch(0.50_0.15_45)] text-white"
                  style={{ textTransform: "none" }}
                >
                  <Handshake className="w-4 h-4 mr-2" />
                  {claimMutation.isPending ? "Claiming..." : "Claim Business"}
                </Button>
              )}
              {!isClaimed && !isAuthenticated && (
                <a href={getLoginUrl()}>
                  <Button className="bg-[oklch(0.55_0.15_45)] hover:bg-[oklch(0.50_0.15_45)] text-white" style={{ textTransform: "none" }}>
                    <Handshake className="w-4 h-4 mr-2" /> Sign In to Claim
                  </Button>
                </a>
              )}
              {isOwner && (
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
                </>
              )}
            </div>
          </div>
        </div>
      </section>

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

              {/* B2B Referral Offers - Only shown for claimed businesses */}
              {isClaimed && b2bOffers.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Handshake className="w-5 h-5 text-[oklch(0.55_0.15_45)]" /> B2B Referral Offers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4" style={{ textTransform: "none", letterSpacing: "normal" }}>
                      For businesses looking to collaborate or send customers. Referred customers can still claim eligible consumer offers.
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
                              {offer.incentiveType === "percentage" ? `${offer.incentiveValue}%` :
                               offer.incentiveType === "fixed" ? `$${offer.incentiveValue}` :
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

              {/* Consumer Offers - Only shown for claimed businesses */}
              {isClaimed && consumerOffers.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" /> Consumer Offers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4" style={{ textTransform: "none", letterSpacing: "normal" }}>
                      Special offers for individual consumers and enthusiasts — discounts, free sessions, and more.
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
                                <Users className="w-3 h-3 mr-1" /> Consumer
                              </Badge>
                              {(offer as any).isSample && (
                                <Badge variant="outline" className="bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700 text-[10px]" style={{ textTransform: "none" }}>
                                  <Sparkles className="w-3 h-3 mr-1" /> Sample
                                </Badge>
                              )}
                            </div>
                            <Badge className="bg-primary text-primary-foreground" style={{ textTransform: "none" }}>
                              {offer.incentiveType === "percentage" ? `${offer.incentiveValue}%` :
                               offer.incentiveType === "fixed" ? `$${offer.incentiveValue}` :
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
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Unclaimed notice */}
              {!isClaimed && (
                <Card className="border-dashed border-2 border-muted">
                  <CardContent className="p-8 text-center">
                    <Shield className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-lg font-bold mb-2">This Business Hasn't Been Claimed</h3>
                    <p className="text-muted-foreground mb-4 max-w-md mx-auto" style={{ textTransform: "none", letterSpacing: "normal" }}>
                      Contact information, referral offers, and full business details are only available for claimed and verified businesses. SportConnect is 100% free — community supporting community.
                    </p>
                    {isAuthenticated ? (
                      <Button
                        onClick={() => claimMutation.mutate({ businessId: business.id })}
                        disabled={claimMutation.isPending}
                        className="bg-primary text-primary-foreground"
                        style={{ textTransform: "none" }}
                      >
                        <Handshake className="w-4 h-4 mr-2" />
                        {claimMutation.isPending ? "Claiming..." : "Claim This Business"}
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
              {/* Contact Info - Only for claimed businesses */}
              {isClaimed && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {business.phone && (
                      <a href={`tel:${business.phone}`} className="flex items-center gap-3 text-sm text-foreground hover:text-primary transition-colors" style={{ textTransform: "none" }}>
                        <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                        {business.phone}
                      </a>
                    )}
                    {business.email && (
                      <a href={`mailto:${business.email}`} className="flex items-center gap-3 text-sm text-foreground hover:text-primary transition-colors" style={{ textTransform: "none" }}>
                        <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                        {business.email}
                      </a>
                    )}
                    {business.website && (
                      <a href={business.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-foreground hover:text-primary transition-colors" style={{ textTransform: "none" }}>
                        <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
                        Visit Website <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
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
                    {!business.phone && !business.email && !business.website && (
                      <p className="text-sm text-muted-foreground" style={{ textTransform: "none" }}>
                        No contact information added yet.
                      </p>
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
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
