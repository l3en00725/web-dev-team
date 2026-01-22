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

    const { name, email, phone, personType, organization } = await context.request.json();

    if (!name || !email || !personType) {
      return new Response(
        JSON.stringify({ error: 'Name, email, and person type are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if person already exists
    const { data: existingPerson } = await supabase
      .from('people')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (existingPerson) {
      return new Response(
        JSON.stringify({ error: 'Person with this email already exists' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Map person type to tags
    const tags = [personType];
    if (personType === 'lead') {
      tags.push('potential-donor');
    }

    // Create person record
    const { data: newPerson, error } = await supabase
      .from('people')
      .insert({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone?.trim() || null,
        organization: organization?.trim() || null,
        tags: tags,
        source: 'manual',
        source_detail: 'Added via admin dashboard',
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: error.message || 'Failed to add person' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create activity log entry
    await supabase.from('activities').insert({
      person_id: newPerson.id,
      type: 'note_added',
      description: `Person added manually via admin dashboard. Type: ${personType}`,
      metadata: { added_by: authCheck.userId, person_type: personType },
    });

    return new Response(
      JSON.stringify({ success: true, person: newPerson }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error adding person:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to add person' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
