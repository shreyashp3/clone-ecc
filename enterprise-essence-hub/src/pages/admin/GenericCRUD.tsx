import { useEffect, useState } from "react";
import { admin } from "@/integrations/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search, X } from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";

interface FieldDef {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "boolean" | "json" | "image";
  required?: boolean;
  showInTable?: boolean;
}

interface GenericCRUDProps {
  title: string;
  table: "testimonials" | "case_studies" | "gallery" | "products" | "services" | "page_seo" | "site_settings";
  fields: FieldDef[];
  idField?: string;
}

export default function GenericCRUD({ title, table, fields, idField = "id" }: GenericCRUDProps) {
  const apiMap = {
    testimonials: admin.testimonials,
    case_studies: admin.caseStudies,
    gallery: admin.gallery,
    products: admin.products,
    services: admin.services,
    page_seo: admin.pageSeo,
    site_settings: admin.siteSettings,
  } as const;

  const api = apiMap[table];
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, any>>({});
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const fetchItems = async () => {
    const data = await api.list();
    setItems(Array.isArray(data) ? data : []);
  };

  useEffect(() => { fetchItems(); }, [table]);

  const openNew = () => {
    const empty: Record<string, any> = {};
    fields.forEach(f => {
      empty[f.key] = f.type === "boolean" ? true : f.type === "number" ? 0 : f.type === "json" ? "[]" : "";
    });
    setForm(empty);
    setEditing(null);
    setOpen(true);
  };

  const openEdit = (item: any) => {
    const f: Record<string, any> = {};
    fields.forEach(fd => {
      f[fd.key] = fd.type === "json" ? JSON.stringify(item[fd.key] || [], null, 2) : (item[fd.key] ?? "");
    });
    setForm(f);
    setEditing(item[idField]);
    setOpen(true);
  };

  const handleSave = async () => {
    const payload: Record<string, any> = {};
    fields.forEach(f => {
      if (f.type === "json") {
        try { payload[f.key] = JSON.parse(form[f.key]); } catch { payload[f.key] = []; }
      } else if (f.type === "number") {
        payload[f.key] = Number(form[f.key]) || 0;
      } else {
        payload[f.key] = form[f.key];
      }
    });

    if (editing) {
      try {
        await api.update(editing, payload);
        toast.success("Updated");
      } catch (error: any) {
        toast.error(error?.message || "Failed to update");
        return;
      }
    } else {
      try {
        await api.create(payload);
        toast.success("Created");
      } catch (error: any) {
        toast.error(error?.message || "Failed to create");
        return;
      }
    }
    setOpen(false);
    fetchItems();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    try {
      await api.delete(id);
      toast.success("Deleted");
      fetchItems();
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete");
    }
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} items?`)) return;
    for (const id of selected) {
      try {
        await api.delete(id);
      } catch (error: any) {
        toast.error(error?.message || "Failed to delete an item");
        break;
      }
    }
    toast.success(`${selected.size} items deleted`);
    setSelected(new Set());
    fetchItems();
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const toggleAll = () => {
    if (selected.size === filteredItems.length) setSelected(new Set());
    else setSelected(new Set(filteredItems.map((i) => i[idField])));
  };

  const tableFields = fields.filter(f => f.showInTable !== false).slice(0, 5);

  const filteredItems = search
    ? items.filter((item) =>
        tableFields.some((f) =>
          String(item[f.key] ?? "").toLowerCase().includes(search.toLowerCase())
        )
      )
    : items;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">{title}</h1>
        <div className="flex gap-2">
          {selected.size > 0 && (
            <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
              <Trash2 className="w-4 h-4 mr-1" /> Delete {selected.size}
            </Button>
          )}
          <Button onClick={openNew}><Plus className="w-4 h-4 mr-2" /> Add New</Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search ${title.toLowerCase()}...`}
          className="pl-9 pr-8"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox checked={selected.size === filteredItems.length && filteredItems.length > 0} onCheckedChange={toggleAll} />
              </TableHead>
              {tableFields.map(f => <TableHead key={f.key}>{f.label}</TableHead>)}
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item) => (
              <TableRow key={item[idField]} className={selected.has(item[idField]) ? "bg-primary/5" : ""}>
                <TableCell>
                  <Checkbox checked={selected.has(item[idField])} onCheckedChange={() => toggleSelect(item[idField])} />
                </TableCell>
                {tableFields.map(f => (
                  <TableCell key={f.key} className="text-sm max-w-xs truncate">
                    {f.type === "boolean" ? (item[f.key] ? "Yes" : "No")
                      : f.type === "image" && item[f.key] ? (
                        <img src={item[f.key]} alt="" className="w-10 h-10 rounded object-cover" />
                      ) : String(item[f.key] ?? "—").slice(0, 60)}
                  </TableCell>
                ))}
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item[idField])}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredItems.length === 0 && (
              <TableRow><TableCell colSpan={tableFields.length + 2} className="text-center text-muted-foreground py-8">
                {search ? "No results found." : "No items yet."}
              </TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} {title}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {fields.map(f => (
              <div key={f.key}>
                <Label>{f.label}</Label>
                {f.type === "image" ? (
                  <ImageUpload value={form[f.key] ?? ""} onChange={(url) => setForm({ ...form, [f.key]: url })} />
                ) : f.type === "textarea" || f.type === "json" ? (
                  <Textarea value={form[f.key] ?? ""} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    rows={f.type === "json" ? 6 : 3} className={f.type === "json" ? "font-mono text-xs" : ""} />
                ) : f.type === "boolean" ? (
                  <div className="pt-1">
                    <Switch checked={!!form[f.key]} onCheckedChange={(v) => setForm({ ...form, [f.key]: v })} />
                  </div>
                ) : (
                  <Input type={f.type === "number" ? "number" : "text"} value={form[f.key] ?? ""}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} required={f.required} />
                )}
              </div>
            ))}
            <Button onClick={handleSave} className="w-full bg-gradient-electric text-white">
              {editing ? "Update" : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
