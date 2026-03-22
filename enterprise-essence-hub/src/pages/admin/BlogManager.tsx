import { useEffect, useState } from "react";
import { admin } from "@/integrations/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, Search, X, Eye, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import ImageUpload from "@/components/admin/ImageUpload";
import RichTextEditor from "@/components/admin/RichTextEditor";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  status: string | null;
  tags: string[] | null;
  category_id: string | null;
  published_at: string | null;
  read_time_minutes: number | null;
  seo_title: string | null;
  seo_description: string | null;
  featured_image: string | null;
  og_image: string | null;
};

type Category = { id: string; name: string; slug: string };

const emptyPost = {
  title: "", slug: "", excerpt: "", content: "", status: "draft" as string,
  tags: [] as string[], category_id: "", seo_title: "", seo_description: "",
  read_time_minutes: 5, featured_image: "", og_image: "",
};

// Helper functions
const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const calculateReadTime = (html: string): number => {
  // Remove HTML tags
  const text = html.replace(/<[^>]*>/g, '');
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words / 200); // Average 200 words per minute
};

const RESERVED_SLUGS = [
  "about",
  "contact", 
  "services",
  "products",
  "blog",
  "case-studies",
  "gallery",
  "pricing",
  "features",
  "docs",
  "help",
  "admin",
  "account",
  "login",
  "signup",
  "register",
];

export default function BlogManager() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyPost);
  const [tagsInput, setTagsInput] = useState("");
  const [searchQ, setSearchQ] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    const [postsData, categoriesData] = await Promise.all([
      admin.blog.list(),
      admin.blogCategories.list(),
    ]);
    setPosts((postsData as BlogPost[]) || []);
    setCategories((categoriesData as Category[]) || []);
  };

  useEffect(() => { 
    // Auto-save draft every 30 seconds when editing
    if (!open || !editing || !form.title.trim()) return;

    const autoSaveInterval = setInterval(() => {
      // Skip if currently saving to avoid race conditions
      if (saving) return;
      
      const autoSavePayload = {
        title: form.title,
        slug: form.slug,
        excerpt: form.excerpt || null,
        content: form.content,
        status: "draft" as const, // Always save as draft
        tags: tagsInput.split(",").map(t => t.trim().toLowerCase()).filter((t, idx, arr) => t && arr.indexOf(t) === idx),
        category_id: form.category_id || null,
        featured_image: form.featured_image || null,
        og_image: form.og_image || null,
        seo_title: form.seo_title || null,
        seo_description: form.seo_description || null,
        author_id: user?.id,
      };

      admin.blog
        .update(editing, autoSavePayload)
        .then(() => {
          console.log("Draft auto-saved at", new Date().toLocaleTimeString());
        })
        .catch((error) => {
          console.warn("Auto-save failed:", error);
        });
    }, 30000); // Every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [open, editing, form, tagsInput, saving, user?.id]);

  useEffect(() => { fetchData(); }, []);

  const openEdit = (post: BlogPost) => {
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || "",
      content: post.content || "",
      status: post.status || "draft",
      tags: post.tags || [],
      category_id: post.category_id || "",
      seo_title: post.seo_title || "",
      seo_description: post.seo_description || "",
      read_time_minutes: post.read_time_minutes || 5,
      featured_image: post.featured_image || "",
      og_image: post.og_image || "",
    });
    setTagsInput((post.tags || []).join(", "));
    setEditing(post.id);
    setOpen(true);
  };

  const openNew = () => {
    setForm(emptyPost);
    setTagsInput("");
    setEditing(null);
    setOpen(true);
  };

  const handleTitleChange = (title: string) => {
    setForm({ ...form, title });
    // Auto-generate slug if it's empty or if we're creating new
    if (!editing && !form.slug.trim()) {
      setForm(prev => ({ ...prev, title, slug: generateSlug(title) }));
    }
  };

  const validateForm = (): boolean => {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return false;
    }

    if (!form.slug.trim()) {
      toast.error("Slug is required");
      return false;
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(form.slug)) {
      toast.error("Slug can only contain lowercase letters, numbers, and hyphens");
      return false;
    }

    if (!form.featured_image.trim()) {
      toast.error("Featured image is required");
      return false;
    }

    if (!form.content || form.content === "<p></p>" || form.content.trim() === "") {
      toast.error("Content cannot be empty");
      return false;
    }

    // Validate minimum content length (at least 50 chars)
    const plainText = form.content.replace(/<[^>]*>/g, "").trim();
    if (plainText.length < 50) {
      toast.error("Content must be at least 50 characters long");
      return false;
    }

    if (form.seo_title.length > 60) {
      toast.error("SEO title must be 60 characters or less (current: " + form.seo_title.length + ")");
      return false;
    }

    if (form.seo_description.length > 160) {
      toast.error("SEO description must be 160 characters or less (current: " + form.seo_description.length + ")");
      return false;
    }

    return true;
  };

  const checkSlugUniqueness = async (slug: string, currentId?: string): Promise<boolean> => {
    // Check against reserved system slugs
    if (RESERVED_SLUGS.includes(slug.toLowerCase())) {
      toast.error(`Slug "${slug}" is reserved for system routes and cannot be used.`);
      return false;
    }

    const posts = await admin.blog.list();
    const match = (posts as BlogPost[]).find((p) => p.slug === slug && p.id !== currentId);
    return !match;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    // Prevent double-click saves (race condition fix)
    if (saving) return;

    setSaving(true);
    try {
      // Check slug uniqueness
      const isUnique = await checkSlugUniqueness(form.slug, editing || undefined);
      if (!isUnique) {
        toast.error("Slug is already in use. Please choose a different slug.");
        setSaving(false);
        return;
      }

      // Case-insensitive deduplication of tags (FIX: was case-sensitive, now handles "React" vs "react")
      const tags = tagsInput
        .split(",")
        .map(t => t.trim().toLowerCase())
        .filter(Boolean)
        .filter((tag, idx, arr) => arr.indexOf(tag) === idx); // Remove duplicates
      
      // Auto-calculate read time
      const readTime = calculateReadTime(form.content);

      const payload: any = {
        title: form.title,
        slug: form.slug,
        excerpt: form.excerpt || null,
        content: form.content,
        status: form.status,
        tags,
        category_id: form.category_id || null,
        published_at: form.status === "published" ? new Date().toISOString() : null,
        author_id: user?.id,
        featured_image: form.featured_image,
        og_image: form.og_image || null,
        seo_title: form.seo_title || null,
        seo_description: form.seo_description || null,
        read_time_minutes: readTime,
      };

      if (editing) {
        await admin.blog.update(editing, payload);
        toast.success("Post updated successfully");
      } else {
        await admin.blog.create(payload);
        toast.success("Post created successfully");
      }
      setOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to save post");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    try {
      await admin.blog.delete(id);
      toast.success("Post deleted");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete post");
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selected.size} posts?`)) return;
    try {
      for (const id of selected) {
        await admin.blog.delete(id);
      }
      toast.success(`${selected.size} posts deleted`);
      setSelected(new Set());
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete some posts");
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const statusColor = (s: string | null): "default" | "secondary" | "outline" | "destructive" => {
    switch (s) {
      case "published": return "default";
      case "draft": return "secondary";
      case "scheduled": return "outline";
      default: return "secondary";
    }
  };

  const filtered = searchQ
    ? posts.filter(p => p.title.toLowerCase().includes(searchQ.toLowerCase()))
    : posts;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Blog Posts</h1>
        <div className="flex gap-2">
          {selected.size > 0 && (
            <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
              <Trash2 className="w-4 h-4 mr-1" /> Delete {selected.size}
            </Button>
          )}
          <Button onClick={openNew}><Plus className="w-4 h-4 mr-2" /> New Post</Button>
        </div>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={searchQ} onChange={(e) => setSearchQ(e.target.value)} placeholder="Search posts..." className="pl-9 pr-8" />
        {searchQ && <button onClick={() => setSearchQ("")} className="absolute right-2 top-1/2 -translate-y-1/2"><X className="w-4 h-4 text-muted-foreground" /></button>}
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox checked={selected.size === filtered.length && filtered.length > 0} onCheckedChange={() => {
                  if (selected.size === filtered.length) setSelected(new Set());
                  else setSelected(new Set(filtered.map(p => p.id)));
                }} />
              </TableHead>
              <TableHead className="w-12">Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((post) => (
              <TableRow key={post.id} className={selected.has(post.id) ? "bg-primary/5" : ""}>
                <TableCell><Checkbox checked={selected.has(post.id)} onCheckedChange={() => toggleSelect(post.id)} /></TableCell>
                <TableCell>
                  {post.featured_image
                    ? <img src={post.featured_image} alt="" className="w-10 h-10 rounded object-cover" />
                    : <div className="w-10 h-10 rounded bg-muted flex items-center justify-center text-muted-foreground text-xs">—</div>
                  }
                </TableCell>
                <TableCell className="font-medium">{post.title}</TableCell>
                <TableCell><Badge variant={statusColor(post.status)}>{post.status}</Badge></TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {post.published_at ? new Date(post.published_at).toLocaleDateString() : "—"}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(post)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(post.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                {searchQ ? "No results found." : "No blog posts yet."}
              </TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Post" : "New Post"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Title *</Label>
                <Input 
                  value={form.title} 
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Blog post title"
                  required
                />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <Label>Slug *</Label>
                  <span className="text-xs text-muted-foreground">{form.slug.length} chars</span>
                </div>
                <Input 
                  value={form.slug} 
                  onChange={(e) => setForm({ ...form, slug: e.target.value })} 
                  placeholder="auto-generated-if-empty"
                  required
                />
                {form.slug && !/^[a-z0-9-]+$/.test(form.slug) && (
                  <p className="text-xs text-destructive mt-1">Slug can only contain lowercase letters, numbers, and hyphens</p>
                )}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Featured Image * (Required)</Label>
                <ImageUpload value={form.featured_image} onChange={(url) => setForm({ ...form, featured_image: typeof url === 'string' ? url : url[0] || '' })} folder="blog" />
                {!form.featured_image && <p className="text-xs text-destructive mt-1">Featured image is required</p>}
              </div>
              <div>
                <Label>OG Image (For Social)</Label>
                <ImageUpload value={form.og_image} onChange={(url) => setForm({ ...form, og_image: typeof url === 'string' ? url : url[0] || '' })} folder="blog" />
              </div>
            </div>

            <div>
              <Label>Excerpt</Label>
              <Textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={2} placeholder="Brief summary of the post..." />
            </div>

            <div>
              <Label>Content * (Required)</Label>
              {!form.content || form.content === "<p></p>" ? (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-md mb-2">
                  <AlertCircle className="w-4 h-4 text-destructive" />
                  <p className="text-sm text-destructive">Content is required</p>
                </div>
              ) : null}
              <Tabs defaultValue="write">
                <TabsList className="mb-2">
                  <TabsTrigger value="write">Write</TabsTrigger>
                  <TabsTrigger value="preview" className="gap-1"><Eye className="w-3 h-3" /> Preview</TabsTrigger>
                </TabsList>
                <TabsContent value="write">
                  <RichTextEditor 
                    value={form.content} 
                    onChange={(html) => setForm({ ...form, content: html })}
                    placeholder="Start writing your blog post..."
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

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Category</Label>
                <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Read Time (Auto-calculated)</Label>
                <div className="flex items-center px-3 py-2 border border-input rounded-md bg-muted/50">
                  <span className="text-sm font-medium">{calculateReadTime(form.content)} min read</span>
                </div>
              </div>
            </div>
            <div>
              <Label>Tags (comma separated, duplicates removed)</Label>
              <Input 
                value={tagsInput} 
                onChange={(e) => setTagsInput(e.target.value)} 
                placeholder="cloud, devops, aws"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {tagsInput ? `${tagsInput.split(",").filter(t => t.trim()).length} tag(s)` : "0 tags"}
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 bg-muted/30 p-3 rounded-lg">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label>SEO Title</Label>
                  <span className={`text-xs ${form.seo_title.length > 60 ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                    {form.seo_title.length}/60
                  </span>
                </div>
                <Input 
                  value={form.seo_title} 
                  onChange={(e) => setForm({ ...form, seo_title: e.target.value })} 
                  placeholder="Optimal: 50-60 characters"
                  maxLength={70}
                />
                <p className="text-xs text-muted-foreground mt-1">Recommended: 50-60 characters</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label>SEO Description</Label>
                  <span className={`text-xs ${form.seo_description.length > 160 ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                    {form.seo_description.length}/160
                  </span>
                </div>
                <Input 
                  value={form.seo_description} 
                  onChange={(e) => setForm({ ...form, seo_description: e.target.value })} 
                  placeholder="Optimal: 150-160 characters"
                  maxLength={170}
                />
                <p className="text-xs text-muted-foreground mt-1">Recommended: 150-160 characters</p>
              </div>
            </div>
            <Button 
              onClick={handleSave} 
              className="w-full bg-gradient-electric text-white"
              disabled={saving}
              size="lg"
            >
              {saving ? "Saving..." : (editing ? "Update Post" : "Create Post")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
