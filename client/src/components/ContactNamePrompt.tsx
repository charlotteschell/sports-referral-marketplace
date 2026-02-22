import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { User, Loader2 } from "lucide-react";

/**
 * ContactNamePrompt: Shows a modal overlay when a logged-in user
 * has completed onboarding but hasn't set their contact name yet.
 * This ensures every user has a real name displayed in the nav bar
 * and throughout the platform instead of their email/OAuth username.
 */
export default function ContactNamePrompt() {
  const { user, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const [name, setName] = useState("");
  const [dismissed, setDismissed] = useState(false);

  const setContactName = trpc.userProfile.setContactName.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
      toast.success("Thanks! Your name has been saved.");
      setDismissed(true);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to save name. Please try again.");
    },
  });

  // Pre-fill with existing name if available
  useEffect(() => {
    if ((user?.contactName || user?.name) && !name) {
      setName(user?.contactName || user?.name || "");
    }
  }, [user]);

  // Only show if: authenticated, onboarding complete, no contactName set, not dismissed
  const shouldShow =
    isAuthenticated &&
    user &&
    user.onboardingComplete &&
    !user.contactName &&
    !dismissed;

  if (!shouldShow) return null;

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Please enter your name.");
      return;
    }
    setContactName.mutate({ contactName: trimmed });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-card text-card-foreground rounded-xl shadow-2xl border border-border max-w-md w-full mx-4 p-6 animate-in fade-in-0 zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>
              What should we call you?
            </h2>
            <p className="text-sm text-muted-foreground" style={{ textTransform: "none" }}>
              Your name shows up in the nav bar and across the platform.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5" style={{ textTransform: "none" }}>
              Your full name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Charlotte Schell"
              className="text-sm"
              style={{ textTransform: "none" }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
              autoFocus
            />
            <p className="text-xs text-muted-foreground mt-1" style={{ textTransform: "none" }}>
              This is how other users and businesses will see you on SportConnect.
            </p>
          </div>

          <Button
            className="w-full bg-primary text-primary-foreground"
            style={{ textTransform: "none" }}
            onClick={handleSubmit}
            disabled={setContactName.isPending || !name.trim()}
          >
            {setContactName.isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...</>
            ) : (
              "Save My Name"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
