import { Link } from "wouter";
import { Mountain, Bike, Snowflake, Compass } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[oklch(0.22_0.02_50)] text-white/70 border-t border-white/10">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663371988607/omxbSEHhGlQLbCoQ.png" alt="SportConnect" className="w-10 h-10 rounded-lg" style={{ filter: "drop-shadow(0 0 6px rgba(200,140,60,0.35))" }} />
              <div className="flex flex-col">
                <span className="text-lg font-bold text-white tracking-wide leading-tight" style={{ fontFamily: "var(--font-heading)" }}>
                  SPORTCONNECT
                </span>
                <span className="text-[9px] text-white/50 tracking-wider" style={{ textTransform: "none", letterSpacing: "0.05em" }}>Powered by RARE Labs</span>
              </div>
            </div>
            <p className="text-sm leading-relaxed" style={{ textTransform: "none", letterSpacing: "normal" }}>
              The referral network for endurance sports businesses. Because growing your business shouldn't be harder than a 200km ride.
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
              <li><Link href="/directory?region=Colorado+Front+Range"><span className="hover:text-white transition-colors cursor-pointer">Colorado Front Range</span></Link></li>
              <li><Link href="/directory?region=Pacific+Northwest"><span className="hover:text-white transition-colors cursor-pointer">Pacific Northwest</span></Link></li>
              <li><Link href="/directory?region=Catalonia"><span className="hover:text-white transition-colors cursor-pointer">Girona / Catalonia</span></Link></li>
              <li><Link href="/directory?region=Mallorca"><span className="hover:text-white transition-colors cursor-pointer">Mallorca</span></Link></li>
              <li><Link href="/directory?region=Western+Canada"><span className="hover:text-white transition-colors cursor-pointer">Western Canada</span></Link></li>
              <li><Link href="/directory?region=Dolomites"><span className="hover:text-white transition-colors cursor-pointer">Dolomites</span></Link></li>
              <li><Link href="/directory?region=Alps"><span className="hover:text-white transition-colors cursor-pointer">Alps</span></Link></li>
              <li><Link href="/directory?region=Pyrenees"><span className="hover:text-white transition-colors cursor-pointer">Pyrenees</span></Link></li>
            </ul>
          </div>

          {/* For Businesses */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">For Businesses</h4>
            <ul className="space-y-2 text-sm" style={{ textTransform: "none", letterSpacing: "normal" }}>
              <li><Link href="/directory"><span className="hover:text-white transition-colors cursor-pointer">Claim Your Business</span></Link></li>
              <li><Link href="/referral-offers"><span className="hover:text-white transition-colors cursor-pointer">B2B Offers</span></Link></li>
              <li><Link href="/dashboard"><span className="hover:text-white transition-colors cursor-pointer">Business Dashboard</span></Link></li>
              <li><Link href="/submit-business"><span className="hover:text-white transition-colors cursor-pointer">List Your Business</span></Link></li>
              <li><Link href="/about"><span className="hover:text-white transition-colors cursor-pointer">About Us</span></Link></li>
              <li><Link href="/support"><span className="hover:text-white transition-colors cursor-pointer">Support</span></Link></li>
              <li><a href="mailto:support@rarelabs.ai"><span className="hover:text-white transition-colors cursor-pointer">Contact Us</span></a></li>
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
            &copy; {new Date().getFullYear()} SportConnect. Built by athletes who should probably be training instead.
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
