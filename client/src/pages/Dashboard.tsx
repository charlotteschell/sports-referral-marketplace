import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2, Plus, Send, ArrowDownLeft, TrendingUp, Gift,
  Shield, MapPin, Pencil, ArrowRight, Bike, Mountain, Snowflake, Star, Loader2
} from "lucide-react";

const sportIcons: Record<string, React.ReactNode> = {
  cycling: <Bike className="w-4 h-4" />,
  "trail-running": <Mountain className="w-4 h-4" />,
  snowsports: <Snowflake className="w-4 h-4" />,
};

export default function Dashboard() {
  const { user, loading } = useAuth({ redirectOnUnauthenticated: true });
  const [, navigate] = useLocation();

  const { data: myBusinesses, isLoading: bizLoading } = trpc.business.myBusinesses.useQuery(
    undefined,
    { enabled: !!user }
  );

  const { data: stats, isLoading: statsLoading } = trpc.referral.stats.useQuery(
    undefined,
    { enabled: !!user }
  );

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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <section className="bg-[oklch(0.22_0.02_50)] text-white py-10">
        <div className="container">
          <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ fontFamily: "var(--font-heading)" }}>
            Dashboard
          </h1>
          <p className="text-white/70" style={{ textTransform: "none", letterSpacing: "normal" }}>
            Welcome back, {user?.name || "there"}. Manage your businesses and referrals.
          </p>
        </div>
      </section>

      <section className="py-8">
        <div className="container">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Referrals Sent", value: stats?.sent || 0, icon: <Send className="w-5 h-5" />, color: "text-primary" },
              { label: "Referrals Received", value: stats?.received || 0, icon: <ArrowDownLeft className="w-5 h-5" />, color: "text-[oklch(0.55_0.15_45)]" },
              { label: "Converted", value: stats?.converted || 0, icon: <TrendingUp className="w-5 h-5" />, color: "text-green-600" },
              { label: "Pending", value: stats?.pending || 0, icon: <Gift className="w-5 h-5" />, color: "text-[oklch(0.40_0.05_250)]" },
            ].map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={stat.color}>{stat.icon}</span>
                  </div>
                  <p className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>{stat.value}</p>
                  <p className="text-xs text-muted-foreground" style={{ textTransform: "none" }}>{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3 mb-8">
            <Link href="/dashboard/add-business">
              <Button className="bg-primary text-primary-foreground" style={{ textTransform: "none" }}>
                <Plus className="w-4 h-4 mr-2" /> Add Business
              </Button>
            </Link>
            <Link href="/dashboard/referrals">
              <Button variant="outline" className="bg-transparent" style={{ textTransform: "none" }}>
                <Send className="w-4 h-4 mr-2" /> View Referrals
              </Button>
            </Link>
            <Link href="/directory">
              <Button variant="outline" className="bg-transparent" style={{ textTransform: "none" }}>
                <Building2 className="w-4 h-4 mr-2" /> Browse Directory
              </Button>
            </Link>
          </div>

          {/* My Businesses */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">My Businesses</h2>
              <Link href="/dashboard/add-business">
                <Button size="sm" variant="outline" className="bg-transparent" style={{ textTransform: "none" }}>
                  <Plus className="w-4 h-4 mr-1" /> Add New
                </Button>
              </Link>
            </div>

            {bizLoading ? (
              <div className="grid md:grid-cols-2 gap-4">
                {[1, 2].map(i => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-5 bg-muted rounded w-2/3 mb-3" />
                      <div className="h-4 bg-muted rounded w-full mb-2" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : !myBusinesses || myBusinesses.length === 0 ? (
              <Card className="border-dashed border-2">
                <CardContent className="p-8 text-center">
                  <Building2 className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-lg font-bold mb-2">No Businesses Yet</h3>
                  <p className="text-muted-foreground mb-4" style={{ textTransform: "none", letterSpacing: "normal" }}>
                    Add your business or claim an existing one from the directory to start receiving referrals.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/dashboard/add-business">
                      <Button className="bg-primary text-primary-foreground" style={{ textTransform: "none" }}>
                        <Plus className="w-4 h-4 mr-2" /> Add New Business
                      </Button>
                    </Link>
                    <Link href="/directory">
                      <Button variant="outline" className="bg-transparent" style={{ textTransform: "none" }}>
                        Claim Existing Business
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {myBusinesses.map((item) => (
                  <Card key={item.business.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          {sportIcons[item.sportCategory?.slug || ""] || <Star className="w-5 h-5" />}
                        </div>
                        <Badge className="bg-primary/10 text-primary" style={{ textTransform: "none" }}>
                          <Shield className="w-3 h-3 mr-1" /> Claimed
                        </Badge>
                      </div>
                      <h3 className="font-bold text-foreground mb-1">{item.business.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3" style={{ textTransform: "none", letterSpacing: "normal" }}>
                        {item.business.shortDescription}
                      </p>
                      {item.business.city && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mb-4" style={{ textTransform: "none" }}>
                          <MapPin className="w-3 h-3" />
                          {item.business.city}{item.business.country ? `, ${item.business.country}` : ""}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/dashboard/edit/${item.business.id}`}>
                          <Button size="sm" variant="outline" className="bg-transparent" style={{ textTransform: "none" }}>
                            <Pencil className="w-3 h-3 mr-1" /> Edit Info
                          </Button>
                        </Link>
                        <Link href={`/dashboard/offers/${item.business.id}`}>
                          <Button size="sm" variant="outline" className="bg-transparent" style={{ textTransform: "none" }}>
                            <Gift className="w-3 h-3 mr-1" /> B2B Offers
                          </Button>
                        </Link>
                        <Link href={`/business/${item.business.slug}`}>
                          <Button size="sm" variant="ghost" style={{ textTransform: "none" }}>
                            View Profile <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
