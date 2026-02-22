import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link, useRoute } from "wouter";
import { 
  ChevronLeft, ChevronRight, Clock, BookOpen,
  UserPlus, LogIn, Search, MousePointerClick, CheckCircle2, 
  AlertCircle, ArrowRight, Building2, Shield
} from "lucide-react";
import { toast } from "sonner";

/* ─── Step illustration component ─── */
interface StepIllustrationProps {
  stepNumber: number;
  title: string;
  description: string;
  children: React.ReactNode;
  tip?: string;
}

function StepBlock({ stepNumber, title, description, children, tip }: StepIllustrationProps) {
  return (
    <div className="mb-12 last:mb-0">
      <div className="flex items-start gap-4 mb-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[oklch(0.55_0.15_45)] text-white flex items-center justify-center font-bold text-lg">
          {stepNumber}
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground mb-1" style={{ textTransform: "none", letterSpacing: "normal" }}>
            {title}
          </h3>
          <p className="text-muted-foreground leading-relaxed" style={{ textTransform: "none", letterSpacing: "normal" }}>
            {description}
          </p>
        </div>
      </div>
      
      {/* Visual illustration */}
      <div className="ml-14 mb-4">
        <div className="rounded-xl border border-border overflow-hidden bg-card shadow-sm">
          {children}
        </div>
      </div>

      {tip && (
        <div className="ml-14 flex items-start gap-3 p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground leading-relaxed" style={{ textTransform: "none", letterSpacing: "normal" }}>
            <span className="font-semibold text-amber-600">Tip:</span> {tip}
          </p>
        </div>
      )}
    </div>
  );
}

/* ─── Mock UI elements for illustrations ─── */
function MockButton({ children, variant = "primary", className = "" }: { children: React.ReactNode; variant?: "primary" | "outline" | "ghost"; className?: string }) {
  const base = "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors";
  const variants = {
    primary: "bg-[oklch(0.55_0.15_45)] text-white",
    outline: "border border-border text-foreground bg-transparent",
    ghost: "text-muted-foreground bg-transparent",
  };
  return <span className={`${base} ${variants[variant]} ${className}`}>{children}</span>;
}

function MockNavBar() {
  return (
    <div className="bg-[oklch(0.22_0.02_50)] px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <span className="text-white font-bold text-sm">SPORTCONNECT</span>
        <div className="hidden sm:flex items-center gap-4">
          <span className="text-white/60 text-xs">Directory</span>
          <span className="text-white/60 text-xs">Referral Offers</span>
          <span className="text-white/60 text-xs">Leaderboard</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-white/70 text-xs px-3 py-1.5 rounded border border-white/20">Sign In</span>
        <span className="text-white text-xs px-3 py-1.5 rounded bg-[oklch(0.55_0.15_45)]">List Your Business</span>
      </div>
    </div>
  );
}

/* ─── Claim Your Business Article ─── */
function ClaimYourBusinessArticle() {
  return (
    <div>
      {/* Article Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4" style={{ textTransform: "none" }}>
          <Clock className="w-4 h-4" />
          <span>5 min read</span>
          <span className="mx-2">·</span>
          <span>Last updated Feb 22, 2026</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4" style={{ textTransform: "none", letterSpacing: "normal" }}>
          How to Create Your Account & Claim Your Business
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed" style={{ textTransform: "none", letterSpacing: "normal" }}>
          Your business might already be listed in the SportConnect directory. This guide walks you through creating your account, finding your business, and claiming it so you can start receiving referrals from partner businesses. The whole process takes about 2 minutes.
        </p>
      </div>

      {/* What You'll Need */}
      <div className="mb-10 p-6 rounded-xl bg-muted/50 border border-border">
        <h2 className="text-lg font-semibold text-foreground mb-3" style={{ textTransform: "none", letterSpacing: "normal" }}>What You'll Need</h2>
        <ul className="space-y-2">
          {[
            "An email address (ideally your business email)",
            "About 2 minutes of your time",
            "That's it. Seriously.",
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground" style={{ textTransform: "none", letterSpacing: "normal" }}>
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Steps */}
      <StepBlock
        stepNumber={1}
        title="Go to SportConnect and Click 'List Your Business'"
        description="Head to the SportConnect homepage. You'll see a 'List Your Business' button in the top-right corner of the navigation bar. Click it to start the signup process."
        tip="If you already have an account, click 'Sign In' instead and skip to Step 3."
      >
        <MockNavBar />
        <div className="p-6 bg-gradient-to-b from-[oklch(0.22_0.02_50)] to-[oklch(0.18_0.02_50)]">
          <div className="max-w-md">
            <p className="text-white/60 text-sm mb-3" style={{ textTransform: "none" }}>The button is in the header navigation:</p>
            <div className="flex items-center gap-3">
              <span className="text-white/50 text-sm px-4 py-2 rounded border border-white/20">Sign In</span>
              <div className="relative">
                <span className="text-white text-sm px-4 py-2 rounded bg-[oklch(0.55_0.15_45)] font-medium">List Your Business</span>
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </StepBlock>

      <StepBlock
        stepNumber={2}
        title="Create Your Account"
        description="You'll be taken to the Manus login page. Sign up with your email and create a password. After verifying your email, you'll be redirected back to SportConnect."
      >
        <div className="p-6 bg-muted/30">
          <div className="max-w-sm mx-auto p-6 rounded-xl bg-card border border-border shadow-sm">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-[oklch(0.55_0.15_45)]/10 flex items-center justify-center mx-auto mb-3">
                <LogIn className="w-6 h-6 text-[oklch(0.55_0.15_45)]" />
              </div>
              <h4 className="font-semibold text-foreground text-sm" style={{ textTransform: "none" }}>Create your account</h4>
              <p className="text-xs text-muted-foreground mt-1" style={{ textTransform: "none" }}>Sign up with email and password</p>
            </div>
            <div className="space-y-3">
              <div className="h-9 rounded-md border border-border bg-background px-3 flex items-center">
                <span className="text-xs text-muted-foreground" style={{ textTransform: "none" }}>you@yourbusiness.com</span>
              </div>
              <div className="h-9 rounded-md border border-border bg-background px-3 flex items-center">
                <span className="text-xs text-muted-foreground" style={{ textTransform: "none" }}>••••••••</span>
              </div>
              <div className="h-9 rounded-md bg-[oklch(0.55_0.15_45)] flex items-center justify-center">
                <span className="text-xs text-white font-medium" style={{ textTransform: "none" }}>Sign Up</span>
              </div>
            </div>
          </div>
        </div>
      </StepBlock>

      <StepBlock
        stepNumber={3}
        title="Complete the Onboarding — Select 'Business Owner'"
        description="After signing in, you'll see the onboarding screen. Select 'I'm a Business Owner' to set up your account as a business. You'll be asked for your name and a few basic details."
        tip="If you're both a business owner AND an athlete, choose 'Business Owner' — you'll still have access to athlete features like saving businesses and claiming offers."
      >
        <div className="p-6 bg-muted/30">
          <div className="max-w-md mx-auto">
            <p className="text-center text-sm font-semibold text-foreground mb-4" style={{ textTransform: "none" }}>How will you use SportConnect?</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border-2 border-[oklch(0.55_0.15_45)] bg-[oklch(0.55_0.15_45)]/5 text-center">
                <Building2 className="w-8 h-8 text-[oklch(0.55_0.15_45)] mx-auto mb-2" />
                <p className="text-sm font-semibold text-foreground" style={{ textTransform: "none" }}>I'm a Business Owner</p>
                <p className="text-xs text-muted-foreground mt-1" style={{ textTransform: "none" }}>Claim & manage your listing</p>
              </div>
              <div className="p-4 rounded-xl border border-border text-center opacity-60">
                <Search className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-semibold text-foreground" style={{ textTransform: "none" }}>I'm an Athlete</p>
                <p className="text-xs text-muted-foreground mt-1" style={{ textTransform: "none" }}>Find deals & local pros</p>
              </div>
            </div>
          </div>
        </div>
      </StepBlock>

      <StepBlock
        stepNumber={4}
        title="Find Your Business in the Directory"
        description="Navigate to the Directory page using the top navigation. Use the search bar to find your business by name, city, or sport. If your business is already listed, you'll see it in the results with an 'Unclaimed' badge."
        tip="Can't find your business? You can add it manually from your Biz Dashboard by clicking 'Add New Business'."
      >
        <div className="p-6 bg-muted/30">
          <div className="max-w-lg mx-auto">
            <div className="flex items-center gap-2 mb-4 p-3 rounded-lg border border-border bg-background">
              <Search className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-foreground" style={{ textTransform: "none" }}>Score Nutrition</span>
              <span className="ml-auto text-xs text-muted-foreground" style={{ textTransform: "none" }}>Search</span>
            </div>
            <div className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-foreground text-sm" style={{ textTransform: "none" }}>SCORE NUTRITION</h4>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20 font-medium">Unclaimed</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1" style={{ textTransform: "none" }}>Sports nutrition coaching for athletes</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-3">
                <span style={{ textTransform: "none" }}>📍 Calgary, Canada</span>
                <span style={{ textTransform: "none" }}>🏃 Running</span>
                <span style={{ textTransform: "none" }}>🥗 Nutritionist</span>
              </div>
            </div>
          </div>
        </div>
      </StepBlock>

      <StepBlock
        stepNumber={5}
        title="Click 'Claim Business' on Your Business Profile"
        description="Click on your business card to open its full profile page. You'll see a 'Claim Business' button in the action bar near the top. Click it to start the claim process."
      >
        <div className="p-6 bg-muted/30">
          <div className="max-w-lg mx-auto">
            <div className="flex items-center gap-3 flex-wrap">
              <MockButton variant="outline">
                <Search className="w-4 h-4" /> Save
              </MockButton>
              <div className="relative">
                <MockButton variant="primary">
                  <MousePointerClick className="w-4 h-4" /> Claim Business
                </MockButton>
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              </div>
              <MockButton variant="outline">Edit Info</MockButton>
              <MockButton variant="outline">Update Offers</MockButton>
            </div>
          </div>
        </div>
      </StepBlock>

      <StepBlock
        stepNumber={6}
        title="Confirm Your Claim"
        description="A confirmation dialog will appear asking you to confirm that you are the owner or authorized representative of this business. Click 'Yes, Claim This Business' to submit your claim."
        tip="Your claim will be reviewed by our admin team. This is usually done within a few hours. You'll be able to see the pending status on your Biz Dashboard."
      >
        <div className="p-6 bg-muted/30">
          <div className="max-w-sm mx-auto p-6 rounded-xl bg-card border border-border shadow-lg">
            <div className="text-center mb-4">
              <div className="w-12 h-12 rounded-full bg-[oklch(0.55_0.15_45)]/10 flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-[oklch(0.55_0.15_45)]" />
              </div>
              <h4 className="font-semibold text-foreground" style={{ textTransform: "none" }}>Claim This Business?</h4>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed" style={{ textTransform: "none" }}>
                By claiming this business, you confirm that you are the owner or an authorized representative. Your claim will be reviewed by our admin team.
              </p>
            </div>
            <div className="space-y-2">
              <div className="h-9 rounded-md bg-[oklch(0.55_0.15_45)] flex items-center justify-center">
                <span className="text-xs text-white font-medium" style={{ textTransform: "none" }}>Yes, Claim This Business</span>
              </div>
              <div className="h-9 rounded-md border border-border flex items-center justify-center">
                <span className="text-xs text-muted-foreground font-medium" style={{ textTransform: "none" }}>Cancel</span>
              </div>
            </div>
          </div>
        </div>
      </StepBlock>

      <StepBlock
        stepNumber={7}
        title="Wait for Admin Approval"
        description="After submitting your claim, you'll see a 'Pending Approval' status on your business listing and in your Biz Dashboard. Our admin team will review your claim and approve it — usually within a few hours."
      >
        <div className="p-6 bg-muted/30">
          <div className="max-w-lg mx-auto">
            <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/5">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground" style={{ textTransform: "none" }}>Claim Pending Approval</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed" style={{ textTransform: "none" }}>
                    Your claim is being reviewed by our admin team. Once approved, you'll be able to edit your business details, upload your logo, and create referral offers.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full w-2/3 rounded-full bg-amber-500" />
              </div>
              <span className="text-xs text-muted-foreground" style={{ textTransform: "none" }}>Pending review</span>
            </div>
          </div>
        </div>
      </StepBlock>

      <StepBlock
        stepNumber={8}
        title="You're In! Start Managing Your Business"
        description="Once approved, you'll have full access to edit your business profile, upload your logo, create B2B and athlete referral offers, send referrals to partner businesses, and track your referral activity on the dashboard."
      >
        <div className="p-6 bg-muted/30">
          <div className="max-w-lg mx-auto">
            <div className="p-4 rounded-lg border border-emerald-500/30 bg-emerald-500/5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground" style={{ textTransform: "none" }}>Claim Approved!</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed" style={{ textTransform: "none" }}>
                    You now have full control of your business listing. Here's what you can do next:
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                { icon: "✏️", label: "Edit your profile" },
                { icon: "📸", label: "Upload your logo" },
                { icon: "🏷️", label: "Create referral offers" },
                { icon: "📤", label: "Send referrals" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 p-3 rounded-lg bg-card border border-border">
                  <span>{item.icon}</span>
                  <span className="text-xs font-medium text-foreground" style={{ textTransform: "none" }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </StepBlock>

      {/* What's Next */}
      <div className="mt-12 p-6 rounded-xl bg-[oklch(0.22_0.02_50)] border border-white/10">
        <h2 className="text-xl font-bold text-white mb-4" style={{ textTransform: "none", letterSpacing: "normal" }}>What's Next?</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Link href="/university/setting-up-offers">
            <div className="group p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer transition-colors">
              <h4 className="text-sm font-semibold text-white mb-1 group-hover:text-[oklch(0.55_0.15_45)] transition-colors" style={{ textTransform: "none" }}>
                Setting Up Your Referral Offers <ArrowRight className="w-4 h-4 inline ml-1" />
              </h4>
              <p className="text-xs text-white/60" style={{ textTransform: "none" }}>Learn how to create B2B and athlete offers that attract referrals.</p>
            </div>
          </Link>
          <Link href="/university/business-profile-tips">
            <div className="group p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer transition-colors">
              <h4 className="text-sm font-semibold text-white mb-1 group-hover:text-[oklch(0.55_0.15_45)] transition-colors" style={{ textTransform: "none" }}>
                Building Your Business Profile <ArrowRight className="w-4 h-4 inline ml-1" />
              </h4>
              <p className="text-xs text-white/60" style={{ textTransform: "none" }}>Tips for making your listing stand out with logo, description, and reviews.</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─── Coming Soon placeholder ─── */
function ComingSoonArticle({ title }: { title: string }) {
  return (
    <div className="text-center py-16">
      <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
      <h1 className="text-2xl font-bold text-foreground mb-3" style={{ textTransform: "none", letterSpacing: "normal" }}>{title}</h1>
      <p className="text-muted-foreground max-w-md mx-auto" style={{ textTransform: "none", letterSpacing: "normal" }}>
        This guide is coming soon. We're working on it right now — check back shortly or reach out to support if you need help in the meantime.
      </p>
      <Link href="/support">
        <button className="mt-6 px-5 py-2.5 rounded-lg bg-[oklch(0.55_0.15_45)] hover:bg-[oklch(0.50_0.15_45)] text-white text-sm font-medium transition-colors" style={{ textTransform: "none" }}>
          Contact Support
        </button>
      </Link>
    </div>
  );
}

/* ─── Article routing map ─── */
const articleMap: Record<string, { title: string; component: React.FC }> = {
  "claim-your-business": {
    title: "How to Create Your Account & Claim Your Business",
    component: ClaimYourBusinessArticle,
  },
  "setting-up-offers": {
    title: "Setting Up Your Referral Offers",
    component: () => <ComingSoonArticle title="Setting Up Your Referral Offers" />,
  },
  "referral-flow": {
    title: "Sending & Receiving Referrals",
    component: () => <ComingSoonArticle title="Sending & Receiving Referrals" />,
  },
  "business-profile-tips": {
    title: "Building Your Business Profile",
    component: () => <ComingSoonArticle title="Building Your Business Profile" />,
  },
  "partner-network": {
    title: "Growing Your Partner Network",
    component: () => <ComingSoonArticle title="Growing Your Partner Network" />,
  },
  "leaderboard-guide": {
    title: "Understanding the Leaderboard & Scoreboard",
    component: () => <ComingSoonArticle title="Understanding the Leaderboard & Scoreboard" />,
  },
  "athlete-getting-started": {
    title: "Getting Started as an Athlete",
    component: () => <ComingSoonArticle title="Getting Started as an Athlete" />,
  },
  "athlete-offers-guide": {
    title: "Finding & Claiming Athlete Offers",
    component: () => <ComingSoonArticle title="Finding & Claiming Athlete Offers" />,
  },
  "saving-favorites": {
    title: "Saving Your Favorite Businesses",
    component: () => <ComingSoonArticle title="Saving Your Favorite Businesses" />,
  },
  "explore-by-sport": {
    title: "Exploring by Sport & Region",
    component: () => <ComingSoonArticle title="Exploring by Sport & Region" />,
  },
};

/* ─── Main Article Page ─── */
export default function UniversityArticle() {
  const [, params] = useRoute("/university/:slug");
  const slug = params?.slug || "";
  const article = articleMap[slug];

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container max-w-3xl py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-3">Article Not Found</h1>
          <p className="text-muted-foreground mb-6" style={{ textTransform: "none" }}>We couldn't find the article you're looking for.</p>
          <Link href="/university">
            <button className="px-5 py-2.5 rounded-lg bg-[oklch(0.55_0.15_45)] text-white text-sm font-medium" style={{ textTransform: "none" }}>
              Back to University
            </button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const ArticleComponent = article.component;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container max-w-3xl py-10 md:py-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/university">
            <span className="hover:text-foreground cursor-pointer transition-colors flex items-center gap-1" style={{ textTransform: "none" }}>
              <ChevronLeft className="w-4 h-4" /> University
            </span>
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground/80" style={{ textTransform: "none" }}>{article.title}</span>
        </div>

        <ArticleComponent />

        {/* Back to University */}
        <div className="mt-12 pt-8 border-t border-border">
          <Link href="/university">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-[oklch(0.55_0.15_45)] hover:underline cursor-pointer" style={{ textTransform: "none" }}>
              <ChevronLeft className="w-4 h-4" /> Back to University
            </span>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
