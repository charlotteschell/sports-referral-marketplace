import { useState, useEffect } from "react";
import { X, ChevronDown, ChevronUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const STORAGE_KEY = "sportconnect_beta_seen";

const HEADLINE = "You're in the breakaway group.";
const SUBHEADLINE = "Welcome to the SportConnect beta.";

const BODY_PARAGRAPHS = [
  "We're quietly testing the platform with a handful of businesses and athletes before our official launch on March 1st.",
  "For businesses, this is your chance to finally get paid for the referrals you already make — and grow revenue from a network of trusted partners.",
  "For athletes, it's where you'll find deals and the best local pros your friends actually recommend.",
  "Things might be a little wobbly, but the early riders in our network will likely see the most referral action right from the gun. It's our way of saying thanks for helping us kick the tires.",
  "If you know other business owners or athletes who belong in the peloton, we'd appreciate you spreading the word.",
];

export default function BetaBanner() {
  const [showPopup, setShowPopup] = useState(false);
  const [bannerExpanded, setBannerExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) {
      // First-time visitor: show popup
      const timer = setTimeout(() => setShowPopup(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  function handlePopupClose() {
    setShowPopup(false);
    localStorage.setItem(STORAGE_KEY, "true");
  }

  function handleBannerDismiss() {
    setDismissed(true);
  }

  // Don't render anything if user dismissed the banner for this session
  if (dismissed) return null;

  return (
    <>
      {/* Popup Modal for first-time visitors */}
      <Dialog open={showPopup} onOpenChange={(open) => { if (!open) handlePopupClose(); }}>
        <DialogContent className="sm:max-w-lg bg-[oklch(0.20_0.03_50)] border-[oklch(0.55_0.15_45)]/30 text-white p-0 overflow-hidden">
          {/* Accent top bar */}
          <div className="h-1.5 bg-gradient-to-r from-[oklch(0.55_0.15_45)] via-amber-500 to-[oklch(0.55_0.15_45)]" />
          
          <div className="px-6 pt-5 pb-6">
            <DialogHeader className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-[oklch(0.55_0.15_45)]/20 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-[oklch(0.55_0.15_45)]" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[oklch(0.55_0.15_45)]">
                  Beta Access
                </span>
              </div>
              <DialogTitle className="text-2xl font-bold text-white leading-tight" style={{ fontFamily: "var(--font-heading)" }}>
                {HEADLINE}
                <br />
                <span className="text-[oklch(0.55_0.15_45)]">{SUBHEADLINE}</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 text-sm text-white/70 leading-relaxed" style={{ textTransform: "none", letterSpacing: "normal" }}>
              {BODY_PARAGRAPHS.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={handlePopupClose}
                className="bg-[oklch(0.55_0.15_45)] hover:bg-[oklch(0.50_0.15_45)] text-white font-semibold px-6"
              >
                Let's ride
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Collapsed / Expandable Banner — always visible after popup dismissed or for returning visitors */}
      {!showPopup && (
        <div className="relative z-50">
          {/* Collapsed banner */}
          <div
            className="bg-gradient-to-r from-[oklch(0.22_0.04_50)] via-[oklch(0.25_0.05_45)] to-[oklch(0.22_0.04_50)] border-b border-[oklch(0.55_0.15_45)]/20 cursor-pointer select-none"
            onClick={() => setBannerExpanded(!bannerExpanded)}
          >
            <div className="container flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-[oklch(0.55_0.15_45)]" />
                <span className="text-xs font-semibold text-[oklch(0.55_0.15_45)] uppercase tracking-wider">
                  Beta
                </span>
                <span className="text-xs text-white/60 hidden sm:inline">
                  — {HEADLINE} {SUBHEADLINE}
                </span>
                <span className="text-xs text-white/60 sm:hidden">
                  — Welcome to the beta
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  className="p-1 text-white/40 hover:text-white/70 transition-colors"
                  onClick={(e) => { e.stopPropagation(); setBannerExpanded(!bannerExpanded); }}
                  aria-label={bannerExpanded ? "Collapse banner" : "Expand banner"}
                >
                  {bannerExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                <button
                  className="p-1 text-white/40 hover:text-white/70 transition-colors"
                  onClick={(e) => { e.stopPropagation(); handleBannerDismiss(); }}
                  aria-label="Dismiss banner"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Expanded content */}
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out bg-[oklch(0.20_0.03_50)] border-b border-[oklch(0.55_0.15_45)]/10 ${
              bannerExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="container py-4">
              <h3 className="text-base font-bold text-white mb-1" style={{ fontFamily: "var(--font-heading)" }}>
                {HEADLINE} <span className="text-[oklch(0.55_0.15_45)]">{SUBHEADLINE}</span>
              </h3>
              <div className="space-y-2 text-sm text-white/60 leading-relaxed max-w-3xl" style={{ textTransform: "none", letterSpacing: "normal" }}>
                {BODY_PARAGRAPHS.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
