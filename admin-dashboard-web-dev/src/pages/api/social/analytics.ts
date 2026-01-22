import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.SUPABASE_URL,
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_KEY
);

/**
 * GET /api/admin/social/analytics
 * 
 * Returns analytics data for social posts including:
 * - Posts with their publish results
 * - Aggregated metrics by platform
 * - Time-series data for charts
 * 
 * Query params:
 * - days: number of days to look back (default: 30)
 */
export const GET: APIRoute = async (context) => {
  try {
    // Auth from Clerk middleware
    const { userId } = context.locals.auth();
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(context.request.url);
    const days = parseInt(url.searchParams.get('days') || '30', 10);
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Also get previous period for trend calculation
    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - days);

    // Fetch published posts with their results
    const { data: posts, error: postsError } = await supabase
      .from('social_drafts')
      .select(`
        id,
        text_content,
        media_urls,
        link_url,
        target_platforms,
        status,
        scheduled_at,
        published_at,
        created_at,
        author_id,
        social_publish_results (
          id,
          platform,
          success,
          platform_post_id,
          platform_post_url,
          created_at
        )
      `)
      .in('status', ['published', 'partially_published'])
      .gte('published_at', startDate.toISOString())
      .lte('published_at', endDate.toISOString())
      .order('published_at', { ascending: false });

    if (postsError) {
      console.error('Error fetching posts:', postsError);
      throw postsError;
    }

    // Fetch previous period posts for trend comparison
    const { data: prevPosts, error: prevError } = await supabase
      .from('social_drafts')
      .select('id, target_platforms, published_at')
      .in('status', ['published', 'partially_published'])
      .gte('published_at', prevStartDate.toISOString())
      .lt('published_at', startDate.toISOString());

    if (prevError) {
      console.error('Error fetching previous posts:', prevError);
    }

    // Get connected accounts for reference
    const { data: accounts } = await supabase
      .from('social_connections')
      .select('id, platform, platform_username, ownership')
      .eq('active', true);

    // Transform posts into analytics format
    const analyticsData = (posts || []).map((post: any) => {
      // Get successful publish results
      const results = post.social_publish_results || [];
      const successfulResults = results.filter((r: any) => r.success);
      
      // Determine platforms from results or target_platforms
      const platforms = successfulResults.length > 0
        ? successfulResults.map((r: any) => r.platform)
        : (post.target_platforms || []);

      // For now, we don't have actual engagement metrics from platforms
      // In production, you'd fetch these from Upload-Post or platform APIs
      // Using placeholder engagement based on platform for demo
      const baseEngagement = getBaseEngagement(platforms[0] || 'linkedin');

      return {
        id: post.id,
        platform: platforms[0] || 'linkedin', // Primary platform
        platforms: platforms,
        content: post.text_content || '',
        date: post.published_at || post.created_at,
        // Placeholder metrics - replace with real data when available
        views: baseEngagement.views,
        likes: baseEngagement.likes,
        comments: baseEngagement.comments,
        shares: baseEngagement.shares,
        // Real data
        hasMedia: (post.media_urls || []).length > 0,
        mediaUrls: post.media_urls || [],
        linkUrl: post.link_url,
        publishResults: successfulResults,
      };
    });

    // Calculate current period metrics
    const currentMetrics = calculateMetrics(analyticsData);
    
    // Calculate previous period metrics for trends
    const prevMetrics = calculateMetrics(
      (prevPosts || []).map((p: any) => ({
        platforms: p.target_platforms || [],
        views: getBaseEngagement(p.target_platforms?.[0] || 'linkedin').views,
        likes: getBaseEngagement(p.target_platforms?.[0] || 'linkedin').likes,
        comments: getBaseEngagement(p.target_platforms?.[0] || 'linkedin').comments,
        shares: getBaseEngagement(p.target_platforms?.[0] || 'linkedin').shares,
      }))
    );

    // Calculate trends (percentage change)
    const trends = {
      reach: calculateTrend(currentMetrics.totalReach, prevMetrics.totalReach),
      engagement: calculateTrend(currentMetrics.totalEngagement, prevMetrics.totalEngagement),
      engagementRate: calculateTrend(currentMetrics.engagementRate, prevMetrics.engagementRate),
      posts: calculateTrend(currentMetrics.totalPosts, prevMetrics.totalPosts),
    };

    // Aggregate by platform
    const platformBreakdown = aggregateByPlatform(analyticsData);

    // Get daily metrics for chart
    const dailyMetrics = aggregateByDay(analyticsData, days);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          posts: analyticsData,
          metrics: currentMetrics,
          trends,
          platformBreakdown,
          dailyMetrics,
          accounts: accounts || [],
          dateRange: {
            start: startDate.toISOString(),
            end: endDate.toISOString(),
            days,
          },
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Analytics error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to fetch analytics' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

/**
 * Get engagement metrics for a post
 * 
 * NOTE: Real engagement metrics (views, likes, etc.) require integration with
 * each platform's native analytics API. Upload-Post doesn't provide these.
 * 
 * For now, we return zeros to be honest about what we know.
 * In the future, you could:
 * 1. Integrate Twitter/X Analytics API
 * 2. Integrate LinkedIn Analytics API
 * 3. Use a third-party analytics aggregator
 */
function getBaseEngagement(_platform: string): { views: number; likes: number; comments: number; shares: number } {
  // Return zeros - we don't have real engagement data yet
  // The UI will show "Engagement data unavailable" when metrics are all zero
  return {
    views: 0,
    likes: 0,
    comments: 0,
    shares: 0,
  };
}

/**
 * Calculate aggregate metrics from posts
 */
function calculateMetrics(posts: any[]): {
  totalReach: number;
  totalEngagement: number;
  engagementRate: number;
  totalPosts: number;
} {
  const totalReach = posts.reduce((sum, p) => sum + (p.views || 0), 0);
  const totalEngagement = posts.reduce(
    (sum, p) => sum + (p.likes || 0) + (p.comments || 0) + (p.shares || 0),
    0
  );
  const engagementRate = totalReach > 0 ? (totalEngagement / totalReach) * 100 : 0;

  return {
    totalReach,
    totalEngagement,
    engagementRate,
    totalPosts: posts.length,
  };
}

/**
 * Calculate percentage trend between two values
 */
function calculateTrend(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Aggregate posts by platform
 */
function aggregateByPlatform(posts: any[]): any[] {
  const platformMap = new Map<string, { engagement: number; posts: number }>();

  posts.forEach((post) => {
    const platforms = post.platforms || [post.platform];
    platforms.forEach((platform: string) => {
      const existing = platformMap.get(platform) || { engagement: 0, posts: 0 };
      existing.engagement += (post.likes || 0) + (post.comments || 0) + (post.shares || 0);
      existing.posts += 1;
      platformMap.set(platform, existing);
    });
  });

  return Array.from(platformMap.entries()).map(([platform, data]) => ({
    platform,
    name: platform.charAt(0).toUpperCase() + platform.slice(1),
    engagement: data.engagement,
    posts: data.posts,
    avgEngagement: data.posts > 0 ? Math.round(data.engagement / data.posts) : 0,
  }));
}

/**
 * Aggregate posts by day for time-series chart
 */
function aggregateByDay(posts: any[], days: number): any[] {
  const dailyMap = new Map<string, { postCount: number }>();

  // Initialize all days
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    dailyMap.set(dateStr, { postCount: 0 });
  }

  // Count posts per day
  posts.forEach((post) => {
    const dateStr = new Date(post.date).toISOString().split('T')[0];
    const existing = dailyMap.get(dateStr);
    if (existing) {
      existing.postCount += 1;
    }
  });

  // Convert to sorted array
  return Array.from(dailyMap.entries())
    .map(([date, data]) => ({
      date,
      dateLabel: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      postCount: data.postCount,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
