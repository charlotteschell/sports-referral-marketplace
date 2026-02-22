import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useLocation, Link } from "wouter";
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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ArrowLeft, Building2, Loader2, Camera, X, Tag } from "lucide-react";
import { useState, useRef, useMemo } from "react";

// Business types that should show the brands field
const RETAILER_TYPE_NAMES = ["Bike Retailer", "Bike Shop", "Running Store", "Ski Shop", "Supplement Retailer"];

export default function AddBusiness() {
  const { user, loading } = useAuth({ redirectOnUnauthenticated: true });
  const [, navigate] = useLocation();

  const { data: sportCategories } = trpc.categories.sportCategories.useQuery();
  const { data: businessTypes } = trpc.categories.businessTypes.useQuery();
  const { data: regions } = trpc.categories.regions.useQuery();
  const { data: hubs } = trpc.categories.hubs.useQuery();

  const [form, setForm] = useState({
    name: "",
    shortDescription: "",
    description: "",
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

  // Multi-select state
  const [selectedSportCategoryIds, setSelectedSportCategoryIds] = useState<number[]>([]);
  const [selectedBusinessTypeIds, setSelectedBusinessTypeIds] = useState<number[]>([]);

  // Logo upload state (upload after creation)
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const utils = trpc.useUtils();

  const uploadLogo = trpc.logoUpload.upload.useMutation();

  const createMutation = trpc.business.create.useMutation({
    onSuccess: async (data) => {
      // Upload logo if one was selected
      if (logoFile && data.id) {
        try {
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1] || '';
            uploadLogo.mutate({
              businessId: data.id,
              logoData: base64,
              contentType: logoFile.type,
            });
          };
          reader.readAsDataURL(logoFile);
        } catch {
          // Logo upload failed but business was created
        }
      }
      toast.success("Business created! It'll be reviewed by our team shortly.");
      navigate(`/business/${data.slug}`);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create business");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) {
      toast.error("Your business needs a name. Even a bad one.");
      return;
    }
    if (selectedSportCategoryIds.length === 0) {
      toast.error("Pick at least one sport category");
      return;
    }
    if (selectedBusinessTypeIds.length === 0) {
      toast.error("Pick at least one business type");
      return;
    }
    createMutation.mutate({
      ...form,
      sportCategoryId: selectedSportCategoryIds[0],
      businessTypeId: selectedBusinessTypeIds[0],
      sportCategoryIds: selectedSportCategoryIds,
      businessTypeIds: selectedBusinessTypeIds,
    });
  };

  const updateField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // Toggle a sport category
  const toggleSportCategory = (id: number) => {
    setSelectedSportCategoryIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Toggle a business type
  const toggleBusinessType = (id: number) => {
    setSelectedBusinessTypeIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Check if any selected business type is a retailer (should show brands)
  const isRetailerType = useMemo(() => {
    if (selectedBusinessTypeIds.length === 0 || !businessTypes) return false;
    return selectedBusinessTypeIds.some(id => {
      const bt = businessTypes.find(t => t.id === id);
      return bt ? RETAILER_TYPE_NAMES.includes(bt.name) : false;
    });
  }, [selectedBusinessTypeIds, businessTypes]);

  // Filter hubs by selected region (deduplicated)
  const filteredHubs = useMemo(() => {
    if (!hubs) return [];
    const filtered = !form.region ? hubs : hubs.filter((h: any) => h.region === form.region);
    const seen = new Set<string>();
    return filtered.filter((h: any) => {
      if (seen.has(h.hub)) return false;
      seen.add(h.hub);
      return true;
    });
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

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large. Max 5MB.");
      return;
    }
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
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
          {/* Logo Upload Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" /> Business Logo
              </CardTitle>
              <CardDescription style={{ textTransform: "none" }}>
                Upload your business logo. Max 5MB. Supported formats: JPG, PNG, WebP, SVG.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-muted/30 shrink-0">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-8 h-8 text-muted-foreground/40" />
                  )}
                </div>
                <div className="flex-1">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    style={{ textTransform: "none" }}
                  >
                    <Camera className="w-4 h-4 mr-2" /> Choose File
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoSelect}
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
                <Building2 className="w-5 h-5" /> Add New Business
              </CardTitle>
              <CardDescription style={{ textTransform: "none" }}>
                Fill in the details below. The more you share, the easier it is for partners and athletes to find you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
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
                    <Textarea id="description" value={form.description} onChange={(e) => updateField("description", e.target.value)} placeholder="Tell people what makes your business worth knowing about..." rows={4} />
                  </div>

                  {/* Multi-select Sport Categories */}
                  <div>
                    <Label style={{ textTransform: "none" }}>Sport Categories * <span className="text-xs text-muted-foreground font-normal">(select all that apply)</span></Label>
                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {sportCategories?.map(cat => (
                        <label
                          key={cat.id}
                          className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                            selectedSportCategoryIds.includes(cat.id)
                              ? "border-primary bg-primary/5 text-foreground"
                              : "border-border bg-card hover:border-muted-foreground/30"
                          }`}
                        >
                          <Checkbox
                            checked={selectedSportCategoryIds.includes(cat.id)}
                            onCheckedChange={() => toggleSportCategory(cat.id)}
                          />
                          <span className="text-sm" style={{ textTransform: "none" }}>{cat.name}</span>
                        </label>
                      ))}
                    </div>
                    {selectedSportCategoryIds.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {selectedSportCategoryIds.map(id => {
                          const cat = sportCategories?.find(c => c.id === id);
                          return cat ? (
                            <Badge key={id} variant="secondary" className="text-xs gap-1 pr-1" style={{ textTransform: "none" }}>
                              {cat.name}
                              <button type="button" onClick={() => toggleSportCategory(id)} className="ml-0.5 hover:bg-destructive/20 rounded-full p-0.5">
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>

                  {/* Multi-select Business Types */}
                  <div>
                    <Label style={{ textTransform: "none" }}>Business Types * <span className="text-xs text-muted-foreground font-normal">(select all that apply)</span></Label>
                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {businessTypes?.map(bt => (
                        <label
                          key={bt.id}
                          className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                            selectedBusinessTypeIds.includes(bt.id)
                              ? "border-primary bg-primary/5 text-foreground"
                              : "border-border bg-card hover:border-muted-foreground/30"
                          }`}
                        >
                          <Checkbox
                            checked={selectedBusinessTypeIds.includes(bt.id)}
                            onCheckedChange={() => toggleBusinessType(bt.id)}
                          />
                          <span className="text-sm" style={{ textTransform: "none" }}>{bt.name}</span>
                        </label>
                      ))}
                    </div>
                    {selectedBusinessTypeIds.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {selectedBusinessTypeIds.map(id => {
                          const bt = businessTypes?.find(t => t.id === id);
                          return bt ? (
                            <Badge key={id} variant="secondary" className="text-xs gap-1 pr-1" style={{ textTransform: "none" }}>
                              {bt.name}
                              <button type="button" onClick={() => toggleBusinessType(id)} className="ml-0.5 hover:bg-destructive/20 rounded-full p-0.5">
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>

                  {/* Brands field - shown for retailer types */}
                  {isRetailerType && (
                    <div className="space-y-3 p-4 rounded-lg border border-border bg-muted/20">
                      <Label className="flex items-center gap-2" style={{ textTransform: "none" }}>
                        <Tag className="w-4 h-4" /> Brands Carried
                      </Label>
                      <p className="text-xs text-muted-foreground" style={{ textTransform: "none" }}>
                        Add the brands you stock or represent. Helps customers and partners find you.
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
                    <div><Label style={{ textTransform: "none" }}>City</Label><Input value={form.city} onChange={(e) => updateField("city", e.target.value)} placeholder="City" /></div>
                    <div><Label style={{ textTransform: "none" }}>State/Province</Label><Input value={form.state} onChange={(e) => updateField("state", e.target.value)} placeholder="State" /></div>
                    <div><Label style={{ textTransform: "none" }}>Country</Label><Input value={form.country} onChange={(e) => updateField("country", e.target.value)} placeholder="Country" /></div>
                  </div>
                  <div><Label style={{ textTransform: "none" }}>Address</Label><Input value={form.address} onChange={(e) => updateField("address", e.target.value)} placeholder="Street address" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label style={{ textTransform: "none" }}>Region</Label>
                      <Select value={form.region} onValueChange={(v) => {
                        updateField("region", v);
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
                    <div><Label style={{ textTransform: "none" }}>Phone</Label><Input value={form.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder="+1 (555) 000-0000" /></div>
                    <div><Label style={{ textTransform: "none" }}>Email</Label><Input type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} placeholder="info@business.com" /></div>
                  </div>
                  <div><Label style={{ textTransform: "none" }}>Website</Label><Input value={form.website} onChange={(e) => updateField("website", e.target.value)} placeholder="yourbusiness.com" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label style={{ textTransform: "none" }}>Instagram Handle</Label><Input value={form.instagram} onChange={(e) => updateField("instagram", e.target.value)} placeholder="username" /></div>
                    <div><Label style={{ textTransform: "none" }}>Facebook URL</Label><Input value={form.facebook} onChange={(e) => updateField("facebook", e.target.value)} placeholder="https://facebook.com/..." /></div>
                  </div>
                </div>

                <Button type="submit" className="w-full bg-primary text-primary-foreground" disabled={createMutation.isPending} style={{ textTransform: "none" }}>
                  {createMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</> : "Create Business"}
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
