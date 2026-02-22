import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ContactNamePrompt() {
  const { user, isAuthenticated } = useAuth();
  const [name, setName] = useState("");
  const [dismissed, setDismissed] = useState(false);

  const utils = trpc.useUtils();
  const updateProfile = trpc.userProfile.update.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
      setDismissed(true);
    },
  });

  // Only show if logged in, onboarding complete, and no contactName set
  if (!isAuthenticated || !user || !user.onboardingComplete || user.contactName || dismissed) {
    return null;
  }

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    updateProfile.mutate({ contactName: trimmed });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[oklch(0.25_0.02_50)] border border-white/15 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-heading)" }}>
          What should we call you?
        </h2>
        <p className="text-white/60 text-sm mb-4">
          This is your private contact name — only you will see it. We'll use it to address you in notifications and messages.
        </p>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={user.name || "Your name"}
          className="mb-4 bg-white/10 border-white/20 text-white placeholder:text-white/40"
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          autoFocus
        />
        <div className="flex gap-2">
          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || updateProfile.isPending}
            className="flex-1 bg-[oklch(0.55_0.15_45)] hover:bg-[oklch(0.50_0.15_45)] text-white"
          >
            {updateProfile.isPending ? "Saving..." : "Save My Name"}
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              if (user.name) {
                updateProfile.mutate({ contactName: user.name });
              } else {
                setDismissed(true);
              }
            }}
            className="text-white/50 hover:text-white hover:bg-white/10"
          >
            Skip
          </Button>
        </div>
      </div>
    </div>
  );
}
