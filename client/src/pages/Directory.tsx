import { useState, useMemo, useEffect, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Link, useSearch, useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Search, MapPin, Shield, Bike, Mountain, Snowflake, Star,
  ChevronLeft, ChevronRight, Filter, X, Compass, Globe, UserPlus,
  Gift, Tag, ExternalLink, Send, Mail, Plus, Check
} from "lucide-react";

const sportIcons: Record<string, React.ReactNode> = {
  cycling: <Bike className="w-4 h-4" />,
  running: <Mountain className="w-4 h-4" />,
  "trail-running": <Mountain className="w-4 h-4" />,
  snowsports: <Snowflake className="w-4 h-4" />,
  "sport-vacations": <Compass className="w-4 h-4" />,
};

const ITEMS_PER_PAGE = 12;

function MultiSelectDropdown({ label, options, selected, onChange, onAddNew }: {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (vals: string[]) => void;
  onAddNew?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (val: string) => {
    if (selected.includes(val)) {
      onChange(selected.filter(v => v !== val));
    } else {
      onChange([...selected, val]);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 h-9 px-3 rounded-md border border-input bg-transparent text-sm hover:bg-accent hover:text-accent-foreground transition-colors min-w-[140px]"
        style={{ textTransform: "none" }}
      >
        <span className="truncate">
          {selected.length === 0 ? label : `${label} (${selected.length})`}
        </span>
        <ChevronRight className={`w-3 h-3 ml-auto transition-transform ${open ? "rotate-90" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-56 max-h-64 overflow-y-auto bg-popover text-popover-foreground border border-border rounded-md shadow-lg z-50">
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => toggle(opt.value)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground text-left"
              style={{ textTransform: "none" }}
            >
              <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                selected.includes(opt.value) ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30"
              }`}>
                {selected.includes(opt.value) && <Check className="w-3 h-3" />}
              </div>
              <span className="truncate">{opt.label}</span>
            </button>
          ))}
          {onAddNew && (
            <button
              onClick={() => { setOpen(false); onAddNew(); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-accent border-t border-border"
              style={{ textTransform: "none" }}
            >
              <Plus className="w-4 h-4" /> Add New
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function Directory() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  const searchString = useSearch();
  const urlParams = useMemo(() => new URLSearchParams(searchString), [searchString]);
  const initialSport = urlParams.get("sport") || "";
  const initialRegion = urlParams.get("region") || "";
  const initialHub = urlParams.get("hub") || "";

  const [searchTerm, setSearchTerm] = useState("");
  const [sportFilters, setSportFilters] = useState<string[]>(initialSport ? [initialSport] : []);
  const [typeFilters, setTypeFilters] = useState<string[]>([]);
  const [regionFilters, setRegionFilters] = useState<string[]>(initialRegion ? [initialRegion] : []);
  const [hubFilters, setHubFilters] = useState<string[]>(initialHub ? [initialHub] : []);
  const [page, setPage] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Send referral dialog
  const [referralDialog, setReferralDialog] = useState<{ businessId: number; businessName: string } | null>(null);
  const [referralNote, setReferralNote] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  // Email dialog
  const [emailDialog, setEmailDialog] = useState<{ businessId: number; businessName: string } | null>(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");

  // Add new category dialog
  const [addCategoryDialog, setAddCategoryDialog] = useState<{ type: 'sport' | 'business_type' | 'region' | 'hub' } | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");

  useEffect(() => {
    const sport = urlParams.get("sport") || "";
    const region = urlParams.get("region") || "";
    const hub = urlParams.get("hub") || "";
    if (sport) setSportFilters([sport]);
    if (region) setRegionFilters([region]);
    if (hub) setHubFilters([hub]);
  }, [urlParams]);

  const { data: sportCategories } = trpc.categories.sportCategories.useQuery();
  const { data: businessTypes } = trpc.categories.businessTypes.useQuery();
  const { data: regions } = trpc.categories.regions.useQuery();
  const { data: hubs } = trpc.categories.hubs.useQuery(
    regionFilters.length === 1 ? { region: regionFilters[0] } : undefined
  );

  const sportCategoryIds = useMemo(() => {
    if (!sportFilters.length || !sportCategories) return undefined;
    return sportCategories.filter(c => sportFilters.includes(c.slug)).map(c => c.id);
  }, [sportFilters, sportCategories]);

  const businessTypeIds = useMemo(() => {
    if (!typeFilters.length || !businessTypes) return undefined;
    return businessTypes.filter(t => typeFilters.includes(t.slug)).map(t => t.id);
  }, [typeFilters, businessTypes]);

  const queryInput = useMemo(() => ({
    search: searchTerm || undefined,
    sportCategoryIds: sportCategoryIds?.length ? sportCategoryIds : undefined,
    businessTypeIds: businessTypeIds?.length ? businessTypeIds : undefined,
    regions: regionFilters.length ? regionFilters : undefined,
    hubs: hubFilters.length ? hubFilters : undefined,
    limit: ITEMS_PER_PAGE,
    offset: page * ITEMS_PER_PAGE,
  }), [searchTerm, sportCategoryIds, businessTypeIds, regionFilters, hubFilters, page]);

  const { data, isLoading } = trpc.searchMulti.search.useQuery(queryInput);

  // Fetch offers for displayed businesses
  const businessIds = useMemo(() => data?.businesses.map(b => b.business.id) || [], [data]);
  const { data: offersData } = trpc.business.offersForBusinesses.useQuery(
    { businessIds },
    { enabled: businessIds.length > 0 }
  );
  const offersByBusiness = useMemo(() => {
    const map: Record<number, any[]> = {};
    if (!offersData) return map;
    for (const offer of offersData) {
      const bid = (offer as any).businessId;
      if (!map[bid]) map[bid] = [];
      map[bid].push(offer);
    }
    return map;
  }, [offersData]);

  // Mutations
  const sendReferral = trpc.referral.send.useMutation({
    onSuccess: () => {
      toast.success("Referral sent! Your referral has been submitted.");
      setReferralDialog(null);
      setReferralNote("");
      setCustomerName("");
      setCustomerEmail("");
    },
    onError: (err) => toast.error(err.message),
  });

  const sendEmail = trpc.partnershipEmail.send.useMutation({
    onSuccess: () => {
      toast.success("Email sent! Your message has been delivered.");
      setEmailDialog(null);
      setEmailSubject("");
      setEmailMessage("");
    },
    onError: (err) => toast.error(err.message),
  });

  const submitCategory = trpc.categoryApproval.submit.useMutation({
    onSuccess: () => {
      toast.success("Submitted! Your suggestion has been sent for review.");
      setAddCategoryDialog(null);
      setNewCategoryName("");
    },
    onError: (err) => toast.error(err.message),
  });

  const totalPages = Math.ceil((data?.total || 0) / ITEMS_PER_PAGE);
  const hasActiveFilters = sportFilters.length > 0 || typeFilters.length > 0 || searchTerm || regionFilters.length > 0 || hubFilters.length > 0;

  const clearFilters = () => {
    setSearchTerm("");
    setSportFilters([]);
    setTypeFilters([]);
    setRegionFilters([]);
    setHubFilters([]);
    setPage(0);
  };

  const { data: myBusinesses } = trpc.business.myBusinesses.useQuery(undefined, { enabled: isAuthenticated });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Page Header */}
      <section className="bg-[oklch(0.22_0.02_50)] text-white py-12">
        <div className="container">
          <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ fontFamily: "var(--font-heading)" }}>
            Business Directory
          </h1>
          <p className="text-white/70 max-w-2xl text-lg" style={{ textTransform: "none", letterSpacing: "normal" }}>
            Every coach, shop, physio, club, and vacation provider that keeps endurance athletes moving. Find your people, or find out your people are already here.
          </p>
        </div>
      </section>

      {/* Search & Multi-Select Filters */}
      <section className="bg-card border-b border-border py-4 sticky top-16 z-40">
        <div className="container">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, region, city, sport, business type..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
                className="pl-10"
                style={{ textTransform: "none" }}
              />
            </div>

            <div className="hidden md:flex items-center gap-2 flex-wrap">
              <MultiSelectDropdown
                label="Sports"
                options={(sportCategories || []).map(c => ({ value: c.slug, label: c.name }))}
                selected={sportFilters}
                onChange={(v) => { setSportFilters(v); setPage(0); }}
                onAddNew={() => setAddCategoryDialog({ type: 'sport' })}
              />
              <MultiSelectDropdown
                label="Business Type"
                options={(businessTypes || []).map(t => ({ value: t.slug, label: t.name }))}
                selected={typeFilters}
                onChange={(v) => { setTypeFilters(v); setPage(0); }}
                onAddNew={() => setAddCategoryDialog({ type: 'business_type' })}
              />
              <MultiSelectDropdown
                label="Region"
                options={(regions || []).map(r => ({ value: r, label: r }))}
                selected={regionFilters}
                onChange={(v) => { setRegionFilters(v); setHubFilters([]); setPage(0); }}
                onAddNew={() => setAddCategoryDialog({ type: 'region' })}
              />
              <MultiSelectDropdown
                label="Hub / Area"
                options={Array.from(new Map((hubs || []).map(h => [h.hub, { value: h.hub, label: h.hub }] as [string, { value: string; label: string }])).values())}
                selected={hubFilters}
                onChange={(v) => { setHubFilters(v); setPage(0); }}
                onAddNew={() => setAddCategoryDialog({ type: 'hub' })}
              />
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground" style={{ textTransform: "none" }}>
                  <X className="w-4 h-4 mr-1" /> Clear
                </Button>
              )}
            </div>

            <Button
              variant="outline"
              className="md:hidden bg-transparent"
              onClick={() => setShowFilters(!showFilters)}
              style={{ textTransform: "none" }}
            >
              <Filter className="w-4 h-4 mr-2" /> Filters
              {hasActiveFilters && <span className="ml-2 w-2 h-2 rounded-full bg-primary" />}
            </Button>
          </div>

          {showFilters && (
            <div className="md:hidden mt-3 flex flex-col gap-3 pb-2">
              <MultiSelectDropdown
                label="Sports"
                options={(sportCategories || []).map(c => ({ value: c.slug, label: c.name }))}
                selected={sportFilters}
                onChange={(v) => { setSportFilters(v); setPage(0); }}
              />
              <MultiSelectDropdown
                label="Business Type"
                options={(businessTypes || []).map(t => ({ value: t.slug, label: t.name }))}
                selected={typeFilters}
                onChange={(v) => { setTypeFilters(v); setPage(0); }}
              />
              <MultiSelectDropdown
                label="Region"
                options={(regions || []).map(r => ({ value: r, label: r }))}
                selected={regionFilters}
                onChange={(v) => { setRegionFilters(v); setHubFilters([]); setPage(0); }}
              />
              <MultiSelectDropdown
                label="Hub / Area"
                options={Array.from(new Map((hubs || []).map(h => [h.hub, { value: h.hub, label: h.hub }] as [string, { value: string; label: string }])).values())}
                selected={hubFilters}
                onChange={(v) => { setHubFilters(v); setPage(0); }}
              />
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} style={{ textTransform: "none" }}>
                  <X className="w-4 h-4 mr-1" /> Clear Filters
                </Button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Results */}
      <section className="py-8 flex-1">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground" style={{ textTransform: "none", letterSpacing: "normal" }}>
              {data?.total || 0} business{(data?.total || 0) !== 1 ? "es" : ""} found
              {regionFilters.length > 0 && <span className="text-primary font-medium"> in {regionFilters.join(", ")}</span>}
            </p>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-lg bg-muted mb-4" />
                    <div className="h-5 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-4 bg-muted rounded w-full mb-4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : data?.businesses.length === 0 ? (
            <div className="text-center py-20">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Nothing here (yet)</h3>
              <p className="text-muted-foreground mb-6" style={{ textTransform: "none", letterSpacing: "normal" }}>
                Try different filters, or maybe you've just discovered a gap in our directory. Want to fix that? List a business.
              </p>
              <Button variant="outline" onClick={clearFilters} className="bg-transparent" style={{ textTransform: "none" }}>
                Clear All Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data?.businesses.map((item) => (
                  <Card key={item.business.id} className="h-full hover:shadow-lg transition-all border-border hover:border-primary/30 group">
                    <CardContent className="p-6">
                      <Link href={`/business/${item.business.slug}`} className="block">
                        <div className="flex items-start justify-between mb-3">
                          {/* Logo or sport icon */}
                          {item.business.logoUrl ? (
                            <img src={item.business.logoUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                              {sportIcons[item.sportCategory?.slug || ""] || <Star className="w-6 h-6" />}
                            </div>
                          )}
                          {item.business.isClaimed && item.business.claimedByUserId ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full" style={{ textTransform: "none" }}>
                              <Shield className="w-3 h-3" /> Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-500/10 px-2 py-1 rounded-full" style={{ textTransform: "none" }}>
                              Unclaimed
                            </span>
                          )}
                        </div>

                        <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                          {item.business.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2" style={{ textTransform: "none", letterSpacing: "normal" }}>
                          {item.business.shortDescription}
                        </p>

                        {/* Google Rating with link */}
                        {item.business.googleRating && (
                          <div className="flex items-center gap-1.5 mb-3">
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3.5 h-3.5 ${
                                    i < Math.round(parseFloat(item.business.googleRating || "0"))
                                      ? "text-yellow-500 fill-yellow-500"
                                      : "text-muted-foreground/30"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs font-medium text-foreground">{item.business.googleRating}</span>
                            {item.business.googleReviewCount && item.business.googleReviewCount > 0 && (
                              <span className="text-xs text-muted-foreground" style={{ textTransform: "none" }}>
                                ({item.business.googleReviewCount} reviews)
                              </span>
                            )}
                            <span className="text-[10px] text-muted-foreground/60 ml-1">Google</span>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground" style={{ textTransform: "none" }}>
                          {item.business.hub && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {item.business.hub}, {item.business.country}
                            </span>
                          )}
                          {!item.business.hub && item.business.city && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {item.business.city}{item.business.country ? `, ${item.business.country}` : ""}
                            </span>
                          )}
                          {item.business.region && (
                            <span className="flex items-center gap-1 text-[oklch(0.55_0.15_45)]">
                              <Globe className="w-3 h-3" /> {item.business.region}
                            </span>
                          )}
                          {item.businessType && (
                            <Badge variant="secondary" className="text-[10px]">{item.businessType.name}</Badge>
                          )}
                        </div>

                        {/* Website link (shown for claimed businesses) */}
                        {item.business.isClaimed && item.business.website && (
                          <div className="mt-2">
                            <span
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(item.business.website!, '_blank'); }}
                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline cursor-pointer"
                              style={{ textTransform: "none" }}
                            >
                              <ExternalLink className="w-3 h-3" /> {item.business.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                            </span>
                          </div>
                        )}

                        {/* Brands carried (for retailers) */}
                        {item.business.brandsCarried && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {item.business.brandsCarried.split(',').slice(0, 4).map((brand, i) => (
                              <Badge key={i} variant="outline" className="text-[10px] px-1.5 py-0">{brand.trim()}</Badge>
                            ))}
                            {item.business.brandsCarried.split(',').length > 4 && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0">+{item.business.brandsCarried.split(',').length - 4} more</Badge>
                            )}
                          </div>
                        )}
                      </Link>

                      {/* Incentives/Offers */}
                      {offersByBusiness[item.business.id] && offersByBusiness[item.business.id].length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border">
                          <div className="flex items-center gap-1 text-xs font-medium text-green-600 mb-1.5" style={{ textTransform: "none" }}>
                            <Gift className="w-3 h-3" /> Available Incentives
                          </div>
                          <div className="flex flex-col gap-1">
                            {offersByBusiness[item.business.id].slice(0, 2).map((offer: any) => (
                              <div key={offer.id} className="flex items-center gap-1.5 text-xs text-muted-foreground" style={{ textTransform: "none" }}>
                                <Tag className="w-3 h-3 text-green-500 shrink-0" />
                                <span className="truncate">{offer.title}</span>
                              </div>
                            ))}
                            {offersByBusiness[item.business.id].length > 2 && (
                              <span className="text-[10px] text-muted-foreground" style={{ textTransform: "none" }}>+{offersByBusiness[item.business.id].length - 2} more</span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Action buttons row - side by side, prominent */}
                      <div className="mt-4 pt-3 border-t border-border flex items-center gap-2">
                        {/* Send Referral button */}
                        <Button
                          size="sm"
                          className="flex-1 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
                          style={{ textTransform: "none" }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (!isAuthenticated) {
                              toast.info("Please log in to send a referral.");
                              window.location.href = getLoginUrl();
                              return;
                            }
                            setReferralDialog({ businessId: item.business.id, businessName: item.business.name });
                          }}
                        >
                          <Send className="w-3.5 h-3.5 mr-1.5" /> Send Referral
                        </Button>

                        {/* Claim button - shown for unclaimed businesses (no real owner), View Profile for verified/claimed */}
                        {(!item.business.isClaimed || (item.business.isClaimed && !item.business.claimedByUserId)) ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-xs font-semibold border-amber-500/40 text-amber-600 hover:bg-amber-500/10 bg-amber-500/5"
                            style={{ textTransform: "none" }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (isAuthenticated) {
                                navigate(`/business/${item.business.slug}`);
                              } else {
                                window.location.href = getLoginUrl();
                              }
                            }}
                          >
                            <UserPlus className="w-3.5 h-3.5 mr-1.5" /> Claim Business
                          </Button>
                        ) : (
                          <Link href={`/business/${item.business.slug}`} className="flex-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full text-xs font-semibold bg-transparent"
                              style={{ textTransform: "none" }}
                            >
                              <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> View Profile
                            </Button>
                          </Link>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)} className="bg-transparent">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground px-4" style={{ textTransform: "none" }}>
                    Page {page + 1} of {totalPages}
                  </span>
                  <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="bg-transparent">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Send Referral Dialog */}
      <Dialog open={!!referralDialog} onOpenChange={() => setReferralDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send a Referral to {referralDialog?.businessName}</DialogTitle>
            <DialogDescription style={{ textTransform: "none" }}>
              Refer a customer to this business. Select which of your businesses is sending the referral.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {myBusinesses && myBusinesses.length > 0 ? (
              <>
                <div>
                  <label className="text-sm font-medium" style={{ textTransform: "none" }}>Your Business</label>
                  <select
                    className="w-full mt-1 h-9 px-3 rounded-md border border-input bg-transparent text-sm"
                    id="referringBusiness"
                    style={{ textTransform: "none" }}
                  >
                    {myBusinesses.map(b => (
                      <option key={b.business.id} value={b.business.id}>{b.business.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium" style={{ textTransform: "none" }}>Customer Name</label>
                  <Input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="John Doe" style={{ textTransform: "none" }} />
                </div>
                <div>
                  <label className="text-sm font-medium" style={{ textTransform: "none" }}>Customer Email</label>
                  <Input value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} placeholder="john@example.com" style={{ textTransform: "none" }} />
                </div>
                <div>
                  <label className="text-sm font-medium" style={{ textTransform: "none" }}>Notes</label>
                  <Textarea value={referralNote} onChange={e => setReferralNote(e.target.value)} placeholder="Any details about this referral..." style={{ textTransform: "none" }} />
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground" style={{ textTransform: "none" }}>
                You need to claim or add a business first before you can send referrals. Head to your dashboard to get started.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReferralDialog(null)} className="bg-transparent" style={{ textTransform: "none" }}>Cancel</Button>
            {myBusinesses && myBusinesses.length > 0 && (
              <Button
                onClick={() => {
                  const select = document.getElementById('referringBusiness') as HTMLSelectElement;
                  sendReferral.mutate({
                    referringBusinessId: parseInt(select.value),
                    receivingBusinessId: referralDialog!.businessId,
                    customerName: customerName || undefined,
                    customerEmail: customerEmail || undefined,
                    notes: referralNote || undefined,
                  });
                }}
                disabled={sendReferral.isPending}
                style={{ textTransform: "none" }}
              >
                {sendReferral.isPending ? "Sending..." : "Send Referral"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Dialog */}
      <Dialog open={!!emailDialog} onOpenChange={() => setEmailDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Email {emailDialog?.businessName}</DialogTitle>
            <DialogDescription style={{ textTransform: "none" }}>
              Send a partnership inquiry or message to this business.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium" style={{ textTransform: "none" }}>Subject</label>
              <Input value={emailSubject} onChange={e => setEmailSubject(e.target.value)} placeholder="Partnership inquiry" style={{ textTransform: "none" }} />
            </div>
            <div>
              <label className="text-sm font-medium" style={{ textTransform: "none" }}>Message</label>
              <Textarea value={emailMessage} onChange={e => setEmailMessage(e.target.value)} placeholder="Hi! I'd love to discuss a referral partnership..." rows={5} style={{ textTransform: "none" }} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailDialog(null)} className="bg-transparent" style={{ textTransform: "none" }}>Cancel</Button>
            <Button
              onClick={() => {
                sendEmail.mutate({
                  recipientBusinessId: emailDialog!.businessId,
                  subject: emailSubject,
                  message: emailMessage,
                });
              }}
              disabled={sendEmail.isPending || !emailSubject || !emailMessage}
              style={{ textTransform: "none" }}
            >
              {sendEmail.isPending ? "Sending..." : "Send Email"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add New Category Dialog */}
      <Dialog open={!!addCategoryDialog} onOpenChange={() => setAddCategoryDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suggest a New {addCategoryDialog?.type === 'sport' ? 'Sport' : addCategoryDialog?.type === 'business_type' ? 'Business Type' : addCategoryDialog?.type === 'region' ? 'Region' : 'Hub / Area'}</DialogTitle>
            <DialogDescription style={{ textTransform: "none" }}>
              Don't see what you're looking for? Suggest it and we'll review it. Once approved, it'll be available for everyone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium" style={{ textTransform: "none" }}>Name</label>
              <Input value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} placeholder="e.g. Gravel Cycling" style={{ textTransform: "none" }} />
            </div>
            {addCategoryDialog?.type === 'hub' && (
              <div>
                <label className="text-sm font-medium" style={{ textTransform: "none" }}>Parent Region (optional)</label>
                <Input placeholder="e.g. Western Canada" style={{ textTransform: "none" }} id="parentRegionInput" />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddCategoryDialog(null)} className="bg-transparent" style={{ textTransform: "none" }}>Cancel</Button>
            <Button
              onClick={() => {
                if (!isAuthenticated) {
                  toast.info("Please log in to suggest a new category.");
                  window.location.href = getLoginUrl();
                  return;
                }
                const parentInput = document.getElementById('parentRegionInput') as HTMLInputElement;
                submitCategory.mutate({
                  categoryType: addCategoryDialog!.type,
                  proposedName: newCategoryName,
                  parentRegion: parentInput?.value || undefined,
                });
              }}
              disabled={submitCategory.isPending || !newCategoryName}
              style={{ textTransform: "none" }}
            >
              {submitCategory.isPending ? "Submitting..." : "Submit for Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
