import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLocation } from "wouter";
import { toast } from "sonner";
import {
  Building2, Bike, Mountain, Snowflake, ArrowRight,
  Loader2, Users, Gift, Send, Star, TrendingUp, Heart
} from "lucide-react";

export default function Onboarding() {
  const { user, loading } = useAuth({ redirectOnUnauthenticated: true });
  const [, navigate] = useLocation();
  const urlParams = new URLSearchParams(window.location.search);
  const typeFromUrl = urlParams.get('type');
  const [selected, setSelected] = useState<"business_owner" | "consumer" | null>(
    typeFromUrl === 'enthusiast' ? 'consumer' : null
  );
  const utils = trpc.useUtils();

  const setAccountType = trpc.accountType.set.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
      if (selected === "business_owner") {
        toast.success("You're in! Let's get your business listed.");
        navigate("/submit-business");
      } else {
        toast.success("You're in! Check out what's near you.");
        navigate("/directory");
      }
    },
    onError: (err) => {
      toast.error(err.message || "Something went wrong. Please try again.");
    },
  });

  const handleContinue = () => {
    if (!selected) {
      toast.error("Please select how you'd like to use SportConnect.");
      return;
    }
    setAccountType.mutate({ accountType: selected });
  };

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

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-[oklch(0.22_0.02_50)] text-white py-12 md:py-16">
          <div className="container max-w-3xl text-center">
            <div className="flex justify-center gap-3 mb-6">
              <Bike className="w-8 h-8 text-primary" />
              <Mountain className="w-8 h-8 text-primary" />
              <Snowflake className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              Welcome to SportConnect!
            </h1>
            <p className="text-white/70 text-lg max-w-xl mx-auto" style={{ textTransform: "none", letterSpacing: "normal" }}>
              One quick question before we let you loose. Are you here to grow a business, or to find the best local pros for your sport?
            </p>
          </div>
        </section>

        {/* Selection Cards */}
        <section className="py-10 md:py-14">
          <div className="container max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

              {/* Business Owner Card */}
              <Card
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${
                  selected === "business_owner"
                    ? "border-primary ring-2 ring-primary/20 shadow-lg"
                    : "border-border hover:border-primary/40"
                }`}
                onClick={() => setSelected("business_owner")}
              >
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      selected === "business_owner" ? "bg-primary text-white" : "bg-primary/10 text-primary"
                    }`}>
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                        Business Owner
                      </h3>
                      <p className="text-sm text-muted-foreground" style={{ textTransform: "none" }}>
                        I have a sports business to grow
                      </p>
                    </div>
                  </div>

                  <p className="text-muted-foreground text-sm mb-5 leading-relaxed" style={{ textTransform: "none", letterSpacing: "normal" }}>
                    Get your business in the network, post what you'll offer for referrals, and start sending (and receiving) customers. It's the word-of-mouth thing you already do, just with tracking and reach.
                  </p>

                  <div className="space-y-3">
                    {[
                      { icon: <Send className="w-4 h-4" />, text: "Send and receive referrals" },
                      { icon: <Gift className="w-4 h-4" />, text: "Post offers that attract partners" },
                      { icon: <TrendingUp className="w-4 h-4" />, text: "Track who sent what" },
                      { icon: <Users className="w-4 h-4" />, text: "Grow beyond your postcode" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-sm" style={{ textTransform: "none" }}>
                        <span className={selected === "business_owner" ? "text-primary" : "text-muted-foreground"}>
                          {item.icon}
                        </span>
                        <span className="text-foreground">{item.text}</span>
                      </div>
                    ))}
                  </div>

                  {selected === "business_owner" && (
                    <div className="mt-5 pt-4 border-t border-primary/20">
                      <p className="text-xs text-primary font-medium" style={{ textTransform: "none" }}>
                        Selected — You'll list your business next
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Sports Enthusiast Card */}
              <Card
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${
                  selected === "consumer"
                    ? "border-primary ring-2 ring-primary/20 shadow-lg"
                    : "border-border hover:border-primary/40"
                }`}
                onClick={() => setSelected("consumer")}
              >
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      selected === "consumer" ? "bg-primary text-white" : "bg-primary/10 text-primary"
                    }`}>
                      <Heart className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                        Sports Enthusiast
                      </h3>
                      <p className="text-sm text-muted-foreground" style={{ textTransform: "none" }}>
                        I ride, run, or ski (or all three)
                      </p>
                    </div>
                  </div>

                  <p className="text-muted-foreground text-sm mb-5 leading-relaxed" style={{ textTransform: "none", letterSpacing: "normal" }}>
                    Find the coaches, shops, physios, and clubs that other athletes actually recommend. Browse profiles, check reviews, and grab deals that aren't available anywhere else.
                  </p>

                  <div className="space-y-3">
                    {[
                      { icon: <Gift className="w-4 h-4" />, text: "Grab deals from local pros" },
                      { icon: <Star className="w-4 h-4" />, text: "Find businesses with real reviews" },
                      { icon: <Mountain className="w-4 h-4" />, text: "Coaches, shops, physios & more" },
                      { icon: <Heart className="w-4 h-4" />, text: "Support the businesses that support you" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-sm" style={{ textTransform: "none" }}>
                        <span className={selected === "consumer" ? "text-primary" : "text-muted-foreground"}>
                          {item.icon}
                        </span>
                        <span className="text-foreground">{item.text}</span>
                      </div>
                    ))}
                  </div>

                  {selected === "consumer" && (
                    <div className="mt-5 pt-4 border-t border-primary/20">
                      <p className="text-xs text-primary font-medium" style={{ textTransform: "none" }}>
                        Selected — You'll be taken to the business directory
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Continue Button */}
            <div className="text-center">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground px-10 gap-2"
                style={{ textTransform: "none" }}
                onClick={handleContinue}
                disabled={!selected || setAccountType.isPending}
              >
                {setAccountType.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Setting up...</>
                ) : (
                  <>Continue <ArrowRight className="w-4 h-4" /></>
                )}
              </Button>
              <p className="text-xs text-muted-foreground mt-3" style={{ textTransform: "none" }}>
                Don't overthink it. You can change this later.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
