import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { admin } from "@/integrations/api/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, FileText, Eye, TrendingUp, Plus, MessageSquare, BarChart3, ArrowUp, ArrowDown, RefreshCw } from "lucide-react";

interface Stats {
  totalLeads: number;
  newLeads: number;
  convertedLeads: number;
  totalPosts: number;
  totalViews: number;
  recentLeads: Array<{ id: string; name: string; email: string; status: string; createdAt: string }>;
  recentConversations: Array<{ id: string; visitorName: string | null; status: string; updatedAt: string }>;
}

interface TrendData {
  totalLeads: { value: number; change: number };
  newLeads: { value: number; change: number };
  convertedLeads: { value: number; change: number };
  totalViews: { value: number; change: number };
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    totalLeads: 0,
    newLeads: 0,
    convertedLeads: 0,
    totalPosts: 0,
    totalViews: 0,
    recentLeads: [],
    recentConversations: [],
  });
  const [trends, setTrends] = useState<TrendData>({
    totalLeads: { value: 0, change: 0 },
    newLeads: { value: 0, change: 0 },
    convertedLeads: { value: 0, change: 0 },
    totalViews: { value: 0, change: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchStats = async () => {
    try {
      const statsResponse = await admin.dashboard.getStats();
      const newStats = {
        totalLeads: statsResponse.totalLeads || 0,
        newLeads: statsResponse.newLeads || 0,
        convertedLeads: statsResponse.convertedLeads || 0,
        totalPosts: statsResponse.totalPosts || 0,
        totalViews: statsResponse.totalViews || 0,
        recentLeads: statsResponse.recentLeads || [],
        recentConversations: statsResponse.recentConversations || [],
      };

      // Calculate trends based on previous data
      setTrends({
        totalLeads: { 
          value: newStats.totalLeads, 
          change: newStats.totalLeads - stats.totalLeads 
        },
        newLeads: { 
          value: newStats.newLeads, 
          change: newStats.newLeads - stats.newLeads 
        },
        convertedLeads: { 
          value: newStats.convertedLeads, 
          change: newStats.convertedLeads - stats.convertedLeads 
        },
        totalViews: { 
          value: newStats.totalViews, 
          change: newStats.totalViews - stats.totalViews 
        },
      });
      
      setStats(newStats);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  // Initial load
  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);
      await fetchStats();
      setLoading(false);
    };
    loadInitial();
  }, []);

  // Auto-refresh effect (FIXED: removed stats from deps to prevent infinite loop)
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      fetchStats();
    }, 60000); // Refresh every 60 seconds
    
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  // Calculate derived metrics
  const conversionRate = stats.totalLeads > 0 ? ((stats.convertedLeads / stats.totalLeads) * 100).toFixed(1) : "0.0";
  const newLeadPercentage = stats.totalLeads > 0 ? ((stats.newLeads / stats.totalLeads) * 100).toFixed(0) : "0";

  const getTrendColor = (change: number): string => {
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-gray-500";
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return <ArrowUp className="w-4 h-4" />;
    if (change < 0) return <ArrowDown className="w-4 h-4" />;
    return null;
  };

  const statCards = [
    { 
      label: "Total Leads", 
      value: stats.totalLeads, 
      icon: Users, 
      color: "text-primary",
      subtext: `${newLeadPercentage}% new`,
      trend: trends.totalLeads.change
    },
    { 
      label: "Conversion Rate", 
      value: `${conversionRate}%`, 
      icon: TrendingUp, 
      color: "text-accent",
      subtext: `${stats.convertedLeads} converted`,
      trend: trends.convertedLeads.change
    },
    { 
      label: "Blog Posts", 
      value: stats.totalPosts, 
      icon: FileText, 
      color: "text-purple",
      subtext: "Published"
    },
    { 
      label: "Page Views", 
      value: stats.totalViews.toLocaleString(), 
      icon: Eye, 
      color: "text-amber",
      subtext: "All time",
      trend: trends.totalViews.change
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Dashboard</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Last updated: {lastUpdated.toLocaleTimeString()} 
            {autoRefresh && " (Auto-refresh: on)"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setAutoRefresh(!autoRefresh)}
            variant="outline"
            size="sm"
            className={autoRefresh ? "bg-primary/10" : ""}
          >
            {autoRefresh ? "Auto-refresh: ON" : "Auto-refresh: OFF"}
          </Button>
          <Button 
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            size="sm"
            className="gap-1"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((c) => (
          <Card key={c.label} className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{c.label}</p>
                <p className="text-3xl font-display font-bold text-foreground mt-2">{c.value}</p>
                <div className="flex items-center gap-1 mt-2">
                  <p className="text-xs text-muted-foreground">{c.subtext}</p>
                  {c.trend !== undefined && (
                    <div className={`flex items-center gap-0.5 text-xs font-medium ${getTrendColor(c.trend)}`}>
                      {getTrendIcon(c.trend)}
                      <span>{c.trend > 0 ? "+" : ""}{c.trend}</span>
                    </div>
                  )}
                </div>
              </div>
              <c.icon className={`w-8 h-8 ${c.color} opacity-60 shrink-0`} />
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-display font-semibold text-foreground mb-3">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Button 
            onClick={() => navigate("/admin/leads")}
            className="h-20 flex flex-col items-center justify-center gap-2 bg-primary/10 hover:bg-primary/20 text-foreground border border-primary/20"
            variant="outline"
          >
            <Plus className="w-5 h-5" />
            <span className="text-xs">View Leads</span>
          </Button>
          <Button 
            onClick={() => navigate("/admin/blog")}
            className="h-20 flex flex-col items-center justify-center gap-2 bg-purple/10 hover:bg-purple/20 text-foreground border border-purple/20"
            variant="outline"
          >
            <FileText className="w-5 h-5" />
            <span className="text-xs">Publish Post</span>
          </Button>
          <Button 
            onClick={() => navigate("/admin/chat")}
            className="h-20 flex flex-col items-center justify-center gap-2 bg-accent/10 hover:bg-accent/20 text-foreground border border-accent/20"
            variant="outline"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-xs">View Chat</span>
          </Button>
          <Button 
            onClick={() => navigate("/admin/analytics")}
            className="h-20 flex flex-col items-center justify-center gap-2 bg-amber/10 hover:bg-amber/20 text-foreground border border-amber/20"
            variant="outline"
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-xs">Analytics</span>
          </Button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <Card className="p-6">
          <h3 className="font-display font-semibold text-foreground mb-4">Recent Leads</h3>
          <div className="space-y-3">
            {stats.recentLeads.length > 0 ? (
              stats.recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{lead.name}</p>
                    <p className="text-xs text-muted-foreground">{lead.email}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    lead.status === "new" ? "bg-primary/20 text-primary" :
                    lead.status === "won" ? "bg-green-500/20 text-green-600" :
                    "bg-muted"
                  }`}>
                    {lead.status || "pending"}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No leads yet</p>
            )}
          </div>
        </Card>

        {/* Recent Conversations */}
        <Card className="p-6">
          <h3 className="font-display font-semibold text-foreground mb-4">Recent Chats</h3>
          <div className="space-y-3">
            {stats.recentConversations.length > 0 ? (
              stats.recentConversations.map((chat) => (
                <div key={chat.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{chat.visitorName || "Anonymous"}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(chat.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    chat.status === "open" ? "bg-accent/20 text-accent" :
                    chat.status === "resolved" ? "bg-green-500/20 text-green-600" :
                    "bg-muted"
                  }`}>
                    {chat.status || "pending"}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No conversations yet</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
