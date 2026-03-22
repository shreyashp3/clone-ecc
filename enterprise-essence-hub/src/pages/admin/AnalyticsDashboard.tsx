import { useEffect, useState } from "react";
import { analytics } from "@/integrations/api/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Calendar, TrendingUp, TrendingDown } from "lucide-react";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function AnalyticsDashboard() {
  const [viewsByDay, setViewsByDay] = useState<{ date: string; count: number }[]>([]);
  const [topPages, setTopPages] = useState<{ page: string; views: number }[]>([]);
  const [deviceBreakdown, setDeviceBreakdown] = useState<{ device: string; count: number; color: string }[]>([]);
  const [totalViews, setTotalViews] = useState(0);
  const [uniqueVisitors, setUniqueVisitors] = useState(0);
  const [avgSessionDuration, setAvgSessionDuration] = useState(0);
  const [bounceRate, setBounceRate] = useState(0);
  const [comparison, setComparison] = useState({ views: 0, change: 0, changePercent: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Date range state
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  const calculateBounceRate = (views: any[]) => {
    // Bounce rate = single-page sessions / total sessions
    // A bounce is when a user visits only one page and leaves without interaction
    if (views.length === 0) return 0;
    
    // Group views by session_id to count page views per session
    const sessionMap: Record<string, number> = {};
    views.forEach((v) => {
      const sessionId = v.session_id || 'unknown';
      sessionMap[sessionId] = (sessionMap[sessionId] || 0) + 1;
    });

    // Count single-page sessions (bounces)
    const bounces = Object.values(sessionMap).filter(pageCount => pageCount === 1).length;
    const totalSessions = Object.keys(sessionMap).length;
    
    return totalSessions > 0 ? Math.round((bounces / totalSessions) * 100) : 0;
  };

  const calculateAvgSessionDuration = (views: any[]) => {
    if (views.length === 0) return 0;
    
    // Group by session_id and calculate session duration from timestamps
    const sessionMap: Record<string, { startTime: number; endTime: number }> = {};
    views.forEach((v) => {
      const sessionId = v.session_id || 'unknown';
      const timestamp = new Date(v.created_at).getTime();
      
      if (!sessionMap[sessionId]) {
        sessionMap[sessionId] = { startTime: timestamp, endTime: timestamp };
      } else {
        sessionMap[sessionId].endTime = Math.max(sessionMap[sessionId].endTime, timestamp);
      }
    });
    
    const totalDuration = Object.values(sessionMap).reduce((sum, s) => sum + (s.endTime - s.startTime), 0);
    const sessionCount = Object.keys(sessionMap).length;
    
    // Convert milliseconds to seconds
    return sessionCount > 0 ? Math.round(totalDuration / sessionCount / 1000) : 0;
  };

  const fetchAnalytics = async (start: string, end: string) => {
    try {
      setLoading(true);
      setError(null);

      // Validate date range (start <= end)
      if (new Date(start) > new Date(end)) {
        setError("Start date cannot be after end date");
        setLoading(false);
        return;
      }

      // Views in date range
      const viewsResponse = await analytics.getPageViews({
        start_date: start,
        end_date: end,
        page: 1,
        limit: 5000,
      });

      const views = (viewsResponse as any)?.data || [];

      if (!views) {
        setLoading(false);
        return;
      }

      // Filter by date range
      const filteredViews = views as any[];

      // Previous period for comparison
      const startObj = new Date(start);
      const endObj = new Date(end);
      const daysDiff = Math.ceil((endObj.getTime() - startObj.getTime()) / (1000 * 60 * 60 * 24));
      
      const prevStart = new Date(startObj);
      prevStart.setDate(prevStart.getDate() - daysDiff);
      const prevEnd = new Date(startObj);
      prevEnd.setDate(prevEnd.getDate() - 1);

      const prevFromDate = prevStart.toISOString().split('T')[0];
      const prevToDate = prevEnd.toISOString().split('T')[0];

      if (filteredViews && filteredViews.length > 0) {
        // Group by day
        const dayMap: Record<string, number> = {};
        const pageMap: Record<string, number> = {};
        const deviceMap: Record<string, number> = {};
        const visitorSet = new Set<string>();

        filteredViews.forEach((v: any) => {
          const day = v.created_at.slice(0, 10);
          dayMap[day] = (dayMap[day] || 0) + 1;
          pageMap[v.page_path] = (pageMap[v.page_path] || 0) + 1;
          const device = v.device_type || "unknown";
          deviceMap[device] = (deviceMap[device] || 0) + 1;
          if (v.session_id) visitorSet.add(v.session_id);
        });

        setTotalViews(filteredViews.length);
        setUniqueVisitors(visitorSet.size);
        setAvgSessionDuration(calculateAvgSessionDuration(filteredViews));
        setBounceRate(calculateBounceRate(filteredViews));

        setViewsByDay(
          Object.entries(dayMap)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, count]) => ({ date, count }))
        );

        setTopPages(
          Object.entries(pageMap)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([page, views]) => ({ page, views }))
        );

        const deviceData = Object.entries(deviceMap).map(([device, count], idx) => ({ 
          device, 
          count,
          color: COLORS[idx % COLORS.length]
        }));
        setDeviceBreakdown(deviceData);

        // Calculate comparison
        const prevResponse = await analytics.getPageViews({
          start_date: prevFromDate,
          end_date: prevToDate,
          page: 1,
          limit: 5000,
        });
        const prevViews = (prevResponse as any)?.data || [];
        const prevViewsCount = prevViews.length;
        const change = filteredViews.length - prevViewsCount;
        const changePercent = prevViewsCount > 0 ? Math.round((change / prevViewsCount) * 100) : 0;
        setComparison({ views: prevViewsCount, change, changePercent });
      } else {
        setTotalViews(0);
        setUniqueVisitors(0);
        setAvgSessionDuration(0);
        setBounceRate(0);
        setViewsByDay([]);
        setTopPages([]);
        setDeviceBreakdown([]);
        setComparison({ views: 0, change: 0, changePercent: 0 });
      }
    } catch (error: any) {
      console.error("Failed to fetch analytics:", error);
      setError("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(startDate, endDate);
  }, [startDate, endDate]);

  // Quick preset buttons
  const setDateRange = (days: number) => {
    const end = new Date().toISOString().split('T')[0];
    const start = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
    setStartDate(start);
    setEndDate(end);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground mb-4">Analytics</h1>
        
        {/* Date Range Selector */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <label className="text-sm font-medium text-foreground">Date Range</label>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              <div className="flex items-center gap-2">
                <Input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div className="flex items-center justify-center text-muted-foreground">to</div>
              <div className="flex items-center gap-2">
                <Input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="text-sm"
                />
              </div>
              
              {/* Quick presets */}
              <div className="col-span-full sm:col-span-3 lg:col-span-2 flex gap-1 flex-wrap">
                <Button variant="outline" size="sm" onClick={() => setDateRange(7)} className="text-xs">7 days</Button>
                <Button variant="outline" size="sm" onClick={() => setDateRange(30)} className="text-xs">30 days</Button>
                <Button variant="outline" size="sm" onClick={() => setDateRange(90)} className="text-xs">90 days</Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6">
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
              <p className="text-muted-foreground">Loading analytics...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Total Views</p>
            <div className="flex items-end justify-between">
              <p className="text-3xl font-display font-bold text-foreground">{totalViews.toLocaleString()}</p>
              {comparison.changePercent !== 0 && (
                <div className="flex items-center gap-1">
                  {comparison.changePercent > 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                  <span className={comparison.changePercent > 0 ? "text-green-500 text-xs font-semibold" : "text-red-500 text-xs font-semibold"}>
                    {comparison.changePercent > 0 ? "+" : ""}{comparison.changePercent}%
                  </span>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">vs previous period: {comparison.views.toLocaleString()}</p>
          </Card>

          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Unique Visitors</p>
            <p className="text-3xl font-display font-bold text-foreground">{uniqueVisitors.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-2">avg {(totalViews / uniqueVisitors || 0).toFixed(1)} views/visitor</p>
          </Card>

          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Avg Session Duration</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-display font-bold text-foreground">
                {avgSessionDuration > 60 ? (avgSessionDuration / 60).toFixed(1) : avgSessionDuration}
              </p>
              <span className="text-sm text-muted-foreground">
                {avgSessionDuration > 60 ? "min" : "sec"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {avgSessionDuration > 0 ? `${Math.round(avgSessionDuration)} seconds average` : "No session data"}
            </p>
          </Card>

          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Bounce Rate</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-display font-bold text-foreground">{bounceRate}%</p>
              <span className={`text-xs font-medium ${bounceRate > 50 ? "text-red-600" : bounceRate > 30 ? "text-amber-600" : "text-green-600"}`}>
                {bounceRate > 50 ? "(High)" : bounceRate > 30 ? "(Moderate)" : "(Good)"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {uniqueVisitors > 0 ? `of ${uniqueVisitors} visitors left without interaction` : "Rate = single-page visitors"}
            </p>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-display font-semibold text-foreground mb-2">Page Views</h3>
          <p className="text-xs text-muted-foreground mb-4">{startDate} to {endDate}</p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={viewsByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="font-display font-semibold text-foreground mb-2">Top Pages</h3>
          <p className="text-xs text-muted-foreground mb-4">{startDate} to {endDate}</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topPages} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
              <YAxis dataKey="page" type="category" width={120} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip />
              <Bar dataKey="views" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="font-display font-semibold text-foreground mb-2">Device Breakdown</h3>
          <p className="text-xs text-muted-foreground mb-4">{startDate} to {endDate}</p>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={deviceBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ device, count }) => `${device} (${count})`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {deviceBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="font-display font-semibold text-foreground mb-2">Device Stats</h3>
          <p className="text-xs text-muted-foreground mb-4">{startDate} to {endDate}</p>
          <div className="space-y-2">
            {deviceBreakdown.map((device, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: device.color }}
                  />
                  <span className="text-sm font-medium text-foreground capitalize">{device.device}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">{device.count}</p>
                  <p className="text-xs text-muted-foreground">
                    {totalViews > 0 ? Math.round((device.count / totalViews) * 100) : 0}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
        </div>
        </>
        )}
      </div>

      {totalViews === 0 && !loading && (
        <p className="text-center text-muted-foreground mt-8">No analytics data for this date range. Page view tracking will populate this dashboard.</p>
      )}
    </div>
  );
}
