import { useState, useEffect, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLocation } from "wouter";
import { toast } from "sonner";
import {
  Building2, Bike, Mountain, Snowflake, ArrowRight, ArrowLeft,
  Loader2, Users, Gift, Send, Star, TrendingUp, Heart, MapPin, Target, Zap
} from "lucide-react";

const EXPERIENCE_LEVELS = [
  { value: "beginner", label: "Beginner", desc: "Just getting started" },
  { value: "intermediate", label: "Intermediate", desc: "A few seasons in" },
  { value: "advanced", label: "Advanced", desc: "Serious about it" },
  { value: "competitive", label: "Competitive", desc: "Racing / competing" },
  { value: "pro", label: "Pro / Semi-Pro", desc: "It's basically my job" },
];

const INTEREST_OPTIONS = [
  { value: "coaching", label: "Coaching / Training Plans" },
  { value: "bike_fit", label: "Bike Fitting" },
  { value: "nutrition", label: "Nutrition / Dietitian" },
  { value: "physio", label: "Physio / Sports Medicine" },
  { value: "massage", label: "Sports Massage" },
  { value: "bike_shop", label: "Bike Shop / Gear" },
  { value: "run_store", label: "Running Store" },
  { value: "ski_shop", label: "Ski / Snowboard Shop" },
  { value: "club", label: "Clubs / Group Rides / Runs" },
  { value: "studio", label: "Indoor Studio / Gym" },
  { value: "travel", label: "Sports Travel / Camps" },
  { value: "other", label: "Other" },
];

const REFERRAL_SOURCES = [
  "Word of mouth",
  "Social media",
  "Google search",
  "A business on SportConnect",
  "Blog / article",
  "Podcast",
  "Other",
];

export default function Onboarding() {
  const { user, loading } = useAuth({ redirectOnUnauthenticated: true });
  const [, navigate] = useLocation();
  const urlParams = new URLSearchParams(window.location.search);
  const typeFromUrl = urlParams.get('type');
  const [selected, setSelected] = useState<"business_owner" | "consumer" | null>(
    typeFromUrl === 'athlete' || typeFromUrl === 'enthusiast' ? 'consumer' :
    typeFromUrl === 'business' ? 'business_owner' : null
  );
  const [step, setStep] = useState<'choose' | 'athlete-form'>(
    typeFromUrl === 'athlete' || typeFromUrl === 'enthusiast' ? 'athlete-form' : 'choose'
  );
  const utils = trpc.useUtils();

  // If user already completed onboarding, redirect to their dashboard
  useEffect(() => {
    if (user && user.onboardingComplete && !typeFromUrl) {
      if (user.role === 'admin') navigate('/admin');
      else if (user.accountType === 'business_owner') navigate('/dashboard');
      else navigate('/athlete-dashboard');
    }
  }, [user, typeFromUrl, navigate]);

  // Sport categories from API
  const { data: sportCategories } = trpc.categories.sportCategories.useQuery();

  // Athlete form state
  const [athleteForm, setAthleteForm] = useState({
    displayName: "",
    selectedSports: [] as number[],
    experienceLevels: {} as Record<number, string>,
    city: "",
    state: "",
    country: "",
    interests: [] as string[],
    goals: "",
    referralSource: "",
    newsletterOptIn: true,
  });

  // All hooks must be declared before any useEffect that uses them
  const setAccountType = trpc.accountType.set.useMutation({
    onSuccess: (_data, variables) => {
      utils.auth.me.invalidate();
      if (variables.accountType === "business_owner") {
        toast.success("You're in! Let's get your business listed.");
        navigate("/submit-business");
      }
      // For consumer, we handle navigation after saving athlete profile
    },
    onError: (err) => {
      toast.error(err.message || "Something went wrong. Please try again.");
    },
  });

  const saveProfile = trpc.athleteProfile.save.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
      toast.success("Profile saved! Let's find you some deals.");
      navigate("/athlete-dashboard");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to save profile. Please try again.");
    },
  });

  const completeOnboarding = trpc.onboarding.complete.useMutation();

  // Pre-fill display name from user
  useEffect(() => {
    if ((user?.contactName || user?.name) && !athleteForm.displayName) {
      setAthleteForm(prev => ({ ...prev, displayName: user?.contactName || user?.name || "" }));
    }
  }, [user]);

  // Auto-proceed for business type from URL (when clicking "List Your Business")
  const [autoProceeded, setAutoProceeded] = useState(false);
  useEffect(() => {
    if (typeFromUrl === 'business' && user && !autoProceeded && !user.onboardingComplete) {
      setAutoProceeded(true);
      setAccountType.mutate({ accountType: "business_owner" });
    }
  }, [typeFromUrl, user, autoProceeded]);

  const handleChoose = () => {
    if (!selected) {
      toast.error("Please select how you'd like to use SportConnect.");
      return;
    }
    if (selected === "business_owner") {
      setAccountType.mutate({ accountType: "business_owner" });
    } else {
      setStep('athlete-form');
    }
  };

  const setContactNameMut = trpc.userProfile.setContactName.useMutation();

  const handleAthleteSubmit = () => {
    // Set account type first, then save profile (which also marks onboarding complete)
    setAccountType.mutate({ accountType: "consumer" }, {
      onSuccess: () => {
        // Also save displayName as contactName
        if (athleteForm.displayName.trim()) {
          setContactNameMut.mutate({ contactName: athleteForm.displayName.trim() });
        }
        saveProfile.mutate({
          displayName: athleteForm.displayName || undefined,
          sportIds: athleteForm.selectedSports.length > 0 ? JSON.stringify(athleteForm.selectedSports) : undefined,
          experienceLevels: Object.keys(athleteForm.experienceLevels).length > 0 ? JSON.stringify(athleteForm.experienceLevels) : undefined,
          city: athleteForm.city || undefined,
          state: athleteForm.state || undefined,
          country: athleteForm.country || undefined,
          interests: athleteForm.interests.length > 0 ? JSON.stringify(athleteForm.interests) : undefined,
          goals: athleteForm.goals || undefined,
          referralSource: athleteForm.referralSource || undefined,
          newsletterOptIn: athleteForm.newsletterOptIn,
        });
      },
    });
  };

  const handleSkipProfile = () => {
    setAccountType.mutate({ accountType: "consumer" }, {
      onSuccess: () => {
        // Save contactName if entered before skipping
        if (athleteForm.displayName.trim()) {
          setContactNameMut.mutate({ contactName: athleteForm.displayName.trim() });
        }
        // Mark onboarding complete even when skipping profile
        completeOnboarding.mutate(undefined, {
          onSuccess: () => {
            utils.auth.me.invalidate();
            toast.success("You're in! Browse around and fill out your profile later.");
            navigate("/directory");
          },
        });
      },
    });
  };

  const toggleSport = (id: number) => {
    setAthleteForm(prev => {
      const selected = prev.selectedSports.includes(id)
        ? prev.selectedSports.filter(s => s !== id)
        : [...prev.selectedSports, id];
      const levels = { ...prev.experienceLevels };
      if (!selected.includes(id)) delete levels[id];
      return { ...prev, selectedSports: selected, experienceLevels: levels };
    });
  };

  const toggleInterest = (value: string) => {
    setAthleteForm(prev => ({
      ...prev,
      interests: prev.interests.includes(value)
        ? prev.interests.filter(i => i !== value)
        : [...prev.interests, value],
    }));
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

  const isPending = setAccountType.isPending || saveProfile.isPending;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-[oklch(0.22_0.02_50)] text-white py-10 md:py-14">
          <div className="container max-w-3xl text-center">
            <div className="flex justify-center gap-3 mb-5">
              <Bike className="w-7 h-7 text-primary" />
              <Mountain className="w-7 h-7 text-primary" />
              <Snowflake className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              {step === 'choose' ? "Welcome to SportConnect!" : "Tell Us About Yourself"}
            </h1>
            <p className="text-white/70 text-lg max-w-xl mx-auto" style={{ textTransform: "none", letterSpacing: "normal" }}>
              {step === 'choose'
                ? "One quick question before we let you loose. Are you here to grow a business, or to find the best local pros for your sport?"
                : "Help us figure out what to recommend. Takes 60 seconds, and you can always update it later."}
            </p>
          </div>
        </section>

        {step === 'choose' ? (
          /* ─── Step 1: Choose Account Type ─── */
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

                {/* Athlete Card */}
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
                          Athlete
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
                          Selected — We'll ask a few quick questions next
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
                  onClick={handleChoose}
                  disabled={!selected || isPending}
                >
                  {isPending ? (
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
        ) : (
          /* ─── Step 2: Athlete Profile Form ─── */
          <section className="py-8 md:py-12">
            <div className="container max-w-2xl">
              <Card className="border-border">
                <CardContent className="p-6 md:p-8 space-y-8">

                  {/* Display Name */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2" style={{ textTransform: "none" }}>
                      What should we call you?
                    </label>
                    <Input
                      value={athleteForm.displayName}
                      onChange={(e) => setAthleteForm(prev => ({ ...prev, displayName: e.target.value }))}
                      placeholder="Your name or trail alias"
                      className="text-sm"
                      style={{ textTransform: "none" }}
                    />
                    <p className="text-xs text-muted-foreground mt-1" style={{ textTransform: "none" }}>
                      This won't be public. We just want to know who's behind the Strava data.
                    </p>
                  </div>

                  {/* Sports Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2" style={{ textTransform: "none" }}>
                      <Bike className="w-4 h-4 inline mr-1.5" />
                      What sports are you into?
                    </label>
                    <p className="text-xs text-muted-foreground mb-3" style={{ textTransform: "none" }}>
                      Pick all that apply. We won't judge the triathlete thing.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {sportCategories?.map((sport: any) => (
                        <button
                          key={sport.id}
                          type="button"
                          onClick={() => toggleSport(sport.id)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                            athleteForm.selectedSports.includes(sport.id)
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-muted text-muted-foreground border-border hover:border-primary/40"
                          }`}
                          style={{ textTransform: "none" }}
                        >
                          {sport.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Experience Levels (for selected sports) */}
                  {athleteForm.selectedSports.length > 0 && (
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2" style={{ textTransform: "none" }}>
                        <Zap className="w-4 h-4 inline mr-1.5" />
                        How would you rate yourself?
                      </label>
                      <p className="text-xs text-muted-foreground mb-3" style={{ textTransform: "none" }}>
                        Be honest. We've all been the person who shows up to a "no-drop ride" and gets dropped.
                      </p>
                      <div className="space-y-3">
                        {athleteForm.selectedSports.map(sportId => {
                          const sport = sportCategories?.find((s: any) => s.id === sportId);
                          if (!sport) return null;
                          return (
                            <div key={sportId} className="flex items-center gap-3 flex-wrap">
                              <span className="text-sm font-medium text-foreground w-28 shrink-0" style={{ textTransform: "none" }}>
                                {sport.name}
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {EXPERIENCE_LEVELS.map(level => (
                                  <button
                                    key={level.value}
                                    type="button"
                                    onClick={() => setAthleteForm(prev => ({
                                      ...prev,
                                      experienceLevels: { ...prev.experienceLevels, [sportId]: level.value },
                                    }))}
                                    className={`px-2.5 py-1.5 rounded text-xs font-medium transition-colors border flex flex-col items-center gap-0.5 ${
                                      athleteForm.experienceLevels[sportId] === level.value
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-muted text-muted-foreground border-border hover:border-primary/40"
                                    }`}
                                    style={{ textTransform: "none" }}
                                  >
                                    <span>{level.label}</span>
                                    <span className={`text-[10px] font-normal ${
                                      athleteForm.experienceLevels[sportId] === level.value
                                        ? "text-primary-foreground/70"
                                        : "text-muted-foreground/60"
                                    }`}>{level.desc}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2" style={{ textTransform: "none" }}>
                      <MapPin className="w-4 h-4 inline mr-1.5" />
                      Where are you based?
                    </label>
                    <p className="text-xs text-muted-foreground mb-3" style={{ textTransform: "none" }}>
                      So we can show you businesses that are actually within driving distance. Or riding distance, if you're that person.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Input
                        value={athleteForm.city}
                        onChange={(e) => setAthleteForm(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="City"
                        className="text-sm"
                        style={{ textTransform: "none" }}
                      />
                      <Input
                        value={athleteForm.state}
                        onChange={(e) => setAthleteForm(prev => ({ ...prev, state: e.target.value }))}
                        placeholder="State / Province"
                        className="text-sm"
                        style={{ textTransform: "none" }}
                      />
                      <Input
                        value={athleteForm.country}
                        onChange={(e) => setAthleteForm(prev => ({ ...prev, country: e.target.value }))}
                        placeholder="Country"
                        className="text-sm"
                        style={{ textTransform: "none" }}
                      />
                    </div>
                  </div>

                  {/* What are you looking for */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2" style={{ textTransform: "none" }}>
                      <Target className="w-4 h-4 inline mr-1.5" />
                      What kind of services interest you?
                    </label>
                    <p className="text-xs text-muted-foreground mb-3" style={{ textTransform: "none" }}>
                      Pick all that apply. This helps us surface the right businesses for you.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {INTEREST_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => toggleInterest(opt.value)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                            athleteForm.interests.includes(opt.value)
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-muted text-muted-foreground border-border hover:border-primary/40"
                          }`}
                          style={{ textTransform: "none" }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Goals */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2" style={{ textTransform: "none" }}>
                      Any specific goals right now?
                    </label>
                    <Textarea
                      value={athleteForm.goals}
                      onChange={(e) => setAthleteForm(prev => ({ ...prev, goals: e.target.value }))}
                      placeholder="Training for a century ride, recovering from a knee thing, trying to not bonk on every long run..."
                      className="text-sm min-h-[80px]"
                      style={{ textTransform: "none" }}
                    />
                    <p className="text-xs text-muted-foreground mt-1" style={{ textTransform: "none" }}>
                      Optional. But it helps us match you with the right people.
                    </p>
                  </div>

                  {/* How did you hear about us */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2" style={{ textTransform: "none" }}>
                      How did you find us?
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {REFERRAL_SOURCES.map((source) => (
                        <button
                          key={source}
                          type="button"
                          onClick={() => setAthleteForm(prev => ({ ...prev, referralSource: source }))}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                            athleteForm.referralSource === source
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-muted text-muted-foreground border-border hover:border-primary/40"
                          }`}
                          style={{ textTransform: "none" }}
                        >
                          {source}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Newsletter opt-in */}
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="newsletter"
                      checked={athleteForm.newsletterOptIn}
                      onCheckedChange={(checked) =>
                        setAthleteForm(prev => ({ ...prev, newsletterOptIn: checked === true }))
                      }
                      className="mt-0.5"
                    />
                    <label htmlFor="newsletter" className="text-sm text-muted-foreground cursor-pointer" style={{ textTransform: "none" }}>
                      Send me occasional updates about new businesses, deals, and features. No spam — we're too busy training to write that much email anyway.
                    </label>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-border">
                    <Button
                      variant="ghost"
                      className="text-muted-foreground gap-2"
                      style={{ textTransform: "none" }}
                      onClick={() => { setStep('choose'); setSelected(null); }}
                      disabled={isPending}
                    >
                      <ArrowLeft className="w-4 h-4" /> Back
                    </Button>
                    <div className="flex-1" />
                    <Button
                      variant="ghost"
                      className="text-muted-foreground text-sm"
                      style={{ textTransform: "none" }}
                      onClick={handleSkipProfile}
                      disabled={isPending}
                    >
                      Skip for now
                    </Button>
                    <Button
                      size="lg"
                      className="bg-primary text-primary-foreground px-8 gap-2"
                      style={{ textTransform: "none" }}
                      onClick={handleAthleteSubmit}
                      disabled={isPending}
                    >
                      {isPending ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                      ) : (
                        <>Let's Go <ArrowRight className="w-4 h-4" /></>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
