import { useState, useEffect, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BusinessLogo from "@/components/BusinessLogo";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Loader2, Gift, Heart, Bookmark, MapPin, ExternalLink,
  Ticket, CheckCircle2, Clock, AlertTriangle, Trash2,
  User, Target, Bike, Settings, ArrowRight, Bell, Check, CheckCheck,
  Sparkles, Star, ChevronRight, Pencil, X, Save, Zap, Mail, BellRing, BellOff,
  Users, ChevronDown, Shield, Plus, UserCog
} from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";

type TabId = "offers" | "saved" | "notifications" | "profile";

export default function AthleteDashboard() {
  const { user, loading } = useAuth({ redirectOnUnauthenticated: true });
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<TabId>("offers");
  const [activeTestProfileId, setActiveTestProfileId] = useState<number | null>(null);
  const [showProfileSwitcher, setShowProfileSwitcher] = useState(false);

  // Admin test profiles
  const isAdmin = user?.role === 'admin';
  const utils = trpc.useUtils();
  const { data: testProfiles } = (trpc as any).admin?.listTestProfiles?.useQuery?.(undefined, { enabled: !!isAdmin }) ?? { data: undefined };
  const activeTestProfile = testProfiles?.find((p: any) => p.id === activeTestProfileId) ?? null;
  const deleteTestProfileMut = (trpc as any).admin?.deleteTestProfile?.useMutation?.({
    onSuccess: () => {
      toast.success('Test profile deleted');
      setActiveTestProfileId(null);
      setShowProfileSwitcher(false);
      (utils as any).admin?.listTestProfiles?.invalidate?.();
    },
    onError: (err: any) => toast.error(err.message || 'Failed to delete profile'),
  }) ?? { mutate: () => {}, isPending: false };
  const createTestProfileMut = (trpc as any).admin?.createTestProfile?.useMutation?.({
    onSuccess: () => {
      toast.success('Test profile created');
      (utils as any).admin?.listTestProfiles?.invalidate?.();
    },
    onError: (err: any) => toast.error(err.message || 'Failed to create profile'),
  }) ?? { mutate: () => {}, isPending: false };
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');

  // Route guard: business owners should use /dashboard, not athlete dashboard
  useEffect(() => {
    if (!loading && user && user.accountType === 'business_owner' && user.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [loading, user, navigate]);

  // Data queries - context-switch between real user and test profile
  const hasTestProfile = isAdmin && !!activeTestProfileId;

  // Real user data (always fetched for fallback)
  const { data: realClaims, isLoading: realClaimsLoading } = trpc.consumerClaim.myClaims.useQuery(
    undefined,
    { enabled: !!user && !hasTestProfile }
  );
  const { data: realSavedBusinesses, isLoading: realSavedLoading } = trpc.savedBusiness.list.useQuery(
    undefined,
    { enabled: !!user && !hasTestProfile }
  );
  const { data: athleteProfile, isLoading: profileLoading } = trpc.athleteProfile.get.useQuery(
    undefined,
    { enabled: !!user && !hasTestProfile }
  );

  // Test profile data (fetched when test profile is active)
  const testProfileInput = useMemo(() => activeTestProfileId ? { testProfileId: activeTestProfileId } : { testProfileId: 0 }, [activeTestProfileId]);
  const { data: testProfileClaims, isLoading: testClaimsLoading } = (trpc as any).admin?.testProfileClaims?.useQuery?.(
    testProfileInput,
    { enabled: hasTestProfile }
  ) ?? { data: undefined, isLoading: false };
  const { data: testProfileSaved, isLoading: testSavedLoading } = (trpc as any).admin?.testProfileSavedBusinesses?.useQuery?.(
    testProfileInput,
    { enabled: hasTestProfile }
  ) ?? { data: undefined, isLoading: false };

  // Merged data - use test profile data when active, otherwise real data
  const claims = hasTestProfile ? testProfileClaims : realClaims;
  const claimsLoading = hasTestProfile ? testClaimsLoading : realClaimsLoading;
  const savedBusinesses = hasTestProfile ? testProfileSaved : realSavedBusinesses;
  const savedLoading = hasTestProfile ? testSavedLoading : realSavedLoading;

  // When test profile is active, create a synthetic athleteProfile from the test profile data
  const effectiveProfile = useMemo(() => {
    if (hasTestProfile && activeTestProfile) {
      return {
        id: activeTestProfile.id,
        displayName: activeTestProfile.displayName || activeTestProfile.profileName,
        sportIds: activeTestProfile.sportIds,
        experienceLevels: activeTestProfile.experienceLevels,
        city: activeTestProfile.city,
        state: activeTestProfile.state,
        country: activeTestProfile.country,
        interests: activeTestProfile.interests,
        goals: activeTestProfile.goals,
        referralSource: '',
        newsletterOptIn: true,
        notificationPreference: 'both',
      };
    }
    return athleteProfile;
  }, [hasTestProfile, activeTestProfile, athleteProfile]);

  const { data: unreadCount } = trpc.notification.unreadCount.useQuery(
    undefined,
    { enabled: !!user, refetchInterval: 30000 }
  );
  const recsInput = useMemo(() => activeTestProfileId ? { testProfileId: activeTestProfileId } : undefined, [activeTestProfileId]);
  const { data: recommendations, isLoading: recsLoading } = (trpc.recommendation.forYou as any).useQuery(
    recsInput,
    { enabled: !!user }
  );
  // Analytics derived from claims data
  const { data: sportCategories } = trpc.categories.sportCategories.useQuery();

  // Mutations - context-switch between real user and test profile
  const realUnsaveMutation = trpc.savedBusiness.unsave.useMutation({
    onSuccess: () => {
      utils.savedBusiness.list.invalidate();
      toast.success("Business removed from saved list.");
    },
  });
  const testUnsaveMutation = (trpc as any).admin?.testProfileUnsaveBusiness?.useMutation?.({
    onSuccess: () => {
      (utils as any).admin?.testProfileSavedBusinesses?.invalidate?.();
      toast.success("Business removed from test profile's saved list.");
    },
  }) ?? { mutate: () => {}, isPending: false };

  const unsaveMutation = {
    mutate: (args: any) => {
      if (hasTestProfile) {
        testUnsaveMutation.mutate({ testProfileId: activeTestProfileId!, businessId: args.businessId });
      } else {
        realUnsaveMutation.mutate(args);
      }
    },
    isPending: hasTestProfile ? testUnsaveMutation.isPending : realUnsaveMutation.isPending,
  };

  const verifyClaim = trpc.consumerClaim.verify.useMutation({
    onSuccess: () => {
      utils.consumerClaim.myClaims.invalidate();
      toast.success("Thanks for the feedback!");
    },
  });

  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
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
    notificationPreference: "both" as string,
  });

  // Populate edit form when entering edit mode - uses effectiveProfile (real or test profile)
  useEffect(() => {
    if (isEditingProfile && effectiveProfile) {
      const sportIds = effectiveProfile.sportIds ? JSON.parse(effectiveProfile.sportIds) : [];
      const expLevels = effectiveProfile.experienceLevels ? JSON.parse(effectiveProfile.experienceLevels) : {};
      const interests = effectiveProfile.interests ? JSON.parse(effectiveProfile.interests) : [];
      setEditForm({
        displayName: effectiveProfile.displayName || user?.contactName || user?.name || "",
        selectedSports: sportIds,
        experienceLevels: expLevels,
        city: effectiveProfile.city || "",
        state: effectiveProfile.state || "",
        country: effectiveProfile.country || "",
        interests,
        goals: effectiveProfile.goals || "",
        referralSource: (effectiveProfile as any).referralSource || "",
        newsletterOptIn: (effectiveProfile as any).newsletterOptIn ?? true,
        notificationPreference: (effectiveProfile as any).notificationPreference || "both",
      });
    }
  }, [isEditingProfile, effectiveProfile, user]);

  // Real profile save mutation
  const realSaveProfileMutation = trpc.athleteProfile.save.useMutation({
    onSuccess: () => {
      utils.athleteProfile.get.invalidate();
      utils.auth.me.invalidate();
      toast.success("Profile updated!");
      setIsEditingProfile(false);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to save profile.");
    },
  });

  // Test profile save mutation
  const testSaveProfileMutation = (trpc as any).admin?.updateTestProfile?.useMutation?.({
    onSuccess: () => {
      (utils as any).admin?.listTestProfiles?.invalidate?.();
      toast.success("Test profile updated!");
      setIsEditingProfile(false);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update test profile.");
    },
  }) ?? { mutate: () => {}, isPending: false };

  const saveProfileMutation = {
    mutate: (args: any) => {
      if (hasTestProfile) {
        testSaveProfileMutation.mutate(args);
      } else {
        realSaveProfileMutation.mutate(args);
      }
    },
    isPending: hasTestProfile ? testSaveProfileMutation.isPending : realSaveProfileMutation.isPending,
  };

  const handleSaveProfile = () => {
    if (hasTestProfile && activeTestProfileId) {
      // Save to test profile via admin.updateTestProfile
      testSaveProfileMutation.mutate({
        id: activeTestProfileId,
        profileName: editForm.displayName || activeTestProfile?.profileName || 'Test Profile',
        displayName: editForm.displayName || undefined,
        sportIds: editForm.selectedSports.length > 0 ? editForm.selectedSports : undefined,
        experienceLevels: Object.keys(editForm.experienceLevels).length > 0 ? editForm.experienceLevels : undefined,
        city: editForm.city || undefined,
        state: editForm.state || undefined,
        country: editForm.country || undefined,
        interests: editForm.interests.length > 0 ? editForm.interests : undefined,
        goals: editForm.goals || undefined,
      });
      return;
    }
    realSaveProfileMutation.mutate({
      displayName: editForm.displayName || undefined,
      sportIds: editForm.selectedSports.length > 0 ? JSON.stringify(editForm.selectedSports) : undefined,
      experienceLevels: Object.keys(editForm.experienceLevels).length > 0 ? JSON.stringify(editForm.experienceLevels) : undefined,
      city: editForm.city || undefined,
      state: editForm.state || undefined,
      country: editForm.country || undefined,
      interests: editForm.interests.length > 0 ? JSON.stringify(editForm.interests) : undefined,
      goals: editForm.goals || undefined,
      referralSource: editForm.referralSource || undefined,
      newsletterOptIn: editForm.newsletterOptIn,
      notificationPreference: editForm.notificationPreference as any,
    });
  };

  const toggleEditSport = (id: number) => {
    setEditForm(prev => {
      const selected = prev.selectedSports.includes(id)
        ? prev.selectedSports.filter(s => s !== id)
        : [...prev.selectedSports, id];
      const levels = { ...prev.experienceLevels };
      if (!selected.includes(id)) delete levels[id];
      return { ...prev, selectedSports: selected, experienceLevels: levels };
    });
  };

  const toggleEditInterest = (value: string) => {
    setEditForm(prev => ({
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

  const tabs: { id: TabId; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: "offers", label: "My Offers", icon: <Ticket className="w-4 h-4" />, count: claims?.length },
    { id: "saved", label: "Saved Businesses", icon: <Bookmark className="w-4 h-4" />, count: savedBusinesses?.length },
    { id: "notifications", label: "Notifications", icon: <Bell className="w-4 h-4" />, count: unreadCount ?? undefined },
    { id: "profile", label: "My Profile", icon: <User className="w-4 h-4" /> },
  ];

  const getSportName = (id: number) => {
    const sport = sportCategories?.find((s: any) => s.id === id);
    return sport?.name || `Sport #${id}`;
  };

  const parsedSportIds: number[] = effectiveProfile?.sportIds
    ? JSON.parse(effectiveProfile.sportIds)
    : [];
  const parsedExperience: Record<string, string> = effectiveProfile?.experienceLevels
    ? JSON.parse(effectiveProfile.experienceLevels)
    : {};
  const parsedInterests: string[] = effectiveProfile?.interests
    ? JSON.parse(effectiveProfile.interests)
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-[oklch(0.22_0.02_50)] text-white py-8 md:py-10">
          <div className="container">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                  Hey, {activeTestProfile ? activeTestProfile.displayName || activeTestProfile.profileName : (user?.contactName || user?.name)?.split(' ')[0] || 'Athlete'} 👋
                </h1>
                <p className="text-white/60 mt-1" style={{ textTransform: "none", letterSpacing: "normal" }}>
                  {activeTestProfile
                    ? <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-violet-400" />Viewing as test profile: <strong className="text-violet-300">{activeTestProfile.profileName}</strong></span>
                    : 'Your deals, your saves, your profile. All the stuff that matters.'
                  }
                </p>

                {/* Admin Profile Switcher */}
                {isAdmin && testProfiles && testProfiles.length > 0 && (
                  <div className="relative mt-2">
                    <button
                      onClick={() => setShowProfileSwitcher(!showProfileSwitcher)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-600/20 border border-violet-500/30 text-violet-200 text-xs hover:bg-violet-600/30 transition-colors"
                      style={{ textTransform: 'none' }}
                    >
                      <Users className="w-3.5 h-3.5" />
                      {activeTestProfile ? `Profile: ${activeTestProfile.profileName}` : 'Switch Test Profile'}
                      <ChevronDown className={`w-3 h-3 transition-transform ${showProfileSwitcher ? 'rotate-180' : ''}`} />
                    </button>

                    {showProfileSwitcher && (
                      <div className="absolute top-full left-0 mt-1 w-72 bg-card border border-border rounded-lg shadow-xl z-50 py-1 max-h-64 overflow-y-auto">
                        <button
                          onClick={() => { setActiveTestProfileId(null); setShowProfileSwitcher(false); }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-muted/50 transition-colors flex items-center gap-2 ${
                            !activeTestProfileId ? 'bg-primary/10 text-primary' : 'text-foreground'
                          }`}
                          style={{ textTransform: 'none' }}
                        >
                          <User className="w-4 h-4" />
                          <div>
                            <div className="font-medium">My Real Account</div>
                            <div className="text-xs text-muted-foreground">{user?.contactName || user?.name}</div>
                          </div>
                          {!activeTestProfileId && <Check className="w-4 h-4 ml-auto text-primary" />}
                        </button>
                        <div className="border-t border-border my-1" />
                        <div className="px-3 py-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Test Profiles</div>
                        {testProfiles.map((p: any) => (
                          <button
                            key={p.id}
                            onClick={() => { setActiveTestProfileId(p.id); setShowProfileSwitcher(false); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-muted/50 transition-colors flex items-center gap-2 ${
                              activeTestProfileId === p.id ? 'bg-violet-500/10 text-violet-400' : 'text-foreground'
                            }`}
                            style={{ textTransform: 'none' }}
                          >
                            <div className="w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 text-xs font-bold">
                              {(p.displayName || p.profileName || '?').charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{p.profileName}</div>
                              <div className="text-xs text-muted-foreground truncate">
                                {[p.city, p.region].filter(Boolean).join(' · ') || 'No location set'}
                                {p.sportIds?.length > 0 && ` · ${p.sportIds.length} sport${p.sportIds.length > 1 ? 's' : ''}`}
                              </div>
                            </div>
                            {activeTestProfileId === p.id && <Check className="w-4 h-4 ml-auto text-violet-400" />}
                          </button>
                        ))}
                        {/* Delete active test profile */}
                        {activeTestProfileId && (
                          <>
                            <div className="border-t border-border my-1" />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <button
                                  className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors flex items-center gap-2"
                                  style={{ textTransform: 'none' }}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  Delete "{testProfiles.find((p: any) => p.id === activeTestProfileId)?.profileName}"
                                </button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Test Profile?</AlertDialogTitle>
                                  <AlertDialogDescription style={{ textTransform: 'none', letterSpacing: 'normal' }}>
                                    This will permanently delete the test profile "{testProfiles.find((p: any) => p.id === activeTestProfileId)?.profileName}". This cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel style={{ textTransform: 'none' }}>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-red-600 hover:bg-red-700"
                                    style={{ textTransform: 'none' }}
                                    onClick={() => {
                                      deleteTestProfileMut.mutate({ id: activeTestProfileId });
                                    }}
                                  >
                                    Yes, Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Admin Profile Management Buttons */}
                {isAdmin && (
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <button
                      onClick={() => setShowCreateForm(!showCreateForm)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-200 text-xs hover:bg-emerald-600/30 transition-colors"
                      style={{ textTransform: 'none' }}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Profile
                    </button>
                    <Link href="/admin?tab=test-profiles">
                      <span
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white/70 text-xs hover:bg-white/20 transition-colors cursor-pointer"
                        style={{ textTransform: 'none' }}
                      >
                        <UserCog className="w-3.5 h-3.5" />
                        Manage Profiles
                      </span>
                    </Link>
                  </div>
                )}

                {/* Quick Create Profile Form */}
                {isAdmin && showCreateForm && (
                  <div className="mt-2 p-3 rounded-lg bg-white/5 border border-white/10 max-w-sm">
                    <div className="text-xs text-white/60 mb-2" style={{ textTransform: 'none' }}>Quick Create Test Profile</div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newProfileName}
                        onChange={(e) => setNewProfileName(e.target.value)}
                        placeholder="Profile name (e.g., 'Denver Cyclist')"
                        className="flex-1 px-2 py-1.5 rounded bg-white/10 border border-white/20 text-white text-xs placeholder:text-white/30 outline-none focus:border-violet-400"
                        style={{ textTransform: 'none' }}
                      />
                      <button
                        onClick={() => {
                          if (newProfileName.trim()) {
                            createTestProfileMut.mutate({ profileName: newProfileName.trim() });
                            setNewProfileName('');
                            setShowCreateForm(false);
                          }
                        }}
                        disabled={!newProfileName.trim() || createTestProfileMut.isPending}
                        className="px-3 py-1.5 rounded bg-violet-600 text-white text-xs hover:bg-violet-700 disabled:opacity-50 transition-colors"
                        style={{ textTransform: 'none' }}
                      >
                        {createTestProfileMut.isPending ? 'Creating...' : 'Create'}
                      </button>
                    </div>
                    <p className="text-[10px] text-white/40 mt-1" style={{ textTransform: 'none' }}>You can add sport/location details in the Admin Panel.</p>
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="flex gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{claims?.length || 0}</div>
                  <div className="text-xs text-white/50" style={{ textTransform: "none" }}>Offers Claimed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{claims?.filter((c: any) => c.claim.status === 'redeemed').length || 0}</div>
                  <div className="text-xs text-white/50" style={{ textTransform: "none" }}>Redeemed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-400">{savedBusinesses?.length || 0}</div>
                  <div className="text-xs text-white/50" style={{ textTransform: "none" }}>Saved</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Test Profile Context Banner */}
        {hasTestProfile && activeTestProfile && (
          <div className="bg-violet-600/10 border-b border-violet-500/30">
            <div className="container py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4 text-violet-500" />
                  <span className="text-violet-700 dark:text-violet-300" style={{ textTransform: 'none' }}>
                    <strong>Test Mode:</strong> Viewing as <strong>{activeTestProfile.displayName || activeTestProfile.profileName}</strong>
                    {activeTestProfile.city && <span className="text-violet-500"> · {[activeTestProfile.city, activeTestProfile.state].filter(Boolean).join(', ')}</span>}
                  </span>
                </div>
                <button
                  onClick={() => setActiveTestProfileId(null)}
                  className="text-xs text-violet-500 hover:text-violet-700 dark:hover:text-violet-300 flex items-center gap-1"
                  style={{ textTransform: 'none' }}
                >
                  <X className="w-3 h-3" /> Exit Test Mode
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <section className="border-b border-border bg-card">
          <div className="container">
            <div className="flex gap-1 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  }`}
                  style={{ textTransform: "none" }}
                >
                  {tab.icon}
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0">
                      {tab.count}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Recommended For You */}
        {recommendations && recommendations.length > 0 && (
          <section className="py-6 bg-gradient-to-b from-muted/30 to-transparent">
            <div className="container">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                    Recommended For You
                  </h2>
                  {activeTestProfile && (
                    <Badge variant="outline" className="text-[10px] border-violet-500/30 text-violet-400 bg-violet-500/10">
                      <Shield className="w-3 h-3 mr-1" />
                      Filtered for: {activeTestProfile.profileName}
                    </Badge>
                  )}
                </div>
                <Link href="/directory">
                  <Button variant="ghost" size="sm" className="text-xs gap-1" style={{ textTransform: "none" }}>
                    View All <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {recommendations.slice(0, 8).map((biz: any) => (
                  <Link key={biz.id} href={`/business/${biz.slug}`}>
                    <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <BusinessLogo
                            logoUrl={biz.logoUrl}
                            businessName={biz.name}
                            size="w-10 h-10"
                            iconSize="w-5 h-5"
                          />
                          <div className="min-w-0">
                            <h3 className="font-semibold text-sm group-hover:text-primary transition-colors truncate" style={{ textTransform: "none" }}>
                              {biz.name}
                            </h3>
                            <p className="text-xs text-muted-foreground" style={{ textTransform: "none" }}>
                              {biz.businessTypeName}
                            </p>
                          </div>
                        </div>
                        {biz.city && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            <span style={{ textTransform: "none" }}>{biz.city}{biz.region ? `, ${biz.region}` : ''}</span>
                          </div>
                        )}
                        {biz.googleRating > 0 && (
                          <div className="flex items-center gap-1 mt-1 text-xs">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            <span className="text-muted-foreground">{Number(biz.googleRating).toFixed(1)}</span>
                          </div>
                        )}
                        <div className="mt-2">
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {biz.matchReason === 'near_you' ? '📍 Near you' :
                             biz.matchReason === 'your_sport' ? '🏅 Your sport' :
                             biz.matchReason === 'your_interest' ? '🎯 Matches interests' :
                             '🔥 Popular'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Tab Content */}
        <section className="py-8">
          <div className="container max-w-4xl">

            {/* ─── My Offers Tab ─── */}
            {activeTab === "offers" && (
              <div>
                {claimsLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : !claims || claims.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="py-16 text-center">
                      <Gift className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
                      <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: "var(--font-heading)" }}>
                        No offers claimed yet
                      </h3>
                      <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6" style={{ textTransform: "none", letterSpacing: "normal" }}>
                        Browse the marketplace, find a deal that doesn't require selling a kidney, and claim it. Your claimed offers will show up here.
                      </p>
                      <Link href="/referral-offers">
                        <Button className="gap-2" style={{ textTransform: "none" }}>
                          Browse Offers <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {claims.map((item: any) => (
                      <Card key={item.claim.id} className="overflow-hidden">
                        <CardContent className="p-4 md:p-6">
                          <div className="flex flex-col md:flex-row md:items-start gap-4">
                            {/* Business Info */}
                            <div className="flex-1">
                              <div className="flex items-start gap-3">
                                <BusinessLogo
                                  logoUrl={item.business.logoUrl}
                                  businessName={item.business.name}
                                  size="w-10 h-10"
                                  iconSize="w-5 h-5"
                                />
                                <div>
                                  <Link href={`/business/${item.business.slug}`}>
                                    <span className="font-semibold text-foreground hover:text-primary transition-colors cursor-pointer" style={{ textTransform: "none" }}>
                                      {item.business.name}
                                    </span>
                                  </Link>
                                  <p className="text-sm text-muted-foreground mt-0.5" style={{ textTransform: "none" }}>
                                    {item.offer.title}
                                  </p>
                                </div>
                              </div>

                              {item.offer.description && (
                                <p className="text-sm text-muted-foreground mt-2 line-clamp-2" style={{ textTransform: "none", letterSpacing: "normal" }}>
                                  {item.offer.description}
                                </p>
                              )}

                              {/* Claim Code */}
                              <div className="mt-3 flex items-center gap-2">
                                <span className="text-xs text-muted-foreground" style={{ textTransform: "none" }}>Claim Code:</span>
                                <code className="text-sm font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                                  {item.claim.claimCode}
                                </code>
                              </div>
                            </div>

                            {/* Status & Actions */}
                            <div className="flex flex-col items-end gap-2 shrink-0">
                              {item.claim.status === 'claimed' && (
                                <>
                                  <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                                    <Clock className="w-3 h-3 mr-1" /> Claimed
                                  </Badge>
                                  <div className="flex gap-2 mt-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-green-600 border-green-600/30 hover:bg-green-600/10 gap-1"
                                      style={{ textTransform: "none" }}
                                      onClick={() => verifyClaim.mutate({
                                        claimId: item.claim.id,
                                        honored: true,
                                      })}
                                      disabled={verifyClaim.isPending}
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5" /> They honored it
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-red-500 border-red-500/30 hover:bg-red-500/10 gap-1"
                                      style={{ textTransform: "none" }}
                                      onClick={() => verifyClaim.mutate({
                                        claimId: item.claim.id,
                                        honored: false,
                                        notes: "Business did not honor the offer",
                                      })}
                                      disabled={verifyClaim.isPending}
                                    >
                                      <AlertTriangle className="w-3.5 h-3.5" /> Nope
                                    </Button>
                                  </div>
                                </>
                              )}
                              {item.claim.status === 'redeemed' && (
                                <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                                  <CheckCircle2 className="w-3 h-3 mr-1" /> Redeemed
                                </Badge>
                              )}
                              {item.claim.status === 'disputed' && (
                                <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
                                  <AlertTriangle className="w-3 h-3 mr-1" /> Disputed
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground" style={{ textTransform: "none" }}>
                                {new Date(item.claim.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ─── Saved Businesses Tab ─── */}
            {activeTab === "saved" && (
              <div>
                {savedLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : !savedBusinesses || savedBusinesses.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="py-16 text-center">
                      <Bookmark className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
                      <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: "var(--font-heading)" }}>
                        No saved businesses yet
                      </h3>
                      <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6" style={{ textTransform: "none", letterSpacing: "normal" }}>
                        Found a coach you like? A shop that doesn't upsell you on everything? Save them here so you don't lose track.
                      </p>
                      <Link href="/directory">
                        <Button className="gap-2" style={{ textTransform: "none" }}>
                          Browse Directory <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedBusinesses.map((item: any) => (
                      <Card key={item.savedBusiness.id} className="overflow-hidden hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <BusinessLogo
                              logoUrl={item.business.logoUrl}
                              businessName={item.business.name}
                            />
                            <div className="flex-1 min-w-0">
                              <Link href={`/business/${item.business.slug}`}>
                                <span className="font-semibold text-foreground hover:text-primary transition-colors cursor-pointer line-clamp-1" style={{ textTransform: "none" }}>
                                  {item.business.name}
                                </span>
                              </Link>
                              {item.businessType && (
                                <p className="text-xs text-muted-foreground mt-0.5" style={{ textTransform: "none" }}>
                                  {item.businessType.name}
                                </p>
                              )}
                              {(item.business.city || item.business.region) && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1" style={{ textTransform: "none" }}>
                                  <MapPin className="w-3 h-3" />
                                  {[item.business.city, item.business.region].filter(Boolean).join(', ')}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-1 shrink-0">
                              <Link href={`/business/${item.business.slug}`}>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                  <ExternalLink className="w-4 h-4" />
                                </Button>
                              </Link>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-muted-foreground hover:text-red-500"
                                onClick={() => unsaveMutation.mutate({ businessId: item.business.id })}
                                disabled={unsaveMutation.isPending}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ─── Notifications Tab ─── */}
            {activeTab === "notifications" && (
              <NotificationsTab />
            )}

            {/* ─── My Profile Tab ─── */}
            {activeTab === "profile" && (
              <ProfileTab
                user={user}
                athleteProfile={effectiveProfile}
                profileLoading={hasTestProfile ? false : profileLoading}
                sportCategories={sportCategories}
                parsedSportIds={parsedSportIds}
                parsedExperience={parsedExperience}
                parsedInterests={parsedInterests}
                getSportName={getSportName}
                isEditingProfile={isEditingProfile}
                setIsEditingProfile={setIsEditingProfile}
                editForm={editForm}
                setEditForm={setEditForm}
                toggleEditSport={toggleEditSport}
                toggleEditInterest={toggleEditInterest}
                handleSaveProfile={handleSaveProfile}
                saveProfileMutation={saveProfileMutation}
              />
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

// ─── Notifications Tab Component ───
function NotificationsTab() {
  const { data: notifications, isLoading, refetch } = trpc.notification.list.useQuery({ limit: 50 });
  const utils = trpc.useUtils();

  const markRead = trpc.notification.markRead.useMutation({
    onSuccess: () => { refetch(); utils.notification.unreadCount.invalidate(); },
  });
  const markAllRead = trpc.notification.markAllRead.useMutation({
    onSuccess: () => { refetch(); utils.notification.unreadCount.invalidate(); },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!notifications || notifications.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-16 text-center">
          <Bell className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: "var(--font-heading)" }}>
            No notifications yet
          </h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto" style={{ textTransform: "none", letterSpacing: "normal" }}>
            Save some businesses you like and we'll ping you here when they post new offers. It's like a deal radar, but less annoying.
          </p>
        </CardContent>
      </Card>
    );
  }

  const hasUnread = notifications.some((n: any) => !n.notification.isRead);

  return (
    <div className="space-y-4">
      {hasUnread && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs gap-1.5"
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
            style={{ textTransform: "none" }}
          >
            <CheckCheck className="w-3.5 h-3.5" /> Mark all as read
          </Button>
        </div>
      )}

      {notifications.map((n: any) => (
        <Card
          key={n.notification.id}
          className={`overflow-hidden transition-colors ${
            !n.notification.isRead ? "border-primary/30 bg-primary/5" : ""
          }`}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <BusinessLogo
                logoUrl={n.business?.logoUrl}
                businessName={n.business?.name || ""}
                size="w-10 h-10"
                iconSize="w-5 h-5"
              />
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${!n.notification.isRead ? "font-semibold text-foreground" : "text-muted-foreground"}`} style={{ textTransform: "none" }}>
                  {n.notification.title}
                </p>
                {n.notification.message && (
                  <p className="text-xs text-muted-foreground mt-0.5" style={{ textTransform: "none", letterSpacing: "normal" }}>
                    {n.notification.message}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] text-muted-foreground">
                    {formatNotificationTime(new Date(n.notification.createdAt))}
                  </span>
                  {n.business?.slug && (
                    <Link href={`/business/${n.business.slug}`}>
                      <span className="text-xs text-primary hover:underline cursor-pointer flex items-center gap-0.5" style={{ textTransform: "none" }}>
                        View Business <ExternalLink className="w-3 h-3" />
                      </span>
                    </Link>
                  )}
                  {!n.notification.isRead && (
                    <button
                      onClick={() => markRead.mutate({ notificationId: n.notification.id })}
                      className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-0.5"
                      style={{ textTransform: "none" }}
                    >
                      <Check className="w-3 h-3" /> Mark read
                    </button>
                  )}
                </div>
              </div>
              {!n.notification.isRead && (
                <div className="w-2.5 h-2.5 rounded-full bg-primary shrink-0 mt-1.5" />
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function formatNotificationTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}


// ─── Constants for Profile Edit ───
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
  "Word of mouth", "Social media", "Google search",
  "A business on SportConnect", "Blog / article", "Podcast", "Other",
];
const NOTIFICATION_OPTIONS = [
  { value: "both", label: "In-App + Email", icon: <BellRing className="w-4 h-4" />, desc: "Get notified everywhere" },
  { value: "in_app_only", label: "In-App Only", icon: <Bell className="w-4 h-4" />, desc: "Notifications in the app only" },
  { value: "email_only", label: "Email Only", icon: <Mail className="w-4 h-4" />, desc: "Email notifications only" },
  { value: "none", label: "None", icon: <BellOff className="w-4 h-4" />, desc: "No notifications" },
];

// ─── Profile Tab Component ───
function ProfileTab({
  user, athleteProfile, profileLoading, sportCategories,
  parsedSportIds, parsedExperience, parsedInterests, getSportName,
  isEditingProfile, setIsEditingProfile, editForm, setEditForm,
  toggleEditSport, toggleEditInterest, handleSaveProfile, saveProfileMutation,
}: {
  user: any;
  athleteProfile: any;
  profileLoading: boolean;
  sportCategories: any;
  parsedSportIds: number[];
  parsedExperience: Record<string, string>;
  parsedInterests: string[];
  getSportName: (id: number) => string;
  isEditingProfile: boolean;
  setIsEditingProfile: (v: boolean) => void;
  editForm: any;
  setEditForm: (fn: any) => void;
  toggleEditSport: (id: number) => void;
  toggleEditInterest: (value: string) => void;
  handleSaveProfile: () => void;
  saveProfileMutation: any;
}) {
  if (profileLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!athleteProfile && !isEditingProfile) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-16 text-center">
          <User className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: "var(--font-heading)" }}>
            Profile not set up yet
          </h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6" style={{ textTransform: "none", letterSpacing: "normal" }}>
            Tell us about your sports and what you're looking for. Takes 60 seconds and helps us recommend the right businesses.
          </p>
          <Link href="/onboarding?type=athlete">
            <Button className="gap-2" style={{ textTransform: "none" }}>
              Set Up Profile <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (isEditingProfile) {
    const isPending = saveProfileMutation.isPending;
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
                <Pencil className="w-5 h-5 text-primary" />
                Edit Profile
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setIsEditingProfile(false)} className="gap-1 text-muted-foreground" style={{ textTransform: "none" }}>
                <X className="w-4 h-4" /> Cancel
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Display Name */}
            <div>
              <Label className="text-sm font-semibold" style={{ textTransform: "none" }}>Display Name</Label>
              <Input
                value={editForm.displayName}
                onChange={(e: any) => setEditForm((prev: any) => ({ ...prev, displayName: e.target.value }))}
                placeholder="Your name or trail alias"
                className="mt-1.5 text-sm"
                style={{ textTransform: "none" }}
              />
            </div>

            {/* Sports Selection */}
            <div>
              <Label className="text-sm font-semibold flex items-center gap-1.5" style={{ textTransform: "none" }}>
                <Bike className="w-4 h-4" /> Sports
              </Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {sportCategories?.map((sport: any) => (
                  <button
                    key={sport.id}
                    type="button"
                    onClick={() => toggleEditSport(sport.id)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                      editForm.selectedSports.includes(sport.id)
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

            {/* Experience Levels */}
            {editForm.selectedSports.length > 0 && (
              <div>
                <Label className="text-sm font-semibold flex items-center gap-1.5" style={{ textTransform: "none" }}>
                  <Zap className="w-4 h-4" /> Experience Level
                </Label>
                <div className="space-y-3 mt-2">
                  {editForm.selectedSports.map((sportId: number) => {
                    const sport = sportCategories?.find((s: any) => s.id === sportId);
                    if (!sport) return null;
                    return (
                      <div key={sportId} className="flex items-center gap-3 flex-wrap">
                        <span className="text-sm font-medium w-28 shrink-0" style={{ textTransform: "none" }}>{sport.name}</span>
                        <div className="flex flex-wrap gap-1.5">
                          {EXPERIENCE_LEVELS.map(level => (
                            <button
                              key={level.value}
                              type="button"
                              onClick={() => setEditForm((prev: any) => ({
                                ...prev,
                                experienceLevels: { ...prev.experienceLevels, [sportId]: level.value },
                              }))}
                              className={`px-2.5 py-1.5 rounded text-xs font-medium transition-colors border flex flex-col items-center gap-0.5 ${
                                editForm.experienceLevels[sportId] === level.value
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "bg-muted text-muted-foreground border-border hover:border-primary/40"
                              }`}
                              style={{ textTransform: "none" }}
                            >
                              <span>{level.label}</span>
                              <span className={`text-[10px] font-normal ${
                                editForm.experienceLevels[sportId] === level.value
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
              <Label className="text-sm font-semibold flex items-center gap-1.5" style={{ textTransform: "none" }}>
                <MapPin className="w-4 h-4" /> Location
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                <Input
                  value={editForm.city}
                  onChange={(e: any) => setEditForm((prev: any) => ({ ...prev, city: e.target.value }))}
                  placeholder="City"
                  className="text-sm"
                  style={{ textTransform: "none" }}
                />
                <Input
                  value={editForm.state}
                  onChange={(e: any) => setEditForm((prev: any) => ({ ...prev, state: e.target.value }))}
                  placeholder="State / Province"
                  className="text-sm"
                  style={{ textTransform: "none" }}
                />
                <Input
                  value={editForm.country}
                  onChange={(e: any) => setEditForm((prev: any) => ({ ...prev, country: e.target.value }))}
                  placeholder="Country"
                  className="text-sm"
                  style={{ textTransform: "none" }}
                />
              </div>
            </div>

            {/* Interests */}
            <div>
              <Label className="text-sm font-semibold flex items-center gap-1.5" style={{ textTransform: "none" }}>
                <Target className="w-4 h-4" /> What kind of services interest you?
              </Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {INTEREST_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleEditInterest(opt.value)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                      editForm.interests.includes(opt.value)
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
              <Label className="text-sm font-semibold" style={{ textTransform: "none" }}>Goals</Label>
              <Textarea
                value={editForm.goals}
                onChange={(e: any) => setEditForm((prev: any) => ({ ...prev, goals: e.target.value }))}
                placeholder="Training for a century ride, recovering from a knee thing..."
                className="mt-1.5 text-sm min-h-[80px]"
                style={{ textTransform: "none" }}
              />
            </div>

            {/* How did you find us */}
            <div>
              <Label className="text-sm font-semibold" style={{ textTransform: "none" }}>How did you find us?</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {REFERRAL_SOURCES.map((source) => (
                  <button
                    key={source}
                    type="button"
                    onClick={() => setEditForm((prev: any) => ({ ...prev, referralSource: source }))}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                      editForm.referralSource === source
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

            {/* Newsletter */}
            <div className="flex items-start gap-3">
              <Checkbox
                id="newsletter-edit"
                checked={editForm.newsletterOptIn}
                onCheckedChange={(checked: any) =>
                  setEditForm((prev: any) => ({ ...prev, newsletterOptIn: checked === true }))
                }
                className="mt-0.5"
              />
              <label htmlFor="newsletter-edit" className="text-sm text-muted-foreground cursor-pointer" style={{ textTransform: "none" }}>
                Send me occasional updates about new businesses, deals, and features.
              </label>
            </div>

            {/* Notification Preferences */}
            <div>
              <Label className="text-sm font-semibold flex items-center gap-1.5 mb-3" style={{ textTransform: "none" }}>
                <Bell className="w-4 h-4" /> Notification Preferences
              </Label>
              <p className="text-xs text-muted-foreground mb-3" style={{ textTransform: "none" }}>
                Choose how you'd like to receive notifications about referrals, offers, and updates.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {NOTIFICATION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setEditForm((prev: any) => ({ ...prev, notificationPreference: opt.value }))}
                    className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                      editForm.notificationPreference === opt.value
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <span className={editForm.notificationPreference === opt.value ? "text-primary" : "text-muted-foreground"}>
                      {opt.icon}
                    </span>
                    <div>
                      <span className="text-sm font-medium block" style={{ textTransform: "none" }}>{opt.label}</span>
                      <span className="text-xs text-muted-foreground" style={{ textTransform: "none" }}>{opt.desc}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Save / Cancel */}
            <div className="flex items-center gap-3 pt-4 border-t border-border">
              <Button
                variant="ghost"
                className="text-muted-foreground gap-2"
                style={{ textTransform: "none" }}
                onClick={() => setIsEditingProfile(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <div className="flex-1" />
              <Button
                className="gap-2"
                style={{ textTransform: "none" }}
                onClick={handleSaveProfile}
                disabled={isPending}
              >
                {isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                ) : (
                  <><Save className="w-4 h-4" /> Save Changes</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // View mode
  return (
    <div className="space-y-6">
      {/* Profile Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
              <User className="w-5 h-5 text-primary" />
              {athleteProfile.displayName || user?.contactName || user?.name || "Athlete"}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              style={{ textTransform: "none" }}
              onClick={() => setIsEditingProfile(true)}
            >
              <Pencil className="w-3.5 h-3.5" /> Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Location */}
          {(athleteProfile.city || athleteProfile.country) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground" style={{ textTransform: "none" }}>
              <MapPin className="w-4 h-4 shrink-0" />
              {[athleteProfile.city, athleteProfile.state, athleteProfile.country].filter(Boolean).join(', ')}
            </div>
          )}

          {/* Sports */}
          {parsedSportIds.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5" style={{ textTransform: "none" }}>
                <Bike className="w-4 h-4 text-primary" /> Sports
              </h4>
              <div className="flex flex-wrap gap-2">
                {parsedSportIds.map((id: number) => (
                  <Badge key={id} variant="secondary" className="text-xs">
                    {getSportName(id)}
                    {parsedExperience[id.toString()] && (
                      <span className="ml-1 text-primary">
                        · {parsedExperience[id.toString()]}
                      </span>
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Interests */}
          {parsedInterests.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5" style={{ textTransform: "none" }}>
                <Target className="w-4 h-4 text-primary" /> Looking For
              </h4>
              <div className="flex flex-wrap gap-2">
                {parsedInterests.map((interest: string) => (
                  <Badge key={interest} variant="outline" className="text-xs capitalize">
                    {interest.replace(/_/g, ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Goals */}
          {athleteProfile.goals && (
            <div>
              <h4 className="text-sm font-semibold mb-1" style={{ textTransform: "none" }}>Goals</h4>
              <p className="text-sm text-muted-foreground" style={{ textTransform: "none", letterSpacing: "normal" }}>
                {athleteProfile.goals}
              </p>
            </div>
          )}

          {/* Notification Preferences */}
          <div className="pt-3 border-t border-border">
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5" style={{ textTransform: "none" }}>
              <Bell className="w-4 h-4 text-primary" /> Notification Preferences
            </h4>
            <div className="text-sm text-muted-foreground" style={{ textTransform: "none" }}>
              {(() => {
                const pref = (athleteProfile as any).notificationPreference || "both";
                const opt = NOTIFICATION_OPTIONS.find(o => o.value === pref);
                return opt ? (
                  <span className="flex items-center gap-2">
                    {opt.icon} {opt.label} — {opt.desc}
                  </span>
                ) : "Both (In-App + Email)";
              })()}
            </div>
          </div>

          {/* Newsletter & Referral Source */}
          <div className="text-xs text-muted-foreground pt-2 border-t border-border" style={{ textTransform: "none" }}>
            Newsletter: {athleteProfile.newsletterOptIn ? "Subscribed" : "Not subscribed"}
            {athleteProfile.referralSource && (
              <span className="ml-3">· Found us via: {athleteProfile.referralSource}</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
