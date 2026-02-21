import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useParams, useLocation, Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

export default function EditBusiness() {
  const { user, loading: authLoading } = useAuth({ redirectOnUnauthenticated: true });
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();

  const { data: sportCategories } = trpc.categories.sportCategories.useQuery();
  const { data: businessTypes } = trpc.categories.businessTypes.useQuery();

  const businessId = parseInt(params.id || "0");
  const { data: bizData, isLoading: bizLoading } = trpc.business.getById.useQuery(
    { id: businessId },
    { enabled: businessId > 0 }
  );

  const [form, setForm] = useState({
    name: "",
    shortDescription: "",
    description: "",
    sportCategoryId: "",
    businessTypeId: "",
    city: "",
    state: "",
    country: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    instagram: "",
    facebook: "",
  });

  useEffect(() => {
    if (bizData?.business) {
      const b = bizData.business;
      setForm({
        name: b.name || "",
        shortDescription: b.shortDescription || "",
        description: b.description || "",
        sportCategoryId: String(b.sportCategoryId),
        businessTypeId: String(b.businessTypeId),
        city: b.city || "",
        state: b.state || "",
        country: b.country || "",
        address: b.address || "",
        phone: b.phone || "",
        email: b.email || "",
        website: b.website || "",
        instagram: b.instagram || "",
        facebook: b.facebook || "",
      });
    }
  }, [bizData]);

  const updateMutation = trpc.business.update.useMutation({
    onSuccess: () => {
      toast.success("Business updated successfully!");
      navigate("/dashboard");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update business");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      id: businessId,
      ...form,
      sportCategoryId: parseInt(form.sportCategoryId),
      businessTypeId: parseInt(form.businessTypeId),
    });
  };

  const updateField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  if (authLoading || bizLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (bizData && bizData.business.claimedByUserId !== user?.id && user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="container py-20 text-center">
          <h2 className="text-2xl font-bold mb-4">Not Authorized</h2>
          <p className="text-muted-foreground mb-6" style={{ textTransform: "none" }}>You don't have permission to edit this business.</p>
          <Link href="/dashboard"><Button className="bg-primary text-primary-foreground">Back to Dashboard</Button></Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <div className="bg-card border-b border-border">
        <div className="container py-3">
          <Link href="/dashboard">
            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground cursor-pointer" style={{ textTransform: "none" }}>
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </span>
          </Link>
        </div>
      </div>

      <section className="py-8">
        <div className="container max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pencil className="w-5 h-5" /> Edit Business
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Basic Information</h3>
                  <div>
                    <Label htmlFor="name" style={{ textTransform: "none" }}>Business Name *</Label>
                    <Input id="name" value={form.name} onChange={(e) => updateField("name", e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="shortDescription" style={{ textTransform: "none" }}>Short Description</Label>
                    <Input id="shortDescription" value={form.shortDescription} onChange={(e) => updateField("shortDescription", e.target.value)} maxLength={500} />
                  </div>
                  <div>
                    <Label htmlFor="description" style={{ textTransform: "none" }}>Full Description</Label>
                    <Textarea id="description" value={form.description} onChange={(e) => updateField("description", e.target.value)} rows={4} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label style={{ textTransform: "none" }}>Sport Category *</Label>
                      <Select value={form.sportCategoryId} onValueChange={(v) => updateField("sportCategoryId", v)}>
                        <SelectTrigger><SelectValue placeholder="Select sport" /></SelectTrigger>
                        <SelectContent>
                          {sportCategories?.map(cat => (
                            <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label style={{ textTransform: "none" }}>Business Type *</Label>
                      <Select value={form.businessTypeId} onValueChange={(v) => updateField("businessTypeId", v)}>
                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>
                          {businessTypes?.map(bt => (
                            <SelectItem key={bt.id} value={String(bt.id)}>{bt.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Location</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div><Label style={{ textTransform: "none" }}>City</Label><Input value={form.city} onChange={(e) => updateField("city", e.target.value)} /></div>
                    <div><Label style={{ textTransform: "none" }}>State</Label><Input value={form.state} onChange={(e) => updateField("state", e.target.value)} /></div>
                    <div><Label style={{ textTransform: "none" }}>Country</Label><Input value={form.country} onChange={(e) => updateField("country", e.target.value)} /></div>
                  </div>
                  <div><Label style={{ textTransform: "none" }}>Address</Label><Input value={form.address} onChange={(e) => updateField("address", e.target.value)} /></div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Contact</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label style={{ textTransform: "none" }}>Phone</Label><Input value={form.phone} onChange={(e) => updateField("phone", e.target.value)} /></div>
                    <div><Label style={{ textTransform: "none" }}>Email</Label><Input type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} /></div>
                  </div>
                  <div><Label style={{ textTransform: "none" }}>Website</Label><Input value={form.website} onChange={(e) => updateField("website", e.target.value)} /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label style={{ textTransform: "none" }}>Instagram</Label><Input value={form.instagram} onChange={(e) => updateField("instagram", e.target.value)} /></div>
                    <div><Label style={{ textTransform: "none" }}>Facebook</Label><Input value={form.facebook} onChange={(e) => updateField("facebook", e.target.value)} /></div>
                  </div>
                </div>

                <Button type="submit" className="w-full bg-primary text-primary-foreground" disabled={updateMutation.isPending} style={{ textTransform: "none" }}>
                  {updateMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
