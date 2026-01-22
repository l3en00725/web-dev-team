import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.SUPABASE_URL,
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_KEY
);

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

    const { integrationToken } = await context.request.json();

    if (!integrationToken) {
      return new Response(
        JSON.stringify({ error: 'Integration token is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify token with Medium API
    try {
      const verifyResponse = await fetch('https://api.medium.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${integrationToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!verifyResponse.ok) {
        return new Response(
          JSON.stringify({ error: 'Invalid Medium integration token' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const userData = await verifyResponse.json();
      const mediumUserId = userData.data?.id;
      const mediumUsername = userData.data?.username;

      // Check if connection already exists
      const { data: existing } = await supabase
        .from('social_connections')
        .select('id')
        .eq('user_id', authCheck.userId)
        .eq('platform', 'medium')
        .maybeSingle();

      if (existing) {
        // Update existing connection
        const { error } = await supabase
          .from('social_connections')
          .update({
            access_token: integrationToken,
            platform_user_id: mediumUserId,
            platform_username: mediumUsername,
            active: true,
            connected_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Create new connection
        const { error } = await supabase
          .from('social_connections')
          .insert({
            user_id: authCheck.userId,
            platform: 'medium',
            access_token: integrationToken,
            platform_user_id: mediumUserId,
            platform_username: mediumUsername,
            active: true,
          });

        if (error) throw error;
      }

      return new Response(
        JSON.stringify({ success: true, username: mediumUsername }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (apiError: any) {
      console.error('Medium API error:', apiError);
      return new Response(
        JSON.stringify({ error: 'Failed to verify Medium token: ' + apiError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error: any) {
    console.error('Error connecting Medium:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to connect Medium' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
