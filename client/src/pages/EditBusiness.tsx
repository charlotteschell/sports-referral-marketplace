import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useParams, useLocation, Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Loader2, Camera, X, Tag } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";

// Business types that should show the brands field
const RETAILER_TYPE_NAMES = ["Bike Retailer", "Bike Shop", "Running Store", "Ski Shop", "Supplement Retailer"];

export default function EditBusiness() {
  const { user, loading: authLoading } = useAuth({ redirectOnUnauthenticated: true });
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();

  const { data: sportCategories } = trpc.categories.sportCategories.useQuery();
  const { data: businessTypes } = trpc.categories.businessTypes.useQuery();
  const { data: regions } = trpc.categories.regions.useQuery();
  const { data: hubs } = trpc.categories.hubs.useQuery();

  const businessId = parseInt(params.id || "0");
  const { data: bizData, isLoading: bizLoading } = trpc.business.getById.useQuery(
    { id: businessId },
    { enabled: businessId > 0 }
  );

  const [formInitialized, setFormInitialized] = useState(false);
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
    brandsCarried: "",
  });

  // Logo upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const utils = trpc.useUtils();

  const uploadLogo = trpc.logoUpload.upload.useMutation({
    onSuccess: () => {
      toast.success("Logo updated!");
      setUploading(false);
      utils.business.getById.invalidate({ id: businessId });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to upload logo");
      setUploading(false);
    },
  });

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large. Max 5MB.");
      return;
    }
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1] || '';
        uploadLogo.mutate({
          businessId,
          logoData: base64,
          contentType: file.type,
        });
      };
      reader.readAsDataURL(file);
    } catch {
      setUploading(false);
      toast.error("Failed to read file");
    }
  };

  // Initialize form from business data - only once when data loads
  useEffect(() => {
    if (bizData?.business && !formInitialized) {
      const b = bizData.business;
      setForm({
        name: b.name || "",
        shortDescription: b.shortDescription || "",
        description: b.description || "",
        sportCategoryId: b.sportCategoryId ? String(b.sportCategoryId) : "",
        businessTypeId: b.businessTypeId ? String(b.businessTypeId) : "",
        city: b.city || "",
        state: b.state || "",
        country: b.country || "",
        address: b.address || "",
        region: b.region || "",
        hub: b.hub || "",
        phone: b.phone || "",
        email: b.email || "",
        website: b.website || "",
        instagram: b.instagram || "",
        facebook: b.facebook || "",
        brandsCarried: (b as any).brandsCarried || "",
      });
      setFormInitialized(true);
    }
  }, [bizData, formInitialized]);

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
      sportCategoryId: form.sportCategoryId ? parseInt(form.sportCategoryId) : undefined,
      businessTypeId: form.businessTypeId ? parseInt(form.businessTypeId) : undefined,
    });
  };

  const updateField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // Check if selected business type is a retailer (should show brands)
  const isRetailerType = useMemo(() => {
    if (!form.businessTypeId || !businessTypes) return false;
    const selectedType = businessTypes.find(bt => bt.id === parseInt(form.businessTypeId));
    return selectedType ? RETAILER_TYPE_NAMES.includes(selectedType.name) : false;
  }, [form.businessTypeId, businessTypes]);

  // Filter hubs by selected region
  const filteredHubs = useMemo(() => {
    if (!hubs) return [];
    if (!form.region) return hubs;
    return hubs.filter((h: any) => h.region === form.region);
  }, [hubs, form.region]);

  // Brands management
  const brandsList = useMemo(() => {
    if (!form.brandsCarried) return [];
    return form.brandsCarried.split(",").map(b => b.trim()).filter(Boolean);
  }, [form.brandsCarried]);

  const [newBrand, setNewBrand] = useState("");

  const addBrand = () => {
    const brand = newBrand.trim();
    if (!brand) return;
    if (brandsList.includes(brand)) {
      toast.info("Brand already added");
      return;
    }
    const updated = [...brandsList, brand].join(", ");
    updateField("brandsCarried", updated);
    setNewBrand("");
  };

  const removeBrand = (brand: string) => {
    const updated = brandsList.filter(b => b !== brand).join(", ");
    updateField("brandsCarried", updated);
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
          {/* Logo Upload Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" /> Business Logo
              </CardTitle>
              <CardDescription style={{ textTransform: "none" }}>
                Upload or update your business logo. Max 5MB. Supported formats: JPG, PNG, WebP, SVG.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-muted/30 shrink-0">
                  {bizData?.business.logoUrl ? (
                    <img src={bizData.business.logoUrl} alt="Logo" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <Camera className="w-8 h-8 text-muted-foreground/40" />
                  )}
                </div>
                <div className="flex-1">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    style={{ textTransform: "none" }}
                  >
                    {uploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</> : <><Camera className="w-4 h-4 mr-2" /> Choose File</>}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                  <p className="text-xs text-muted-foreground mt-2" style={{ textTransform: "none" }}>
                    Your logo appears on directory cards and your business profile.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

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

                  {/* Brands field - shown for retailer types */}
                  {isRetailerType && (
                    <div className="space-y-3 p-4 rounded-lg border border-border bg-muted/20">
                      <Label className="flex items-center gap-2" style={{ textTransform: "none" }}>
                        <Tag className="w-4 h-4" /> Brands Carried
                      </Label>
                      <p className="text-xs text-muted-foreground" style={{ textTransform: "none" }}>
                        Add the brands you stock or represent. This helps customers and partners find you.
                      </p>
                      {brandsList.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {brandsList.map((brand) => (
                            <Badge key={brand} variant="secondary" className="text-xs gap-1 pr-1" style={{ textTransform: "none" }}>
                              {brand}
                              <button
                                type="button"
                                onClick={() => removeBrand(brand)}
                                className="ml-0.5 hover:bg-destructive/20 rounded-full p-0.5"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Input
                          placeholder="e.g., Specialized, Trek, Shimano..."
                          value={newBrand}
                          onChange={(e) => setNewBrand(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addBrand();
                            }
                          }}
                          className="flex-1"
                        />
                        <Button type="button" variant="outline" size="sm" onClick={addBrand} style={{ textTransform: "none" }}>
                          Add
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Location</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div><Label style={{ textTransform: "none" }}>City</Label><Input value={form.city} onChange={(e) => updateField("city", e.target.value)} /></div>
                    <div><Label style={{ textTransform: "none" }}>State</Label><Input value={form.state} onChange={(e) => updateField("state", e.target.value)} /></div>
                    <div><Label style={{ textTransform: "none" }}>Country</Label><Input value={form.country} onChange={(e) => updateField("country", e.target.value)} /></div>
                  </div>
                  <div><Label style={{ textTransform: "none" }}>Address</Label><Input value={form.address} onChange={(e) => updateField("address", e.target.value)} /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label style={{ textTransform: "none" }}>Region</Label>
                      <Select value={form.region} onValueChange={(v) => {
                        updateField("region", v);
                        // Reset hub when region changes if hub doesn't belong to new region
                        if (form.hub && hubs) {
                          const hubInRegion = hubs.find((h: any) => h.hub === form.hub && h.region === v);
                          if (!hubInRegion) updateField("hub", "");
                        }
                      }}>
                        <SelectTrigger><SelectValue placeholder="Select region" /></SelectTrigger>
                        <SelectContent>
                          {regions?.map((r: string) => (
                            <SelectItem key={r} value={r}>{r}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label style={{ textTransform: "none" }}>Hub / Area</Label>
                      <Select value={form.hub} onValueChange={(v) => updateField("hub", v)}>
                        <SelectTrigger><SelectValue placeholder="Select hub" /></SelectTrigger>
                        <SelectContent>
                          {filteredHubs.map((h: any) => (
                            <SelectItem key={h.hub} value={h.hub}>{h.hub}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
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
