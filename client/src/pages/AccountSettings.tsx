import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { AlertTriangle, User, Bell, Trash2, Shield } from "lucide-react";

export default function AccountSettings() {
  const { user, loading: authLoading } = useAuth();
  const utils = trpc.useUtils();

  const { data: profile, isLoading: profileLoading } = trpc.userProfile.get.useQuery(undefined, {
    enabled: !!user,
  });

  const updateProfile = trpc.userProfile.update.useMutation({
    onSuccess: () => {
      utils.userProfile.get.invalidate();
      utils.auth.me.invalidate();
      toast.success("Profile updated");
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteAccount = trpc.userProfile.deleteAccount.useMutation({
    onSuccess: () => {
      toast.success("Account deleted. Redirecting...");
      setTimeout(() => { window.location.href = "/"; }, 2000);
    },
    onError: (err) => toast.error(err.message),
  });

  const [contactName, setContactName] = useState("");
  const [notifPref, setNotifPref] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [profileInitialized, setProfileInitialized] = useState(false);

  // Initialize form from profile data
  if (profile && !profileInitialized) {
    setContactName(profile.contactName || "");
    setNotifPref(profile.notificationPreference || "both");
    setProfileInitialized(true);
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 text-center text-muted-foreground">Loading...</div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 text-center">
          <h2 className="text-2xl font-bold mb-4">Sign in to access account settings</h2>
          <a href={getLoginUrl("/account-settings")}>
            <Button size="lg">Sign In</Button>
          </a>
        </div>
        <Footer />
      </div>
    );
  }

  const handleSaveProfile = () => {
    const updates: { contactName?: string; notificationPreference?: "in_app_only" | "email_only" | "both" | "none" } = {};
    if (contactName !== (profile?.contactName || "")) updates.contactName = contactName;
    if (notifPref !== (profile?.notificationPreference || "both")) {
      updates.notificationPreference = notifPref as any;
    }
    if (Object.keys(updates).length === 0) {
      toast.info("No changes to save");
      return;
    }
    updateProfile.mutate(updates);
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmText !== "DELETE MY ACCOUNT") {
      toast.error('Please type "DELETE MY ACCOUNT" to confirm');
      return;
    }
    deleteAccount.mutate({ confirmText: "DELETE MY ACCOUNT" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container max-w-3xl py-12">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Account Settings</h1>
        <p className="text-muted-foreground mb-8">Manage your profile, notifications, and account</p>

        {/* Profile Section */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle>Profile</CardTitle>
            </div>
            <CardDescription>Your personal information. Your contact name is private and only visible to you.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="contactName">Contact Name (private — only you see this)</Label>
              <Input
                id="contactName"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Your name"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={profile?.email || ""} disabled className="mt-1 opacity-60" />
              <p className="text-xs text-muted-foreground mt-1">Email is managed through your login provider</p>
            </div>
            <div>
              <Label>Account Type</Label>
              <Input value={profile?.accountType === "business_owner" ? "Business Owner" : "Athlete / Consumer"} disabled className="mt-1 opacity-60" />
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle>Notification Preferences</CardTitle>
            </div>
            <CardDescription>Choose how you'd like to receive notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={notifPref} onValueChange={setNotifPref}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="both">In-app + Email (recommended)</SelectItem>
                <SelectItem value="in_app_only">In-app only</SelectItem>
                <SelectItem value="email_only">Email only</SelectItem>
                <SelectItem value="none">None — opt out of all notifications</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end mb-10">
          <Button onClick={handleSaveProfile} disabled={updateProfile.isPending}>
            {updateProfile.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        {/* Danger Zone */}
        {user.role !== "admin" && (
          <Card className="border-destructive/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-destructive" />
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
              </div>
              <CardDescription>
                Permanently delete your account. This action cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-destructive mb-1">What happens when you delete your account:</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Your personal information (name, email) will be permanently removed</li>
                      <li>Your businesses will be hidden from the public directory</li>
                      <li>Your referral offers will be deactivated</li>
                      <li>Your saved businesses and notifications will be deleted</li>
                      <li>Your previous referral activity will be preserved anonymously as "Deleted Account"</li>
                    </ul>
                  </div>
                </div>
              </div>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                className="w-full sm:w-auto"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete My Account
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Admin notice */}
        {user.role === "admin" && (
          <Card className="border-amber-500/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-amber-500" />
                <CardTitle className="text-amber-600">Admin Account</CardTitle>
              </div>
              <CardDescription>
                Admin accounts cannot be self-deleted. Contact another admin if you need to remove your account.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
      <Footer />

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Delete Your Account
            </DialogTitle>
            <DialogDescription>
              This action is permanent and cannot be undone. Your personal data will be erased, and your businesses will be hidden from the directory.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="deleteConfirm" className="text-sm font-medium">
                Type <span className="font-mono font-bold text-destructive">DELETE MY ACCOUNT</span> to confirm
              </Label>
              <Input
                id="deleteConfirm"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE MY ACCOUNT"
                className="mt-2 font-mono"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowDeleteDialog(false); setDeleteConfirmText(""); }}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== "DELETE MY ACCOUNT" || deleteAccount.isPending}
            >
              {deleteAccount.isPending ? "Deleting..." : "Permanently Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
