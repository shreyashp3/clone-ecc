import { useEffect, useState } from "react";
import { admin } from "@/integrations/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search, X, AlertCircle, CheckCircle } from "lucide-react";

// Helper function to validate JSON
const isValidJSON = (str: string): boolean => {
  try {
    const parsed = JSON.parse(str);
    return Array.isArray(parsed);
  } catch {
    return false;
  }
};

type Service = {
  id: string;
  title: string;
  slug: string;
  category_name: string;
  tagline: string | null;
  description: string | null;
  is_published: boolean;
  created_at: string;
};

type ServiceForm = {
  title: string;
  slug: string;
  category_name: string;
  category_slug: string;
  tagline: string;
  hero_subtitle: string;
  description: string;
  long_overview: string;
  icon: string;
  features: string;
  benefits: string;
  process_steps: string;
  service_inclusions: string;
  industry_use_cases: string;
  technologies: string;
  faqs: string;
  cta_heading: string;
  cta_text: string;
  is_published: boolean;
  seo_title: string;
  seo_description: string;
  og_image: string;
  canonical_url: string;
  sort_order: number;
};

const emptyForm: ServiceForm = {
  title: "",
  slug: "",
  category_name: "",
  category_slug: "",
  tagline: "",
  hero_subtitle: "",
  description: "",
  long_overview: "",
  icon: "",
  features: "[]",
  benefits: "[]",
  process_steps: "[]",
  service_inclusions: "[]",
  industry_use_cases: "[]",
  technologies: "[]",
  faqs: "[]",
  cta_heading: "",
  cta_text: "",
  is_published: false,
  seo_title: "",
  seo_description: "",
  og_image: "",
  canonical_url: "",
  sort_order: 0,
};

export default function ServicesManager() {
  const [services, setServices] = useState<Service[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [searchQ, setSearchQ] = useState("");
  const [jsonErrors, setJsonErrors] = useState<Record<string, boolean>>({
    features: false,
    benefits: false,
    process_steps: false,
    service_inclusions: false,
    industry_use_cases: false,
    technologies: false,
    faqs: false,
  });

  const fetchData = async () => {
    const data = await admin.services.list();
    setServices((data as Service[]) || []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleNew = () => {
    setForm(emptyForm);
    setEditing(null);
    setJsonErrors({
      features: false,
      benefits: false,
      process_steps: false,
      service_inclusions: false,
      industry_use_cases: false,
      technologies: false,
      faqs: false,
    });
    setOpen(true);
  };

  const handleEdit = async (id: string) => {
    const data = await admin.services.get(id);
    if (data) {
      setForm({
        title: data.title || "",
        slug: data.slug || "",
        category_name: data.category_name || "",
        category_slug: data.category_slug || "",
        tagline: data.tagline || "",
        hero_subtitle: data.hero_subtitle || "",
        description: data.description || "",
        long_overview: data.long_overview || "",
        icon: data.icon || "",
        features: JSON.stringify(data.features || []),
        benefits: JSON.stringify(data.benefits || []),
        process_steps: JSON.stringify(data.process_steps || []),
        service_inclusions: JSON.stringify(data.service_inclusions || []),
        industry_use_cases: JSON.stringify(data.industry_use_cases || []),
        technologies: JSON.stringify(data.technologies || []),
        faqs: JSON.stringify(data.faqs || []),
        cta_heading: data.cta_heading || "",
        cta_text: data.cta_text || "",
        is_published: data.is_published || false,
        seo_title: data.seo_title || "",
        seo_description: data.seo_description || "",
        og_image: data.og_image || "",
        canonical_url: data.canonical_url || "",
        sort_order: data.sort_order || 0,
      });
      // Validate JSON fields on edit
      setJsonErrors({
        features: !isValidJSON(JSON.stringify(data.features || [])),
        benefits: !isValidJSON(JSON.stringify(data.benefits || [])),
        process_steps: !isValidJSON(JSON.stringify(data.process_steps || [])),
        service_inclusions: !isValidJSON(JSON.stringify(data.service_inclusions || [])),
        industry_use_cases: !isValidJSON(JSON.stringify(data.industry_use_cases || [])),
        technologies: !isValidJSON(JSON.stringify(data.technologies || [])),
        faqs: !isValidJSON(JSON.stringify(data.faqs || [])),
      });
      setEditing(id);
      setOpen(true);
    }
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!form.slug.trim()) {
      toast.error("Slug is required");
      return;
    }

    // Validate JSON fields
    const jsonFields = ['features', 'benefits', 'process_steps', 'service_inclusions', 'industry_use_cases', 'technologies', 'faqs'] as const;
    const payload: any = { ...form };

    try {
      for (const field of jsonFields) {
        try {
          const parsed = JSON.parse(form[field]);
          if (!Array.isArray(parsed)) {
            toast.error(`${field.replace(/_/g, ' ')}: Must be a JSON array (e.g., ["item1", "item2"])`);
            return;
          }
          payload[field] = parsed;
        } catch (e: any) {
          toast.error(`${field.replace(/_/g, ' ')}: Invalid JSON syntax. Expected format: ["item1", "item2"]`);
          return;
        }
      }

      if (editing) {
        await admin.services.update(editing, payload);
        toast.success("Service updated");
      } else {
        await admin.services.create(payload);
        toast.success("Service created");
      }
      setOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to save service");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this service?")) return;
    try {
      await admin.services.delete(id);
      toast.success("Service deleted");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete service");
    }
  };

  const filtered = services.filter((s) =>
    s.title.toLowerCase().includes(searchQ.toLowerCase()) ||
    s.category_name.toLowerCase().includes(searchQ.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-foreground">Services</h1>
        <Button onClick={handleNew} className="gap-2">
          <Plus className="w-4 h-4" />
          New Service
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={searchQ}
          onChange={(e) => setSearchQ(e.target.value)}
          placeholder="Search services..."
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
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((service) => (
              <TableRow key={service.id}>
                <TableCell className="font-medium max-w-xs truncate">{service.title}</TableCell>
                <TableCell>{service.category_name}</TableCell>
                <TableCell>
                  <Badge variant={service.is_published ? "default" : "secondary"}>
                    {service.is_published ? "Published" : "Draft"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(service.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(service.id)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(service.id)}
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
                  {searchQ ? "No results found" : "No services yet"}
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
            <DialogTitle>{editing ? "Edit Service" : "New Service"}</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="lists">Lists</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
            </TabsList>

            {/* Basic Info */}
            <TabsContent value="basic" className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Title *</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Slug *</Label>
                  <Input
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Category Name *</Label>
                  <Input
                    value={form.category_name}
                    onChange={(e) => setForm({ ...form, category_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Category Slug *</Label>
                  <Input
                    value={form.category_slug}
                    onChange={(e) => setForm({ ...form, category_slug: e.target.value })}
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
                <Label>Hero Subtitle</Label>
                <Input
                  value={form.hero_subtitle}
                  onChange={(e) => setForm({ ...form, hero_subtitle: e.target.value })}
                />
              </div>

              <div>
                <Label>Icon (Lucide name)</Label>
                <Input
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  placeholder="e.g., Cloud, Database, Shield"
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

            {/* Content */}
            <TabsContent value="content" className="space-y-4">
              <div>
                <Label>Short Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label>Long Overview</Label>
                <Textarea
                  value={form.long_overview}
                  onChange={(e) => setForm({ ...form, long_overview: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>CTA Heading</Label>
                  <Input
                    value={form.cta_heading}
                    onChange={(e) => setForm({ ...form, cta_heading: e.target.value })}
                  />
                </div>
                <div>
                  <Label>CTA Text</Label>
                  <Input
                    value={form.cta_text}
                    onChange={(e) => setForm({ ...form, cta_text: e.target.value })}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Lists (JSON) */}
            <TabsContent value="lists" className="space-y-4">
              <Card className="p-3 bg-muted/30 text-xs text-muted-foreground">
                <div className="font-medium mb-1">JSON Format Guide</div>
                Enter JSON arrays for list items. Examples:
                <ul className="mt-1 space-y-0.5">
                  <li>• Simple strings: ["Item 1", "Item 2", "Item 3"]</li>
                  <li>• Objects: [{"{"}"title": "Step 1", "desc": "Description"{"}"}, {"{"}"title": "Step 2"{"}"}]</li>
                </ul>
              </Card>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Label className="flex-1">Features (JSON)</Label>
                  {isValidJSON(form.features) ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : form.features.trim() && (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                </div>
                <Textarea
                  value={form.features}
                  onChange={(e) => {
                    setForm({ ...form, features: e.target.value });
                    setJsonErrors({ ...jsonErrors, features: false });
                  }}
                  rows={3}
                  className={`font-mono text-sm ${!isValidJSON(form.features) && form.features.trim() ? 'border-red-500' : ''}`}
                />
                {!isValidJSON(form.features) && form.features.trim() && (
                  <p className="text-xs text-red-600 mt-1">❌ Invalid JSON. Must be an array like: ["item1", "item2"]</p>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Label className="flex-1">Benefits (JSON)</Label>
                  {isValidJSON(form.benefits) ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : form.benefits.trim() && (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                </div>
                <Textarea
                  value={form.benefits}
                  onChange={(e) => {
                    setForm({ ...form, benefits: e.target.value });
                    setJsonErrors({ ...jsonErrors, benefits: false });
                  }}
                  rows={3}
                  className={`font-mono text-sm ${!isValidJSON(form.benefits) && form.benefits.trim() ? 'border-red-500' : ''}`}
                />
                {!isValidJSON(form.benefits) && form.benefits.trim() && (
                  <p className="text-xs text-red-600 mt-1">❌ Invalid JSON. Must be an array like: ["item1", "item2"]</p>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Label className="flex-1">Process Steps (JSON)</Label>
                  {isValidJSON(form.process_steps) ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : form.process_steps.trim() && (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                </div>
                <Textarea
                  value={form.process_steps}
                  onChange={(e) => {
                    setForm({ ...form, process_steps: e.target.value });
                    setJsonErrors({ ...jsonErrors, process_steps: false });
                  }}
                  rows={3}
                  className={`font-mono text-sm ${!isValidJSON(form.process_steps) && form.process_steps.trim() ? 'border-red-500' : ''}`}
                />
                {!isValidJSON(form.process_steps) && form.process_steps.trim() && (
                  <p className="text-xs text-red-600 mt-1">❌ Invalid JSON. Must be an array like: ["item1", "item2"]</p>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Label className="flex-1">Service Inclusions (JSON)</Label>
                  {isValidJSON(form.service_inclusions) ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : form.service_inclusions.trim() && (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                </div>
                <Textarea
                  value={form.service_inclusions}
                  onChange={(e) => {
                    setForm({ ...form, service_inclusions: e.target.value });
                    setJsonErrors({ ...jsonErrors, service_inclusions: false });
                  }}
                  rows={3}
                  className={`font-mono text-sm ${!isValidJSON(form.service_inclusions) && form.service_inclusions.trim() ? 'border-red-500' : ''}`}
                />
                {!isValidJSON(form.service_inclusions) && form.service_inclusions.trim() && (
                  <p className="text-xs text-red-600 mt-1">❌ Invalid JSON. Must be an array like: ["item1", "item2"]</p>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Label className="flex-1">Industry Use Cases (JSON)</Label>
                  {isValidJSON(form.industry_use_cases) ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : form.industry_use_cases.trim() && (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                </div>
                <Textarea
                  value={form.industry_use_cases}
                  onChange={(e) => {
                    setForm({ ...form, industry_use_cases: e.target.value });
                    setJsonErrors({ ...jsonErrors, industry_use_cases: false });
                  }}
                  rows={3}
                  className={`font-mono text-sm ${!isValidJSON(form.industry_use_cases) && form.industry_use_cases.trim() ? 'border-red-500' : ''}`}
                />
                {!isValidJSON(form.industry_use_cases) && form.industry_use_cases.trim() && (
                  <p className="text-xs text-red-600 mt-1">❌ Invalid JSON. Must be an array like: ["item1", "item2"]</p>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Label className="flex-1">Technologies (JSON)</Label>
                  {isValidJSON(form.technologies) ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : form.technologies.trim() && (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                </div>
                <Textarea
                  value={form.technologies}
                  onChange={(e) => {
                    setForm({ ...form, technologies: e.target.value });
                    setJsonErrors({ ...jsonErrors, technologies: false });
                  }}
                  rows={3}
                  className={`font-mono text-sm ${!isValidJSON(form.technologies) && form.technologies.trim() ? 'border-red-500' : ''}`}
                />
                {!isValidJSON(form.technologies) && form.technologies.trim() && (
                  <p className="text-xs text-red-600 mt-1">❌ Invalid JSON. Must be an array like: ["item1", "item2"]</p>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Label className="flex-1">FAQs (JSON)</Label>
                  {isValidJSON(form.faqs) ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : form.faqs.trim() && (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                </div>
                <Textarea
                  value={form.faqs}
                  onChange={(e) => {
                    setForm({ ...form, faqs: e.target.value });
                    setJsonErrors({ ...jsonErrors, faqs: false });
                  }}
                  rows={3}
                  className={`font-mono text-sm ${!isValidJSON(form.faqs) && form.faqs.trim() ? 'border-red-500' : ''}`}
                />
                {!isValidJSON(form.faqs) && form.faqs.trim() && (
                  <p className="text-xs text-red-600 mt-1">❌ Invalid JSON. Must be an array like: ["item1", "item2"]</p>
                )}
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

              <div>
                <Label>OG Image URL</Label>
                <Input
                  value={form.og_image}
                  onChange={(e) => setForm({ ...form, og_image: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div>
                <Label>Canonical URL</Label>
                <Input
                  value={form.canonical_url}
                  onChange={(e) => setForm({ ...form, canonical_url: e.target.value })}
                  placeholder="https://..."
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
          </Tabs>

          <Button onClick={handleSave} className="w-full bg-gradient-electric text-white">
            {editing ? "Update Service" : "Create Service"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
