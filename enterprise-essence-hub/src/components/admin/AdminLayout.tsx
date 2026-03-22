import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, FileText, Briefcase, Package, MessageSquare,
  Users, Image, Settings, LogOut, ChevronLeft, ChevronRight,
  BarChart3, Search, Globe, Menu, Shield
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  { label: "Blog Posts", icon: FileText, path: "/admin/blog" },
  { label: "Services", icon: Briefcase, path: "/admin/services" },
  { label: "Products", icon: Package, path: "/admin/products" },
  { label: "Case Studies", icon: FileText, path: "/admin/case-studies" },
  { label: "Testimonials", icon: MessageSquare, path: "/admin/testimonials" },
  { label: "Gallery", icon: Image, path: "/admin/gallery" },
  { label: "Leads", icon: Users, path: "/admin/leads" },
  { label: "Analytics", icon: BarChart3, path: "/admin/analytics" },
  { label: "SEO", icon: Search, path: "/admin/seo" },
  { label: "Chat", icon: MessageSquare, path: "/admin/chat" },
  { label: "Careers", icon: Briefcase, path: "/admin/careers" },
  { label: "Users", icon: Shield, path: "/admin/users" },
  { label: "Settings", icon: Settings, path: "/admin/settings" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, signOut, roles } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/login");
  };

  const sidebar = (
    <div className={cn(
      "flex flex-col h-full bg-card border-r border-border transition-all",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="p-4 border-b border-border flex items-center justify-between">
        {!collapsed && (
          <Link to="/admin" className="font-display font-bold text-foreground text-lg">
            ECC Admin
          </Link>
        )}
        <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)} className="hidden lg:flex">
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        {!collapsed && (
          <div className="mb-3">
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            <p className="text-xs text-primary capitalize">{roles[0]?.replace("_", " ") || "Staff"}</p>
          </div>
        )}
        <Button variant="ghost" size={collapsed ? "icon" : "default"} onClick={handleSignOut} className="w-full justify-start">
          <LogOut className="w-4 h-4" />
          {!collapsed && <span className="ml-2">Sign Out</span>}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-foreground/50 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 lg:static lg:z-auto transition-transform",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {sidebar}
      </div>
      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border flex items-center px-4 gap-4 bg-card">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex-1" />
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
            <Globe className="w-3 h-3" /> View Site
          </Link>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
