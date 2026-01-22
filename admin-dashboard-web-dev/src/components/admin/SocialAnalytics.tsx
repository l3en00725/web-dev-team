"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  BarChart3,
  Activity,
  Layers,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Eye,
  Calendar,
  ChevronDown,
  Loader2,
  Linkedin,
  Facebook,
  Instagram,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { format, parseISO } from "date-fns";

// Types
interface PostData {
  id: string;
  platform: string;
  platforms: string[];
  content: string;
  date: string;
  views: number;
  likes: number;
  shares: number;
  comments: number;
  hasMedia: boolean;
  mediaUrls: string[];
  linkUrl?: string;
}

interface DailyMetric {
  date: string;
  dateLabel: string;
  postCount: number;
}

interface PlatformMetric {
  platform: string;
  name: string;
  engagement: number;
  posts: number;
  avgEngagement: number;
}

interface AnalyticsData {
  posts: PostData[];
  metrics: {
    totalReach: number;
    totalEngagement: number;
    engagementRate: number;
    totalPosts: number;
  };
  trends: {
    reach: number;
    engagement: number;
    engagementRate: number;
    posts: number;
  };
  platformBreakdown: PlatformMetric[];
  dailyMetrics: DailyMetric[];
}

// Brand colors
const BRAND_COLORS = {
  primary: "#3b82f6",
  secondary: "#04a3eb",
  accent: "#ff7e00",
  dark: "#022a42",
};

// Platform colors
const PLATFORM_COLORS: Record<string, string> = {
  linkedin: "#0A66C2",
  x: "#000000",
  facebook: "#1877F2",
  instagram: "#E4405F",
  tiktok: "#000000",
  youtube: "#FF0000",
  threads: "#000000",
  pinterest: "#E60023",
};

// Platform icons
const PlatformIcon = ({ platform, className = "w-4 h-4" }: { platform: string; className?: string }) => {
  switch (platform.toLowerCase()) {
    case "linkedin":
      return <Linkedin className={className} />;
    case "facebook":
      return <Facebook className={className} />;
    case "instagram":
      return <Instagram className={className} />;
    case "x":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    default:
      return <Layers className={className} />;
  }
};

// Custom Tooltip for the Area Chart
const CustomChartTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl border border-slate-700">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className="text-lg font-bold">
        {payload[0]?.value?.toLocaleString() || 0}
        <span className="text-xs font-normal text-slate-400 ml-1">views</span>
      </p>
    </div>
  );
};

// Date range options
const DATE_RANGES = [
  { label: "Last 7 days", value: 7 },
  { label: "Last 14 days", value: 14 },
  { label: "Last 30 days", value: 30 },
  { label: "Last 90 days", value: 90 },
];

// KPI Card Component with Trend
function KPICard({
  title,
  value,
  trend,
  subtitle,
  icon: Icon,
  iconBgClass,
  iconColorClass,
}: {
  title: string;
  value: string;
  trend: number;
  subtitle: string;
  icon: React.ElementType;
  iconBgClass: string;
  iconColorClass: string;
}) {
  const isPositive = trend >= 0;

  return (
    <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
            <div className="flex items-center gap-2 mt-2">
              <span
                className={`flex items-center gap-0.5 text-sm font-medium ${
                  isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                {isPositive ? (
                  <ArrowUp className="w-3.5 h-3.5" />
                ) : (
                  <ArrowDown className="w-3.5 h-3.5" />
                )}
                {Math.abs(trend).toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground">{subtitle}</span>
            </div>
          </div>
          <div className={`p-3 rounded-full ${iconBgClass}`}>
            <Icon className={`w-6 h-6 ${iconColorClass}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Post Item Component (for recent posts list)
function PostItem({ post, rank }: { post: PostData; rank: number }) {
  // Use first media URL as thumbnail if available
  const thumbnail = post.hasMedia && post.mediaUrls?.length > 0 ? post.mediaUrls[0] : null;

  return (
    <div className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all group">
      {/* Thumbnail */}
      <div className="relative flex-shrink-0">
        <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt=""
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20">
              <PlatformIcon platform={post.platform} className="w-5 h-5 text-blue-500" />
            </div>
          )}
        </div>
        {/* Platform badge */}
        <div
          className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center shadow-sm"
          style={{ backgroundColor: PLATFORM_COLORS[post.platform] || '#666' }}
        >
          <PlatformIcon platform={post.platform} className="w-3 h-3 text-white" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground line-clamp-2 leading-snug">
          {post.content || "No content"}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-muted-foreground">
            {format(new Date(post.date), "MMM d, yyyy 'at' h:mm a")}
          </span>
          {post.platforms && post.platforms.length > 1 && (
            <span className="text-xs text-muted-foreground">
              • {post.platforms.length} platforms
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Empty State Component
function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
        <BarChart3 className="w-8 h-8 text-muted-foreground" />
      </div>
      <p className="text-muted-foreground">{message}</p>
      <p className="text-sm text-muted-foreground/70 mt-1">
        Start publishing posts to see your analytics here.
      </p>
    </div>
  );
}

export function SocialAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState(30);
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);

  // Fetch analytics data
  const fetchAnalytics = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      else setIsRefreshing(true);
      
      setError(null);

      const response = await fetch(`/api/admin/social/analytics?days=${dateRange}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch analytics');
      }

      setData(result.data);
    } catch (err: any) {
      console.error('Analytics fetch error:', err);
      setError(err.message || 'Failed to load analytics');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [dateRange]);

  // Fetch on mount and when date range changes
  useEffect(() => {
    fetchAnalytics(true);
  }, [fetchAnalytics]);

  // Get recent posts sorted by date
  const recentPosts = useMemo(() => {
    if (!data?.posts) return [];
    return [...data.posts]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [data?.posts]);

  // Get top platform
  const topPlatform = useMemo(() => {
    if (!data?.platformBreakdown || data.platformBreakdown.length === 0) return null;
    return data.platformBreakdown.reduce((top, curr) =>
      curr.avgEngagement > top.avgEngagement ? curr : top
    );
  }, [data?.platformBreakdown]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-lg font-medium text-foreground mb-2">Failed to load analytics</p>
        <p className="text-muted-foreground mb-4">{error}</p>
        <button
          onClick={() => fetchAnalytics(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const metrics = data?.metrics || { totalReach: 0, totalEngagement: 0, engagementRate: 0, totalPosts: 0 };
  const trends = data?.trends || { reach: 0, engagement: 0, engagementRate: 0, posts: 0 };
  const dailyMetrics = data?.dailyMetrics || [];
  const platformBreakdown = data?.platformBreakdown || [];

  return (
    <div className="space-y-6">
      {/* Header with Date Range Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Social Analytics</h2>
          <p className="text-muted-foreground">Track your social media performance</p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Refresh Button */}
          <button
            onClick={() => fetchAnalytics(false)}
            disabled={isRefreshing}
            className="p-2 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors disabled:opacity-50"
            title="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 text-muted-foreground ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          {/* Date Range Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-950 border border-border/50 rounded-lg text-sm font-medium hover:bg-muted/50 transition-colors shadow-sm"
            >
              <Calendar className="w-4 h-4 text-muted-foreground" />
              {DATE_RANGES.find((r) => r.value === dateRange)?.label}
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
            
            {isDateDropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-950 border border-border/50 rounded-lg shadow-lg z-10">
                {DATE_RANGES.map((range) => (
                  <button
                    key={range.value}
                    onClick={() => {
                      setDateRange(range.value);
                      setIsDateDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-muted/50 first:rounded-t-lg last:rounded-b-lg ${
                      dateRange === range.value ? "bg-muted text-foreground font-medium" : "text-muted-foreground"
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 1: KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Posts - this we know for sure */}
        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Total Posts</p>
                <p className="text-3xl font-bold text-foreground mt-1">{metrics.totalPosts}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`flex items-center gap-0.5 text-sm font-medium ${trends.posts >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {trends.posts >= 0 ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />}
                    {Math.abs(trends.posts).toFixed(0)}%
                  </span>
                  <span className="text-xs text-muted-foreground">vs last period</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Layers className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Platforms Used */}
        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Platforms</p>
                <p className="text-3xl font-bold text-foreground mt-1">{platformBreakdown.length}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {platformBreakdown.map(p => p.name).join(', ') || 'None yet'}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Platform by Posts */}
        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Top Platform</p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {topPlatform?.name || '—'}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {topPlatform ? `${topPlatform.posts} posts` : 'No posts yet'}
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
                {topPlatform ? (
                  <PlatformIcon platform={topPlatform.platform} className="w-6 h-6 text-purple-600" />
                ) : (
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Engagement Notice */}
        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow bg-amber-50/50 dark:bg-amber-950/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Engagement Data</p>
                <p className="text-lg font-semibold text-amber-700 dark:text-amber-400 mt-1">Coming Soon</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Platform analytics integration
                </p>
              </div>
              <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/30">
                <Eye className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Posts Over Time Chart */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-muted-foreground" />
            Posts Over Time
          </CardTitle>
          <CardDescription>Number of posts published each day</CardDescription>
        </CardHeader>
        <CardContent>
          {dailyMetrics.length > 0 && dailyMetrics.some(d => d.postCount > 0) ? (
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyMetrics} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPosts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="3 3"
                    className="stroke-muted/50"
                  />
                  <XAxis
                    dataKey="dateLabel"
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (!active || !payload || payload.length === 0) return null;
                      return (
                        <div className="bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl border border-slate-700">
                          <p className="text-xs text-slate-400 mb-1">{label}</p>
                          <p className="text-lg font-bold">
                            {payload[0]?.value || 0}
                            <span className="text-xs font-normal text-slate-400 ml-1">
                              {payload[0]?.value === 1 ? 'post' : 'posts'}
                            </span>
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="postCount"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorPosts)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState message="No posts published in this period" />
          )}
        </CardContent>
      </Card>

      {/* Row 3: Platform Breakdown & Top Posts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Posts by Platform */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>Posts by Platform</CardTitle>
            <CardDescription>Distribution of your content</CardDescription>
          </CardHeader>
          <CardContent>
            {platformBreakdown.length > 0 ? (
              <>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={platformBreakdown} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} className="stroke-muted/50" />
                      <XAxis 
                        type="number" 
                        tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} 
                        tickLine={false} 
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                        tickLine={false}
                        axisLine={false}
                        width={80}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload || payload.length === 0) return null;
                          const posts = payload[0]?.value || 0;
                          return (
                            <div className="bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl border border-slate-700">
                              <p className="text-xs text-slate-400 mb-1">{payload[0]?.payload?.name}</p>
                              <p className="text-lg font-bold">
                                {posts}
                                <span className="text-xs font-normal text-slate-400 ml-1">
                                  {posts === 1 ? 'post' : 'posts'}
                                </span>
                              </p>
                            </div>
                          );
                        }}
                      />
                      <Bar
                        dataKey="posts"
                        radius={[0, 6, 6, 0]}
                        fill={BRAND_COLORS.primary}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Platform legend */}
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {platformBreakdown.map((pm) => (
                    <div key={pm.platform} className="flex items-center gap-2 text-sm">
                      <span 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: PLATFORM_COLORS[pm.platform] || '#666' }} 
                      />
                      <span className="text-muted-foreground">{pm.name}:</span>
                      <span className="font-medium">{pm.posts} {pm.posts === 1 ? 'post' : 'posts'}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <EmptyState message="No platform data available" />
            )}
          </CardContent>
        </Card>

        {/* Recent Posts */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Posts</CardTitle>
            <CardDescription>Your latest published content</CardDescription>
          </CardHeader>
          <CardContent>
            {recentPosts.length > 0 ? (
              <div className="space-y-3">
                {recentPosts.map((post, index) => (
                  <PostItem key={post.id} post={post} rank={index + 1} />
                ))}
              </div>
            ) : (
              <EmptyState message="No posts published yet" />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default SocialAnalytics;
