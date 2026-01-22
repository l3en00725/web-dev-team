import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.SUPABASE_URL,
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_KEY
);

const UPLOAD_POST_API_URL = 'https://api.upload-post.com/api';
const UPLOAD_POST_API_KEY = import.meta.env.UPLOAD_POST_API_KEY;

// Video file extensions
const VIDEO_EXTENSIONS = ['.mp4', '.mov', '.avi', '.webm', '.mpeg', '.m4v'];

/**
 * POST /api/admin/social/publish
 * Publish a draft to selected platforms via Upload-Post API
 * 
 * Based on Upload-Post API docs:
 * - POST /api/upload for video uploads
 * - POST /api/upload for photo uploads
 * - POST /api/upload for text posts
 */
export const POST: APIRoute = async (context) => {
  try {
    // Auth from Clerk middleware
    const { userId } = context.locals.auth();
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!UPLOAD_POST_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Upload-Post API key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await context.request.json();
    const { draftId } = body;

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

    // Verify ownership
    if (draft.author_id !== userId) {
      return new Response(
        JSON.stringify({ error: 'You can only publish your own drafts' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check draft status
    if (['publishing', 'published'].includes(draft.status)) {
      return new Response(
        JSON.stringify({ error: 'This draft is already published or publishing' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate we have platforms to publish to
    if (!draft.target_platforms || draft.target_platforms.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No target platforms selected' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Fetch target accounts
    const { data: accounts } = await supabase
      .from('social_connections')
      .select('*')
      .in('id', draft.target_accounts || [])
      .eq('active', true);

    if (!accounts || accounts.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No valid social accounts selected' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Update draft status to publishing
    await supabase
      .from('social_drafts')
      .update({ status: 'publishing' })
      .eq('id', draftId);

    // Determine content type
    const hasMedia = draft.media_urls && draft.media_urls.length > 0;
    const hasVideo = hasMedia && draft.media_urls.some((url: string) => 
      VIDEO_EXTENSIONS.some(ext => url.toLowerCase().includes(ext))
    );

    // Build Upload-Post request
    // Each account may have a different upload_post_user
    const uploadPostUsers = accounts
      .map(acc => acc.upload_post_user)
      .filter(Boolean);

    if (uploadPostUsers.length === 0) {
      await supabase
        .from('social_drafts')
        .update({ status: 'failed' })
        .eq('id', draftId);

      return new Response(
        JSON.stringify({ error: 'No Upload-Post users configured for selected accounts. Go to Social Connections to set up your accounts.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let uploadPostResponse;

    try {
      // Build base params - using first user for now
      // Upload-Post handles multi-platform via platform[] array
      const baseParams: Record<string, any> = {
        user: uploadPostUsers[0], // Primary user
        'platform[]': draft.target_platforms, // Array of platforms
        async_upload: true, // Always use async for better UX
      };

      // Add scheduling if set
      if (draft.scheduled_at) {
        baseParams.scheduled_date = new Date(draft.scheduled_at).toISOString();
      }

      // Validate we have content to publish
    const textContent = (draft.text_content || '').trim();
    if (!textContent && !hasMedia) {
      await supabase
        .from('social_drafts')
        .update({ status: 'failed' })
        .eq('id', draftId);

      return new Response(
        JSON.stringify({ error: 'Post must have either text content or media' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Title is required by Upload-Post API - use text content or generate a default
    const title = textContent || 'Shared via Blue Kids';

    if (hasVideo) {
        // Video upload - POST /api/upload (for videos)
        // According to docs: video (URL or file), title (required), description (optional)
        uploadPostResponse = await callUploadPostAPI('/upload', {
          ...baseParams,
          video: draft.media_urls[0], // Video URL
          title: title.slice(0, 280), // Title/caption (limited to 280 chars)
          description: textContent, // Extended description for LinkedIn/YouTube
        });
      } else if (hasMedia) {
        // Photo upload - POST /api/upload_photos (different endpoint for photos!)
        // According to docs: photos[] (URLs or files), title (caption)
        uploadPostResponse = await callUploadPostAPI('/upload_photos', {
          ...baseParams,
          title: title, // Caption - required by Upload-Post
          description: textContent, // Description
          'photos[]': draft.media_urls, // Array of photo URLs
        });
      } else {
        // Text-only post - use upload_photos with no photos (just text)
        // Or we can use the post endpoint for text-only
        uploadPostResponse = await callUploadPostAPI('/upload_photos', {
          ...baseParams,
          title: title, // Required by Upload-Post
          description: textContent,
          // Add link if present
          ...(draft.link_url ? { link: draft.link_url } : {}),
        });
      }

      // Store request ID for status polling
      const requestId = uploadPostResponse.request_id || uploadPostResponse.job_id || uploadPostResponse.id;

      // Update draft with request ID and status
      // For immediate posts, mark as published since Upload-Post confirmed receipt
      // For scheduled posts, keep as scheduled
      const newStatus = draft.scheduled_at ? 'scheduled' : 'published';
      await supabase
        .from('social_drafts')
        .update({ 
          upload_post_request_id: requestId,
          status: newStatus,
          published_at: draft.scheduled_at ? null : new Date().toISOString(),
        })
        .eq('id', draftId);

      // Create publish result entries for each platform
      const publishResults = accounts.map(account => ({
        draft_id: draftId,
        platform: account.platform,
        account_id: account.id,
        success: true, // Will be updated when we poll for status
        upload_post_response: uploadPostResponse,
      }));

      await supabase
        .from('social_publish_results')
        .insert(publishResults);

      // Update account last successful post timestamp
      await supabase
        .from('social_connections')
        .update({ 
          last_successful_post_at: new Date().toISOString(),
          last_error_message: null,
        })
        .in('id', accounts.map(a => a.id));

      return new Response(
        JSON.stringify({ 
          success: true, 
          requestId,
          jobId: uploadPostResponse.job_id,
          message: draft.scheduled_at 
            ? 'Post scheduled successfully' 
            : 'Post is being published',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );

    } catch (uploadError: any) {
      console.error('Upload-Post error:', uploadError);

      // Update draft status to failed
      await supabase
        .from('social_drafts')
        .update({ status: 'failed' })
        .eq('id', draftId);

      // Update accounts with error
      await supabase
        .from('social_connections')
        .update({ last_error_message: uploadError.message })
        .in('id', accounts.map(a => a.id));

      // Create failed publish results
      const failedResults = accounts.map(account => ({
        draft_id: draftId,
        platform: account.platform,
        account_id: account.id,
        success: false,
        error_message: uploadError.message,
      }));

      await supabase
        .from('social_publish_results')
        .insert(failedResults);

      throw uploadError;
    }

  } catch (error: any) {
    console.error('Error publishing:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to publish' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

/**
 * Call Upload-Post API using form data format
 * Based on docs: https://docs.upload-post.com/api/upload-video
 */
/**
 * Call Upload-Post API
 * @param endpoint - The API endpoint (e.g., '/upload', '/upload_photos')
 * @param params - The parameters to send
 */
async function callUploadPostAPI(endpoint: string, params: Record<string, any>) {
  const formData = new FormData();

  console.log(`Upload-Post [${endpoint}] params:`, JSON.stringify(params, null, 2));

  // Handle special array parameters
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;

    if (key === 'platform[]' && Array.isArray(value)) {
      // Append each platform separately with the same key
      value.forEach(platform => {
        formData.append('platform[]', platform);
      });
    } else if (key === 'photos[]' && Array.isArray(value)) {
      // Append each photo URL separately with the same key
      value.forEach(photoUrl => {
        formData.append('photos[]', photoUrl);
      });
    } else if (Array.isArray(value)) {
      // Handle other arrays
      value.forEach(item => {
        formData.append(key, item);
      });
    } else {
      formData.append(key, String(value));
    }
  }

  // Log what we're actually sending
  const formDataEntries: Record<string, any> = {};
  formData.forEach((value, key) => {
    if (formDataEntries[key]) {
      if (Array.isArray(formDataEntries[key])) {
        formDataEntries[key].push(value);
      } else {
        formDataEntries[key] = [formDataEntries[key], value];
      }
    } else {
      formDataEntries[key] = value;
    }
  });
  console.log('FormData entries:', JSON.stringify(formDataEntries, null, 2));

  const url = `${UPLOAD_POST_API_URL}${endpoint}`;
  console.log(`Calling Upload-Post API: ${url}`);
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Apikey ${UPLOAD_POST_API_KEY}`,
    },
    body: formData,
  });

  const result = await response.json();
  console.log('Upload-Post response:', response.status, JSON.stringify(result, null, 2));

  if (!response.ok) {
    const errorMsg = result.message || result.error || `Upload-Post API error: ${response.status}`;
    throw new Error(errorMsg);
  }

  return result;
}
