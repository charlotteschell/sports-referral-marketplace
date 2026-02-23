import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Link, useLocation } from "wouter";
import { Menu, X, Mountain, Shield, Building2, Bike, ChevronDown, Settings, MoreHorizontal, Trophy, GraduationCap, Info, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useRef } from "react";
import { NotificationBell } from "@/components/NotificationBell";
import SportConnectLogo from "@/components/SportConnectLogo";

function DropdownMenu({ trigger, items, align = "right" }: {
  trigger: React.ReactNode;
  items: { href: string; label: string; icon?: any; }[];
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [location] = useLocation();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <div onClick={() => setOpen(!open)} className="cursor-pointer">
        {trigger}
      </div>
      {open && (
        <div className={`absolute ${align === "right" ? "right-0" : "left-0"} top-full mt-1 w-48 bg-[oklch(0.25_0.02_50)] border border-white/15 rounded-lg shadow-xl py-1 z-50`}>
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = location.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <span
                  className={`flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer transition-colors ${
                    isActive ? "text-white bg-white/10" : "text-white/70 hover:text-white hover:bg-white/5"
                  }`}
                  style={{ textTransform: "none" }}
                  onClick={() => setOpen(false)}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location, navigate] = useLocation();

  const isAdmin = isAuthenticated && user?.role === 'admin';
  const isBusinessOwner = isAuthenticated && user?.accountType === 'business_owner';
  const needsOnboarding = isAuthenticated && user && !user.onboardingComplete;

  const displayName = user?.contactName || user?.name || 'User';

  useEffect(() => {
    if (needsOnboarding && location !== '/onboarding' && !location.startsWith('/onboarding')) {
      navigate('/onboarding');
    }
  }, [needsOnboarding, location, navigate]);

  // Primary nav links (always visible)
  const primaryLinks = [
    { href: "/directory", label: "Directory" },
    { href: "/referral-offers", label: "Offers" },
  ];

  // Secondary nav links (grouped under "More" dropdown)
  const moreLinks = [
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
    { href: "/university", label: "University", icon: GraduationCap },
    { href: "/about", label: "About", icon: Info },
    { href: "/support", label: "Support", icon: HelpCircle },
  ];

  // All links for mobile
  const allNavLinks = [
    { href: "/directory", label: "Directory" },
    { href: "/referral-offers", label: "Offers" },
    { href: "/leaderboard", label: "Leaderboard" },
    { href: "/university", label: "University" },
    { href: "/about", label: "About" },
    { href: "/support", label: "Support" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  const isMoreActive = moreLinks.some(l => isActive(l.href));

  const getDashboardLink = () => {
    if (isAdmin) return "/admin";
    if (isBusinessOwner) return "/dashboard";
    return "/athlete-dashboard";
  };

  const getDashboardLabel = () => {
    if (isAdmin) return "Admin Panel";
    if (isBusinessOwner) return "Dashboard";
    return "My Dashboard";
  };

  // Dashboard items for admin dropdown
  const dashboardItems = [
    { href: "/admin", label: "Admin Panel", icon: Shield },
    { href: "/dashboard", label: "Biz Dashboard", icon: Building2 },
    { href: "/athlete-dashboard", label: "Athlete View", icon: Bike },
  ];

  const getRoleBadges = () => {
    if (isAdmin) return (
      <div className="flex items-center gap-1">
        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-amber-400/50 text-amber-300 bg-amber-400/10 font-medium gap-1 whitespace-nowrap">
          <Shield className="w-3 h-3" /> Admin
        </Badge>
      </div>
    );
    if (isBusinessOwner) return (
      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-emerald-400/50 text-emerald-300 bg-emerald-400/10 font-medium gap-1 whitespace-nowrap">
        <Building2 className="w-3 h-3" /> Business
      </Badge>
    );
    return (
      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-sky-400/50 text-sky-300 bg-sky-400/10 font-medium gap-1 whitespace-nowrap">
        <Bike className="w-3 h-3" /> Athlete
      </Badge>
    );
  };

  return (
    <header className="sticky top-0 z-50 bg-[oklch(0.22_0.02_50)] border-b border-white/10 backdrop-blur-sm">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-2.5 cursor-pointer">
              <SportConnectLogo className="w-11 h-11" style={{ filter: "drop-shadow(0 0 6px rgba(200,140,60,0.35))" }} />
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white tracking-wide leading-tight whitespace-nowrap" style={{ fontFamily: "var(--font-heading)" }}>
                  SPORTCONNECT
                </span>
                <span className="text-[9px] text-white/50 tracking-wider whitespace-nowrap" style={{ textTransform: "none", letterSpacing: "0.05em" }}>Powered by RARE Labs</span>
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {primaryLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span
                  className={`px-2.5 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    isActive(link.href)
                      ? "text-white bg-white/10"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  }`}
                  style={{ textTransform: "none", letterSpacing: "normal" }}
                >
                  {link.label}
                </span>
              </Link>
            ))}

            {/* More dropdown for secondary links */}
            <DropdownMenu
              align="left"
              trigger={
                <span
                  className={`px-2.5 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer whitespace-nowrap inline-flex items-center gap-1 ${
                    isMoreActive
                      ? "text-white bg-white/10"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  }`}
                  style={{ textTransform: "none", letterSpacing: "normal" }}
                >
                  More
                  <ChevronDown className="w-3.5 h-3.5" />
                </span>
              }
              items={moreLinks}
            />
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-1.5">
            {isAuthenticated ? (
              <>
                <NotificationBell />

                {/* Name + Role badge */}
                <div className="flex items-center gap-1.5">
                  <span className="text-white/60 text-sm hidden lg:inline whitespace-nowrap max-w-[120px] truncate" style={{ textTransform: "none" }}>{displayName}</span>
                  {getRoleBadges()}
                </div>

                {/* Admin gets dropdown, others get single dashboard link */}
                {isAdmin ? (
                  <DropdownMenu
                    trigger={
                      <Button
                        variant="ghost"
                        className="text-white/80 hover:text-white hover:bg-white/10 text-sm whitespace-nowrap gap-1"
                        style={{ textTransform: "none" }}
                      >
                        {dashboardItems.find(i => location.startsWith(i.href))?.label || "Dashboards"}
                        <ChevronDown className="w-3.5 h-3.5" />
                      </Button>
                    }
                    items={dashboardItems}
                  />
                ) : (
                  <Link href={getDashboardLink()}>
                    <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10 text-sm whitespace-nowrap" style={{ textTransform: "none" }}>
                      {getDashboardLabel()}
                    </Button>
                  </Link>
                )}

                {/* Account Settings */}
                <Link href="/account-settings">
                  <Button variant="ghost" className="text-white/50 hover:text-white hover:bg-white/10 p-2" title="Account Settings">
                    <Settings className="w-4 h-4" />
                  </Button>
                </Link>

                <Button
                  variant="ghost"
                  className="text-white/60 hover:text-white hover:bg-white/10 text-sm whitespace-nowrap"
                  onClick={() => logout()}
                  style={{ textTransform: "none" }}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <a href={getLoginUrl()}>
                  <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10 text-sm whitespace-nowrap" style={{ textTransform: "none" }}>
                    Sign In
                  </Button>
                </a>
                <a href={getLoginUrl("/onboarding?type=athlete")}>
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 bg-transparent text-sm whitespace-nowrap" style={{ textTransform: "none" }}>
                    <Mountain className="w-3.5 h-3.5 mr-1.5" /> I'm an Athlete
                  </Button>
                </a>
                <a href={getLoginUrl("/onboarding?type=business")}>
                  <Button className="bg-[oklch(0.55_0.15_45)] hover:bg-[oklch(0.50_0.15_45)] text-white text-sm whitespace-nowrap" style={{ textTransform: "none" }}>
                    List Your Business
                  </Button>
                </a>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-white/10 pt-4">
            <nav className="flex flex-col gap-1">
              {allNavLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <span
                    className={`block px-3 py-2 rounded-md text-sm font-medium cursor-pointer ${
                      isActive(link.href)
                        ? "text-white bg-white/10"
                        : "text-white/70 hover:text-white hover:bg-white/5"
                    }`}
                    style={{ textTransform: "none" }}
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </span>
                </Link>
              ))}
              <div className="border-t border-white/10 mt-2 pt-2">
                {isAuthenticated ? (
                  <>
                    <div className="px-3 py-2 flex items-center gap-2">
                      <span className="text-white/60 text-sm" style={{ textTransform: "none" }}>{displayName}</span>
                      {getRoleBadges()}
                    </div>

                    {isAdmin ? (
                      <>
                        <Link href="/admin">
                          <span className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-white/70 hover:text-white cursor-pointer" style={{ textTransform: "none" }} onClick={() => setMobileOpen(false)}>
                            <Shield className="w-4 h-4" /> Admin Panel
                          </span>
                        </Link>
                        <Link href="/dashboard">
                          <span className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-white/50 hover:text-white cursor-pointer" style={{ textTransform: "none" }} onClick={() => setMobileOpen(false)}>
                            <Building2 className="w-4 h-4" /> Biz Dashboard
                          </span>
                        </Link>
                        <Link href="/athlete-dashboard">
                          <span className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-white/50 hover:text-white cursor-pointer" style={{ textTransform: "none" }} onClick={() => setMobileOpen(false)}>
                            <Bike className="w-4 h-4" /> Athlete View
                          </span>
                        </Link>
                      </>
                    ) : (
                      <Link href={getDashboardLink()}>
                        <span className="block px-3 py-2 rounded-md text-sm font-medium text-white/70 hover:text-white cursor-pointer" style={{ textTransform: "none" }} onClick={() => setMobileOpen(false)}>
                          {getDashboardLabel()}
                        </span>
                      </Link>
                    )}

                    <Link href="/account-settings">
                      <span className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-white/50 hover:text-white cursor-pointer" style={{ textTransform: "none" }} onClick={() => setMobileOpen(false)}>
                        <Settings className="w-4 h-4" /> Account Settings
                      </span>
                    </Link>

                    <button
                      className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium text-white/60 hover:text-white"
                      onClick={() => { logout(); setMobileOpen(false); }}
                      style={{ textTransform: "none" }}
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <a href={getLoginUrl()}>
                      <span className="block px-3 py-2 rounded-md text-sm font-medium text-white/70 hover:text-white cursor-pointer" style={{ textTransform: "none" }} onClick={() => setMobileOpen(false)}>
                        Sign In
                      </span>
                    </a>
                    <a href={getLoginUrl("/onboarding?type=athlete")}>
                      <span className="block px-3 py-2 rounded-md text-sm font-medium text-white/70 hover:text-white cursor-pointer" style={{ textTransform: "none" }} onClick={() => setMobileOpen(false)}>
                        <span className="inline-flex items-center gap-1.5"><Mountain className="w-3.5 h-3.5" /> I'm an Athlete</span>
                      </span>
                    </a>
                    <a href={getLoginUrl("/onboarding?type=business")}>
                      <span className="block px-3 py-2 rounded-md text-sm font-medium text-[oklch(0.55_0.15_45)] hover:text-white cursor-pointer" style={{ textTransform: "none" }} onClick={() => setMobileOpen(false)}>
                        List Your Business
                      </span>
                    </a>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
