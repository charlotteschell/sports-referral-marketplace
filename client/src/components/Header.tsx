import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Link, useLocation } from "wouter";
import { Menu, X, Mountain, Shield, Building2, Bike } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { NotificationBell } from "@/components/NotificationBell";

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
              <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663371988607/omxbSEHhGlQLbCoQ.png" alt="SportConnect" className="w-11 h-11 rounded-lg" style={{ filter: "drop-shadow(0 0 6px rgba(200,140,60,0.35))" }} />
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white tracking-wide leading-tight" style={{ fontFamily: "var(--font-heading)" }}>
                  SPORTCONNECT
                </span>
                <span className="text-[9px] text-white/50 tracking-wider" style={{ textTransform: "none", letterSpacing: "0.05em" }}>Powered by RARE Labs</span>
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
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
                <div className="flex items-center gap-1.5">
                  {user?.name && <span className="text-white/60 text-sm hidden lg:inline" style={{ textTransform: "none" }}>{user.name}</span>}
                  {getRoleBadge()}
                </div>

                {/* Primary dashboard link - correct per user type */}
                <Link href={getDashboardLink()}>
                  <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10 text-sm" style={{ textTransform: "none" }}>
                    {getDashboardLabel()}
                  </Button>
                </Link>

                {/* Admin gets secondary links to business and athlete dashboards */}
                {isAdmin && (
                  <>
                    <Link href="/dashboard">
                      <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/10 text-sm" style={{ textTransform: "none" }}>
                        Biz Dashboard
                      </Button>
                    </Link>
                    <Link href="/athlete-dashboard">
                      <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/10 text-sm" style={{ textTransform: "none" }}>
                        Athlete View
                      </Button>
                    </Link>
                  </>
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
                      {user?.name && <span className="text-white/60 text-sm" style={{ textTransform: "none" }}>{user.name}</span>}
                      {getRoleBadge()}
                    </div>

                    {/* Primary dashboard link */}
                    <Link href={getDashboardLink()}>
                      <span className="block px-3 py-2 rounded-md text-sm font-medium text-white/70 hover:text-white cursor-pointer" style={{ textTransform: "none" }} onClick={() => setMobileOpen(false)}>
                        {getDashboardLabel()}
                      </span>
                    </Link>

                    {/* Admin gets secondary links */}
                    {isAdmin && (
                      <>
                        <Link href="/dashboard">
                          <span className="block px-3 py-2 rounded-md text-sm font-medium text-white/50 hover:text-white cursor-pointer" style={{ textTransform: "none" }} onClick={() => setMobileOpen(false)}>
                            Biz Dashboard
                          </span>
                        </Link>
                        <Link href="/athlete-dashboard">
                          <span className="block px-3 py-2 rounded-md text-sm font-medium text-white/50 hover:text-white cursor-pointer" style={{ textTransform: "none" }} onClick={() => setMobileOpen(false)}>
                            Athlete View
                          </span>
                        </Link>
                      </>
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
