import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Link, useLocation } from "wouter";
import { Menu, X, Mountain, Shield, Building2, Bike, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useRef } from "react";
import { NotificationBell } from "@/components/NotificationBell";
import SportConnectLogo from "@/components/SportConnectLogo";

function AdminNavDropdown() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [open]);

  const items = [
    { href: '/admin', label: 'Admin Panel', icon: Shield },
    { href: '/dashboard', label: 'Biz Dashboard', icon: Building2 },
    { href: '/athlete-dashboard', label: 'Athlete View', icon: Bike },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        className="text-white/80 hover:text-white hover:bg-white/10 text-sm gap-1"
        style={{ textTransform: 'none' }}
        onClick={() => setOpen(!open)}
      >
        <Shield className="w-3.5 h-3.5" />
        Dashboards
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </Button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 rounded-lg bg-[oklch(0.22_0.02_50)] border border-white/15 shadow-xl z-50 py-1 animate-in fade-in-0 zoom-in-95 duration-150">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.href}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-white/75 hover:text-white hover:bg-white/10 transition-colors"
                style={{ textTransform: 'none' }}
                onClick={() => { navigate(item.href); setOpen(false); }}
              >
                <Icon className="w-4 h-4 text-white/50" />
                {item.label}
              </button>
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

  // Determine user type for navigation
  const isAdmin = isAuthenticated && user?.role === 'admin';
  const isBusinessOwner = isAuthenticated && user?.accountType === 'business_owner';
  const isAthlete = isAuthenticated && user?.accountType === 'consumer';
  const needsOnboarding = isAuthenticated && user && !user.onboardingComplete;

  // Redirect to onboarding if user hasn't completed it (except if already on onboarding page)
  useEffect(() => {
    if (needsOnboarding && location !== '/onboarding' && !location.startsWith('/onboarding')) {
      navigate('/onboarding');
    }
  }, [needsOnboarding, location, navigate]);

  const navLinks = [
    { href: "/directory", label: "Directory" },
    { href: "/referral-offers", label: "Referral Offers" },
    { href: "/leaderboard", label: "Leaderboard" },
    { href: "/university", label: "University" },
    { href: "/about", label: "About" },
    { href: "/support", label: "Support" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  // Determine the correct dashboard link based on user type
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

  const getRoleBadge = () => {
    if (isAdmin) return (
      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-amber-400/50 text-amber-300 bg-amber-400/10 font-medium gap-1">
        <Shield className="w-3 h-3" /> Admin
      </Badge>
    );
    if (isBusinessOwner) return (
      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-emerald-400/50 text-emerald-300 bg-emerald-400/10 font-medium gap-1">
        <Building2 className="w-3 h-3" /> Business
      </Badge>
    );
    return (
      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-sky-400/50 text-sky-300 bg-sky-400/10 font-medium gap-1">
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
                <span className="text-xl font-bold text-white tracking-wide leading-tight" style={{ fontFamily: "var(--font-heading)" }}>
                  SPORTCONNECT
                </span>
                <span className="text-[9px] text-white/50 tracking-wider" style={{ textTransform: "none", letterSpacing: "0.05em" }}>Powered by RARE Labs</span>
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {navLinks.map((link) => (
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
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <NotificationBell />

                {/* Role badge */}
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  {(user?.contactName || user?.name) && <span className="text-white/60 text-sm hidden lg:inline truncate max-w-[120px]" style={{ textTransform: "none" }}>{user.contactName || user.name}</span>}
                  {getRoleBadge()}
                </div>

                {/* Dashboard link(s) - admin gets dropdown, others get single link */}
                {isAdmin ? (
                  <AdminNavDropdown />
                ) : (
                  <Link href={getDashboardLink()}>
                    <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10 text-sm" style={{ textTransform: "none" }}>
                      {getDashboardLabel()}
                    </Button>
                  </Link>
                )}


                <Button
                  variant="ghost"
                  className="text-white/60 hover:text-white hover:bg-white/10 text-sm"
                  onClick={() => logout()}
                  style={{ textTransform: "none" }}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <a href={getLoginUrl()}>
                  <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10 text-sm" style={{ textTransform: "none" }}>
                    Sign In
                  </Button>
                </a>
                <a href={getLoginUrl("/onboarding?type=athlete")}>
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 bg-transparent text-sm" style={{ textTransform: "none" }}>
                    <Mountain className="w-3.5 h-3.5 mr-1.5" /> I'm an Athlete
                  </Button>
                </a>
                <a href={getLoginUrl("/onboarding?type=business")}>
                  <Button className="bg-[oklch(0.55_0.15_45)] hover:bg-[oklch(0.50_0.15_45)] text-white text-sm" style={{ textTransform: "none" }}>
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
              {navLinks.map((link) => (
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
                    {/* Role badge + name in mobile */}
                    <div className="px-3 py-2 flex items-center gap-2">
                      {(user?.contactName || user?.name) && <span className="text-white/60 text-sm" style={{ textTransform: "none" }}>{user.contactName || user.name}</span>}
                      {getRoleBadge()}
                    </div>

                    {/* Dashboard links */}
                    {isAdmin ? (
                      <>
                        <span className="block px-3 py-1.5 text-xs font-semibold text-white/40 uppercase tracking-wider mt-1" style={{ textTransform: "uppercase" }}>Admin Views</span>
                        <Link href="/admin">
                          <span className="block px-3 py-2 rounded-md text-sm font-medium text-white/70 hover:text-white cursor-pointer" style={{ textTransform: "none" }} onClick={() => setMobileOpen(false)}>
                            <Shield className="w-3.5 h-3.5 inline mr-1.5" />Admin Panel
                          </span>
                        </Link>
                        <Link href="/dashboard">
                          <span className="block px-3 py-2 rounded-md text-sm font-medium text-white/70 hover:text-white cursor-pointer" style={{ textTransform: "none" }} onClick={() => setMobileOpen(false)}>
                            <Building2 className="w-3.5 h-3.5 inline mr-1.5" />Biz Dashboard
                          </span>
                        </Link>
                        <Link href="/athlete-dashboard">
                          <span className="block px-3 py-2 rounded-md text-sm font-medium text-white/70 hover:text-white cursor-pointer" style={{ textTransform: "none" }} onClick={() => setMobileOpen(false)}>
                            <Bike className="w-3.5 h-3.5 inline mr-1.5" />Athlete View
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
