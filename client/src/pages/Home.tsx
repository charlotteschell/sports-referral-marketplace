import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import {
  Bike, Mountain, Snowflake, Users, ArrowRight, Handshake,
  TrendingUp, Search, Shield, MapPin, ChevronRight, Star
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const sportIcons: Record<string, React.ReactNode> = {
  cycling: <Bike className="w-8 h-8" />,
  "trail-running": <Mountain className="w-8 h-8" />,
  snowsports: <Snowflake className="w-8 h-8" />,
};

const sportImages: Record<string, string> = {
  cycling: "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=600&h=400&fit=crop",
  "trail-running": "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&h=400&fit=crop",
  snowsports: "https://images.unsplash.com/photo-1565992441121-4367c2967103?w=600&h=400&fit=crop",
};

export default function Home() {
  const { isAuthenticated } = useAuth();
  const { data: categories } = trpc.categories.sportCategories.useQuery();
  const { data: stats } = trpc.stats.directory.useQuery();
  const { data: featured } = trpc.business.featured.useQuery({ limit: 6 });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[oklch(0.22_0.02_50)] text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        <div className="container relative py-20 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6 text-sm font-medium">
              <Handshake className="w-4 h-4 text-[oklch(0.55_0.15_45)]" />
              <span>The Endurance Sports Business Network</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6" style={{ fontFamily: "var(--font-heading)" }}>
              Where Sports Pros<br />
              <span className="text-[oklch(0.55_0.15_45)]">&amp; Enthusiasts</span><br />
              Grow Together
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-4 max-w-2xl leading-relaxed" style={{ fontFamily: "var(--font-sans)", textTransform: "none", letterSpacing: "normal" }}>
              Whether you're a <strong className="text-white">professional coach, bike shop owner, or physio therapist</strong> — or an <strong className="text-white">enthusiast looking for trusted local services</strong> — SportConnect is the marketplace that brings the endurance sports community together.
            </p>
            <p className="text-base md:text-lg text-white/60 mb-8 max-w-2xl" style={{ fontFamily: "var(--font-sans)", textTransform: "none", letterSpacing: "normal" }}>
              Businesses send each other referral customers for incentives. Enthusiasts discover the best local pros. Everyone wins.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/directory">
                <Button size="lg" className="bg-[oklch(0.55_0.15_45)] hover:bg-[oklch(0.50_0.15_45)] text-white font-semibold text-base px-8 h-12">
                  <Search className="w-5 h-5 mr-2" />
                  Explore Directory
                </Button>
              </Link>
              {!isAuthenticated && (
                <a href={getLoginUrl()}>
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 font-semibold text-base px-8 h-12 bg-transparent">
                    List Your Business
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </a>
              )}
              {isAuthenticated && (
                <Link href="/dashboard">
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 font-semibold text-base px-8 h-12 bg-transparent">
                    My Dashboard
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
        {/* Diagonal cut bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-background" style={{ clipPath: "polygon(0 100%, 100% 0, 100% 100%)" }} />
      </section>

      {/* Stats Bar */}
      <section className="py-8 border-b border-border">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-primary" style={{ fontFamily: "var(--font-heading)" }}>{stats?.totalBusinesses || 0}+</p>
              <p className="text-sm text-muted-foreground mt-1" style={{ textTransform: "none" }}>Businesses Listed</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-[oklch(0.55_0.15_45)]" style={{ fontFamily: "var(--font-heading)" }}>{stats?.sportCategories || 3}</p>
              <p className="text-sm text-muted-foreground mt-1" style={{ textTransform: "none" }}>Sport Categories</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-[oklch(0.40_0.05_250)]" style={{ fontFamily: "var(--font-heading)" }}>{stats?.claimedBusinesses || 0}</p>
              <p className="text-sm text-muted-foreground mt-1" style={{ textTransform: "none" }}>Verified Businesses</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary" style={{ fontFamily: "var(--font-heading)" }}>{stats?.totalReferrals || 0}</p>
              <p className="text-sm text-muted-foreground mt-1" style={{ textTransform: "none" }}>Referrals Sent</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg" style={{ textTransform: "none", letterSpacing: "normal" }}>
              A simple, powerful way for sports businesses and enthusiasts to connect and grow together.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Search className="w-8 h-8" />, title: "Discover", desc: "Browse the directory to find coaches, shops, therapists, and clubs in cycling, trail running, and snowsports — whether you're a business or an enthusiast." },
              { icon: <Handshake className="w-8 h-8" />, title: "Connect & Refer", desc: "Businesses claim their profiles and post referral offers. Send customers to partner businesses and earn incentives for every successful referral." },
              { icon: <TrendingUp className="w-8 h-8" />, title: "Grow Together", desc: "Track referrals, build partnerships, and watch your network expand. Collaboration beats competition in the endurance sports community." },
            ].map((step, i) => (
              <div key={i} className="relative">
                <div className="bg-card border border-border rounded-lg p-8 h-full hover:shadow-lg transition-shadow">
                  <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-5">
                    {step.icon}
                  </div>
                  <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm" style={{ fontFamily: "var(--font-heading)" }}>
                    {i + 1}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed" style={{ textTransform: "none", letterSpacing: "normal" }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sport Categories */}
      <section className="py-20 bg-[oklch(0.22_0.02_50)] text-white relative">
        <div className="absolute top-0 left-0 right-0 h-16 bg-background" style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }} />
        <div className="container relative z-10 pt-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for Endurance Sports</h2>
            <p className="text-white/70 max-w-2xl mx-auto text-lg" style={{ textTransform: "none", letterSpacing: "normal" }}>
              From mountain peaks to open roads, we serve every discipline in the endurance sports world — for professionals and enthusiasts alike.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {categories?.map((cat) => (
              <Link key={cat.id} href={`/directory?sport=${cat.slug}`}>
                <div className="group relative overflow-hidden rounded-lg cursor-pointer h-64">
                  <img
                    src={sportImages[cat.slug] || ""}
                    alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-[oklch(0.55_0.15_45)]">
                        {sportIcons[cat.slug]}
                      </div>
                      <h3 className="text-2xl font-bold text-white">{cat.name}</h3>
                    </div>
                    <p className="text-white/70 text-sm" style={{ textTransform: "none", letterSpacing: "normal" }}>{cat.description}</p>
                    <div className="flex items-center gap-1 mt-3 text-[oklch(0.55_0.15_45)] text-sm font-medium" style={{ textTransform: "none" }}>
                      Browse businesses <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-background" style={{ clipPath: "polygon(0 100%, 100% 0, 100% 100%)" }} />
      </section>

      {/* Business Types */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Every Type of Sports Business</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg" style={{ textTransform: "none", letterSpacing: "normal" }}>
              Coaches, shops, therapists, clubs, and more — all the professionals that keep athletes performing at their best.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {[
              { name: "Coaches", icon: "🏋️" },
              { name: "Bike Shops", icon: "🚲" },
              { name: "Run Stores", icon: "👟" },
              { name: "Physio", icon: "💪" },
              { name: "Nutrition", icon: "🥗" },
              { name: "Massage", icon: "🤲" },
              { name: "Clubs", icon: "🏔️" },
            ].map((type) => (
              <Link key={type.name} href="/directory">
                <div className="bg-card border border-border rounded-lg p-4 text-center hover:shadow-md hover:border-primary/30 transition-all cursor-pointer">
                  <div className="text-3xl mb-2">{type.icon}</div>
                  <p className="text-sm font-semibold text-foreground" style={{ textTransform: "none" }}>{type.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Businesses */}
      {featured && featured.length > 0 && (
        <section className="py-20 bg-secondary/30">
          <div className="container">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Featured Businesses</h2>
                <p className="text-muted-foreground" style={{ textTransform: "none", letterSpacing: "normal" }}>Discover top-rated businesses in the endurance sports community</p>
              </div>
              <Link href="/directory">
                <Button variant="outline" className="hidden md:flex bg-transparent">
                  View All <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((item) => (
                <Link key={item.business.id} href={`/business/${item.business.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-border">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          {sportIcons[item.sportCategory?.slug || ""] || <Star className="w-6 h-6" />}
                        </div>
                        {item.business.isClaimed && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full" style={{ textTransform: "none" }}>
                            <Shield className="w-3 h-3" /> Verified
                          </span>
                        )}
                        {!item.business.isClaimed && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full" style={{ textTransform: "none" }}>
                            Unclaimed
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-1">{item.business.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3" style={{ textTransform: "none", letterSpacing: "normal" }}>{item.business.shortDescription}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground" style={{ textTransform: "none" }}>
                        {item.business.city && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {item.business.city}{item.business.country ? `, ${item.business.country}` : ""}
                          </span>
                        )}
                        {item.sportCategory && (
                          <span className="flex items-center gap-1">
                            {sportIcons[item.sportCategory.slug] ? <span className="w-3 h-3">{sportIcons[item.sportCategory.slug]}</span> : null}
                            {item.sportCategory.name}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            <div className="mt-8 text-center md:hidden">
              <Link href="/directory">
                <Button variant="outline" className="bg-transparent">View All Businesses <ArrowRight className="w-4 h-4 ml-2" /></Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA for Both Audiences */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-8">
            {/* For Businesses */}
            <div className="bg-primary rounded-xl p-8 md:p-10 text-primary-foreground">
              <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center mb-5">
                <Handshake className="w-6 h-6" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4">For Sports Professionals</h3>
              <p className="text-primary-foreground/80 mb-6 leading-relaxed" style={{ textTransform: "none", letterSpacing: "normal" }}>
                Claim your business, post referral offers, and start receiving qualified customers from trusted partners. Build a referral network that grows your revenue.
              </p>
              <ul className="space-y-2 mb-8" style={{ textTransform: "none", letterSpacing: "normal" }}>
                {["Claim and manage your business profile", "Post B2B referral incentives", "Track referrals sent and received", "Connect with complementary businesses"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-primary-foreground/90">
                    <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.55_0.15_45)]" />
                    {item}
                  </li>
                ))}
              </ul>
              {!isAuthenticated ? (
                <a href={getLoginUrl()}>
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold">
                    Get Started Free <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </a>
              ) : (
                <Link href="/dashboard">
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold">
                    Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              )}
            </div>
            {/* For Enthusiasts */}
            <div className="bg-[oklch(0.55_0.15_45)] rounded-xl p-8 md:p-10 text-white">
              <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center mb-5">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4">For Sports Enthusiasts</h3>
              <p className="text-white/80 mb-6 leading-relaxed" style={{ textTransform: "none", letterSpacing: "normal" }}>
                Find the best local coaches, shops, therapists, and clubs for cycling, trail running, and snowsports. Discover trusted professionals in your area.
              </p>
              <ul className="space-y-2 mb-8" style={{ textTransform: "none", letterSpacing: "normal" }}>
                {["Search by sport, location, and business type", "Find verified, claimed businesses", "Access special referral offers", "Connect with your local sports community"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-white/90">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/directory">
                <Button size="lg" className="bg-white text-[oklch(0.55_0.15_45)] hover:bg-white/90 font-semibold">
                  Browse Directory <Search className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
