import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "wouter";
import { 
  Building2, Bike, ChevronRight, BookOpen, GraduationCap,
  UserPlus, ClipboardCheck, Megaphone, HandCoins, Star, 
  Search, Tag, Heart, MapPin
} from "lucide-react";

interface ArticleCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

function ArticleCard({ title, description, href, icon, badge }: ArticleCardProps) {
  return (
    <Link href={href}>
      <div className="group relative bg-card border border-border rounded-xl p-6 hover:border-[oklch(0.55_0.15_45)]/40 hover:shadow-lg hover:shadow-[oklch(0.55_0.15_45)]/5 transition-all duration-300 cursor-pointer h-full">
        {badge && (
          <span className="absolute top-4 right-4 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[oklch(0.55_0.15_45)]/10 text-[oklch(0.55_0.15_45)] border border-[oklch(0.55_0.15_45)]/20">
            {badge}
          </span>
        )}
        <div className="w-10 h-10 rounded-lg bg-[oklch(0.55_0.15_45)]/10 flex items-center justify-center mb-4 group-hover:bg-[oklch(0.55_0.15_45)]/20 transition-colors">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-[oklch(0.55_0.15_45)] transition-colors" style={{ textTransform: "none", letterSpacing: "normal" }}>
          {title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4" style={{ textTransform: "none", letterSpacing: "normal" }}>
          {description}
        </p>
        <div className="flex items-center gap-1 text-sm font-medium text-[oklch(0.55_0.15_45)] group-hover:gap-2 transition-all">
          Read guide <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </Link>
  );
}

const businessArticles: ArticleCardProps[] = [
  {
    title: "How to Create Your Account & Claim Your Business",
    description: "Step-by-step guide to signing up as a business owner, finding your business in the directory, and claiming your listing for free.",
    href: "/university/claim-your-business",
    icon: <UserPlus className="w-5 h-5 text-[oklch(0.55_0.15_45)]" />,
    badge: "Start Here",
  },
  {
    title: "Setting Up Your Referral Offers",
    description: "Learn how to create compelling B2B and athlete offers that attract referrals from partner businesses.",
    href: "/university/setting-up-offers",
    icon: <Tag className="w-5 h-5 text-[oklch(0.55_0.15_45)]" />,
    badge: "Coming Soon",
  },
  {
    title: "Sending & Receiving Referrals",
    description: "How the referral flow works — from sending a customer to a partner business to honoring incoming referrals.",
    href: "/university/referral-flow",
    icon: <HandCoins className="w-5 h-5 text-[oklch(0.55_0.15_45)]" />,
    badge: "Coming Soon",
  },
  {
    title: "Building Your Business Profile",
    description: "Tips for making your profile stand out — logo, description, contact info, and Google reviews integration.",
    href: "/university/business-profile-tips",
    icon: <Star className="w-5 h-5 text-[oklch(0.55_0.15_45)]" />,
    badge: "Coming Soon",
  },
  {
    title: "Growing Your Partner Network",
    description: "Strategies for finding and connecting with complementary businesses in your area and beyond.",
    href: "/university/partner-network",
    icon: <Megaphone className="w-5 h-5 text-[oklch(0.55_0.15_45)]" />,
    badge: "Coming Soon",
  },
  {
    title: "Understanding the Leaderboard & Scoreboard",
    description: "How the platform tracks referral activity and what the leaderboard rankings mean for your business.",
    href: "/university/leaderboard-guide",
    icon: <ClipboardCheck className="w-5 h-5 text-[oklch(0.55_0.15_45)]" />,
    badge: "Coming Soon",
  },
];

const athleteArticles: ArticleCardProps[] = [
  {
    title: "Getting Started as an Athlete",
    description: "How to sign up, browse the directory, and find the best local coaches, shops, and service providers near you.",
    href: "/university/athlete-getting-started",
    icon: <Search className="w-5 h-5 text-[oklch(0.55_0.15_45)]" />,
    badge: "Coming Soon",
  },
  {
    title: "Finding & Claiming Athlete Offers",
    description: "How to discover exclusive deals from businesses in the network and claim offers for discounts and free sessions.",
    href: "/university/athlete-offers-guide",
    icon: <Tag className="w-5 h-5 text-[oklch(0.55_0.15_45)]" />,
    badge: "Coming Soon",
  },
  {
    title: "Saving Your Favorite Businesses",
    description: "How to bookmark businesses you love and build your personal network of trusted local pros.",
    href: "/university/saving-favorites",
    icon: <Heart className="w-5 h-5 text-[oklch(0.55_0.15_45)]" />,
    badge: "Coming Soon",
  },
  {
    title: "Exploring by Sport & Region",
    description: "How to use filters to find businesses by sport type, region, and hub — from Calgary to Mallorca.",
    href: "/university/explore-by-sport",
    icon: <MapPin className="w-5 h-5 text-[oklch(0.55_0.15_45)]" />,
    badge: "Coming Soon",
  },
];

export default function University() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.22_0.02_50)] via-[oklch(0.18_0.02_50)] to-[oklch(0.15_0.01_50)]" />
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-[oklch(0.55_0.15_45)] blur-[100px]" />
          <div className="absolute bottom-20 right-20 w-48 h-48 rounded-full bg-[oklch(0.65_0.12_45)] blur-[80px]" />
        </div>
        <div className="relative container max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[oklch(0.55_0.15_45)]/10 border border-[oklch(0.55_0.15_45)]/20 mb-6">
            <GraduationCap className="w-4 h-4 text-[oklch(0.55_0.15_45)]" />
            <span className="text-sm font-medium text-[oklch(0.55_0.15_45)]" style={{ textTransform: "none" }}>SportConnect University</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Learn the Ropes
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto leading-relaxed" style={{ textTransform: "none", letterSpacing: "normal" }}>
            Guides, tutorials, and tips to help you get the most out of SportConnect — whether you're a business looking to grow through referrals, or an athlete looking for the best local pros.
          </p>
        </div>
      </section>

      {/* For Businesses Section */}
      <section className="py-16 md:py-20">
        <div className="container max-w-6xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-emerald-500" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">For Businesses</h2>
          </div>
          <p className="text-muted-foreground mb-8 max-w-2xl leading-relaxed" style={{ textTransform: "none", letterSpacing: "normal" }}>
            Everything you need to claim your listing, set up referral offers, and start growing your business through the SportConnect network.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {businessArticles.map((article) => (
              <ArticleCard key={article.href} {...article} />
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="container max-w-6xl">
        <div className="border-t border-border" />
      </div>

      {/* For Athletes Section */}
      <section className="py-16 md:py-20">
        <div className="container max-w-6xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-sky-500/10 flex items-center justify-center">
              <Bike className="w-5 h-5 text-sky-500" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">For Athletes</h2>
          </div>
          <p className="text-muted-foreground mb-8 max-w-2xl leading-relaxed" style={{ textTransform: "none", letterSpacing: "normal" }}>
            Find the best local pros, grab exclusive deals, and discover businesses your fellow athletes actually recommend.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {athleteArticles.map((article) => (
              <ArticleCard key={article.href} {...article} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[oklch(0.22_0.02_50)]">
        <div className="container max-w-3xl text-center">
          <BookOpen className="w-10 h-10 text-[oklch(0.55_0.15_45)] mx-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Can't Find What You're Looking For?</h2>
          <p className="text-white/70 mb-6 leading-relaxed" style={{ textTransform: "none", letterSpacing: "normal" }}>
            We're adding new guides regularly. If you have a question that isn't covered here, reach out to our support team and we'll get you sorted.
          </p>
          <Link href="/support">
            <button className="px-6 py-3 rounded-lg bg-[oklch(0.55_0.15_45)] hover:bg-[oklch(0.50_0.15_45)] text-white font-medium transition-colors" style={{ textTransform: "none" }}>
              Contact Support
            </button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
