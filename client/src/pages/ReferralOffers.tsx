import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Gift, MapPin, ArrowRight, Bike, Mountain, Snowflake, Star } from "lucide-react";

const sportIcons: Record<string, React.ReactNode> = {
  cycling: <Bike className="w-4 h-4" />,
  "trail-running": <Mountain className="w-4 h-4" />,
  snowsports: <Snowflake className="w-4 h-4" />,
};

export default function ReferralOffers() {
  const { data: offers, isLoading } = trpc.referralOffer.allActive.useQuery({ limit: 50 });

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
            Browse active B2B referral incentives from verified businesses. Send referrals and earn rewards.
          </p>
        </div>
      </section>

      <section className="py-10 flex-1">
        <div className="container">
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
          ) : !offers || offers.length === 0 ? (
            <div className="text-center py-20">
              <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No Active Referral Offers</h3>
              <p className="text-muted-foreground mb-6" style={{ textTransform: "none", letterSpacing: "normal" }}>
                Be the first to post a referral offer. Claim your business and start attracting referrals.
              </p>
              <Link href="/directory">
                <Button className="bg-primary text-primary-foreground" style={{ textTransform: "none" }}>
                  Browse Directory
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {offers.map((item) => (
                <Card key={item.offer.id} className="hover:shadow-lg transition-shadow border-border">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-foreground mb-1">{item.offer.title}</h3>
                        {item.business && (
                          <Link href={`/business/${item.business.slug}`}>
                            <span className="text-sm text-primary hover:underline cursor-pointer" style={{ textTransform: "none" }}>
                              {item.business.name}
                            </span>
                          </Link>
                        )}
                      </div>
                      <Badge className="bg-[oklch(0.55_0.15_45)] text-white shrink-0" style={{ textTransform: "none" }}>
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
                      <div className="flex items-center gap-3 text-xs text-muted-foreground pt-3 border-t border-border" style={{ textTransform: "none" }}>
                        {item.business.city && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {item.business.city}{item.business.country ? `, ${item.business.country}` : ""}
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
        </div>
      </section>

      <Footer />
    </div>
  );
}
