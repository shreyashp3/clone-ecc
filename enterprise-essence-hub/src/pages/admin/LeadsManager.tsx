import { useEffect, useState } from "react";
import { admin } from "@/integrations/api/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Eye, Download, Trash2 } from "lucide-react";
type LeadStatus = "new" | "contacted" | "qualified" | "proposal" | "won" | "lost";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  interest?: string | null;
  message?: string | null;
  form_type: string;
  source_page?: string | null;
  status: LeadStatus;
  assigned_to?: string | null;
  notes?: string | null;
  created_at: string;
}

// Team/assignee options
const TEAM_MEMBERS = [
  { id: "unassigned", name: "Unassigned" },
  { id: "sales-1", name: "Sales Team 1" },
  { id: "sales-2", name: "Sales Team 2" },
  { id: "support", name: "Support Team" },
  { id: "marketing", name: "Marketing Team" },
];

export default function LeadsManager() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Lead | null>(null);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());

  const fetchLeads = async () => {
    const params: { status?: string; q?: string; limit?: number } = {
      limit: 200,
    };
    if (filter !== "all") params.status = filter;
    if (search) params.q = search;

    const data = await admin.leads.list(params);
    setLeads((data as any)?.data || []);
  };

  useEffect(() => { fetchLeads(); }, [filter, search]);

  const updateStatus = async (id: string, status: LeadStatus) => {
    await admin.leads.update(id, { status });
    toast.success("Status updated");
    fetchLeads();
    if (selected?.id === id) setSelected({ ...selected!, status });
  };

  const updateAssignment = async (id: string, assignedTo: string) => {
    const actualAssignee = assignedTo === "unassigned" ? null : assignedTo;
    await admin.leads.update(id, { assigned_to: actualAssignee });
    toast.success("Assigned to " + (assignedTo === "unassigned" ? "unassigned" : assignedTo));
    fetchLeads();
    if (selected?.id === id) setSelected({ ...selected!, assigned_to: actualAssignee });
  };

  const bulkUpdateStatus = async (status: LeadStatus) => {
    if (selectedLeads.size === 0) return;
    try {
      await admin.leads.bulkUpdate({ ids: Array.from(selectedLeads), status });
      toast.success(`Updated ${selectedLeads.size} leads to ${status}`);
      setSelectedLeads(new Set());
      fetchLeads();
    } catch (error: any) {
      toast.error("Failed to update leads: " + error.message);
    }
  };

  const bulkAssign = async (assignee: string) => {
    if (selectedLeads.size === 0) return;
    try {
      const actualAssignee = assignee === "unassigned" ? null : assignee;
      await admin.leads.bulkUpdate({ ids: Array.from(selectedLeads), assigned_to: actualAssignee });
      toast.success(`Assigned ${selectedLeads.size} leads to ${assignee}`);
      setSelectedLeads(new Set());
      fetchLeads();
    } catch (error: any) {
      toast.error("Failed to assign leads: " + error.message);
    }
  };

  const bulkDelete = async () => {
    if (selectedLeads.size === 0) return;
    if (!confirm(`Delete ${selectedLeads.size} leads? This cannot be undone.`)) return;
    
    try {
      await admin.leads.bulkDelete(Array.from(selectedLeads));
      toast.success(`Deleted ${selectedLeads.size} leads`);
      setSelectedLeads(new Set());
      fetchLeads();
    } catch (error: any) {
      toast.error("Failed to delete leads: " + error.message);
    }
  };

  const toggleSelectLead = (id: string) => {
    const next = new Set(selectedLeads);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedLeads(next);
  };

  const toggleSelectAll = () => {
    if (selectedLeads.size === leads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(leads.map(l => l.id)));
    }
  };

  const updateNotes = async (id: string, notes: string) => {
    try {
      await admin.leads.update(id, { notes });
      toast.success("Notes saved");
    } catch (error: any) {
      console.error("Update notes error:", error);
      toast.error("Failed to save notes: " + error.message);
    }
  };

  const exportCSV = () => {
    const headers = ["Name", "Email", "Phone", "Company", "Interest", "Status", "Source", "Date"];
    const rows = leads.map(l => [l.name, l.email, l.phone, l.company, l.interest, l.status, l.source_page, l.created_at]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const statusColor = (s: string | null): "default" | "secondary" | "outline" | "destructive" => {
    switch (s) {
      case "new": return "default";
      case "contacted": return "outline";
      case "qualified": return "secondary";
      case "won": return "default";
      case "lost": return "destructive";
      default: return "secondary";
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Lead Management</h1>
          {selectedLeads.size > 0 && (
            <p className="text-xs text-muted-foreground mt-1">{selectedLeads.size} leads selected</p>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {selectedLeads.size > 0 && (
            <>
              <Select onValueChange={bulkUpdateStatus}>
                <SelectTrigger className="w-32"><SelectValue placeholder="Change Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="proposal">Proposal</SelectItem>
                  <SelectItem value="won">Won</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
              <Select onValueChange={bulkAssign}>
                <SelectTrigger className="w-32"><SelectValue placeholder="Assign To" /></SelectTrigger>
                <SelectContent>
                  {TEAM_MEMBERS.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="destructive" size="sm" onClick={bulkDelete}>
                <Trash2 className="w-4 h-4 mr-1" /> Delete {selectedLeads.size}
              </Button>
            </>
          )}
          <Button variant="outline" onClick={exportCSV}><Download className="w-4 h-4 mr-2" /> Export CSV</Button>
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <Input placeholder="Search leads..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="qualified">Qualified</SelectItem>
            <SelectItem value="proposal">Proposal</SelectItem>
            <SelectItem value="won">Won</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox 
                  checked={selectedLeads.size === leads.length && leads.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Interest</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-16">View</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => (
              <TableRow key={lead.id} className={selectedLeads.has(lead.id) ? "bg-primary/5" : ""}>
                <TableCell>
                  <Checkbox 
                    checked={selectedLeads.has(lead.id)}
                    onCheckedChange={() => toggleSelectLead(lead.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">{lead.name}</TableCell>
                <TableCell className="text-sm">{lead.email}</TableCell>
                <TableCell className="text-sm">{lead.company || "—"}</TableCell>
                <TableCell className="text-xs">
                  {lead.assigned_to ? (
                    <Badge variant="outline">
                      {TEAM_MEMBERS.find(m => m.id === lead.assigned_to)?.name || lead.assigned_to}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">Unassigned</span>
                  )}
                </TableCell>
                <TableCell className="text-sm">{lead.interest || "—"}</TableCell>
                <TableCell>
                  <Badge variant={statusColor(lead.status)}>{lead.status}</Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(lead.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => setSelected(lead)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {leads.length === 0 && (
              <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">No leads found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Lead Details</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Name:</span> <strong>{selected.name}</strong></div>
                <div><span className="text-muted-foreground">Email:</span> <strong>{selected.email}</strong></div>
                <div><span className="text-muted-foreground">Phone:</span> <strong>{selected.phone || "—"}</strong></div>
                <div><span className="text-muted-foreground">Company:</span> <strong>{selected.company || "—"}</strong></div>
                <div><span className="text-muted-foreground">Interest:</span> <strong>{selected.interest || "—"}</strong></div>
                <div><span className="text-muted-foreground">Source:</span> <strong>{selected.source_page || "—"}</strong></div>
                <div><span className="text-muted-foreground">Form:</span> <strong>{selected.form_type}</strong></div>
                <div><span className="text-muted-foreground">Date:</span> <strong>{new Date(selected.created_at).toLocaleString()}</strong></div>
              </div>
              {selected.message && (
                <div>
                  <Label className="text-muted-foreground">Message</Label>
                  <p className="text-sm mt-1 p-3 bg-muted rounded-lg">{selected.message}</p>
                </div>
              )}
              <div>
                <Label>Assigned To</Label>
                <Select value={selected.assigned_to || "unassigned"} onValueChange={(v) => updateAssignment(selected.id, v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TEAM_MEMBERS.map(m => (
                      <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={selected.status || "new"} onValueChange={(v) => updateStatus(selected.id, v as LeadStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="proposal">Proposal</SelectItem>
                    <SelectItem value="won">Won</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea defaultValue={selected.notes || ""} onBlur={(e) => updateNotes(selected.id, e.target.value)} rows={3} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
