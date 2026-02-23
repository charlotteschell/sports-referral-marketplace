import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Link, useLocation } from "wouter";
import {
  Menu, X, Mountain, Shield, Building2, Bike, ChevronDown, Settings,
  Trophy, GraduationCap, HelpCircle, Search, Tag, ClipboardList, Key,
  Handshake, LogOut, UserPlus
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useRef } from "react";
import { NotificationBell } from "@/components/NotificationBell";
import SportConnectLogo from "@/components/SportConnectLogo";

/* ── Rich Dropdown ── */
type DropdownItem = {
  href: string;
  label: string;
  desc?: string;
  icon?: any;
  iconBg?: string;
  onClick?: () => void;
  divider?: boolean;
};

function RichDropdown({ trigger, items, align = "left", width = "w-60" }: {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
  width?: string;
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

  return (
    <div ref={ref} className="relative">
      <div onClick={() => setOpen(!open)} className="cursor-pointer">
        {trigger}
      </div>
      {open && (
        <div className={`absolute ${align === "right" ? "right-0" : "left-0"} top-full mt-2 ${width} bg-[oklch(0.22_0.03_50)] border border-white/15 rounded-xl shadow-2xl py-2 z-50`}>
          {items.map((item, i) => {
            if (item.divider) {
              return <div key={`div-${i}`} className="h-px bg-white/10 mx-3 my-1.5" />;
            }
            const Icon = item.icon;
            const content = (
              <span
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-colors text-white/70 hover:text-white hover:bg-white/5 mx-1"
                style={{ textTransform: "none" }}
                onClick={() => {
                  if (item.onClick) item.onClick();
                  setOpen(false);
                }}
              >
                {Icon && (
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.iconBg || "bg-white/10"}`}>
                    <Icon className="w-4 h-4" />
                  </span>
                )}
                <span className="flex flex-col min-w-0">
                  <span className="font-semibold text-[13px] text-white">{item.label}</span>
                  {item.desc && <span className="text-[11px] text-white/40 leading-tight">{item.desc}</span>}
                </span>
              </span>
            );
            if (item.onClick) {
              return <div key={item.label}>{content}</div>;
            }
            return (
              <Link key={item.href || item.label} href={item.href}>
                {content}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Nav Link ── */
function NavLink({ href, label, active, onClick, className = "" }: {
  href?: string;
  label: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  const inner = (
    <span
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
        active
          ? "text-primary font-semibold"
          : "text-white/70 hover:text-white hover:bg-white/5"
      } ${className}`}
      style={{ textTransform: "none", letterSpacing: "normal" }}
      onClick={onClick}
    >
      {label}
    </span>
  );
  if (href) return <Link href={href}>{inner}</Link>;
  return inner;
}

/* ── Main Header ── */
export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location, navigate] = useLocation();

  const isAdmin = isAuthenticated && user?.role === "admin";
  const isBusinessOwner = isAuthenticated && user?.accountType === "business_owner";
  const isAthlete = isAuthenticated && user?.accountType === "consumer";
  const needsOnboarding = isAuthenticated && user && !user.onboardingComplete;

  const displayName = user?.contactName || user?.name || "User";
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  useEffect(() => {
    if (needsOnboarding && location !== "/onboarding" && !location.startsWith("/onboarding")) {
      navigate("/onboarding");
    }
  }, [needsOnboarding, location, navigate]);

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  // Dashboard link based on user type
  const getDashboardHref = () => {
    if (isAdmin) return "/admin";
    if (isBusinessOwner) return "/dashboard";
    return "/athlete-dashboard";
  };

  // Offers link — athletes go to consumer tab
  const getOffersHref = () => {
    if (isAthlete || (!isBusinessOwner && !isAdmin)) return "/referral-offers?tab=consumer";
    return "/referral-offers";
  };

  const isDashboardActive = isActive("/dashboard") || isActive("/admin") || isActive("/athlete-dashboard");

  // Role badge for user menu
  const getRoleBadge = () => {
    if (isAdmin) return (
      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-amber-400/50 text-amber-300 bg-amber-400/10 font-medium whitespace-nowrap">
        Admin
      </Badge>
    );
    if (isBusinessOwner) return (
      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-primary/50 text-primary bg-primary/10 font-medium whitespace-nowrap">
        Business
      </Badge>
    );
    return (
      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-sky-400/50 text-sky-300 bg-sky-400/10 font-medium whitespace-nowrap">
        Athlete
      </Badge>
    );
  };

  /* ═══════════════════════════════════════════════════
     LOGGED-OUT NAV ITEMS
     ═══════════════════════════════════════════════════ */
  const forBusinessItems: DropdownItem[] = [
    { href: "/directory", label: "List Your Business", desc: "Add your business to the network", icon: ClipboardList, iconBg: "bg-primary/15 text-primary" },
    { href: "/directory", label: "Claim Your Business", desc: "Already listed? Take ownership", icon: Key, iconBg: "bg-primary/15 text-primary" },
    { href: "/referral-offers", label: "Referral Offers", desc: "Browse B2B referral incentives", icon: Handshake, iconBg: "bg-primary/15 text-primary" },
  ];

  const forAthleteItems: DropdownItem[] = [
    { href: "/directory", label: "Find a Pro", desc: "Browse the business directory", icon: Search, iconBg: "bg-emerald-500/15 text-emerald-400" },
    { href: "/referral-offers?tab=consumer", label: "Get Deals", desc: "Exclusive offers for athletes", icon: Tag, iconBg: "bg-emerald-500/15 text-emerald-400" },
  ];

  const helpItems: DropdownItem[] = [
    { href: "/university", label: "Tutorials & Guides", desc: "University & guides", icon: GraduationCap, iconBg: "bg-sky-500/15 text-sky-400" },
    { href: "/support", label: "Support", desc: "Get help & contact us", icon: HelpCircle, iconBg: "bg-sky-500/15 text-sky-400" },
  ];

  const signUpItems: DropdownItem[] = [
    { href: getLoginUrl("/onboarding?type=athlete"), label: "I'm an Athlete", desc: "Find pros & grab deals", icon: Bike, iconBg: "bg-emerald-500/15 text-emerald-400" },
    { href: getLoginUrl("/onboarding?type=business"), label: "I Have a Business", desc: "List & earn referral revenue", icon: Building2, iconBg: "bg-primary/15 text-primary" },
  ];

  /* ═══════════════════════════════════════════════════
     LOGGED-IN USER MENU ITEMS
     ═══════════════════════════════════════════════════ */
  const userMenuItems: DropdownItem[] = [
    { href: "/account-settings", label: "Settings", desc: "Account & preferences", icon: Settings, iconBg: "bg-white/10 text-white/60" },
    { href: "", label: "", desc: "", divider: true },
    { href: "", label: "Log Out", desc: "", icon: LogOut, iconBg: "bg-white/10 text-white/60", onClick: () => logout() },
  ];

  // Admin dashboard dropdown items
  const adminDashboardItems: DropdownItem[] = [
    { href: "/admin", label: "Admin Panel", desc: "Manage the platform", icon: Shield, iconBg: "bg-amber-400/15 text-amber-300" },
    { href: "/dashboard", label: "Biz Dashboard", desc: "Business owner view", icon: Building2, iconBg: "bg-primary/15 text-primary" },
    { href: "/athlete-dashboard", label: "Athlete View", desc: "Athlete experience", icon: Bike, iconBg: "bg-sky-400/15 text-sky-400" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[oklch(0.22_0.02_50)] border-b border-white/10 backdrop-blur-sm">
      <div className="container">
        <div className="flex items-center justify-between h-16">

          {/* ── Left Side ── */}
          <div className="flex items-center gap-1">
            {/* Logo */}
            <Link href="/">
              <div className="flex items-center gap-2.5 cursor-pointer mr-4">
                <SportConnectLogo className="w-10 h-10" style={{ filter: "drop-shadow(0 0 6px rgba(200,140,60,0.35))" }} />
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-white tracking-wide leading-tight whitespace-nowrap" style={{ fontFamily: "var(--font-heading)" }}>
                    SPORTCONNECT
                  </span>
                  <span className="text-[9px] text-white/50 tracking-wider whitespace-nowrap" style={{ textTransform: "none", letterSpacing: "0.05em" }}>Powered by RARE Labs</span>
                </div>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden lg:flex items-center gap-0.5">
              {!isAuthenticated ? (
                /* ── Logged-Out Nav ── */
                <>
                  <RichDropdown
                    align="left"
                    trigger={
                      <span className="px-3 py-2 rounded-md text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 cursor-pointer whitespace-nowrap inline-flex items-center gap-1 transition-colors" style={{ textTransform: "none" }}>
                        For Businesses <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                      </span>
                    }
                    items={forBusinessItems}
                  />
                  <RichDropdown
                    align="left"
                    trigger={
                      <span className="px-3 py-2 rounded-md text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 cursor-pointer whitespace-nowrap inline-flex items-center gap-1 transition-colors" style={{ textTransform: "none" }}>
                        For Athletes <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                      </span>
                    }
                    items={forAthleteItems}
                  />
                  <NavLink href="/leaderboard" label="Leaderboard" active={isActive("/leaderboard")} />
                  <NavLink href="/about" label="About" active={isActive("/about")} />
                  <RichDropdown
                    align="left"
                    trigger={
                      <span className={`px-3 py-2 rounded-md text-sm font-medium cursor-pointer whitespace-nowrap inline-flex items-center gap-1 transition-colors ${
                        isActive("/university") || isActive("/support") ? "text-primary font-semibold" : "text-white/70 hover:text-white hover:bg-white/5"
                      }`} style={{ textTransform: "none" }}>
                        Help <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                      </span>
                    }
                    items={helpItems}
                  />
                </>
              ) : (
                /* ── Logged-In Nav ── */
                <>
                  {isAdmin ? (
                    <RichDropdown
                      align="left"
                      trigger={
                        <span className={`px-3 py-2 rounded-md text-sm font-medium cursor-pointer whitespace-nowrap inline-flex items-center gap-1 transition-colors ${
                          isDashboardActive ? "text-primary font-semibold" : "text-white/70 hover:text-white hover:bg-white/5"
                        }`} style={{ textTransform: "none" }}>
                          Dashboard <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                        </span>
                      }
                      items={adminDashboardItems}
                    />
                  ) : (
                    <NavLink
                      href={getDashboardHref()}
                      label="Dashboard"
                      active={isDashboardActive}
                    />
                  )}
                  <NavLink href="/directory" label="Directory" active={isActive("/directory")} />
                  <NavLink href={getOffersHref()} label="Offers" active={isActive("/referral-offers")} />
                  <RichDropdown
                    align="left"
                    trigger={
                      <span className={`px-3 py-2 rounded-md text-sm font-medium cursor-pointer whitespace-nowrap inline-flex items-center gap-1 transition-colors ${
                        isActive("/university") || isActive("/support") || isActive("/leaderboard") || isActive("/about")
                          ? "text-primary font-semibold"
                          : "text-white/70 hover:text-white hover:bg-white/5"
                      }`} style={{ textTransform: "none" }}>
                        More <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                      </span>
                    }
                    items={[
                      { href: "/leaderboard", label: "Leaderboard", desc: "Top businesses & referrers", icon: Trophy, iconBg: "bg-amber-400/15 text-amber-300" },
                      { href: "/about", label: "About", desc: "Our mission & story", icon: Mountain, iconBg: "bg-white/10 text-white/60" },
                      ...helpItems,
                    ]}
                  />
                </>
              )}
            </nav>
          </div>

          {/* ── Right Side ── */}
          <div className="hidden lg:flex items-center gap-2">
            {isAuthenticated ? (
              /* ── Logged-In Right ── */
              <>
                <NotificationBell />

                {/* User dropdown: avatar + name + badge */}
                <RichDropdown
                  align="right"
                  width="w-56"
                  trigger={
                    <span className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                      <span className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-[oklch(0.60_0.15_55)] flex items-center justify-center text-xs font-bold text-white shrink-0">
                        {initials}
                      </span>
                      <span className="text-sm font-medium text-white max-w-[100px] truncate" style={{ textTransform: "none" }}>{displayName.split(" ")[0]}</span>
                      {getRoleBadge()}
                      <ChevronDown className="w-3.5 h-3.5 text-white/50" />
                    </span>
                  }
                  items={userMenuItems}
                />
              </>
            ) : (
              /* ── Logged-Out Right ── */
              <>
                <a href={getLoginUrl()}>
                  <span className="px-3 py-2 rounded-md text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 cursor-pointer transition-colors" style={{ textTransform: "none" }}>
                    Log In
                  </span>
                </a>
                <RichDropdown
                  align="right"
                  width="w-56"
                  trigger={
                    <Button className="bg-primary hover:bg-primary/90 text-white text-sm font-semibold gap-1" style={{ textTransform: "none" }}>
                      Sign Up <ChevronDown className="w-3.5 h-3.5 opacity-80" />
                    </Button>
                  }
                  items={signUpItems}
                />
              </>
            )}
          </div>

          {/* ── Mobile Toggle ── */}
          <button className="lg:hidden text-white p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* ═══════════════════════════════════════════
            MOBILE MENU
            ═══════════════════════════════════════════ */}
        {mobileOpen && (
          <div className="lg:hidden pb-4 border-t border-white/10 pt-4">
            <nav className="flex flex-col gap-0.5">
              {!isAuthenticated ? (
                /* ── Mobile Logged-Out ── */
                <>
                  <p className="px-3 py-1.5 text-[11px] font-semibold text-white/40 uppercase tracking-wider">For Businesses</p>
                  {forBusinessItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link key={item.label} href={item.href}>
                        <span className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-white/70 hover:text-white hover:bg-white/5 cursor-pointer" style={{ textTransform: "none" }} onClick={() => setMobileOpen(false)}>
                          {Icon && <Icon className="w-4 h-4 text-primary" />}
                          {item.label}
                        </span>
                      </Link>
                    );
                  })}

                  <p className="px-3 py-1.5 text-[11px] font-semibold text-white/40 uppercase tracking-wider mt-2">For Athletes</p>
                  {forAthleteItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link key={item.label} href={item.href}>
                        <span className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-white/70 hover:text-white hover:bg-white/5 cursor-pointer" style={{ textTransform: "none" }} onClick={() => setMobileOpen(false)}>
                          {Icon && <Icon className="w-4 h-4 text-emerald-400" />}
                          {item.label}
                        </span>
                      </Link>
                    );
                  })}

                  <div className="h-px bg-white/10 mx-3 my-2" />
                  <Link href="/leaderboard">
                    <span className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-white/70 hover:text-white hover:bg-white/5 cursor-pointer" style={{ textTransform: "none" }} onClick={() => setMobileOpen(false)}>
                      <Trophy className="w-4 h-4" /> Leaderboard
                    </span>
                  </Link>
                  <Link href="/about">
                    <span className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-white/70 hover:text-white hover:bg-white/5 cursor-pointer" style={{ textTransform: "none" }} onClick={() => setMobileOpen(false)}>
                      <Mountain className="w-4 h-4" /> About
                    </span>
                  </Link>
                  <Link href="/university">
                    <span className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-white/70 hover:text-white hover:bg-white/5 cursor-pointer" style={{ textTransform: "none" }} onClick={() => setMobileOpen(false)}>
                      <GraduationCap className="w-4 h-4" /> Tutorials & Guides
                    </span>
                  </Link>
                  <Link href="/support">
                    <span className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-white/70 hover:text-white hover:bg-white/5 cursor-pointer" style={{ textTransform: "none" }} onClick={() => setMobileOpen(false)}>
                      <HelpCircle className="w-4 h-4" /> Support
                    </span>
                  </Link>

                  <div className="h-px bg-white/10 mx-3 my-2" />
                  <a href={getLoginUrl()}>
                    <span className="block px-3 py-2.5 rounded-md text-sm font-medium text-white/70 hover:text-white cursor-pointer" style={{ textTransform: "none" }} onClick={() => setMobileOpen(false)}>
                      Log In
                    </span>
                  </a>
                  <a href={getLoginUrl("/onboarding?type=athlete")}>
                    <span className="flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium text-white/70 hover:text-white cursor-pointer" style={{ textTransform: "none" }} onClick={() => setMobileOpen(false)}>
                      <Bike className="w-4 h-4 text-emerald-400" /> Sign Up as Athlete
                    </span>
                  </a>
                  <a href={getLoginUrl("/onboarding?type=business")}>
                    <span className="flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium text-primary hover:text-white cursor-pointer" style={{ textTransform: "none" }} onClick={() => setMobileOpen(false)}>
                      <Building2 className="w-4 h-4" /> List Your Business
                    </span>
                  </a>
                </>
              ) : (
                /* ── Mobile Logged-In ── */
                <>
                  {/* User info */}
                  <div className="px-3 py-2.5 flex items-center gap-3">
                    <span className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-[oklch(0.60_0.15_55)] flex items-center justify-center text-sm font-bold text-white shrink-0">
                      {initials}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-white" style={{ textTransform: "none" }}>{displayName}</span>
                      <span className="text-[11px] text-white/40" style={{ textTransform: "none" }}>{user?.email}</span>
                    </div>
                    {getRoleBadge()}
                  </div>

                  <div className="h-px bg-white/10 mx-3 my-1.5" />

                  {/* Dashboard links */}
                  {isAdmin ? (
                    <>
                      <Link href="/admin">
                        <span className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-white/70 hover:text-white cursor-pointer" style={{ textTransform: "none" }} onClick={() => setMobileOpen(false)}>
                          <Shield className="w-4 h-4 text-amber-300" /> Admin Panel
                        </span>
                      </Link>
                      <Link href="/dashboard">
                        <span className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-white/70 hover:text-white cursor-pointer" style={{ textTransform: "none" }} onClick={() => setMobileOpen(false)}>
                          <Building2 className="w-4 h-4 text-primary" /> Biz Dashboard
                        </span>
                      </Link>
                      <Link href="/athlete-dashboard">
                        <span className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-white/70 hover:text-white cursor-pointer" style={{ textTransform: "none" }} onClick={() => setMobileOpen(false)}>
                          <Bike className="w-4 h-4 text-sky-400" /> Athlete View
                        </span>
                      </Link>
                    </>
                  ) : (
                    <Link href={getDashboardHref()}>
                      <span className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm cursor-pointer ${isDashboardActive ? "text-primary font-semibold" : "text-white/70 hover:text-white"}`} style={{ textTransform: "none" }} onClick={() => setMobileOpen(false)}>
                        {isBusinessOwner ? <Building2 className="w-4 h-4" /> : <Bike className="w-4 h-4" />} Dashboard
                      </span>
                    </Link>
                  )}

                  <div className="h-px bg-white/10 mx-3 my-1.5" />

                  <Link href="/directory">
                    <span className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm cursor-pointer ${isActive("/directory") ? "text-primary font-semibold" : "text-white/70 hover:text-white"}`} style={{ textTransform: "none" }} onClick={() => setMobileOpen(false)}>
                      <Search className="w-4 h-4" /> Directory
                    </span>
                  </Link>
                  <Link href={getOffersHref()}>
                    <span className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm cursor-pointer ${isActive("/referral-offers") ? "text-primary font-semibold" : "text-white/70 hover:text-white"}`} style={{ textTransform: "none" }} onClick={() => setMobileOpen(false)}>
                      <Handshake className="w-4 h-4" /> Offers
                    </span>
                  </Link>
                  <Link href="/leaderboard">
                    <span className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm cursor-pointer ${isActive("/leaderboard") ? "text-primary font-semibold" : "text-white/70 hover:text-white"}`} style={{ textTransform: "none" }} onClick={() => setMobileOpen(false)}>
                      <Trophy className="w-4 h-4" /> Leaderboard
                    </span>
                  </Link>
                  <Link href="/about">
                    <span className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-white/70 hover:text-white cursor-pointer" style={{ textTransform: "none" }} onClick={() => setMobileOpen(false)}>
                      <Mountain className="w-4 h-4" /> About
                    </span>
                  </Link>
                  <Link href="/university">
                    <span className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-white/70 hover:text-white cursor-pointer" style={{ textTransform: "none" }} onClick={() => setMobileOpen(false)}>
                      <GraduationCap className="w-4 h-4" /> Tutorials & Guides
                    </span>
                  </Link>
                  <Link href="/support">
                    <span className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-white/70 hover:text-white cursor-pointer" style={{ textTransform: "none" }} onClick={() => setMobileOpen(false)}>
                      <HelpCircle className="w-4 h-4" /> Support
                    </span>
                  </Link>

                  <div className="h-px bg-white/10 mx-3 my-1.5" />

                  <Link href="/account-settings">
                    <span className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-white/70 hover:text-white cursor-pointer" style={{ textTransform: "none" }} onClick={() => setMobileOpen(false)}>
                      <Settings className="w-4 h-4" /> Settings
                    </span>
                  </Link>
                  <button
                    className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-md text-sm text-white/60 hover:text-white"
                    onClick={() => { logout(); setMobileOpen(false); }}
                    style={{ textTransform: "none" }}
                  >
                    <LogOut className="w-4 h-4" /> Log Out
                  </button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
