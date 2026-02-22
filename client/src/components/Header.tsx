import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Link, useLocation } from "wouter";
import { Menu, X, Mountain } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();

  const navLinks = [
    { href: "/directory", label: "Directory" },
    { href: "/referral-offers", label: "Referral Offers" },
    { href: "/submit-business", label: "Submit Business" },
    { href: "/leaderboard", label: "Leaderboard" },
    { href: "/about", label: "About" },
    { href: "/support", label: "Support" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 bg-[oklch(0.22_0.02_50)] border-b border-white/10 backdrop-blur-sm">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <img src="/favicon-64.png" alt="SportConnect" className="w-9 h-9 rounded-lg" />
              <div className="flex flex-col">
                <span className="text-lg font-bold text-white tracking-wide leading-tight" style={{ fontFamily: "var(--font-heading)" }}>
                  SPORTCONNECT
                </span>
                <span className="text-[9px] text-white/40 tracking-wider" style={{ textTransform: "none", letterSpacing: "0.05em" }}>Powered by RARE Labs</span>
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
                <Link href="/dashboard">
                  <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10 text-sm" style={{ textTransform: "none" }}>
                    Dashboard
                  </Button>
                </Link>
                {user?.role === 'admin' && (
                  <Link href="/admin">
                    <Button variant="ghost" className="text-amber-400/80 hover:text-amber-300 hover:bg-white/10 text-sm" style={{ textTransform: "none" }}>
                      Admin
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
                <a href={getLoginUrl("/onboarding")}>
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 bg-transparent text-sm" style={{ textTransform: "none" }}>
                    <Mountain className="w-3.5 h-3.5 mr-1.5" /> I'm an Enthusiast
                  </Button>
                </a>
                <Link href="/submit-business">
                  <Button className="bg-[oklch(0.55_0.15_45)] hover:bg-[oklch(0.50_0.15_45)] text-white text-sm" style={{ textTransform: "none" }}>
                    List Your Business
                  </Button>
                </Link>
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
                    <Link href="/dashboard">
                      <span className="block px-3 py-2 rounded-md text-sm font-medium text-white/70 hover:text-white cursor-pointer" style={{ textTransform: "none" }} onClick={() => setMobileOpen(false)}>
                        Dashboard
                      </span>
                    </Link>
                    {user?.role === 'admin' && (
                      <Link href="/admin">
                        <span className="block px-3 py-2 rounded-md text-sm font-medium text-amber-400/80 hover:text-amber-300 cursor-pointer" style={{ textTransform: "none" }} onClick={() => setMobileOpen(false)}>
                          Admin Panel
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
                    <a href={getLoginUrl("/onboarding")}>
                      <span className="block px-3 py-2 rounded-md text-sm font-medium text-white/70 hover:text-white cursor-pointer" style={{ textTransform: "none" }} onClick={() => setMobileOpen(false)}>
                        <span className="inline-flex items-center gap-1.5"><Mountain className="w-3.5 h-3.5" /> I'm an Enthusiast</span>
                      </span>
                    </a>
                    <Link href="/submit-business">
                      <span className="block px-3 py-2 rounded-md text-sm font-medium text-[oklch(0.55_0.15_45)] hover:text-white cursor-pointer" style={{ textTransform: "none" }} onClick={() => setMobileOpen(false)}>
                        List Your Business
                      </span>
                    </Link>
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
