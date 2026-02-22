import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BusinessLogo from "@/components/BusinessLogo";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useState } from "react";
import {
  Trophy, Medal, Award, TrendingUp, ArrowUpRight, ArrowDownLeft,
  MessageSquare, Crown, Star, Flame, Zap, Users, DollarSign,
  ChevronRight, Handshake, UserCheck, Wallet
} from "lucide-react";

type Timeframe = "all" | "month" | "year";

function getRankBadge(rank: number) {
  if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />;
  if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
  return <span className="text-sm font-bold text-white/40">#{rank}</span>;
}

function getRankStyle(rank: number) {
  if (rank === 1) return "bg-gradient-to-r from-yellow-500/20 to-yellow-600/5 border-yellow-500/30";
  if (rank === 2) return "bg-gradient-to-r from-gray-400/15 to-gray-500/5 border-gray-400/20";
  if (rank === 3) return "bg-gradient-to-r from-amber-600/15 to-amber-700/5 border-amber-600/20";
  return "bg-white/5 border-white/10";
}

function getStreakBadge(count: number) {
  if (count >= 20) return { icon: <Flame className="w-3.5 h-3.5" />, label: "On Fire", color: "bg-red-500/20 text-red-300" };
  if (count >= 10) return { icon: <Zap className="w-3.5 h-3.5" />, label: "Power Player", color: "bg-purple-500/20 text-purple-300" };
  if (count >= 5) return { icon: <Star className="w-3.5 h-3.5" />, label: "Rising Star", color: "bg-blue-500/20 text-blue-300" };
  return null;
}

export default function Leaderboard() {
  const [timeframe, setTimeframe] = useState<Timeframe>("all");
  const [activeTab, setActiveTab] = useState<"referrers" | "receivers" | "connectors">("referrers");

  const { data: rankings, isLoading } = trpc.leaderboard.rankings.useQuery({ timeframe, limit: 20 });
  const { data: summary } = trpc.leaderboard.summary.useQuery();
  const { data: platformStats } = trpc.platformStats.get.useQuery();

  const timeframeLabels: Record<Timeframe, string> = {
    all: "All Time",
    month: "This Month",
    year: "This Year",
  };

  const tabs = [
    { key: "referrers" as const, label: "Top Referrers", icon: <ArrowUpRight className="w-4 h-4" />, description: "The generous ones. Sending clients left, right, and across borders." },
    { key: "receivers" as const, label: "Most Reliable", icon: <ArrowDownLeft className="w-4 h-4" />, description: "They said they'd honour the referral. And they actually did. Legends." },
    { key: "connectors" as const, label: "Top Connectors", icon: <MessageSquare className="w-4 h-4" />, description: "The matchmakers. Always introducing businesses to each other." },
  ];

  const currentData = activeTab === "referrers"
    ? (rankings && 'topReferrers' in rankings ? rankings.topReferrers : []) 
    : activeTab === "receivers"
    ? (rankings && 'topReceivers' in rankings ? rankings.topReceivers : [])
    : (rankings && 'topConnectors' in rankings ? rankings.topConnectors : []);

  return (
    <div className="min-h-screen bg-[oklch(0.18_0.02_50)]">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.25_0.04_45)] to-[oklch(0.18_0.02_50)]" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-yellow-500 blur-3xl" />
          <div className="absolute bottom-10 right-20 w-40 h-40 rounded-full bg-amber-500 blur-3xl" />
        </div>
        <div className="container relative py-16">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
              Community Rankings
            </Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3" style={{ fontFamily: "var(--font-heading)" }}>
            THE LEADERBOARD
          </h1>
          <p className="text-lg text-white/60 max-w-2xl" style={{ textTransform: "none", letterSpacing: "normal" }}>
            Who's actually walking the walk? These businesses aren't just talking about collaboration over post-ride coffees. They're sending real customers, honouring real deals, and building partnerships that go beyond a handshake at a race expo.
          </p>

          {/* Summary Stats */}
          {platformStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {[
                { label: "Total Referrals", value: platformStats.totalReferrals.toLocaleString(), icon: <TrendingUp className="w-5 h-5 text-amber-400" />, color: "text-[oklch(0.55_0.15_45)]" },
                { label: "Referrals Honored", value: platformStats.honoredReferrals.toLocaleString(), icon: <Award className="w-5 h-5 text-green-400" />, color: "text-green-400" },
                { label: "Referral Incentives Earned", value: `$${platformStats.totalIncentivesExchanged.toLocaleString()}`, icon: <DollarSign className="w-5 h-5 text-emerald-400" />, color: "text-emerald-400" },
                { label: "Business Revenue from Referrals", value: `$${platformStats.businessRevenueFromReferrals.toLocaleString()}`, icon: <Wallet className="w-5 h-5 text-amber-400" />, color: "text-amber-400" },
                { label: "Athlete Offers Claimed", value: platformStats.consumerOffersClaimed.toLocaleString(), icon: <UserCheck className="w-5 h-5 text-blue-400" />, color: "text-blue-400" },
                { label: "Athletes Sent to Businesses", value: platformStats.totalAthletesSentToBusinesses.toLocaleString(), icon: <Users className="w-5 h-5 text-cyan-400" />, color: "text-cyan-400" },
                { label: "Business Partnerships Brokered", value: platformStats.totalPartnershipsBrokered.toLocaleString(), icon: <Handshake className="w-5 h-5 text-purple-400" />, color: "text-purple-400" },
                { label: "Athlete Savings", value: `$${platformStats.consumerSavings.toLocaleString()}`, icon: <DollarSign className="w-5 h-5 text-amber-300" />, color: "text-amber-300" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    {stat.icon}
                    <span className="text-xs text-white/40 uppercase tracking-wider">{stat.label}</span>
                  </div>
                  <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Controls */}
      <section className="container py-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* Timeframe Filter */}
          <div className="flex gap-2">
            {(Object.keys(timeframeLabels) as Timeframe[]).map((tf) => (
              <Button
                key={tf}
                variant={timeframe === tf ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeframe(tf)}
                className={timeframe === tf
                  ? "bg-[oklch(0.55_0.15_45)] hover:bg-[oklch(0.50_0.15_45)] text-white"
                  : "border-white/20 text-white/60 hover:text-white hover:bg-white/10"
                }
              >
                {timeframeLabels[tf]}
              </Button>
            ))}
          </div>

          {/* Tab Selector */}
          <div className="flex gap-1 bg-white/5 rounded-lg p-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? "bg-[oklch(0.55_0.15_45)] text-white"
                    : "text-white/50 hover:text-white/80"
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm text-white/40 mt-2">
          {tabs.find(t => t.key === activeTab)?.description}
        </p>
      </section>

      {/* Rankings */}
      <section className="container pb-16">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : currentData.length === 0 ? (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="py-16 text-center">
              <Trophy className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No rankings yet</h3>
              <p className="text-white/50 mb-6" style={{ textTransform: "none", letterSpacing: "normal" }}>
                The leaderboard is empty. Which means there's a #1 spot with your name on it. Just saying.
              </p>
              <Link href="/directory">
                <Button className="bg-[oklch(0.55_0.15_45)] hover:bg-[oklch(0.50_0.15_45)] text-white">
                  Browse Directory
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {currentData.map((biz: any, index: number) => {
              const rank = index + 1;
              const streak = getStreakBadge(
                activeTab === "referrers" ? Number(biz.totalSent || 0) :
                activeTab === "receivers" ? Number(biz.honored || 0) :
                Number(biz.totalEmails || 0)
              );

              return (
                <Link key={biz.id} href={`/business/${biz.slug}`}>
                  <div className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.01] hover:shadow-lg ${getRankStyle(rank)}`}>
                    {/* Rank */}
                    <div className="w-10 h-10 flex items-center justify-center shrink-0">
                      {getRankBadge(rank)}
                    </div>

                    {/* Logo */}
                    <BusinessLogo
                      logoUrl={biz.logoUrl}
                      businessName={biz.name}
                    />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-white font-semibold truncate">{biz.name}</h3>
                        {streak && (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${streak.color}`}>
                            {streak.icon}
                            {streak.label}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-white/40 mt-0.5">
                        {biz.businessTypeName && <span>{biz.businessTypeName}</span>}
                        {biz.city && <span>• {biz.city}</span>}
                        {biz.region && <span>• {biz.region}</span>}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 shrink-0">
                      {activeTab === "referrers" && (
                        <>
                          <div className="text-right hidden sm:block">
                            <div className="text-xs text-white/40">Sent</div>
                            <div className="text-lg font-bold text-white">{Number(biz.totalSent || 0)}</div>
                          </div>
                          <div className="text-right hidden sm:block">
                            <div className="text-xs text-white/40">Honored</div>
                            <div className="text-lg font-bold text-green-400">{Number(biz.honored || 0)}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-white/40">Earned</div>
                            <div className="text-lg font-bold text-emerald-400">${Number(biz.totalEarned || 0).toLocaleString()}</div>
                          </div>
                        </>
                      )}
                      {activeTab === "receivers" && (
                        <>
                          <div className="text-right hidden sm:block">
                            <div className="text-xs text-white/40">Received</div>
                            <div className="text-lg font-bold text-white">{Number(biz.totalReceived || 0)}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-white/40">Honored</div>
                            <div className="text-lg font-bold text-green-400">{Number(biz.honored || 0)}</div>
                          </div>
                          <div className="text-right hidden sm:block">
                            <div className="text-xs text-white/40">Paid Out</div>
                            <div className="text-lg font-bold text-amber-400">${Number(biz.totalPaidOut || 0).toLocaleString()}</div>
                          </div>
                        </>
                      )}
                      {activeTab === "connectors" && (
                        <div className="text-right">
                          <div className="text-xs text-white/40">Emails</div>
                          <div className="text-lg font-bold text-blue-400">{Number(biz.totalEmails || 0)}</div>
                        </div>
                      )}
                      <ChevronRight className="w-4 h-4 text-white/20 hidden sm:block" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-[oklch(0.30_0.06_45)] to-[oklch(0.25_0.04_50)] border-white/10">
            <CardContent className="py-10">
              <Trophy className="w-10 h-10 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Want to climb the ranks?</h3>
              <p className="text-white/50 mb-6 max-w-md mx-auto">
                Claim your business, start sending referrals, and honor the ones you receive. 
                The businesses that refer the most and follow through show up at the top.
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Link href="/directory">
                  <Button className="bg-[oklch(0.55_0.15_45)] hover:bg-[oklch(0.50_0.15_45)] text-white">
                    Browse Directory
                  </Button>
                </Link>
                <ListYourBusinessCTA />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}


// Helper component: routes authenticated business owners to /submit-business,
// unauthenticated users to login with onboarding?type=business return path
function ListYourBusinessCTA() {
  const { isAuthenticated, user } = useAuth();
  
  // If authenticated and already a business owner, go straight to submit-business
  if (isAuthenticated && user?.accountType === 'business_owner') {
    return (
      <Link href="/submit-business">
        <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
          List Your Business
        </Button>
      </Link>
    );
  }
  
  // If authenticated but not a business owner (athlete), go to onboarding with business type
  if (isAuthenticated) {
    return (
      <Link href="/onboarding?type=business">
        <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
          List Your Business
        </Button>
      </Link>
    );
  }
  
  // Not authenticated — go through login flow with returnPath
  return (
    <a href={getLoginUrl("/onboarding?type=business")}>
      <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
        List Your Business
      </Button>
    </a>
  );
}
