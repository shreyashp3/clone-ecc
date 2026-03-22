import { useEffect, useState } from "react";
import { admin } from "@/integrations/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Trash2, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
type AppRole = "super_admin" | "admin" | "content_manager" | "support_agent" | "marketing_manager";

interface UserWithRoles {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  roles: { id: string; role: AppRole }[];
}

const ROLE_LABELS: Record<AppRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  content_manager: "Content Manager",
  support_agent: "Support Agent",
  marketing_manager: "Marketing Manager",
};

const ROLE_COLORS: Record<AppRole, "default" | "secondary" | "outline" | "destructive"> = {
  super_admin: "destructive",
  admin: "default",
  content_manager: "secondary",
  support_agent: "outline",
  marketing_manager: "outline",
};

export default function UserManagement() {
  const { isAdmin, roles } = useAuth();
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [open, setOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<AppRole>("content_manager");
  const [loading, setLoading] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const fetchUsers = async () => {
    const data = await admin.users.list();
    setUsers(Array.isArray(data) ? data : []);
  };

  useEffect(() => { 
    fetchUsers();
    setIsSuperAdmin(roles.includes("super_admin"));
  }, [roles]);

  const handleAddRole = async (userId: string, role: AppRole) => {
    try {
      await admin.users.addRole(userId, role);
      toast.success("Role added");
      fetchUsers();
    } catch (error: any) {
      const message = error?.message || "Failed to add role";
      if (message.toLowerCase().includes("already")) toast.error("User already has this role");
      else toast.error(message);
    }
  };

  const handleRemoveRole = async (roleId: string) => {
    if (!confirm("Remove this role?")) return;
    try {
      await admin.users.removeRole(roleId);
      toast.success("Role removed");
      fetchUsers();
    } catch (error: any) {
      toast.error(error?.message || "Failed to remove role");
    }
  };

  const handleInviteUser = async () => {
    if (!newEmail || !newPassword) {
      toast.error("Email and password are required");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Validate password complexity (min 8 chars, uppercase, number, special char)
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      toast.error("Password must be at least 8 characters with uppercase letter, number, and special character (@$!%*?&)");
      return;
    }

    // Prevent non-super-admins from creating super_admin users
    if (newRole === "super_admin" && !isSuperAdmin) {
      toast.error("Only super admins can create other super admin users");
      return;
    }

    setLoading(true);

    // Use edge function to create user server-side (avoids session hijack)
    try {
      await admin.users.create({
        email: newEmail,
        password: newPassword,
        full_name: newName,
        role: newRole,
      });
    } catch (error: any) {
      toast.error(error?.message || "Failed to create user");
      setLoading(false);
      return;
    }

    toast.success(`User created with ${ROLE_LABELS[newRole]} role.`);

    setOpen(false);
    setNewEmail("");
    setNewPassword("");
    setNewName("");
    setLoading(false);
    fetchUsers();
  };

  if (!isAdmin) {
    return <p className="text-muted-foreground">Only admins can manage users.</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">User Management</h1>
        <Button onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add User
        </Button>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead className="w-48">Add Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.user_id}>
                <TableCell className="font-medium">{u.display_name || "Unknown"}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {u.roles.map((r) => (
                      <Badge key={r.id} variant={ROLE_COLORS[r.role]} className="gap-1 cursor-pointer group" onClick={() => handleRemoveRole(r.id)}>
                        {ROLE_LABELS[r.role]}
                        <Trash2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Select onValueChange={(v) => handleAddRole(u.user_id, v as AppRole)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Add role..." />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(ROLE_LABELS) as AppRole[])
                        .filter((r) => !u.roles.some((ur) => ur.role === r))
                        .map((r) => (
                          <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-8">No staff users found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" /> Add Staff User
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Full Name</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="John Doe" />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="user@company.com" />
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 6 characters" />
            </div>
            <div>
              <Label>Role</Label>
              <Select value={newRole} onValueChange={(v) => setNewRole(v as AppRole)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(ROLE_LABELS) as AppRole[]).map((r) => (
                    <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleInviteUser} disabled={loading} className="w-full bg-gradient-electric text-white">
              {loading ? "Creating..." : "Create User"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
