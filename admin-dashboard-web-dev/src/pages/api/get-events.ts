import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.SUPABASE_URL,
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_KEY
);

export const GET: APIRoute = async () => {
  try {
    // TODO: Add Clerk authentication check

    const { data: events, error } = await supabase
      .from('programs')
      .select('id, sport, event_date, location, coach_name, description, status')
      .eq('status', 'upcoming')
      .order('event_date', { ascending: true });

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({ success: true, events: events || [] }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error fetching events:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to fetch events' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
