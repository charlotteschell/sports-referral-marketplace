import { useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import {
  Bike, Mountain, Snowflake, Users, ArrowRight, Handshake,
  TrendingUp, Search, Shield, MapPin, ChevronRight, ChevronLeft, Star,
  Compass, Globe, Palmtree, Gift, Tag, Clock, Timer, Info
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const sportIcons: Record<string, React.ReactNode> = {
  cycling: <Bike className="w-8 h-8" />,
  running: <Mountain className="w-8 h-8" />,
  "trail-running": <Mountain className="w-8 h-8" />,
  snowsports: <Snowflake className="w-8 h-8" />,
  "sport-vacations": <Compass className="w-8 h-8" />,
};

const sportSmallIcons: Record<string, React.ReactNode> = {
  cycling: <Bike className="w-4 h-4" />,
  running: <Mountain className="w-4 h-4" />,
  "trail-running": <Mountain className="w-4 h-4" />,
  snowsports: <Snowflake className="w-4 h-4" />,
  "sport-vacations": <Compass className="w-4 h-4" />,
};

const sportImages: Record<string, string> = {
  cycling: "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=600&h=400&fit=crop",
  running: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663371988607/OYNtBsrsPHnEVeOb.jpg",
  "trail-running": "https://images.unsplash.com/photo-1483721310020-03333e577078?w=600&h=400&fit=crop",
  snowsports: "https://images.unsplash.com/photo-1565992441121-4367c2967103?w=600&h=400&fit=crop",
  "sport-vacations": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=400&fit=crop",
};

const regionHighlights = [
  { name: "Colorado Front Range", country: "USA", emoji: "🇺🇸", description: "Boulder, Denver, Fort Collins" },
  { name: "Pacific Northwest", country: "USA", emoji: "🇺🇸", description: "Seattle, Portland, Bend" },
  { name: "Girona & Catalonia", country: "Spain", emoji: "🇪🇸", description: "Pro cyclist training mecca" },
  { name: "Mallorca", country: "Spain", emoji: "🇪🇸", description: "World-class cycling roads" },
  { name: "Western Canada", country: "Canada", emoji: "🇨🇦", description: "Calgary, Canmore, Banff" },
  { name: "Dolomites", country: "Italy", emoji: "🇮🇹", description: "Legendary passes and alpine trails" },
  { name: "Pyrenees", country: "France/Spain", emoji: "🇫🇷", description: "Tour de France cols and GR routes" },
  { name: "Alps", country: "France/Switzerland", emoji: "🇨🇭", description: "UTMB and ski touring paradise" },
];

// Launch date: Sunday March 1, 2026 at 12:00 AM MST (07:00 UTC)
const LAUNCH_DATE = new Date('2026-03-01T07:00:00Z').getTime();

function InfoStatCard({ count }: { count: number }) {
  const [showTip, setShowTip] = useState(false);
  const tipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showTip) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (tipRef.current && !tipRef.current.contains(e.target as Node)) {
        setShowTip(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [showTip]);

  return (
    <div className="col-span-2 md:col-span-1 relative" ref={tipRef}>
      <p className="text-3xl font-bold text-[oklch(0.55_0.15_45)]" style={{ fontFamily: "var(--font-heading)" }}>{count}</p>
      <p className="text-sm text-muted-foreground mt-1 inline-flex items-center gap-1" style={{ textTransform: "none" }}>Referrals Sent
        <button
          type="button"
          onClick={() => setShowTip(!showTip)}
          className="relative p-1 -m-1 rounded-full hover:bg-muted/30 active:bg-muted/50 transition-colors touch-manipulation"
          aria-label="More info about referrals count"
        >
          <Info className="w-3.5 h-3.5 text-muted-foreground/60 hover:text-primary transition-colors" />
        </button>
      </p>
      {showTip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 rounded-lg bg-popover text-popover-foreground text-xs leading-relaxed shadow-lg border border-border z-50 animate-in fade-in-0 zoom-in-95 duration-150" style={{ textTransform: "none", letterSpacing: "normal" }}>
          Full transparency: we seeded sample referrals so you can see how the platform works. Real numbers incoming once you lot start using it.
        </div>
      )}
    </div>
  );
}

function LaunchTimer() {
  const [diff, setDiff] = useState(() => Date.now() - LAUNCH_DATE);

  useEffect(() => {
    const interval = setInterval(() => {
      setDiff(Date.now() - LAUNCH_DATE);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const isLaunched = diff >= 0;
  const absDiff = Math.abs(diff);
  const totalSeconds = Math.floor(absDiff / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const days = Math.floor(totalHours / 24);

  const displayHours = totalHours % 24;
  const displayMinutes = totalMinutes % 60;
  const displaySeconds = totalSeconds % 60;

  return (
    <div className="flex flex-col items-center mb-2">
      <div className="flex items-center gap-2 mb-2">
        <Clock className="w-4 h-4 text-[oklch(0.55_0.15_45)]" />
        <span className="text-xs text-white/50 uppercase tracking-wider" style={{ textTransform: "none", letterSpacing: "0.1em" }}>
          {isLaunched ? "Time since launch" : "Launching in"}
        </span>
      </div>
      <div className="flex items-center gap-1 md:gap-3">
        {[
          { value: days, label: "days" },
          { value: displayHours, label: "hrs" },
          { value: displayMinutes, label: "min" },
          { value: displaySeconds, label: "sec" },
        ].map((unit, i) => (
          <div key={unit.label} className="flex items-center gap-1 md:gap-3">
            <div className="bg-white/10 border border-white/15 rounded-lg px-3 py-2 min-w-[56px] text-center">
              <span className="text-xl md:text-2xl font-bold text-white font-mono" style={{ fontFamily: "var(--font-heading)" }}>
                {String(unit.value).padStart(2, '0')}
              </span>
              <p className="text-[10px] text-white/40 mt-0.5" style={{ textTransform: "none" }}>{unit.label}</p>
            </div>
            {i < 3 && <span className="text-white/30 text-xl font-bold hidden md:block">:</span>}
          </div>
        ))}
      </div>
      <p className="text-xs text-white/40 mt-2 italic" style={{ textTransform: "none", letterSpacing: "normal" }}>
        {isLaunched ? "Ticking since launch. No pressure." : "Monday at noon MST. Mark your calendar. Or don't. The counter doesn't care."}
      </p>
    </div>
  );
}

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const { data: categories } = trpc.categories.sportCategories.useQuery();
  const { data: stats } = trpc.stats.directory.useQuery();
  const { data: featured } = trpc.business.featured.useQuery({ limit: 30 });
  const { data: platformStats } = trpc.platformStats.get.useQuery();

  // Fetch offers for featured businesses
  const featuredIds = useMemo(() => featured?.map(b => b.business.id) || [], [featured]);
  const { data: featuredOffers } = trpc.business.offersForBusinesses.useQuery(
    { businessIds: featuredIds },
    { enabled: featuredIds.length > 0 }
  );
  const offersByBusiness = useMemo(() => {
    const map: Record<number, any[]> = {};
    if (!featuredOffers) return map;
    for (const offer of featuredOffers) {
      const bid = (offer as any).businessId;
      if (!map[bid]) map[bid] = [];
      map[bid].push(offer);
    }
    return map;
  }, [featuredOffers]);

  // Carousel state
  const carouselRef = useRef<HTMLDivElement>(null);
  const scrollCarousel = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return;
    const scrollAmount = 400;
    carouselRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

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
              <span>Word-of-mouth referrals, minus the forgetting</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6" style={{ fontFamily: "var(--font-heading)" }}>
              Your Crew.<br />
              <span className="text-[oklch(0.55_0.15_45)]">Your Sport.</span><br />
              One Network.
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-4 max-w-2xl leading-relaxed" style={{ fontFamily: "var(--font-sans)", textTransform: "none", letterSpacing: "normal" }}>
              You already send clients to that physio down the road. And the bike shop already tells people about your coaching. It's just that <strong className="text-white">nobody tracks it, nobody gets thanked, and it stays local forever</strong>. We figured we'd fix that part.
            </p>
            <p className="text-base md:text-lg text-white/60 mb-4 max-w-2xl" style={{ fontFamily: "var(--font-sans)", textTransform: "none", letterSpacing: "normal" }}>
              SportConnect helps <strong className="text-white/80">coaches, shops, physios, nutritionists, clubs, and vacation providers</strong> refer customers to each other — with actual incentives, actual tracking, and reach beyond your postcode. Athletes get deals too. Everyone wins. Revolutionary, we know.
            </p>
            <p className="text-sm text-white/50 mb-8 max-w-2xl" style={{ fontFamily: "var(--font-sans)", textTransform: "none", letterSpacing: "normal" }}>
              Cycling &bull; Road Running &bull; Trail Running &bull; Ultra Running &bull; Skiing &bull; Snowboarding &bull; Nordic Skiing &bull; Sport Vacations
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/directory">
                <Button size="lg" className="bg-[oklch(0.55_0.15_45)] hover:bg-[oklch(0.50_0.15_45)] text-white font-semibold text-base px-8 h-12">
                  <Search className="w-5 h-5 mr-2" />
                  Explore Directory
                </Button>
              </Link>
              {!isAuthenticated && (
                <a href={getLoginUrl("/onboarding?type=business")}>
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 font-semibold text-base px-8 h-12 bg-transparent">
                    List Your Business
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </a>
              )}
              {isAuthenticated && (
                <Link href={user?.role === 'admin' ? '/admin' : user?.accountType === 'business_owner' ? '/dashboard' : '/athlete-dashboard'}>
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 font-semibold text-base px-8 h-12 bg-transparent">
                    My Dashboard
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-background" style={{ clipPath: "polygon(0 100%, 100% 0, 100% 100%)" }} />
      </section>

      {/* Stats Bar */}
      <section className="py-8 border-b border-border">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-primary" style={{ fontFamily: "var(--font-heading)" }}>{stats?.totalBusinesses || 0}+</p>
              <p className="text-sm text-muted-foreground mt-1" style={{ textTransform: "none" }}>Businesses (and counting)</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-[oklch(0.55_0.15_45)]" style={{ fontFamily: "var(--font-heading)" }}>{stats?.sportCategories || 4}</p>
              <p className="text-sm text-muted-foreground mt-1" style={{ textTransform: "none" }}>Sport Categories</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-[oklch(0.40_0.05_250)]" style={{ fontFamily: "var(--font-heading)" }}>{stats?.claimedBusinesses || 0}</p>
              <p className="text-sm text-muted-foreground mt-1" style={{ textTransform: "none" }}>Verified Businesses</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary" style={{ fontFamily: "var(--font-heading)" }}>{stats?.regions || 0}</p>
              <p className="text-sm text-muted-foreground mt-1" style={{ textTransform: "none" }}>Regions Covered</p>
            </div>
            <InfoStatCard count={stats?.totalReferrals || 0} />
          </div>
        </div>
      </section>

      {/* Platform Activity Tracker */}
      {platformStats && (
        <section className="py-12 bg-gradient-to-r from-[oklch(0.22_0.02_50)] to-[oklch(0.28_0.03_50)] text-white">
          <div className="container">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-heading)" }}>The Scoreboard</h2>
              <p className="text-white/60 text-sm" style={{ textTransform: "none", letterSpacing: "normal" }}>Real-time proof that collaboration beats going it alone</p>
            </div>
            {/* Launch Countdown Timer */}
            <LaunchTimer />
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-6">
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                <p className="text-2xl md:text-3xl font-bold text-[oklch(0.55_0.15_45)]" style={{ fontFamily: "var(--font-heading)" }}>{platformStats.totalReferrals}</p>
                <p className="text-xs text-white/60 mt-1" style={{ textTransform: "none" }}>Total Referrals</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                <p className="text-2xl md:text-3xl font-bold text-green-400" style={{ fontFamily: "var(--font-heading)" }}>{platformStats.honoredReferrals}</p>
                <p className="text-xs text-white/60 mt-1" style={{ textTransform: "none" }}>Referrals Honored</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                <p className="text-2xl md:text-3xl font-bold text-emerald-400" style={{ fontFamily: "var(--font-heading)" }}>${platformStats.totalIncentivesExchanged}</p>
                <p className="text-xs text-white/60 mt-1" style={{ textTransform: "none" }}>Incentives Exchanged</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                <p className="text-2xl md:text-3xl font-bold text-blue-400" style={{ fontFamily: "var(--font-heading)" }}>{platformStats.consumerOffersClaimed}</p>
                <p className="text-xs text-white/60 mt-1" style={{ textTransform: "none" }}>Consumer Offers Claimed</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                <p className="text-2xl md:text-3xl font-bold text-amber-400" style={{ fontFamily: "var(--font-heading)" }}>${platformStats.consumerSavings}</p>
                <p className="text-xs text-white/60 mt-1" style={{ textTransform: "none" }}>Consumer Savings</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                <p className="text-2xl md:text-3xl font-bold text-purple-400" style={{ fontFamily: "var(--font-heading)" }}>{platformStats.activeBusinesses}</p>
                <p className="text-xs text-white/60 mt-1" style={{ textTransform: "none" }}>Active Businesses</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg" style={{ textTransform: "none", letterSpacing: "normal" }}>
              Three steps. We'd have made it two, but we're not that clever.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Search className="w-8 h-8" />, title: "Find Your People", desc: "Browse coaches, shops, physios, clubs, and vacation providers across cycling, running, and snow sports. You know that nutritionist your training buddy swears by? They're probably in here." },
              { icon: <Handshake className="w-8 h-8" />, title: "Refer & Get Referred", desc: "Claim your profile, post your referral offers, and start sending customers to businesses you actually trust. Athletes can grab deals directly. It's the word-of-mouth thing you already do — just with receipts." },
              { icon: <TrendingUp className="w-8 h-8" />, title: "Grow Together", desc: "Track every referral, build partnerships locally and across borders. Because as endurance athletes, we already do enough hard things the hard way. Revenue growth shouldn't be one of them." },
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
              Road, trail, snow, or the "I do all three and my knees hate me" combo. We cover the sports and every business that keeps athletes moving (or recovering when they overdo it).
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories?.map((cat) => (
              <Link key={cat.id} href={`/directory?sport=${cat.slug}`}>
                <div className="group relative overflow-hidden rounded-lg cursor-pointer h-56">
                  <img
                    src={sportImages[cat.slug] || sportImages["sport-vacations"]}
                    alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-[oklch(0.55_0.15_45)]">
                        {sportIcons[cat.slug] || <Compass className="w-8 h-8" />}
                      </div>
                      <h3 className="text-xl font-bold text-white">{cat.name}</h3>
                    </div>
                    <p className="text-white/70 text-sm line-clamp-2" style={{ textTransform: "none", letterSpacing: "normal" }}>{cat.description}</p>
                    <div className="flex items-center gap-1 mt-2 text-[oklch(0.55_0.15_45)] text-sm font-medium" style={{ textTransform: "none" }}>
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

      {/* Regions & Hubs */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              <Globe className="w-8 h-8 inline-block mr-2 text-[oklch(0.55_0.15_45)]" />
              Where the Magic Happens
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg" style={{ textTransform: "none", letterSpacing: "normal" }}>
              The towns where people plan their entire lives around training schedules. You know who you are. These are the hubs where our businesses operate.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {regionHighlights.map((region) => (
              <Link key={region.name} href={`/directory?region=${encodeURIComponent(region.name)}`}>
                <div className="bg-card border border-border rounded-lg p-5 text-center hover:shadow-md hover:border-primary/30 transition-all cursor-pointer h-full">
                  <div className="text-3xl mb-2">{region.emoji}</div>
                  <h3 className="text-sm font-bold text-foreground mb-1">{region.name}</h3>
                  <p className="text-xs text-muted-foreground" style={{ textTransform: "none", letterSpacing: "normal" }}>{region.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Business Types */}
      <section className="py-20 bg-secondary/30">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Every Flavour of Sports Business</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg" style={{ textTransform: "none", letterSpacing: "normal" }}>
              If your business involves keeping athletes faster, healthier, less injured, or just slightly less delusional about their FTP — you belong here.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {[
              { name: "Coaches", icon: "🏋️" },
              { name: "Bike Shops", icon: "🚲" },
              { name: "Run Stores", icon: "👟" },
              { name: "Physio", icon: "💪" },
              { name: "Nutrition", icon: "🥗" },
              { name: "Massage", icon: "🤲" },
              { name: "Clubs", icon: "🏔️" },
              { name: "Vacations", icon: "✈️" },
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

      {/* Featured Businesses - Horizontal Carousel */}
      {featured && featured.length > 0 && (
        <section className="py-20 bg-background">
          <div className="container">
            <div className="flex items-center justify-between mb-10">
              <div>
                <div className="inline-flex items-center gap-2 bg-[oklch(0.55_0.15_45)]/10 border border-[oklch(0.55_0.15_45)]/20 rounded-full px-4 py-1.5 mb-4 text-sm font-medium text-[oklch(0.55_0.15_45)]">
                  <Star className="w-4 h-4" />
                  <span style={{ textTransform: "none" }}>Featured</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Featured Businesses</h2>
                <p className="text-muted-foreground max-w-xl" style={{ textTransform: "none", letterSpacing: "normal" }}>A few of the businesses already in the network. See yours? Claim it. Don't see yours? List it. Either way, get in here.</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => scrollCarousel('left')} className="bg-transparent hidden md:flex">
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => scrollCarousel('right')} className="bg-transparent hidden md:flex">
                  <ChevronRight className="w-5 h-5" />
                </Button>
                <Link href="/directory">
                  <Button variant="outline" className="hidden md:flex bg-transparent ml-2">
                    View All <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
            <div
              ref={carouselRef}
              className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {featured.map((item) => (
                <Link key={item.business.id} href={`/business/${item.business.slug}`} className="snap-start shrink-0 w-[340px] md:w-[380px]">
                  <Card className="h-full hover:shadow-lg hover:border-[oklch(0.55_0.15_45)]/30 transition-all cursor-pointer border-border group">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        {item.business.logoUrl ? (
                          <img src={item.business.logoUrl} alt={item.business.name} className="w-12 h-12 rounded-lg object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-[oklch(0.55_0.15_45)]/10 flex items-center justify-center text-[oklch(0.55_0.15_45)] group-hover:bg-[oklch(0.55_0.15_45)]/20 transition-colors">
                            {sportIcons[item.sportCategory?.slug || ""] || <Star className="w-6 h-6" />}
                          </div>
                        )}
                        <div className="flex flex-col items-end gap-1">
                          {item.business.isClaimed && item.business.claimedByUserId ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full" style={{ textTransform: "none" }}>
                              <Shield className="w-3 h-3" /> Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-500/10 px-2 py-1 rounded-full" style={{ textTransform: "none" }}>
                              Unclaimed
                            </span>
                          )}
                          {item.business.googleRating && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full" style={{ textTransform: "none" }}>
                              <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> {item.business.googleRating}
                              {item.business.googleReviewCount && item.business.googleReviewCount > 0 && (
                                <span className="text-muted-foreground">({item.business.googleReviewCount})</span>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-[oklch(0.55_0.15_45)] transition-colors">{item.business.name}</h3>
                      {item.businessType && (
                        <span className="inline-block text-xs font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded mb-2" style={{ textTransform: "none" }}>
                          {item.businessType.name}
                        </span>
                      )}
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2" style={{ textTransform: "none", letterSpacing: "normal" }}>{item.business.shortDescription}</p>

                      {/* Incentives */}
                      {offersByBusiness[item.business.id] && offersByBusiness[item.business.id].length > 0 && (
                        <div className="mb-3 p-2.5 bg-green-500/5 border border-green-500/10 rounded-lg">
                          <div className="flex items-center gap-1 text-xs font-medium text-green-600 mb-1.5" style={{ textTransform: "none" }}>
                            <Gift className="w-3 h-3" /> Incentives
                          </div>
                          {offersByBusiness[item.business.id].slice(0, 2).map((offer: any) => (
                            <div key={offer.id} className="flex items-center gap-1.5 text-xs text-muted-foreground" style={{ textTransform: "none" }}>
                              <Tag className="w-3 h-3 text-green-500 shrink-0" />
                              <span className="truncate">{offer.title}</span>
                              {offer.isSample && (
                                <span className="text-[10px] bg-amber-500/10 text-amber-600 px-1 rounded shrink-0">Sample</span>
                              )}
                            </div>
                          ))}
                          {offersByBusiness[item.business.id].length > 2 && (
                            <span className="text-[10px] text-muted-foreground" style={{ textTransform: "none" }}>+{offersByBusiness[item.business.id].length - 2} more</span>
                          )}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-3 border-t border-border" style={{ textTransform: "none" }}>
                        {item.business.hub && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {item.business.hub}{item.business.country ? `, ${item.business.country}` : ""}
                          </span>
                        )}
                        {!item.business.hub && item.business.city && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {item.business.city}{item.business.country ? `, ${item.business.country}` : ""}
                          </span>
                        )}
                        {item.business.region && (
                          <span className="flex items-center gap-1 text-[oklch(0.55_0.15_45)]">
                            <Globe className="w-3 h-3" /> {item.business.region}
                          </span>
                        )}
                        {item.sportCategory && (
                          <span className="flex items-center gap-1 ml-auto">
                            {sportSmallIcons[item.sportCategory.slug] || <Compass className="w-3 h-3" />}
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

      {/* Dual Offer Types Explainer */}
      <section className="py-20 bg-secondary/30">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Two Ways to Play</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg" style={{ textTransform: "none", letterSpacing: "normal" }}>
              Business-to-business referral incentives, and deals for athletes. Because why should only one side benefit?
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-card border border-border rounded-xl p-8">
              <div className="w-12 h-12 rounded-lg bg-[oklch(0.55_0.15_45)]/10 flex items-center justify-center mb-5">
                <Handshake className="w-6 h-6 text-[oklch(0.55_0.15_45)]" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">B2B Offers</h3>
              <p className="text-muted-foreground leading-relaxed mb-4" style={{ textTransform: "none", letterSpacing: "normal" }}>
                You send a client to a physio, the physio sends a client to you. Except now there's an actual incentive attached and you can track it. Wild concept, we know.
              </p>
              <ul className="space-y-2" style={{ textTransform: "none", letterSpacing: "normal" }}>
                {["Commission per referral", "Service trade agreements", "Cross-promotion partnerships", "Volume-based incentives"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.55_0.15_45)]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-card border border-border rounded-xl p-8">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-5">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Consumer Offers</h3>
              <p className="text-muted-foreground leading-relaxed mb-4" style={{ textTransform: "none", letterSpacing: "normal" }}>
                For athletes who like saving money (so, all athletes). Browse deals from local pros — discounts, free sessions, package deals. No coupon clipping required.
              </p>
              <ul className="space-y-2" style={{ textTransform: "none", letterSpacing: "normal" }}>
                {["Percentage discounts", "Free trial sessions", "Package deal pricing", "First-time customer specials"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="text-center mt-8">
            <Link href="/referral-offers">
              <Button size="lg" className="bg-[oklch(0.55_0.15_45)] hover:bg-[oklch(0.50_0.15_45)] text-white font-semibold">
                Browse All Offers <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA for Both Audiences */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-8">
            {/* For Businesses */}
            <div className="bg-primary rounded-xl p-8 md:p-10 text-primary-foreground">
              <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center mb-5">
                <Handshake className="w-6 h-6" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4">For Sports Businesses</h3>
              <p className="text-primary-foreground/80 mb-6 leading-relaxed" style={{ textTransform: "none", letterSpacing: "normal" }}>
                You've been doing the word-of-mouth thing for years. We just gave it a URL. Claim your profile, post what you'll offer for referrals, and let the network do what networks do — from Mallorca to Colorado.
              </p>
              <ul className="space-y-2 mb-8" style={{ textTransform: "none", letterSpacing: "normal" }}>
                {["Claim your profile (it's probably already here)", "Post referral offers that actually make sense", "Track who sent what and who owes who coffee", "Connect with businesses beyond your postcode"].map((item) => (
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
              <h3 className="text-2xl md:text-3xl font-bold mb-4">For Athletes & Enthusiasts</h3>
              <p className="text-white/80 mb-6 leading-relaxed" style={{ textTransform: "none", letterSpacing: "normal" }}>
                Looking for a coach who gets it? A physio who won't judge your training volume? A bike shop that doesn't upsell you on things you don't need? Start here.
              </p>
              <ul className="space-y-2 mb-8" style={{ textTransform: "none", letterSpacing: "normal" }}>
                {["Search by sport, region, and business type", "Find businesses with actual Google reviews", "Grab deals you won't find anywhere else", "Plan your next sport trip (tax-deductible, right?)"].map((item) => (
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
