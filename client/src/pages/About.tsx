import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Heart, Coffee, Mountain, Users, Clock, HandHeart, Zap } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const ABOUT_HERO = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663371988607/GSsAYVXwIlZznLhu.jpg";
const ABOUT_VOLUNTEERS = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663371988607/JsbXrVJnnSpJXqEl.jpg";
const ABOUT_COMMUNITY = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663371988607/WdUcGqrXsOPVoFXc.jpg";

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <img
          src={ABOUT_HERO}
          alt="Sports community gathering at a mountain trailhead"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
        <div className="relative h-full container flex items-end pb-12">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              We Didn't Invent Referrals. We Just Gave Them Wi-Fi.
            </h1>
            <p className="text-lg text-white/90" style={{ textTransform: "none", letterSpacing: "normal" }}>
              Sports businesses have been sending customers to each other forever. We just made it trackable, incentivised, and not limited to whoever you happen to know personally.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 md:py-24">
        <div className="container max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">The Honest Version</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed" style={{ textTransform: "none", letterSpacing: "normal" }}>
                Here's the thing: the cycling coach in Boulder already tells clients about the sports nutritionist across town. The bike shop in Girona already points tourists toward the best physio. The running club in Calgary already recommends that one massage therapist everyone loves. This stuff happens every single day.
              </p>
              <p className="text-muted-foreground mb-4 leading-relaxed" style={{ textTransform: "none", letterSpacing: "normal" }}>
                But it's all word-of-mouth. It only works if you've spent years building local relationships. It doesn't cross borders. Nobody tracks it. Nobody gets properly thanked. And the small business owner who just opened shop? They're invisible until they've put in their time.
              </p>
              <p className="text-muted-foreground leading-relaxed" style={{ textTransform: "none", letterSpacing: "normal" }}>
                We thought: what if we just made the thing that's already happening... actually work? A place where sports businesses can find each other, set up referral incentives, and grow together — locally and across borders. Not a disruption. Not a revolution. Just the obvious thing that nobody had built yet. So we did. Badly at first, but we're getting better.
              </p>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-lg">
              <img
                src={ABOUT_VOLUNTEERS}
                alt="Volunteers planning community events"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* The Real Problem */}
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container max-w-4xl">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            The Problem (As We See It)
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-background rounded-xl p-8 shadow-sm border border-border/50">
              <h3 className="text-xl font-semibold text-foreground mb-3">Word-of-Mouth Is Brilliant</h3>
              <p className="text-muted-foreground leading-relaxed" style={{ textTransform: "none", letterSpacing: "normal" }}>
                A referral from someone you trust beats any Instagram ad. When a coach says "go see this physio," the client actually goes. It's the most powerful marketing channel in sports — and it costs nothing. The problem isn't the concept.
              </p>
            </div>
            <div className="bg-background rounded-xl p-8 shadow-sm border border-border/50">
              <h3 className="text-xl font-semibold text-foreground mb-3">...But It's Painfully Limited</h3>
              <p className="text-muted-foreground leading-relaxed" style={{ textTransform: "none", letterSpacing: "normal" }}>
                It only works with people you already know. It's restricted to your local area. It takes years of community building to develop. New businesses can't access it. Nobody tracks who sent who. And the person doing the referring? They get a "thanks mate" at best. As endurance athletes and small business owners, we already do many hard things the hard way. Revenue growth shouldn't be one of them.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Volunteer-Driven Banner */}
      <section className="bg-gradient-to-r from-emerald-600 to-teal-700 py-16">
        <div className="container max-w-4xl text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-white/20 rounded-full p-4">
              <Heart className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-6">
            100% Volunteer Powered (Yes, Really)
          </h2>
          <p className="text-white/90 text-lg leading-relaxed max-w-2xl mx-auto mb-8" style={{ textTransform: "none", letterSpacing: "normal" }}>
            This entire platform is built and maintained by unpaid volunteers who are passionate about these sports. We're the people who think a 5am ride before work is "self-care." Our judgment may be questionable, but our commitment isn't.
          </p>
          <div className="bg-white/10 rounded-2xl p-8 max-w-2xl mx-auto backdrop-blur-sm">
            <p className="text-white/95 text-lg italic leading-relaxed" style={{ textTransform: "none", letterSpacing: "normal" }}>
              "The world ran just fine before this marketplace existed. And our volunteers have day jobs that occasionally demand attention so they can afford their bike habit. We're pedaling as fast as we can. Literally and figuratively."
            </p>
          </div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container max-w-5xl">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            What We Actually Care About
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-background rounded-xl p-8 shadow-sm border border-border/50">
              <div className="bg-emerald-100 dark:bg-emerald-900/30 rounded-full w-14 h-14 flex items-center justify-center mb-5">
                <Users className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Community Over Competition</h3>
              <p className="text-muted-foreground leading-relaxed" style={{ textTransform: "none", letterSpacing: "normal" }}>
                Local sports businesses do better when they work together. A referral from a trusted partner is worth more than any ad spend. We're not here to disrupt anything — we're here to connect people who should've been connected already.
              </p>
            </div>
            <div className="bg-background rounded-xl p-8 shadow-sm border border-border/50">
              <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full w-14 h-14 flex items-center justify-center mb-5">
                <Mountain className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">We Actually Do These Sports</h3>
              <p className="text-muted-foreground leading-relaxed" style={{ textTransform: "none", letterSpacing: "normal" }}>
                Every volunteer on this project is an active cyclist, runner, or snow sports enthusiast. We've bonked on long rides, DNF'd races, overtrained into injury, and still signed up for the next one. We understand the ecosystem because we can't stop participating in it.
              </p>
            </div>
            <div className="bg-background rounded-xl p-8 shadow-sm border border-border/50">
              <div className="bg-amber-100 dark:bg-amber-900/30 rounded-full w-14 h-14 flex items-center justify-center mb-5">
                <HandHeart className="w-7 h-7 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">No Shady Stuff</h3>
              <p className="text-muted-foreground leading-relaxed" style={{ textTransform: "none", letterSpacing: "normal" }}>
                We verify businesses. We don't sell your data. We don't take a cut of your referrals. We're not building this to flip it to some VC. Just good people helping good people grow their businesses. Boring? Maybe. Trustworthy? We hope so.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Community Image + Future Plans */}
      <section className="py-16 md:py-24">
        <div className="container max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 rounded-2xl overflow-hidden shadow-lg">
              <img
                src={ABOUT_COMMUNITY}
                alt="Athletes celebrating together on a mountain summit"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-3xl font-bold text-foreground mb-6">The Money Question</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed" style={{ textTransform: "none", letterSpacing: "normal" }}>
                Right now, SportConnect is completely free. Funded by our own coffee money and the occasional post-ride beer fund. We believe in building something valuable first and figuring out sustainability later. (Our accountant hates this plan.)
              </p>
              <p className="text-muted-foreground mb-4 leading-relaxed" style={{ textTransform: "none", letterSpacing: "normal" }}>
                At some point, as the network grows, we may ask for donations or a small fee to cover hosting costs. But that day isn't today. And when it comes, we'll be upfront about it — because that's how we'd want to be treated.
              </p>
              <div className="bg-muted/50 rounded-xl p-6 border border-border/50">
                <div className="flex items-center gap-3 mb-3">
                  <Coffee className="w-5 h-5 text-amber-600" />
                  <span className="font-semibold text-foreground">Currently Free. Seriously.</span>
                </div>
                <p className="text-sm text-muted-foreground" style={{ textTransform: "none", letterSpacing: "normal" }}>
                  No subscription fees, no commissions, no hidden costs, no "premium tier" upsell. If you want to buy us a coffee though, we won't say no. We're volunteers, not monks.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Patience Note */}
      <section className="bg-muted/30 py-16">
        <div className="container max-w-3xl text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-amber-100 dark:bg-amber-900/30 rounded-full p-4">
              <Clock className="w-8 h-8 text-amber-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-4">A Gentle Disclaimer</h2>
          <p className="text-muted-foreground leading-relaxed mb-4" style={{ textTransform: "none", letterSpacing: "normal" }}>
            We're a small team of volunteers who squeeze in development time between rides, runs, and ski days. (Priorities, right?) If you spot a bug, we appreciate your patience. If you have a suggestion, we genuinely want to hear it. And if you want to help build this thing, pull up a chair.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-6" style={{ textTransform: "none", letterSpacing: "normal" }}>
            Found something broken? Got a brilliant idea? Just want to tell us our copy is trying too hard? We're all ears.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:support@rarelabs.ai"
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            >
              <Heart className="w-4 h-4" />
              Email Us
            </a>
            <Link href="/support">
              <Button variant="outline" className="bg-transparent px-6 py-3 h-auto font-medium">
                <Zap className="w-4 h-4 mr-2" />
                Submit a Ticket
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
