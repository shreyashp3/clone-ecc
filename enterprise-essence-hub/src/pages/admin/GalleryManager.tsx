import { useEffect, useState } from "react";
import { admin } from "@/integrations/api/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Trash2, Search, X, Eye, Download, Copy } from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";

type GalleryItem = {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_type: string | null;
  category: string | null;
  alt_text: string | null;
  is_published: boolean;
  sort_order: number | null;
  created_at: string;
};

export default function GalleryManager() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchQ, setSearchQ] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [preview, setPreview] = useState<GalleryItem | null>(null);
  const [editDialog, setEditDialog] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    file_url: "",
    category: "",
    alt_text: "",
    is_published: true,
    sort_order: 0,
  });

  const fetchData = async () => {
    const data = await admin.gallery.list();

    if (Array.isArray(data)) {
      setItems(data as GalleryItem[]);
      const cats = [...new Set(data.map((d: any) => d.category).filter(Boolean))];
      setCategories(cats as string[]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddNew = () => {
    setForm({
      title: "",
      description: "",
      file_url: "",
      category: "",
      alt_text: "",
      is_published: true,
      sort_order: items.length,
    });
    setEditDialog(true);
  };

  const handleSave = async () => {
    if (!form.file_url) {
      toast.error("Please upload an image");
      return;
    }
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!form.alt_text.trim()) {
      toast.error("Alt text is required for accessibility");
      return;
    }

    setUploading(true);
    try {
      await admin.gallery.create({
        ...form,
        category: form.category || null,
        alt_text: form.alt_text || null,
      });

      toast.success("Image added to gallery");
      setEditDialog(false);
      fetchData();
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error(error.message || "Failed to save image");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this image?")) return;
    try {
      await admin.gallery.delete(id);
      toast.success("Image deleted");
      fetchData();
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error.message || "Failed to delete image");
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard");
  };

  const filtered = items.filter((item) => {
    const matchSearch =
      item.title.toLowerCase().includes(searchQ.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQ.toLowerCase());
    const matchCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  const stats = {
    total: items.length,
    published: items.filter((i) => i.is_published).length,
    byCategory: categories.length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-foreground">Gallery</h1>
        <Button onClick={handleAddNew} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Image
        </Button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Images</p>
          <p className="text-3xl font-display font-bold text-foreground">{stats.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Published</p>
          <p className="text-3xl font-display font-bold text-foreground">{stats.published}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Categories</p>
          <p className="text-3xl font-display font-bold text-foreground">{stats.byCategory}</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Search images..."
            className="pl-9"
          />
          {searchQ && (
            <button
              onClick={() => setSearchQ("")}
              className="absolute right-2 top-1/2 -translate-y-1/2"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Gallery Grid */}
      {filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((item) => (
            <Card
              key={item.id}
              className="group overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Image Container */}
              <div className="relative bg-muted h-40 overflow-hidden">
                <img
                  src={item.file_url}
                  alt={item.alt_text || item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                {!item.is_published && (
                  <Badge variant="secondary" className="absolute top-2 left-2">
                    Draft
                  </Badge>
                )}

                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setPreview(item)}
                    className="text-white hover:bg-white/20"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopyUrl(item.file_url)}
                    className="text-white hover:bg-white/20"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(item.id)}
                    className="text-red-400 hover:bg-red-500/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Info */}
              <div className="p-3 space-y-2">
                <p className="font-medium text-foreground truncate">{item.title}</p>
                {item.category && (
                  <Badge variant="outline" className="text-xs">
                    {item.category}
                  </Badge>
                )}
                <p className="text-xs text-muted-foreground">
                  {new Date(item.created_at).toLocaleDateString()}
                </p>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">
            {searchQ || selectedCategory !== "all"
              ? "No images match your filters"
              : "No images yet. Click 'Add Image' to get started."}
          </p>
        </Card>
      )}

      {/* Preview Modal */}
      {preview && (
        <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{preview.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <img
                src={preview.file_url}
                alt={preview.alt_text || preview.title}
                className="w-full h-auto rounded-lg"
              />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Category</p>
                  <p className="font-medium">{preview.category || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge variant={preview.is_published ? "default" : "secondary"}>
                    {preview.is_published ? "Published" : "Draft"}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Alt Text</p>
                  <p className="font-medium">{preview.alt_text || "—"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Description</p>
                  <p className="font-medium">{preview.description || "—"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground mb-2">URL</p>
                  <div className="flex gap-2">
                    <Input value={preview.file_url} readOnly className="text-xs" />
                    <Button
                      size="sm"
                      onClick={() => handleCopyUrl(preview.file_url)}
                      className="gap-1"
                    >
                      <Copy className="w-4 h-4" />
                      Copy
                    </Button>
                  </div>
                </div>
              </div>
              <Button
                onClick={() =>
                  window.open(preview.file_url, "_blank")
                }
                variant="outline"
                className="w-full gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Upload Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Image to Gallery</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Image</Label>
              <ImageUpload
                value={form.file_url}
                onChange={(url) => setForm({ ...form, file_url: url as string })}
                folder="gallery"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Title *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Image title"
                />
              </div>
              <div>
                <Label>Category</Label>
                <Input
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="e.g., Team, Product, Event"
                  list="categories"
                />
                <datalist id="categories">
                  {categories.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>
            </div>

            <div>
              <Label>Alt Text</Label>
              <Input
                value={form.alt_text}
                onChange={(e) => setForm({ ...form, alt_text: e.target.value })}
                placeholder="Describe the image for accessibility"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Optional description"
              />
            </div>

            <div className="flex gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_published}
                  onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">Publish immediately</span>
              </label>
            </div>

            <Button
              onClick={handleSave}
              disabled={uploading}
              className="w-full bg-gradient-electric text-white"
            >
              {uploading ? "Uploading..." : "Add Image"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
