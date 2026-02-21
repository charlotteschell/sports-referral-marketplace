import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Link, useSearch, useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Search, MapPin, Shield, Bike, Mountain, Snowflake, Star,
  ChevronLeft, ChevronRight, Filter, X, Compass, Globe, UserPlus
} from "lucide-react";

const sportIcons: Record<string, React.ReactNode> = {
  cycling: <Bike className="w-4 h-4" />,
  running: <Mountain className="w-4 h-4" />,
  "trail-running": <Mountain className="w-4 h-4" />,
  snowsports: <Snowflake className="w-4 h-4" />,
  "sport-vacations": <Compass className="w-4 h-4" />,
};

const ITEMS_PER_PAGE = 12;

export default function Directory() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const searchString = useSearch();
  const urlParams = useMemo(() => new URLSearchParams(searchString), [searchString]);
  const initialSport = urlParams.get("sport") || "";
  const initialRegion = urlParams.get("region") || "";
  const initialHub = urlParams.get("hub") || "";

  const [searchTerm, setSearchTerm] = useState("");
  const [sportFilter, setSportFilter] = useState(initialSport);
  const [typeFilter, setTypeFilter] = useState("");
  const [regionFilter, setRegionFilter] = useState(initialRegion);
  const [hubFilter, setHubFilter] = useState(initialHub);
  const [page, setPage] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Update filters when URL params change
  useEffect(() => {
    const sport = urlParams.get("sport") || "";
    const region = urlParams.get("region") || "";
    const hub = urlParams.get("hub") || "";
    if (sport) setSportFilter(sport);
    if (region) setRegionFilter(region);
    if (hub) setHubFilter(hub);
  }, [urlParams]);

  const { data: sportCategories } = trpc.categories.sportCategories.useQuery();
  const { data: businessTypes } = trpc.categories.businessTypes.useQuery();
  const { data: regions } = trpc.categories.regions.useQuery();
  const { data: hubs } = trpc.categories.hubs.useQuery(
    regionFilter ? { region: regionFilter } : undefined
  );

  const sportCategoryId = useMemo(() => {
    if (!sportFilter || !sportCategories) return undefined;
    const cat = sportCategories.find(c => c.slug === sportFilter);
    return cat?.id;
  }, [sportFilter, sportCategories]);

  const businessTypeId = useMemo(() => {
    if (!typeFilter || !businessTypes) return undefined;
    const bt = businessTypes.find(t => t.slug === typeFilter);
    return bt?.id;
  }, [typeFilter, businessTypes]);

  const queryInput = useMemo(() => ({
    search: searchTerm || undefined,
    sportCategoryId,
    businessTypeId,
    region: regionFilter || undefined,
    hub: hubFilter || undefined,
    limit: ITEMS_PER_PAGE,
    offset: page * ITEMS_PER_PAGE,
  }), [searchTerm, sportCategoryId, businessTypeId, regionFilter, hubFilter, page]);

  const { data, isLoading } = trpc.business.search.useQuery(queryInput);

  const totalPages = Math.ceil((data?.total || 0) / ITEMS_PER_PAGE);
  const hasActiveFilters = sportFilter || typeFilter || searchTerm || regionFilter || hubFilter;

  const clearFilters = () => {
    setSearchTerm("");
    setSportFilter("");
    setTypeFilter("");
    setRegionFilter("");
    setHubFilter("");
    setPage(0);
  };

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
            Find coaches, shops, therapists, vacation providers, and clubs serving cyclists, runners, and snowsports enthusiasts across the world's top endurance sports hubs.
          </p>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="bg-card border-b border-border py-4 sticky top-16 z-40">
        <div className="container">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
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

            {/* Desktop Filters */}
            <div className="hidden md:flex items-center gap-2 flex-wrap">
              <Select value={sportFilter} onValueChange={(v) => { setSportFilter(v === "all" ? "" : v); setPage(0); }}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Sports" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sports</SelectItem>
                  {sportCategories?.map(cat => (
                    <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v === "all" ? "" : v); setPage(0); }}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Business Types</SelectItem>
                  {businessTypes?.map(bt => (
                    <SelectItem key={bt.id} value={bt.slug}>{bt.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={regionFilter} onValueChange={(v) => { setRegionFilter(v === "all" ? "" : v); setHubFilter(""); setPage(0); }}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Regions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  {regions?.map(r => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {hubs && hubs.length > 0 && (
                <Select value={hubFilter} onValueChange={(v) => { setHubFilter(v === "all" ? "" : v); setPage(0); }}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Hubs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Hubs</SelectItem>
                    {hubs.map(h => (
                      <SelectItem key={h.hub} value={h.hub}>{h.hub}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground" style={{ textTransform: "none" }}>
                  <X className="w-4 h-4 mr-1" /> Clear
                </Button>
              )}
            </div>

            {/* Mobile Filter Toggle */}
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

          {/* Mobile Filters Expanded */}
          {showFilters && (
            <div className="md:hidden mt-3 flex flex-col gap-3 pb-2">
              <Select value={sportFilter} onValueChange={(v) => { setSportFilter(v === "all" ? "" : v); setPage(0); }}>
                <SelectTrigger>
                  <SelectValue placeholder="All Sports" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sports</SelectItem>
                  {sportCategories?.map(cat => (
                    <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v === "all" ? "" : v); setPage(0); }}>
                <SelectTrigger>
                  <SelectValue placeholder="All Business Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Business Types</SelectItem>
                  {businessTypes?.map(bt => (
                    <SelectItem key={bt.id} value={bt.slug}>{bt.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={regionFilter} onValueChange={(v) => { setRegionFilter(v === "all" ? "" : v); setHubFilter(""); setPage(0); }}>
                <SelectTrigger>
                  <SelectValue placeholder="All Regions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  {regions?.map(r => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {hubs && hubs.length > 0 && (
                <Select value={hubFilter} onValueChange={(v) => { setHubFilter(v === "all" ? "" : v); setPage(0); }}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Hubs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Hubs</SelectItem>
                    {hubs.map(h => (
                      <SelectItem key={h.hub} value={h.hub}>{h.hub}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

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
          {/* Results count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground" style={{ textTransform: "none", letterSpacing: "normal" }}>
              {data?.total || 0} business{(data?.total || 0) !== 1 ? "es" : ""} found
              {regionFilter && <span className="text-primary font-medium"> in {regionFilter}</span>}
              {hubFilter && <span className="text-primary font-medium"> — {hubFilter}</span>}
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
              <h3 className="text-xl font-bold mb-2">No businesses found</h3>
              <p className="text-muted-foreground mb-6" style={{ textTransform: "none", letterSpacing: "normal" }}>
                Try adjusting your search or filters to find what you're looking for.
              </p>
              <Button variant="outline" onClick={clearFilters} className="bg-transparent" style={{ textTransform: "none" }}>
                Clear All Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data?.businesses.map((item) => (
                  <Link key={item.business.id} href={`/business/${item.business.slug}`}>
                    <Card className="h-full hover:shadow-lg transition-all cursor-pointer border-border hover:border-primary/30 group">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            {sportIcons[item.sportCategory?.slug || ""] || <Star className="w-6 h-6" />}
                          </div>
                          {item.business.isClaimed ? (
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
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2" style={{ textTransform: "none", letterSpacing: "normal" }}>
                          {item.business.shortDescription}
                        </p>

                        {/* Google Rating */}
                        {item.business.googleRating && (
                          <div className="flex items-center gap-1 mb-3">
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
                              <span className="text-xs text-muted-foreground" style={{ textTransform: "none" }}>({item.business.googleReviewCount})</span>
                            )}
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
                            <span className="bg-secondary px-2 py-0.5 rounded text-secondary-foreground">
                              {item.businessType.name}
                            </span>
                          )}
                        </div>

                        {/* Claim Your Business CTA for unclaimed listings */}
                        {!item.business.isClaimed && (
                          <div className="mt-4 pt-3 border-t border-border">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (isAuthenticated) {
                                  navigate(`/business/${item.business.slug}`);
                                } else {
                                  window.location.href = getLoginUrl();
                                }
                              }}
                              className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 hover:text-amber-700 transition-all border border-amber-500/20 hover:border-amber-500/40"
                              style={{ textTransform: "none" }}
                            >
                              <UserPlus className="w-4 h-4" />
                              Is this your business? Claim it
                            </button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 0}
                    onClick={() => setPage(p => p - 1)}
                    className="bg-transparent"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground px-4" style={{ textTransform: "none" }}>
                    Page {page + 1} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage(p => p + 1)}
                    className="bg-transparent"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
