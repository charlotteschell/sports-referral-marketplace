import { Button } from "@/components/ui/button";
import { AlertCircle, Home, Search, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 flex items-center justify-center py-20">
        <div className="w-full max-w-lg mx-4 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-[oklch(0.55_0.15_45)]/20 rounded-full animate-pulse" />
              <AlertCircle className="relative h-16 w-16 text-[oklch(0.65_0.18_55)]" />
            </div>
          </div>

          <h1 className="text-5xl font-black text-foreground mb-2" style={{ fontFamily: "'Oswald', sans-serif" }}>404</h1>

          <h2 className="text-xl font-semibold text-muted-foreground mb-4">
            Wrong Turn
          </h2>

          <p className="text-muted-foreground mb-8 leading-relaxed">
            This page doesn't exist. Kind of like your rest days.
            <br />
            Let's get you back on course.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => setLocation("/")}
              className="bg-[oklch(0.55_0.15_45)] hover:bg-[oklch(0.50_0.15_45)] text-white"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
            <Button
              onClick={() => setLocation("/directory")}
              variant="outline"
              className="border-border text-foreground hover:bg-accent"
            >
              <Search className="w-4 h-4 mr-2" />
              Browse Directory
            </Button>
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              className="border-border text-foreground hover:bg-accent"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
