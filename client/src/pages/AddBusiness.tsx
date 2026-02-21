import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useLocation, Link } from "wouter";
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
import { ArrowLeft, Building2, Loader2 } from "lucide-react";
import { useState } from "react";

export default function AddBusiness() {
  const { user, loading } = useAuth({ redirectOnUnauthenticated: true });
  const [, navigate] = useLocation();

  const { data: sportCategories } = trpc.categories.sportCategories.useQuery();
  const { data: businessTypes } = trpc.categories.businessTypes.useQuery();

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
    region: "",
    hub: "",
    phone: "",
    email: "",
    website: "",
    instagram: "",
    facebook: "",
  });

  const createMutation = trpc.business.create.useMutation({
    onSuccess: (data) => {
      toast.success("Business created successfully!");
      navigate(`/business/${data.slug}`);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create business");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.sportCategoryId || !form.businessTypeId) {
      toast.error("Please fill in all required fields");
      return;
    }
    createMutation.mutate({
      ...form,
      sportCategoryId: parseInt(form.sportCategoryId),
      businessTypeId: parseInt(form.businessTypeId),
    });
  };

  const updateField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
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
                <Building2 className="w-5 h-5" /> Add New Business
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Basic Information</h3>

                  <div>
                    <Label htmlFor="name" style={{ textTransform: "none" }}>Business Name *</Label>
                    <Input id="name" value={form.name} onChange={(e) => updateField("name", e.target.value)} placeholder="e.g., Summit Cycling Coaching" />
                  </div>

                  <div>
                    <Label htmlFor="shortDescription" style={{ textTransform: "none" }}>Short Description</Label>
                    <Input id="shortDescription" value={form.shortDescription} onChange={(e) => updateField("shortDescription", e.target.value)} placeholder="Brief tagline (max 500 chars)" maxLength={500} />
                  </div>

                  <div>
                    <Label htmlFor="description" style={{ textTransform: "none" }}>Full Description</Label>
                    <Textarea id="description" value={form.description} onChange={(e) => updateField("description", e.target.value)} placeholder="Describe your business in detail..." rows={4} />
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

                {/* Location */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Location</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city" style={{ textTransform: "none" }}>City</Label>
                      <Input id="city" value={form.city} onChange={(e) => updateField("city", e.target.value)} placeholder="City" />
                    </div>
                    <div>
                      <Label htmlFor="state" style={{ textTransform: "none" }}>State/Province</Label>
                      <Input id="state" value={form.state} onChange={(e) => updateField("state", e.target.value)} placeholder="State" />
                    </div>
                    <div>
                      <Label htmlFor="country" style={{ textTransform: "none" }}>Country</Label>
                      <Input id="country" value={form.country} onChange={(e) => updateField("country", e.target.value)} placeholder="Country" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address" style={{ textTransform: "none" }}>Address</Label>
                    <Input id="address" value={form.address} onChange={(e) => updateField("address", e.target.value)} placeholder="Street address" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="region" style={{ textTransform: "none" }}>Region</Label>
                      <Input id="region" value={form.region} onChange={(e) => updateField("region", e.target.value)} placeholder="e.g., Dolomites, Western Canada" />
                    </div>
                    <div>
                      <Label htmlFor="hub" style={{ textTransform: "none" }}>Hub / Area</Label>
                      <Input id="hub" value={form.hub} onChange={(e) => updateField("hub", e.target.value)} placeholder="e.g., Cortina d'Ampezzo, Whistler" />
                    </div>
                  </div>
                </div>

                {/* Contact */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Contact</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone" style={{ textTransform: "none" }}>Phone</Label>
                      <Input id="phone" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder="+1 (555) 000-0000" />
                    </div>
                    <div>
                      <Label htmlFor="email" style={{ textTransform: "none" }}>Email</Label>
                      <Input id="email" type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} placeholder="info@business.com" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="website" style={{ textTransform: "none" }}>Website</Label>
                    <Input id="website" value={form.website} onChange={(e) => updateField("website", e.target.value)} placeholder="https://www.example.com" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="instagram" style={{ textTransform: "none" }}>Instagram Handle</Label>
                      <Input id="instagram" value={form.instagram} onChange={(e) => updateField("instagram", e.target.value)} placeholder="username" />
                    </div>
                    <div>
                      <Label htmlFor="facebook" style={{ textTransform: "none" }}>Facebook URL</Label>
                      <Input id="facebook" value={form.facebook} onChange={(e) => updateField("facebook", e.target.value)} placeholder="https://facebook.com/..." />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground"
                  disabled={createMutation.isPending}
                  style={{ textTransform: "none" }}
                >
                  {createMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</>
                  ) : (
                    "Create Business"
                  )}
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
