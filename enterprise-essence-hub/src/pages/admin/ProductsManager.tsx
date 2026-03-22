import { useEffect, useState } from "react";
import { admin } from "@/integrations/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search, X } from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";

type Product = {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  is_published: boolean;
  created_at: string;
};

type ProductForm = {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  external_url: string;
  features: string;
  benefits: string;
  pricing: string;
  color: string;
  is_published: boolean;
  seo_title: string;
  seo_description: string;
  sort_order: number;
  logo_url: string;
  screenshots: string;
};

const emptyForm: ProductForm = {
  name: "",
  slug: "",
  tagline: "",
  description: "",
  external_url: "",
  features: "[]",
  benefits: "[]",
  pricing: "{}",
  color: "#000000",
  is_published: false,
  seo_title: "",
  seo_description: "",
  sort_order: 0,
  logo_url: "",
  screenshots: "[]",
};

export default function ProductsManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [searchQ, setSearchQ] = useState("");

  const fetchData = async () => {
    const data = await admin.products.list();
    setProducts((data as Product[]) || []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleNew = () => {
    setForm(emptyForm);
    setEditing(null);
    setOpen(true);
  };

  const handleEdit = async (id: string) => {
    const data = await admin.products.get(id);
    if (data) {
      setForm({
        name: data.name || "",
        slug: data.slug || "",
        tagline: data.tagline || "",
        description: data.description || "",
        external_url: data.external_url || "",
        features: JSON.stringify(data.features || []),
        benefits: JSON.stringify(data.benefits || []),
        pricing: JSON.stringify(data.pricing || {}),
        color: data.color || "#000000",
        is_published: data.is_published || false,
        seo_title: data.seo_title || "",
        seo_description: data.seo_description || "",
        sort_order: data.sort_order || 0,
        logo_url: data.logo_url || "",
        screenshots: JSON.stringify(data.screenshots || []),
      });
      setEditing(id);
      setOpen(true);
    }
  };

  const validateJSONFields = (): boolean => {
    // Validate features (must be array)
    try {
      const features = JSON.parse(form.features);
      if (!Array.isArray(features)) {
        toast.error("Features must be a JSON array (e.g., [\"feature1\", \"feature2\"])");
        return false;
      }
    } catch (e) {
      toast.error("Invalid JSON in Features field");
      return false;
    }

    // Validate benefits (must be array)
    try {
      const benefits = JSON.parse(form.benefits);
      if (!Array.isArray(benefits)) {
        toast.error("Benefits must be a JSON array (e.g., [\"benefit1\", \"benefit2\"])");
        return false;
      }
    } catch (e) {
      toast.error("Invalid JSON in Benefits field");
      return false;
    }

    // Validate pricing (must be object)
    try {
      const pricing = JSON.parse(form.pricing);
      if (typeof pricing !== "object" || Array.isArray(pricing) || pricing === null) {
        toast.error("Pricing must be a JSON object (e.g., {\"basic\": 99, \"pro\": 199})");
        return false;
      }
    } catch (e) {
      toast.error("Invalid JSON in Pricing field");
      return false;
    }

    // Validate screenshots (must be array)
    try {
      const screenshots = JSON.parse(form.screenshots);
      if (!Array.isArray(screenshots)) {
        toast.error("Screenshots must be a JSON array of image URLs");
        return false;
      }
    } catch (e) {
      toast.error("Invalid JSON in Screenshots field");
      return false;
    }

    return true;
  };

  const validateColor = (color: string): boolean => {
    // Validate hex color format
    if (!/^#[0-9A-F]{6}$/i.test(color)) {
      toast.error("Color must be a valid hex format (e.g., #FF5733)");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!form.slug.trim()) {
      toast.error("Slug is required");
      return;
    }

    // Validate color format
    if (!validateColor(form.color)) {
      return;
    }

    if (!validateJSONFields()) {
      return;
    }

    try {
      // Safely parse JSON fields with null coalescing
      const features = form.features ? JSON.parse(form.features) : [];
      const benefits = form.benefits ? JSON.parse(form.benefits) : [];
      const pricing = form.pricing ? JSON.parse(form.pricing) : {};
      const screenshots = form.screenshots ? JSON.parse(form.screenshots) : [];

      const payload = {
        name: form.name,
        slug: form.slug,
        tagline: form.tagline || null,
        description: form.description || null,
        external_url: form.external_url || null,
        features,
        benefits,
        pricing,
        color: form.color,
        is_published: form.is_published,
        seo_title: form.seo_title || null,
        seo_description: form.seo_description || null,
        sort_order: form.sort_order,
        logo_url: form.logo_url || null,
        screenshots,
      };

      if (editing) {
        await admin.products.update(editing, payload);
        toast.success("Product updated");
      } else {
        await admin.products.create(payload);
        toast.success("Product created");
      }
      setOpen(false);
      fetchData();
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error(error.message || "Failed to save product");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      await admin.products.delete(id);
      toast.success("Product deleted");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete product");
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(searchQ.toLowerCase()) ||
    p.tagline?.toLowerCase().includes(searchQ.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-foreground">Products</h1>
        <Button onClick={handleNew} className="gap-2">
          <Plus className="w-4 h-4" />
          New Product
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={searchQ}
          onChange={(e) => setSearchQ(e.target.value)}
          placeholder="Search products..."
          className="pl-9"
        />
        {searchQ && (
          <button onClick={() => setSearchQ("")} className="absolute right-2 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Tagline</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium max-w-xs truncate">{product.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{product.tagline}</TableCell>
                <TableCell>
                  <Badge variant={product.is_published ? "default" : "secondary"}>
                    {product.is_published ? "Published" : "Draft"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(product.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(product.id)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  {searchQ ? "No results found" : "No products yet"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit/Create Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Product" : "New Product"}</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
            </TabsList>

            {/* Basic Info */}
            <TabsContent value="basic" className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Name *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Slug *</Label>
                  <Input
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>Tagline</Label>
                <Input
                  value={form.tagline}
                  onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                  placeholder="Short tagline"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={4}
                />
              </div>

              <div>
                <Label>External URL</Label>
                <Input
                  value={form.external_url}
                  onChange={(e) => setForm({ ...form, external_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pub"
                  checked={form.is_published}
                  onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="pub" className="cursor-pointer">
                  Published
                </Label>
              </div>
            </TabsContent>

            {/* Media */}
            <TabsContent value="media" className="space-y-4">
              <div>
                <Label>Logo / Hero Image</Label>
                <ImageUpload
                  value={form.logo_url}
                  onChange={(url) => setForm({ ...form, logo_url: url as string })}
                  folder="products"
                />
              </div>

              <div>
                <Label>Screenshots (JSON URLs)</Label>
                <Textarea
                  value={form.screenshots}
                  onChange={(e) => setForm({ ...form, screenshots: e.target.value })}
                  rows={4}
                  className="font-mono text-sm"
                  placeholder='["https://...", "https://..."]'
                />
                <p className="text-xs text-muted-foreground mt-1">Enter JSON array of image URLs</p>
              </div>

              <div>
                <Label>Color Theme</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <Input
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Details */}
            <TabsContent value="details" className="space-y-4">
              <Card className="p-3 bg-muted/30 text-xs text-muted-foreground">
                Enter JSON for features, benefits, and pricing. Examples below.
              </Card>

              <div>
                <Label>Features (JSON array)</Label>
                <Textarea
                  value={form.features}
                  onChange={(e) => setForm({ ...form, features: e.target.value })}
                  rows={3}
                  className="font-mono text-sm"
                  placeholder='["Feature 1", "Feature 2"]'
                />
              </div>

              <div>
                <Label>Benefits (JSON array)</Label>
                <Textarea
                  value={form.benefits}
                  onChange={(e) => setForm({ ...form, benefits: e.target.value })}
                  rows={3}
                  className="font-mono text-sm"
                  placeholder='["Benefit 1", "Benefit 2"]'
                />
              </div>

              <div>
                <Label>Pricing (JSON)</Label>
                <Textarea
                  value={form.pricing}
                  onChange={(e) => setForm({ ...form, pricing: e.target.value })}
                  rows={3}
                  className="font-mono text-sm"
                  placeholder='{"plan": "pricing_details"}'
                />
              </div>

              <div>
                <Label>Sort Order</Label>
                <Input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                />
              </div>
            </TabsContent>

            {/* SEO */}
            <TabsContent value="seo" className="space-y-4">
              <div>
                <Label>SEO Title</Label>
                <Input
                  value={form.seo_title}
                  onChange={(e) => setForm({ ...form, seo_title: e.target.value })}
                  maxLength={60}
                />
                <p className="text-xs text-muted-foreground mt-1">{form.seo_title.length}/60</p>
              </div>

              <div>
                <Label>SEO Description</Label>
                <Textarea
                  value={form.seo_description}
                  onChange={(e) => setForm({ ...form, seo_description: e.target.value })}
                  maxLength={160}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">{form.seo_description.length}/160</p>
              </div>
            </TabsContent>
          </Tabs>

          <Button onClick={handleSave} className="w-full bg-gradient-electric text-white">
            {editing ? "Update Product" : "Create Product"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
