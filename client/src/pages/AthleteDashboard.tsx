import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "wouter";
import { toast } from "sonner";
import {
  Loader2, Gift, Heart, Bookmark, MapPin, ExternalLink,
  Ticket, CheckCircle2, Clock, AlertTriangle, Trash2,
  User, Target, Bike, Settings, ArrowRight
} from "lucide-react";

type TabId = "offers" | "saved" | "profile";

export default function AthleteDashboard() {
  const { user, loading } = useAuth({ redirectOnUnauthenticated: true });
  const [activeTab, setActiveTab] = useState<TabId>("offers");

  // Data queries
  const { data: claims, isLoading: claimsLoading } = trpc.consumerClaim.myClaims.useQuery(
    undefined,
    { enabled: !!user }
  );
  const { data: savedBusinesses, isLoading: savedLoading } = trpc.savedBusiness.list.useQuery(
    undefined,
    { enabled: !!user }
  );
  const { data: athleteProfile, isLoading: profileLoading } = trpc.athleteProfile.get.useQuery(
    undefined,
    { enabled: !!user }
  );
  // Analytics derived from claims data
  const { data: sportCategories } = trpc.categories.sportCategories.useQuery();

  const utils = trpc.useUtils();

  // Mutations
  const unsaveMutation = trpc.savedBusiness.unsave.useMutation({
    onSuccess: () => {
      utils.savedBusiness.list.invalidate();
      toast.success("Business removed from saved list.");
    },
  });

  const verifyClaim = trpc.consumerClaim.verify.useMutation({
    onSuccess: () => {
      utils.consumerClaim.myClaims.invalidate();
      toast.success("Thanks for the feedback!");
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const tabs: { id: TabId; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: "offers", label: "My Offers", icon: <Ticket className="w-4 h-4" />, count: claims?.length },
    { id: "saved", label: "Saved Businesses", icon: <Bookmark className="w-4 h-4" />, count: savedBusinesses?.length },
    { id: "profile", label: "My Profile", icon: <User className="w-4 h-4" /> },
  ];

  const getSportName = (id: number) => {
    const sport = sportCategories?.find((s: any) => s.id === id);
    return sport?.name || `Sport #${id}`;
  };

  const parsedSportIds: number[] = athleteProfile?.sportIds
    ? JSON.parse(athleteProfile.sportIds)
    : [];
  const parsedExperience: Record<string, string> = athleteProfile?.experienceLevels
    ? JSON.parse(athleteProfile.experienceLevels)
    : {};
  const parsedInterests: string[] = athleteProfile?.interests
    ? JSON.parse(athleteProfile.interests)
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-[oklch(0.22_0.02_50)] text-white py-8 md:py-10">
          <div className="container">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                  Hey, {user?.name?.split(' ')[0] || 'Athlete'} 👋
                </h1>
                <p className="text-white/60 mt-1" style={{ textTransform: "none", letterSpacing: "normal" }}>
                  Your deals, your saves, your profile. All the stuff that matters.
                </p>
              </div>

              {/* Quick Stats */}
              <div className="flex gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{claims?.length || 0}</div>
                  <div className="text-xs text-white/50" style={{ textTransform: "none" }}>Offers Claimed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{claims?.filter((c: any) => c.claim.status === 'redeemed').length || 0}</div>
                  <div className="text-xs text-white/50" style={{ textTransform: "none" }}>Redeemed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-400">{savedBusinesses?.length || 0}</div>
                  <div className="text-xs text-white/50" style={{ textTransform: "none" }}>Saved</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <section className="border-b border-border bg-card">
          <div className="container">
            <div className="flex gap-1 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  }`}
                  style={{ textTransform: "none" }}
                >
                  {tab.icon}
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0">
                      {tab.count}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Tab Content */}
        <section className="py-8">
          <div className="container max-w-4xl">

            {/* ─── My Offers Tab ─── */}
            {activeTab === "offers" && (
              <div>
                {claimsLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : !claims || claims.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="py-16 text-center">
                      <Gift className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
                      <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: "var(--font-heading)" }}>
                        No offers claimed yet
                      </h3>
                      <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6" style={{ textTransform: "none", letterSpacing: "normal" }}>
                        Browse the marketplace, find a deal that doesn't require selling a kidney, and claim it. Your claimed offers will show up here.
                      </p>
                      <Link href="/referral-offers">
                        <Button className="gap-2" style={{ textTransform: "none" }}>
                          Browse Offers <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {claims.map((item: any) => (
                      <Card key={item.claim.id} className="overflow-hidden">
                        <CardContent className="p-4 md:p-6">
                          <div className="flex flex-col md:flex-row md:items-start gap-4">
                            {/* Business Info */}
                            <div className="flex-1">
                              <div className="flex items-start gap-3">
                                {item.business.logoUrl ? (
                                  <img
                                    src={item.business.logoUrl}
                                    alt={item.business.name}
                                    className="w-10 h-10 rounded-lg object-cover"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Gift className="w-5 h-5 text-primary" />
                                  </div>
                                )}
                                <div>
                                  <Link href={`/business/${item.business.slug}`}>
                                    <span className="font-semibold text-foreground hover:text-primary transition-colors cursor-pointer" style={{ textTransform: "none" }}>
                                      {item.business.name}
                                    </span>
                                  </Link>
                                  <p className="text-sm text-muted-foreground mt-0.5" style={{ textTransform: "none" }}>
                                    {item.offer.title}
                                  </p>
                                </div>
                              </div>

                              {item.offer.description && (
                                <p className="text-sm text-muted-foreground mt-2 line-clamp-2" style={{ textTransform: "none", letterSpacing: "normal" }}>
                                  {item.offer.description}
                                </p>
                              )}

                              {/* Claim Code */}
                              <div className="mt-3 flex items-center gap-2">
                                <span className="text-xs text-muted-foreground" style={{ textTransform: "none" }}>Claim Code:</span>
                                <code className="text-sm font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                                  {item.claim.claimCode}
                                </code>
                              </div>
                            </div>

                            {/* Status & Actions */}
                            <div className="flex flex-col items-end gap-2 shrink-0">
                              {item.claim.status === 'claimed' && (
                                <>
                                  <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                                    <Clock className="w-3 h-3 mr-1" /> Claimed
                                  </Badge>
                                  <div className="flex gap-2 mt-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-green-600 border-green-600/30 hover:bg-green-600/10 gap-1"
                                      style={{ textTransform: "none" }}
                                      onClick={() => verifyClaim.mutate({
                                        claimId: item.claim.id,
                                        honored: true,
                                      })}
                                      disabled={verifyClaim.isPending}
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5" /> They honored it
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-red-500 border-red-500/30 hover:bg-red-500/10 gap-1"
                                      style={{ textTransform: "none" }}
                                      onClick={() => verifyClaim.mutate({
                                        claimId: item.claim.id,
                                        honored: false,
                                        notes: "Business did not honor the offer",
                                      })}
                                      disabled={verifyClaim.isPending}
                                    >
                                      <AlertTriangle className="w-3.5 h-3.5" /> Nope
                                    </Button>
                                  </div>
                                </>
                              )}
                              {item.claim.status === 'redeemed' && (
                                <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                                  <CheckCircle2 className="w-3 h-3 mr-1" /> Redeemed
                                </Badge>
                              )}
                              {item.claim.status === 'disputed' && (
                                <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
                                  <AlertTriangle className="w-3 h-3 mr-1" /> Disputed
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground" style={{ textTransform: "none" }}>
                                {new Date(item.claim.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ─── Saved Businesses Tab ─── */}
            {activeTab === "saved" && (
              <div>
                {savedLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : !savedBusinesses || savedBusinesses.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="py-16 text-center">
                      <Bookmark className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
                      <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: "var(--font-heading)" }}>
                        No saved businesses yet
                      </h3>
                      <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6" style={{ textTransform: "none", letterSpacing: "normal" }}>
                        Found a coach you like? A shop that doesn't upsell you on everything? Save them here so you don't lose track.
                      </p>
                      <Link href="/directory">
                        <Button className="gap-2" style={{ textTransform: "none" }}>
                          Browse Directory <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedBusinesses.map((item: any) => (
                      <Card key={item.savedBusiness.id} className="overflow-hidden hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            {item.business.logoUrl ? (
                              <img
                                src={item.business.logoUrl}
                                alt={item.business.name}
                                className="w-12 h-12 rounded-lg object-cover shrink-0"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                <Heart className="w-6 h-6 text-primary" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <Link href={`/business/${item.business.slug}`}>
                                <span className="font-semibold text-foreground hover:text-primary transition-colors cursor-pointer line-clamp-1" style={{ textTransform: "none" }}>
                                  {item.business.name}
                                </span>
                              </Link>
                              {item.businessType && (
                                <p className="text-xs text-muted-foreground mt-0.5" style={{ textTransform: "none" }}>
                                  {item.businessType.name}
                                </p>
                              )}
                              {(item.business.city || item.business.region) && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1" style={{ textTransform: "none" }}>
                                  <MapPin className="w-3 h-3" />
                                  {[item.business.city, item.business.region].filter(Boolean).join(', ')}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-1 shrink-0">
                              <Link href={`/business/${item.business.slug}`}>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                  <ExternalLink className="w-4 h-4" />
                                </Button>
                              </Link>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-muted-foreground hover:text-red-500"
                                onClick={() => unsaveMutation.mutate({ businessId: item.business.id })}
                                disabled={unsaveMutation.isPending}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ─── My Profile Tab ─── */}
            {activeTab === "profile" && (
              <div>
                {profileLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : !athleteProfile ? (
                  <Card className="border-dashed">
                    <CardContent className="py-16 text-center">
                      <User className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
                      <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: "var(--font-heading)" }}>
                        Profile not set up yet
                      </h3>
                      <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6" style={{ textTransform: "none", letterSpacing: "normal" }}>
                        Tell us about your sports and what you're looking for. Takes 60 seconds and helps us recommend the right businesses.
                      </p>
                      <Link href="/onboarding?type=athlete">
                        <Button className="gap-2" style={{ textTransform: "none" }}>
                          Set Up Profile <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    {/* Profile Summary */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
                          <User className="w-5 h-5 text-primary" />
                          {athleteProfile.displayName || user?.name || "Athlete"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Location */}
                        {(athleteProfile.city || athleteProfile.country) && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground" style={{ textTransform: "none" }}>
                            <MapPin className="w-4 h-4 shrink-0" />
                            {[athleteProfile.city, athleteProfile.state, athleteProfile.country].filter(Boolean).join(', ')}
                          </div>
                        )}

                        {/* Sports */}
                        {parsedSportIds.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5" style={{ textTransform: "none" }}>
                              <Bike className="w-4 h-4 text-primary" /> Sports
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {parsedSportIds.map((id: number) => (
                                <Badge key={id} variant="secondary" className="text-xs">
                                  {getSportName(id)}
                                  {parsedExperience[id.toString()] && (
                                    <span className="ml-1 text-primary">
                                      · {parsedExperience[id.toString()]}
                                    </span>
                                  )}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Interests */}
                        {parsedInterests.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5" style={{ textTransform: "none" }}>
                              <Target className="w-4 h-4 text-primary" /> Looking For
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {parsedInterests.map((interest: string) => (
                                <Badge key={interest} variant="outline" className="text-xs capitalize">
                                  {interest.replace(/_/g, ' ')}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Goals */}
                        {athleteProfile.goals && (
                          <div>
                            <h4 className="text-sm font-semibold mb-1" style={{ textTransform: "none" }}>Goals</h4>
                            <p className="text-sm text-muted-foreground" style={{ textTransform: "none", letterSpacing: "normal" }}>
                              {athleteProfile.goals}
                            </p>
                          </div>
                        )}

                        {/* Newsletter */}
                        <div className="text-xs text-muted-foreground pt-2 border-t border-border" style={{ textTransform: "none" }}>
                          Newsletter: {athleteProfile.newsletterOptIn ? "Subscribed" : "Not subscribed"}
                          {athleteProfile.referralSource && (
                            <span className="ml-3">· Found us via: {athleteProfile.referralSource}</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Edit Profile Link */}
                    <div className="text-center">
                      <Link href="/onboarding?type=athlete">
                        <Button variant="outline" className="gap-2" style={{ textTransform: "none" }}>
                          <Settings className="w-4 h-4" /> Edit Profile
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
