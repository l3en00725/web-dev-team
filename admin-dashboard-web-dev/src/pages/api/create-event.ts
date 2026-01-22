import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.SUPABASE_URL,
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_KEY
);

export const POST: APIRoute = async ({ request }) => {
  try {
    // TODO: Add Clerk authentication check

    const data = await request.json();

    // Validate required fields
    if (!data.sport || !data.eventDate || !data.location || !data.status) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Insert event into database
    const { data: event, error } = await supabase
      .from('programs')
      .insert({
        sport: data.sport,
        event_date: data.eventDate,
        location: data.location,
        coach_name: data.coachName || null,
        description: data.description || null,
        max_participants: data.maxParticipants || null,
        status: data.status,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to create event' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, event }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error creating event:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to create event' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
