import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Settings, User, Bell, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function AccountSettings() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  const [contactName, setContactName] = useState("");
  const [notifPref, setNotifPref] = useState("both");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const utils = trpc.useUtils();

  const updateProfile = trpc.userProfile.update.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
      toast.success("Settings saved");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteAccount = trpc.userProfile.deleteAccount.useMutation({
    onSuccess: () => {
      toast.success("Account deleted. Redirecting...");
      setTimeout(() => { window.location.href = "/"; }, 1500);
    },
    onError: (err: any) => toast.error(err.message),
  });

  useEffect(() => {
    if (user) {
      setContactName(user.contactName || user.name || "");
      setNotifPref(user.notificationPreference || "both");
    }
  }, [user]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[oklch(0.18_0.02_50)] flex items-center justify-center">
          <div className="text-white/60">Loading...</div>
        </div>
      </>
    );
  }

  if (!isAuthenticated) {
    navigate("/");
    return null;
  }

  const handleSaveProfile = () => {
    const updates: Record<string, string> = {};
    if (contactName.trim() && contactName !== (user?.contactName || user?.name)) {
      updates.contactName = contactName.trim();
    }
    if (notifPref !== (user?.notificationPreference || "both")) {
      updates.notificationPreference = notifPref;
    }
    if (Object.keys(updates).length > 0) {
      updateProfile.mutate(updates as any);
    } else {
      toast.info("No changes to save");
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[oklch(0.18_0.02_50)] py-8">
        <div className="container max-w-2xl">
          <div className="flex items-center gap-3 mb-8">
            <Settings className="w-7 h-7 text-[oklch(0.75_0.15_55)]" />
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
              Account Settings
            </h1>
          </div>

          {/* Profile Section */}
          <Card className="bg-[oklch(0.22_0.02_50)] border-white/10 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="w-5 h-5" /> Profile
              </CardTitle>
              <CardDescription className="text-white/50">
                Your private contact name — only you see this. We use it to address you in notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-white/70 mb-1 block">Contact Name</label>
                <Input
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  placeholder="How should we address you?"
                />
              </div>
              <div>
                <label className="text-sm text-white/70 mb-1 block">Email</label>
                <Input
                  value={user?.email || ""}
                  disabled
                  className="bg-white/5 border-white/10 text-white/50"
                />
                <p className="text-xs text-white/40 mt-1">Email is managed through your login provider</p>
              </div>
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card className="bg-[oklch(0.22_0.02_50)] border-white/10 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Bell className="w-5 h-5" /> Notification Preferences
              </CardTitle>
              <CardDescription className="text-white/50">
                Choose how you'd like to receive notifications about referrals, claims, and updates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={notifPref} onValueChange={setNotifPref}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="both">In-App + Email</SelectItem>
                  <SelectItem value="in_app_only">In-App Only</SelectItem>
                  <SelectItem value="email_only">Email Only</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end mb-10">
            <Button
              onClick={handleSaveProfile}
              disabled={updateProfile.isPending}
              className="bg-[oklch(0.55_0.15_45)] hover:bg-[oklch(0.50_0.15_45)] text-white px-8"
            >
              {updateProfile.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>

          {/* Danger Zone */}
          <Card className="bg-[oklch(0.22_0.02_50)] border-red-500/30">
            <CardHeader>
              <CardTitle className="text-red-400 flex items-center gap-2">
                <Trash2 className="w-5 h-5" /> Danger Zone
              </CardTitle>
              <CardDescription className="text-white/50">
                Permanently delete your account. Your referral history will be preserved anonymously as "Deleted Account" to maintain data integrity for other users.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!showDeleteConfirm ? (
                <Button
                  variant="outline"
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10 bg-transparent"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Delete My Account
                </Button>
              ) : (
                <div className="space-y-4 p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-red-300 font-medium">This action cannot be undone</p>
                      <p className="text-white/50 text-sm mt-1">
                        Your account, profile, and businesses will be removed. Past referral activity will be anonymized.
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-white/70 mb-1 block">Type "DELETE" to confirm</label>
                    <Input
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      className="bg-white/10 border-red-500/30 text-white placeholder:text-white/30"
                      placeholder="DELETE"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="border-red-500/50 text-red-400 hover:bg-red-500/20 bg-transparent"
                      disabled={deleteConfirmText !== "DELETE" || deleteAccount.isPending}
                      onClick={() => deleteAccount.mutate()}
                    >
                      {deleteAccount.isPending ? "Deleting..." : "Permanently Delete Account"}
                    </Button>
                    <Button
                      variant="ghost"
                      className="text-white/50 hover:text-white"
                      onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(""); }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
