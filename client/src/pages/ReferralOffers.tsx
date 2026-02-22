import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Gift, MapPin, ArrowRight, Bike, Mountain, Snowflake, Star,
  Handshake, Users, Compass, Globe, Info, Heart, Sparkles
} from "lucide-react";

const sportIcons: Record<string, React.ReactNode> = {
  cycling: <Bike className="w-4 h-4" />,
  running: <Mountain className="w-4 h-4" />,
  "trail-running": <Mountain className="w-4 h-4" />,
  snowsports: <Snowflake className="w-4 h-4" />,
  "sport-vacations": <Compass className="w-4 h-4" />,
};

export default function ReferralOffers() {
  const [offerTypeFilter, setOfferTypeFilter] = useState<string>("all");
  const { data: offers, isLoading } = trpc.referralOffer.allActive.useQuery({ limit: 100 });

  const filteredOffers = useMemo(() => {
    if (!offers) return [];
    if (offerTypeFilter === "all") return offers;
    return offers.filter(item => item.offer.offerType === offerTypeFilter);
  }, [offers, offerTypeFilter]);

  const b2bCount = useMemo(() => offers?.filter(o => o.offer.offerType === "b2b").length || 0, [offers]);
  const consumerCount = useMemo(() => offers?.filter(o => o.offer.offerType === "consumer").length || 0, [offers]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <section className="bg-[oklch(0.22_0.02_50)] text-white py-12">
        <div className="container">
          <div className="flex items-center gap-3 mb-3">
            <Gift className="w-8 h-8 text-[oklch(0.55_0.15_45)]" />
            <h1 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
              Referral Offers
            </h1>
          </div>
          <p className="text-white/70 max-w-2xl text-lg" style={{ textTransform: "none", letterSpacing: "normal" }}>
            Referral incentives between businesses, and deals for athletes. Browse what's on offer and find the ones worth your time.
          </p>
        </div>
      </section>

      {/* Community Message Banner */}
      <section className="bg-[oklch(0.55_0.15_45)]/5 border-b border-[oklch(0.55_0.15_45)]/15">
        <div className="container py-4">
          <div className="flex items-start gap-3">
            <Heart className="w-5 h-5 text-[oklch(0.55_0.15_45)] mt-0.5 shrink-0" />
            <div>
              <p className="text-sm text-foreground font-medium" style={{ textTransform: "none", letterSpacing: "normal" }}>
                These are real offers from real businesses. No catch.
              </p>
              <p className="text-sm text-muted-foreground mt-1" style={{ textTransform: "none", letterSpacing: "normal" }}>
                SportConnect is free. See your business here with a sample offer? <Link href="/directory" className="text-[oklch(0.55_0.15_45)] underline hover:text-[oklch(0.45_0.15_45)]">Claim your listing</Link> and replace it with your actual incentive. Takes about 2 minutes. We timed it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Offer Type Tabs */}
      <section className="bg-card border-b border-border py-4 sticky top-16 z-40">
        <div className="container">
          <Tabs value={offerTypeFilter} onValueChange={setOfferTypeFilter}>
            <TabsList className="bg-muted">
              <TabsTrigger value="all" className="data-[state=active]:bg-background" style={{ textTransform: "none" }}>
                All Offers ({offers?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="b2b" className="data-[state=active]:bg-background" style={{ textTransform: "none" }}>
                <Handshake className="w-4 h-4 mr-1.5" /> B2B ({b2bCount})
              </TabsTrigger>
              <TabsTrigger value="consumer" className="data-[state=active]:bg-background" style={{ textTransform: "none" }}>
                <Users className="w-4 h-4 mr-1.5" /> Consumer ({consumerCount})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </section>

      <section className="py-10 flex-1">
        <div className="container">
          {/* Explainer for current tab */}
          {offerTypeFilter === "b2b" && (
            <div className="bg-[oklch(0.55_0.15_45)]/10 border border-[oklch(0.55_0.15_45)]/20 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-1">
                <Handshake className="w-5 h-5 text-[oklch(0.55_0.15_45)]" />
                <h3 className="font-bold text-foreground">B2B Referral Offers</h3>
              </div>
              <p className="text-sm text-muted-foreground" style={{ textTransform: "none", letterSpacing: "normal" }}>
                For businesses that send customers to each other. Earn commissions, trade services, or set up a partnership. Referred customers can still grab consumer offers too.
              </p>
            </div>
          )}
          {offerTypeFilter === "consumer" && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-foreground">Consumer Offers</h3>
              </div>
              <p className="text-sm text-muted-foreground" style={{ textTransform: "none", letterSpacing: "normal" }}>
                For athletes and enthusiasts. Discounts, free sessions, and deals straight from sports businesses near you.
              </p>
            </div>
          )}

          {isLoading ? (
            <div className="grid md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-5 bg-muted rounded w-2/3 mb-3" />
                    <div className="h-4 bg-muted rounded w-full mb-2" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredOffers.length === 0 ? (
            <div className="text-center py-20">
              <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No {offerTypeFilter !== "all" ? (offerTypeFilter === "b2b" ? "B2B" : "Consumer") : "Active"} Offers</h3>
              <p className="text-muted-foreground mb-6" style={{ textTransform: "none", letterSpacing: "normal" }}>
                {offerTypeFilter === "b2b" 
                  ? "No B2B referral offers yet. Claim your business and post the first one."
                  : offerTypeFilter === "consumer"
                  ? "No consumer offers yet. Check back soon or browse B2B offers."
                  : "Be the first to post a referral offer. Claim your business and start attracting referrals."
                }
              </p>
              <Link href="/directory">
                <Button className="bg-primary text-primary-foreground" style={{ textTransform: "none" }}>
                  Browse Directory
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredOffers.map((item) => (
                <Card key={item.offer.id} className={`hover:shadow-lg transition-shadow border-border ${(item.offer as any).isSample ? "relative" : ""}`}>
                  <CardContent className="p-6">
                    {/* Sample Offer Banner */}
                    {(item.offer as any).isSample && (
                      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md px-3 py-2 mb-4 flex items-start gap-2">
                        <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                        <p className="text-xs text-amber-700 dark:text-amber-300" style={{ textTransform: "none", letterSpacing: "normal" }}>
                          <strong>Sample offer for demonstrative purposes.</strong> Is this your business? <Link href="/directory" className="underline hover:text-amber-900 dark:hover:text-amber-100">Claim your listing</Link> to replace this with your real incentives — completely free.
                        </p>
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-bold text-lg text-foreground">{item.offer.title}</h3>
                          <Badge
                            variant={item.offer.offerType === "b2b" ? "secondary" : "default"}
                            className={item.offer.offerType === "b2b"
                              ? "bg-[oklch(0.55_0.15_45)]/10 text-[oklch(0.55_0.15_45)] border-[oklch(0.55_0.15_45)]/20"
                              : "bg-primary/10 text-primary border-primary/20"
                            }
                            style={{ textTransform: "none" }}
                          >
                            {item.offer.offerType === "b2b" ? (
                              <><Handshake className="w-3 h-3 mr-1" /> B2B</>
                            ) : (
                              <><Users className="w-3 h-3 mr-1" /> Consumer</>
                            )}
                          </Badge>
                          {(item.offer as any).isSample && (
                            <Badge variant="outline" className="bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700 text-[10px]" style={{ textTransform: "none" }}>
                              <Sparkles className="w-3 h-3 mr-1" /> Sample
                            </Badge>
                          )}
                        </div>
                        {item.business && (
                          <Link href={`/business/${item.business.slug}`}>
                            <span className="text-sm text-primary hover:underline cursor-pointer" style={{ textTransform: "none" }}>
                              {item.business.name}
                            </span>
                          </Link>
                        )}
                      </div>
                      <Badge className="bg-[oklch(0.55_0.15_45)] text-white shrink-0 ml-2" style={{ textTransform: "none" }}>
                        {item.offer.incentiveType === "percentage" ? `${item.offer.incentiveValue}%` :
                         item.offer.incentiveType === "fixed" ? `$${item.offer.incentiveValue}` :
                         item.offer.incentiveType}
                      </Badge>
                    </div>

                    {item.offer.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2" style={{ textTransform: "none", letterSpacing: "normal" }}>
                        {item.offer.description}
                      </p>
                    )}

                    {item.offer.incentiveDescription && (
                      <p className="text-sm text-foreground mb-3" style={{ textTransform: "none", letterSpacing: "normal" }}>
                        <strong>Incentive:</strong> {item.offer.incentiveDescription}
                      </p>
                    )}

                    {item.business && (
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-3 border-t border-border" style={{ textTransform: "none" }}>
                        {item.business.hub && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {item.business.hub}, {item.business.country}
                          </span>
                        )}
                        {!item.business.hub && item.business.city && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {item.business.city}{item.business.country ? `, ${item.business.country}` : ""}
                          </span>
                        )}
                        {item.business.region && (
                          <span className="flex items-center gap-1 text-[oklch(0.55_0.15_45)]">
                            <Globe className="w-3 h-3" /> {item.business.region}
                          </span>
                        )}
                      </div>
                    )}

                    {item.business && (
                      <Link href={`/business/${item.business.slug}`}>
                        <Button variant="outline" size="sm" className="mt-4 bg-transparent" style={{ textTransform: "none" }}>
                          View Business <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Bottom CTA for business owners */}
          {filteredOffers.length > 0 && (
            <div className="mt-12 bg-[oklch(0.22_0.02_50)] rounded-xl p-8 text-center">
              <Heart className="w-8 h-8 text-[oklch(0.55_0.15_45)] mx-auto mb-3" />
              <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-heading)" }}>
                Own a Business in the Endurance Sports Community?
              </h3>
              <p className="text-white/70 max-w-xl mx-auto mb-5" style={{ textTransform: "none", letterSpacing: "normal" }}>
                SportConnect is free. Claim your listing, post your own referral offers, and start getting customers from partner businesses. No subscription, no hidden fees.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/directory">
                  <Button className="bg-[oklch(0.55_0.15_45)] hover:bg-[oklch(0.45_0.15_45)] text-white" style={{ textTransform: "none" }}>
                    Find & Claim Your Business
                  </Button>
                </Link>
                <Link href="/submit-business">
                  <Button variant="outline" className="bg-transparent text-white border-white/30 hover:bg-white/10" style={{ textTransform: "none" }}>
                    Submit a New Business
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
