import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.SUPABASE_URL,
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_KEY
);

const UPLOAD_POST_API_URL = 'https://api.upload-post.com/api';
const UPLOAD_POST_API_KEY = import.meta.env.UPLOAD_POST_API_KEY;

/**
 * GET /api/admin/social/status/[id]
 * Check the publish status of a draft by polling Upload-Post API
 * [id] is the draft ID
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

    const { id: draftId } = context.params;

    if (!draftId) {
      return new Response(
        JSON.stringify({ error: 'Draft ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Fetch the draft
    const { data: draft, error: draftError } = await supabase
      .from('social_drafts')
      .select('*')
      .eq('id', draftId)
      .single();

    if (draftError || !draft) {
      return new Response(
        JSON.stringify({ error: 'Draft not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // If no request ID, return current status
    if (!draft.upload_post_request_id) {
      return new Response(
        JSON.stringify({ 
          status: draft.status,
          message: 'No publish request found',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // If already in final state, return it
    if (['published', 'failed'].includes(draft.status)) {
      // Fetch publish results
      const { data: results } = await supabase
        .from('social_publish_results')
        .select('*')
        .eq('draft_id', draftId);

      return new Response(
        JSON.stringify({ 
          status: draft.status,
          publishedAt: draft.published_at,
          results: results || [],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Poll Upload-Post for status
    if (!UPLOAD_POST_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Upload-Post API key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    try {
      const statusResponse = await fetch(
        `${UPLOAD_POST_API_URL}/uploadposts/status?request_id=${draft.upload_post_request_id}`,
        {
          headers: {
            'Authorization': `Apikey ${UPLOAD_POST_API_KEY}`,
          },
        }
      );

      if (!statusResponse.ok) {
        // If we can't get status, return current state
        return new Response(
          JSON.stringify({ 
            status: draft.status,
            message: 'Unable to fetch status from Upload-Post',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const statusData = await statusResponse.json();

      // Determine overall status from Upload-Post response
      let newStatus = draft.status;
      let publishedAt = draft.published_at;
      const platformResults: Record<string, any> = {};

      // Parse Upload-Post response (structure may vary)
      if (statusData.status === 'completed' || statusData.status === 'success') {
        newStatus = 'published';
        publishedAt = new Date().toISOString();
      } else if (statusData.status === 'failed' || statusData.status === 'error') {
        newStatus = 'failed';
      } else if (statusData.status === 'partial') {
        newStatus = 'partially_published';
        publishedAt = new Date().toISOString();
      }
      // 'pending', 'processing' keep status as 'publishing'

      // Update draft if status changed
      if (newStatus !== draft.status) {
        await supabase
          .from('social_drafts')
          .update({ 
            status: newStatus,
            published_at: publishedAt,
          })
          .eq('id', draftId);

        // Update publish results with platform-specific data
        if (statusData.results && Array.isArray(statusData.results)) {
          for (const result of statusData.results) {
            await supabase
              .from('social_publish_results')
              .update({
                success: result.success || result.status === 'success',
                platform_post_id: result.post_id || result.id,
                platform_post_url: result.url || result.post_url,
                error_message: result.error || result.message,
                upload_post_response: result,
              })
              .eq('draft_id', draftId)
              .eq('platform', result.platform);

            // Update connection last post info
            if (result.success || result.status === 'success') {
              await supabase
                .from('social_connections')
                .update({ 
                  last_successful_post_at: new Date().toISOString(),
                  last_error_message: null,
                })
                .eq('platform', result.platform)
                .eq('upload_post_user', result.user);
            } else if (result.error) {
              await supabase
                .from('social_connections')
                .update({ last_error_message: result.error })
                .eq('platform', result.platform)
                .eq('upload_post_user', result.user);
            }
          }
        }
      }

      // Fetch updated publish results
      const { data: results } = await supabase
        .from('social_publish_results')
        .select('*')
        .eq('draft_id', draftId);

      return new Response(
        JSON.stringify({ 
          status: newStatus,
          publishedAt,
          uploadPostStatus: statusData.status,
          results: results || [],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );

    } catch (apiError: any) {
      console.error('Upload-Post status check error:', apiError);
      // Return current status if API call fails
      return new Response(
        JSON.stringify({ 
          status: draft.status,
          message: 'Error checking status: ' + apiError.message,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

  } catch (error: any) {
    console.error('Error checking publish status:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to check status' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
