import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Heart, Coffee, Mountain, Users, Clock, HandHeart } from "lucide-react";

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
              Built by Athletes, for Athletes
            </h1>
            <p className="text-lg text-white/90">
              A community-driven marketplace connecting the small businesses that fuel our passion for cycling, trail running, and snow sports.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 md:py-24">
        <div className="container max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">Our Story</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                SportConnect was born from a simple observation: the small businesses that serve our sporting communities — the coaches, bike shops, nutritionists, sport psychologists, running clubs, and cycling studios — often operate in silos. They serve the same passionate athletes but rarely collaborate.
              </p>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                We believe that when a cycling coach refers a client to a trusted sports nutritionist, or when a bike shop recommends a great sport psychologist, everyone wins — the businesses grow, and the athletes get better care.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                That's why we built this referral marketplace: to make it easy for sports SMBs to find each other, collaborate, and grow together through mutual referrals.
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

      {/* Volunteer-Driven Banner */}
      <section className="bg-gradient-to-r from-emerald-600 to-teal-700 py-16">
        <div className="container max-w-4xl text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-white/20 rounded-full p-4">
              <Heart className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-6">
            100% Volunteer-Driven
          </h2>
          <p className="text-white/90 text-lg leading-relaxed max-w-2xl mx-auto mb-8">
            This site is purely driven by unpaid volunteers who are passionate about these sports themselves. We're cyclists, runners, and skiers who believe in the power of community. So please be patient if there's a small bug, or if responses are a bit delayed.
          </p>
          <div className="bg-white/10 rounded-2xl p-8 max-w-2xl mx-auto backdrop-blur-sm">
            <p className="text-white/95 text-lg italic leading-relaxed">
              "Just remember, the world still ran before this marketplace was created! And our volunteers sometimes have real bosses at their day jobs that may demand their attention so they can pay the bills."
            </p>
          </div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container max-w-5xl">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            What Drives Us
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-background rounded-xl p-8 shadow-sm border border-border/50">
              <div className="bg-emerald-100 dark:bg-emerald-900/30 rounded-full w-14 h-14 flex items-center justify-center mb-5">
                <Users className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Community First</h3>
              <p className="text-muted-foreground leading-relaxed">
                We exist to help local sports businesses collaborate and thrive together. When one business grows, the whole community benefits.
              </p>
            </div>
            <div className="bg-background rounded-xl p-8 shadow-sm border border-border/50">
              <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full w-14 h-14 flex items-center justify-center mb-5">
                <Mountain className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Passion for Sport</h3>
              <p className="text-muted-foreground leading-relaxed">
                Every volunteer on this project is an active cyclist, runner, or snow sports enthusiast. We understand the ecosystem because we live it.
              </p>
            </div>
            <div className="bg-background rounded-xl p-8 shadow-sm border border-border/50">
              <div className="bg-amber-100 dark:bg-amber-900/30 rounded-full w-14 h-14 flex items-center justify-center mb-5">
                <HandHeart className="w-7 h-7 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Trust & Transparency</h3>
              <p className="text-muted-foreground leading-relaxed">
                All businesses are verified before being listed. We maintain quality so you can refer with confidence and build lasting partnerships.
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
              <h2 className="text-3xl font-bold text-foreground mb-6">Looking Ahead</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Right now, we're keeping SportConnect completely free — funded by our own coffee money. We believe in building something valuable first and figuring out sustainability later.
              </p>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                At some point, as the number of businesses and activities increase, we may ask for donations or a small payment to help support the basic cost of running and building this site. But that day isn't today.
              </p>
              <div className="bg-muted/50 rounded-xl p-6 border border-border/50">
                <div className="flex items-center gap-3 mb-3">
                  <Coffee className="w-5 h-5 text-amber-600" />
                  <span className="font-semibold text-foreground">Currently Free</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  No subscription fees, no commissions, no hidden costs. Just a community of sports enthusiasts helping each other grow.
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
          <h2 className="text-2xl font-bold text-foreground mb-4">A Note on Patience</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            We're a small team of volunteers who squeeze in development time between rides, runs, and ski days. If you spot a bug, we appreciate your understanding. If you have a suggestion, we'd love to hear it. And if you want to help, we'd be thrilled to have you on board.
          </p>
          <a
            href="mailto:hello@sportconnect.com"
            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
          >
            <Heart className="w-4 h-4" />
            Get in Touch
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
