import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.SUPABASE_URL,
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_KEY
);

/**
 * GET /api/admin/social/drafts
 * List drafts for the current user
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
    const status = url.searchParams.get('status'); // Optional filter

    let query = supabase
      .from('social_drafts')
      .select('*')
      .eq('author_id', userId)
      .order('updated_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: drafts, error } = await query;

    if (error) throw error;

    return new Response(
      JSON.stringify({ drafts: drafts || [] }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error fetching drafts:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to fetch drafts' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

/**
 * POST /api/admin/social/drafts
 * Create a new draft
 */
export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const authCheck = await requireAdmin(cookies, request.url, request);
    if (authCheck.redirect) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { userId } = authCheck;
    const body = await request.json();
    const { 
      textContent, 
      mediaUrls, 
      linkUrl, 
      targetPlatforms, 
      targetAccounts,
      scheduledAt 
    } = body;

    // Validate content
    if (!textContent && (!mediaUrls || mediaUrls.length === 0)) {
      return new Response(
        JSON.stringify({ error: 'Post must have text content or media' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Determine status
    let status = 'draft';
    if (scheduledAt) {
      const scheduleDate = new Date(scheduledAt);
      if (scheduleDate > new Date()) {
        status = 'scheduled';
      }
    }

    const { data: draft, error } = await supabase
      .from('social_drafts')
      .insert({
        author_id: userId,
        text_content: textContent || null,
        media_urls: mediaUrls || [],
        link_url: linkUrl || null,
        target_platforms: targetPlatforms || [],
        target_accounts: targetAccounts || [],
        scheduled_at: scheduledAt || null,
        status,
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, draft }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error creating draft:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to create draft' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

/**
 * PUT /api/admin/social/drafts
 * Update an existing draft
 * Expects { id, ...fields } in body
 */
export const PUT: APIRoute = async ({ request, cookies }) => {
  try {
    const authCheck = await requireAdmin(cookies, request.url, request);
    if (authCheck.redirect) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { userId } = authCheck;
    const body = await request.json();
    const { id, textContent, mediaUrls, linkUrl, targetPlatforms, targetAccounts, scheduledAt } = body;

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Draft ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify ownership
    const { data: existing } = await supabase
      .from('social_drafts')
      .select('id, author_id, status')
      .eq('id', id)
      .single();

    if (!existing) {
      return new Response(
        JSON.stringify({ error: 'Draft not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (existing.author_id !== userId) {
      return new Response(
        JSON.stringify({ error: 'You can only edit your own drafts' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Don't allow editing published or publishing drafts
    if (['published', 'publishing'].includes(existing.status)) {
      return new Response(
        JSON.stringify({ error: 'Cannot edit a published or publishing post' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Build update object
    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (textContent !== undefined) updates.text_content = textContent || null;
    if (mediaUrls !== undefined) updates.media_urls = mediaUrls || [];
    if (linkUrl !== undefined) updates.link_url = linkUrl || null;
    if (targetPlatforms !== undefined) updates.target_platforms = targetPlatforms || [];
    if (targetAccounts !== undefined) updates.target_accounts = targetAccounts || [];
    if (scheduledAt !== undefined) {
      updates.scheduled_at = scheduledAt || null;
      // Update status if scheduling
      if (scheduledAt && new Date(scheduledAt) > new Date()) {
        updates.status = 'scheduled';
      } else if (!scheduledAt && existing.status === 'scheduled') {
        updates.status = 'draft';
      }
    }

    const { data: draft, error } = await supabase
      .from('social_drafts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, draft }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error updating draft:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to update draft' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

/**
 * DELETE /api/admin/social/drafts
 * Delete a draft
 * Expects { id } in body
 */
export const DELETE: APIRoute = async ({ request, cookies }) => {
  try {
    const authCheck = await requireAdmin(cookies, request.url, request);
    if (authCheck.redirect) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { userId } = authCheck;
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Draft ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify ownership
    const { data: existing } = await supabase
      .from('social_drafts')
      .select('id, author_id, status')
      .eq('id', id)
      .single();

    if (!existing) {
      return new Response(
        JSON.stringify({ error: 'Draft not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (existing.author_id !== userId) {
      return new Response(
        JSON.stringify({ error: 'You can only delete your own drafts' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Don't allow deleting publishing drafts
    if (existing.status === 'publishing') {
      return new Response(
        JSON.stringify({ error: 'Cannot delete a post that is currently publishing' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { error } = await supabase
      .from('social_drafts')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error deleting draft:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to delete draft' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
