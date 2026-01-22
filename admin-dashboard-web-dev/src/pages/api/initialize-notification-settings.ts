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

    // Default email addresses (from original form-email.ts)
    const defaultEmails = [
      'ben@bluehomesgroup.com',
      'scott@bluehomesgroup.com',
      'bryan@bluehomesgroup.com',
      'yuliya@confidere.biz'
    ];

    // Check if table exists and if settings already exist
    const { data: existing, error: checkError } = await supabase
      .from('notification_settings')
      .select('id')
      .limit(1);

    // If table doesn't exist, checkError will have code '42P01' or similar
    if (checkError) {
      if (checkError.code === '42P01' || checkError.message?.includes('does not exist') || checkError.message?.includes('relation')) {
        return new Response(
          JSON.stringify({ 
            error: 'TABLE_NOT_FOUND',
            message: 'Notification settings table does not exist. Please run the database migration (007_notification_settings.sql) first in your Supabase SQL Editor.'
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      // Other error checking table
      return new Response(
        JSON.stringify({ error: 'Failed to check existing settings: ' + checkError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (existing && existing.length > 0) {
      return new Response(
        JSON.stringify({ error: 'Notification settings already exist' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Insert default notification settings
    const { error } = await supabase
      .from('notification_settings')
      .insert([
        {
          notification_type: 'contact_forms',
          enabled: true,
          email_addresses: defaultEmails
        },
        {
          notification_type: 'event_registrations',
          enabled: true,
          email_addresses: defaultEmails
        },
        {
          notification_type: 'volunteer_applications',
          enabled: true,
          email_addresses: defaultEmails
        }
      ]);

    if (error) {
      // If table doesn't exist, provide helpful error
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        return new Response(
          JSON.stringify({ 
            error: 'Notification settings table does not exist. Please run the database migration (007_notification_settings.sql) first.' 
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to initialize notification settings: ' + error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Notification settings initialized successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Initialize notification settings error:', error);
    return new Response(
      JSON.stringify({ error: 'Server error. Please try again later.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
