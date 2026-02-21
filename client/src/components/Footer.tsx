import { Link } from "wouter";
import { Mountain, Bike, Snowflake, Compass } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[oklch(0.22_0.02_50)] text-white/70 border-t border-white/10">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[oklch(0.55_0.15_45)] flex items-center justify-center">
                <Mountain className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold text-white tracking-wide leading-tight" style={{ fontFamily: "var(--font-heading)" }}>
                  SPORTCONNECT
                </span>
                <span className="text-[9px] text-white/40 tracking-wider" style={{ textTransform: "none", letterSpacing: "0.05em" }}>Powered by RARE Labs</span>
              </div>
            </div>
            <p className="text-sm leading-relaxed" style={{ textTransform: "none", letterSpacing: "normal" }}>
              The referral marketplace connecting endurance sports businesses and enthusiasts. Grow together through collaboration.
            </p>
          </div>

          {/* Directory */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">Sports</h4>
            <ul className="space-y-2 text-sm" style={{ textTransform: "none", letterSpacing: "normal" }}>
              <li><Link href="/directory?sport=cycling"><span className="hover:text-white transition-colors cursor-pointer flex items-center gap-2"><Bike className="w-3 h-3" /> Cycling</span></Link></li>
              <li><Link href="/directory?sport=running"><span className="hover:text-white transition-colors cursor-pointer flex items-center gap-2"><Mountain className="w-3 h-3" /> Running</span></Link></li>
              <li><Link href="/directory?sport=snowsports"><span className="hover:text-white transition-colors cursor-pointer flex items-center gap-2"><Snowflake className="w-3 h-3" /> Snowsports</span></Link></li>
              <li><Link href="/directory?sport=sport-vacations"><span className="hover:text-white transition-colors cursor-pointer flex items-center gap-2"><Compass className="w-3 h-3" /> Sport Vacations</span></Link></li>
            </ul>
          </div>

          {/* Regions */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">Top Regions</h4>
            <ul className="space-y-2 text-sm" style={{ textTransform: "none", letterSpacing: "normal" }}>
              <li><Link href="/directory?region=Dolomites"><span className="hover:text-white transition-colors cursor-pointer">Dolomites</span></Link></li>
              <li><Link href="/directory?region=Pyrenees"><span className="hover:text-white transition-colors cursor-pointer">Pyrenees</span></Link></li>
              <li><Link href="/directory?region=Mallorca"><span className="hover:text-white transition-colors cursor-pointer">Mallorca</span></Link></li>
              <li><Link href="/directory?region=Alps"><span className="hover:text-white transition-colors cursor-pointer">Alps</span></Link></li>
              <li><Link href="/directory?region=Western+Canada"><span className="hover:text-white transition-colors cursor-pointer">Western Canada</span></Link></li>
              <li><Link href="/directory?region=Western+US"><span className="hover:text-white transition-colors cursor-pointer">Western US</span></Link></li>
            </ul>
          </div>

          {/* For Businesses */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">For Businesses</h4>
            <ul className="space-y-2 text-sm" style={{ textTransform: "none", letterSpacing: "normal" }}>
              <li><Link href="/directory"><span className="hover:text-white transition-colors cursor-pointer">Claim Your Business</span></Link></li>
              <li><Link href="/referral-offers"><span className="hover:text-white transition-colors cursor-pointer">B2B Offers</span></Link></li>
              <li><Link href="/dashboard"><span className="hover:text-white transition-colors cursor-pointer">Business Dashboard</span></Link></li>
            </ul>
          </div>

          {/* For Enthusiasts */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">For Enthusiasts</h4>
            <ul className="space-y-2 text-sm" style={{ textTransform: "none", letterSpacing: "normal" }}>
              <li><Link href="/directory"><span className="hover:text-white transition-colors cursor-pointer">Find Local Pros</span></Link></li>
              <li><Link href="/referral-offers"><span className="hover:text-white transition-colors cursor-pointer">Consumer Offers</span></Link></li>
              <li><Link href="/directory?sport=sport-vacations"><span className="hover:text-white transition-colors cursor-pointer">Sport Vacations</span></Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40" style={{ textTransform: "none", letterSpacing: "normal" }}>
            &copy; {new Date().getFullYear()} SportConnect. Built for the endurance sports community.
          </p>
          <div className="flex items-center gap-4 text-xs text-white/40" style={{ textTransform: "none", letterSpacing: "normal" }}>
            <span>Cycling</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>Running</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>Snowsports</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>Sport Vacations</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
