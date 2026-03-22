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
import { Plus, Pencil, Trash2, Search, X, Eye } from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";
import RichTextEditor from "@/components/admin/RichTextEditor";

type CaseStudy = {
  id: string;
  title: string;
  slug: string;
  client_industry: string | null;
  is_published: boolean;
  created_at: string;
};

type CaseStudyForm = {
  title: string;
  slug: string;
  client_industry: string;
  problem: string;
  solution: string;
  content: string;
  technologies: string;
  results: string;
  featured_image: string;
  images: string;
  is_published: boolean;
  seo_title: string;
  seo_description: string;
  sort_order: number;
};

const emptyForm: CaseStudyForm = {
  title: "",
  slug: "",
  client_industry: "",
  problem: "",
  solution: "",
  content: "",
  technologies: "[]",
  results: "[]",
  featured_image: "",
  images: "[]",
  is_published: false,
  seo_title: "",
  seo_description: "",
  sort_order: 0,
};

const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export default function CaseStudiesManager() {
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [searchQ, setSearchQ] = useState("");

  const fetchData = async () => {
    const data = await admin.caseStudies.list();
    setCaseStudies((data as CaseStudy[]) || []);
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
    const data = await admin.caseStudies.get(id);
    if (data) {
      setForm({
        title: data.title || "",
        slug: data.slug || "",
        client_industry: data.client_industry || "",
        problem: data.problem || "",
        solution: data.solution || "",
        content: (data as any).content || "",
        technologies: JSON.stringify(data.technologies || []),
        results: JSON.stringify(data.results || []),
        featured_image: data.featured_image || "",
        images: JSON.stringify(data.images || []),
        is_published: data.is_published || false,
        seo_title: data.seo_title || "",
        seo_description: data.seo_description || "",
        sort_order: data.sort_order || 0,
      });
      setEditing(id);
      setOpen(true);
    }
  };

  const handleTitleChange = (title: string) => {
    if (!editing && !form.slug.trim()) {
      setForm((prev) => ({ ...prev, title, slug: generateSlug(title) }));
    } else {
      setForm((prev) => ({ ...prev, title }));
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

    try {
      let technologies: any[] = [];
      let results: any[] = [];
      let images: any[] = [];

      try {
        technologies = form.technologies ? JSON.parse(form.technologies) : [];
        if (!Array.isArray(technologies)) { toast.error("Technologies must be a JSON array"); return; }
      } catch { toast.error("Invalid JSON in Technologies field"); return; }

      try {
        results = form.results ? JSON.parse(form.results) : [];
        if (!Array.isArray(results)) { toast.error("Results must be a JSON array"); return; }
      } catch { toast.error("Invalid JSON in Results field"); return; }

      try {
        images = form.images ? JSON.parse(form.images) : [];
        if (!Array.isArray(images)) { toast.error("Images must be a JSON array"); return; }
      } catch { toast.error("Invalid JSON in Images field"); return; }

      const payload: any = {
        title: form.title,
        slug: form.slug,
        client_industry: form.client_industry || null,
        problem: form.problem || null,
        solution: form.solution || null,
        content: form.content || null,
        technologies,
        results,
        featured_image: form.featured_image || null,
        images,
        is_published: form.is_published,
        seo_title: form.seo_title || null,
        seo_description: form.seo_description || null,
        sort_order: form.sort_order,
      };

      if (editing) {
        await admin.caseStudies.update(editing, payload);
        toast.success("Case study updated");
      } else {
        await admin.caseStudies.create(payload);
        toast.success("Case study created");
      }
      setOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to save case study");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this case study?")) return;
    try {
      await admin.caseStudies.delete(id);
      toast.success("Case study deleted");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete case study");
    }
  };

  const filtered = caseStudies.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQ.toLowerCase()) ||
      c.client_industry?.toLowerCase().includes(searchQ.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-foreground">Case Studies</h1>
        <Button onClick={handleNew} className="gap-2">
          <Plus className="w-4 h-4" />
          New Case Study
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={searchQ} onChange={(e) => setSearchQ(e.target.value)} placeholder="Search case studies..." className="pl-9" />
        {searchQ && (
          <button onClick={() => setSearchQ("")} className="absolute right-2 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Client Industry</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((caseStudy) => (
              <TableRow key={caseStudy.id}>
                <TableCell className="font-medium max-w-xs truncate">{caseStudy.title}</TableCell>
                <TableCell className="text-sm">{caseStudy.client_industry || "—"}</TableCell>
                <TableCell>
                  <Badge variant={caseStudy.is_published ? "default" : "secondary"}>
                    {caseStudy.is_published ? "Published" : "Draft"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{new Date(caseStudy.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(caseStudy.id)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(caseStudy.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  {searchQ ? "No results found" : "No case studies yet"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Case Study" : "New Case Study"}</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
            </TabsList>

            {/* Basic Info */}
            <TabsContent value="basic" className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Title *</Label>
                  <Input value={form.title} onChange={(e) => handleTitleChange(e.target.value)} />
                </div>
                <div>
                  <Label>Slug *</Label>
                  <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Client Industry</Label>
                  <Input value={form.client_industry} onChange={(e) => setForm({ ...form, client_industry: e.target.value })} placeholder="e.g., Healthcare, Finance, Gaming" />
                </div>
                <div>
                  <Label>Sort Order</Label>
                  <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="pub" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} className="w-4 h-4" />
                <Label htmlFor="pub" className="cursor-pointer">Published</Label>
              </div>
            </TabsContent>

            {/* Content - Rich Text Editor */}
            <TabsContent value="content" className="space-y-4">
              <Card className="p-3 bg-muted/30 text-xs text-muted-foreground">
                Use the rich text editor below to write the full case study content. You can insert inline images, headings, lists, links, and more. The Problem/Solution fields below are optional summary fields.
              </Card>

              <div>
                <Label>Full Content (Rich Text Editor)</Label>
                <Tabs defaultValue="write">
                  <TabsList className="mb-2">
                    <TabsTrigger value="write">Write</TabsTrigger>
                    <TabsTrigger value="preview" className="gap-1"><Eye className="w-3 h-3" /> Preview</TabsTrigger>
                  </TabsList>
                  <TabsContent value="write">
                    <RichTextEditor
                      value={form.content}
                      onChange={(html) => setForm({ ...form, content: html })}
                      placeholder="Write the full case study content here..."
                    />
                  </TabsContent>
                  <TabsContent value="preview">
                    <div className="min-h-[400px] max-h-[600px] overflow-y-auto border border-border rounded-md p-6 bg-background prose prose-sm dark:prose-invert max-w-none">
                      {form.content && form.content !== "<p></p>" ? (
                        <div dangerouslySetInnerHTML={{ __html: form.content }} />
                      ) : (
                        <p className="text-muted-foreground">Nothing to preview</p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-xs font-medium text-muted-foreground mb-3">Optional Summary Fields (shown as fallback if no rich content)</p>
                <div className="space-y-4">
                  <div>
                    <Label>Challenge / Problem Statement</Label>
                    <Textarea value={form.problem} onChange={(e) => setForm({ ...form, problem: e.target.value })} rows={3} placeholder="Brief problem description..." />
                  </div>
                  <div>
                    <Label>Solution</Label>
                    <Textarea value={form.solution} onChange={(e) => setForm({ ...form, solution: e.target.value })} rows={3} placeholder="Brief solution description..." />
                  </div>
                </div>
              </div>

              <Card className="p-3 bg-muted/30 text-xs text-muted-foreground">
                Results: use objects with value + label, e.g. [&#123;"value":"50%","label":"Cost Reduction"&#125;] — or simple strings ["50% cost reduction"]
              </Card>
              <div>
                <Label>Results / Outcomes (JSON array)</Label>
                <Textarea
                  value={form.results}
                  onChange={(e) => setForm({ ...form, results: e.target.value })}
                  rows={3}
                  className="font-mono text-sm"
                  placeholder='[{"value": "50%", "label": "Cost Reduction"}, {"value": "2x", "label": "Faster Deployments"}]'
                />
              </div>
            </TabsContent>

            {/* Media */}
            <TabsContent value="media" className="space-y-4">
              <div>
                <Label>Featured Image</Label>
                <ImageUpload value={form.featured_image} onChange={(url) => setForm({ ...form, featured_image: url as string })} folder="case-studies" />
              </div>
              <div>
                <Label>Gallery Images (JSON array of URLs)</Label>
                <Textarea value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} rows={4} className="font-mono text-sm" placeholder='["https://...", "https://..."]' />
              </div>
            </TabsContent>

            {/* Details */}
            <TabsContent value="details" className="space-y-4">
              <div>
                <Label>Technologies (JSON array)</Label>
                <Textarea value={form.technologies} onChange={(e) => setForm({ ...form, technologies: e.target.value })} rows={3} className="font-mono text-sm" placeholder='["AWS EKS", "Terraform", "ArgoCD"]' />
              </div>
            </TabsContent>

            {/* SEO */}
            <TabsContent value="seo" className="space-y-4">
              <div>
                <Label>SEO Title</Label>
                <Input value={form.seo_title} onChange={(e) => setForm({ ...form, seo_title: e.target.value })} maxLength={60} />
                <p className="text-xs text-muted-foreground mt-1">{form.seo_title.length}/60</p>
              </div>
              <div>
                <Label>SEO Description</Label>
                <Textarea value={form.seo_description} onChange={(e) => setForm({ ...form, seo_description: e.target.value })} maxLength={160} rows={3} />
                <p className="text-xs text-muted-foreground mt-1">{form.seo_description.length}/160</p>
              </div>
            </TabsContent>
          </Tabs>

          <Button onClick={handleSave} className="w-full bg-gradient-electric text-white">
            {editing ? "Update Case Study" : "Create Case Study"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
