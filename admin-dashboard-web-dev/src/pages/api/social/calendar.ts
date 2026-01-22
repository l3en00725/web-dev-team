import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.SUPABASE_URL,
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_KEY
);

/**
 * GET /api/admin/social/calendar
 * Fetch posts for the calendar view - all admins can see all posts
 * Supports date range filtering via query params: startDate, endDate
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
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const status = url.searchParams.get('status'); // Optional: filter by status

    // Build query - fetch ALL posts for the org (not filtered by author)
    let query = supabase
      .from('social_drafts')
      .select(`
        id,
        author_id,
        text_content,
        media_urls,
        link_url,
        target_platforms,
        target_accounts,
        scheduled_at,
        status,
        created_at,
        updated_at
      `)
      .order('scheduled_at', { ascending: true, nullsFirst: false });

    // Filter by date range if provided
    if (startDate && endDate) {
      // Get posts that are scheduled within the range OR created within the range (for unscheduled posts)
      query = query.or(`scheduled_at.gte.${startDate},and(scheduled_at.lte.${endDate}),and(scheduled_at.is.null,created_at.gte.${startDate},created_at.lte.${endDate})`);
    } else if (startDate) {
      query = query.or(`scheduled_at.gte.${startDate},and(scheduled_at.is.null,created_at.gte.${startDate})`);
    } else if (endDate) {
      query = query.or(`scheduled_at.lte.${endDate},and(scheduled_at.is.null,created_at.lte.${endDate})`);
    }

    // Filter by status if provided
    if (status) {
      const statuses = status.split(',');
      query = query.in('status', statuses);
    }

    const { data: posts, error } = await query;

    if (error) {
      console.error('Error fetching calendar posts:', error);
      throw error;
    }

    // Transform to calendar-friendly format
    const calendarPosts = (posts || []).map(post => ({
      id: post.id,
      date: post.scheduled_at || post.created_at,
      platform: post.target_platforms?.[0] || 'unknown', // Primary platform
      platforms: post.target_platforms || [],
      content: post.text_content || '',
      media: post.media_urls || [],
      linkUrl: post.link_url,
      status: post.status,
      authorId: post.author_id,
      createdAt: post.created_at,
      updatedAt: post.updated_at,
    }));

    return new Response(
      JSON.stringify({ 
        success: true, 
        posts: calendarPosts,
        count: calendarPosts.length 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Calendar API error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to fetch calendar data' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
