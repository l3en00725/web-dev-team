import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const resend = new Resend(import.meta.env.RESEND_API_KEY);
const supabase = createClient(
  import.meta.env.SUPABASE_URL,
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_KEY
);

// Allowed sender emails (must be verified in Resend)
const ALLOWED_SENDER_EMAILS = [
  'info@thebluekids.com',
  'ben@bluehomesgroup.com',
  'scott@bluehomesgroup.com',
  'bryan@bluehomesgroup.com',
  'yuliya@confidere.biz',
];

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

    const { emailType, recipients, customRecipients, customEmails, fromEmail, subject, content } = await context.request.json();
    
    // Handle multiple recipients (array)
    const recipientList = Array.isArray(recipients) ? recipients : [recipients].filter(Boolean);

    if (!subject || !content || !fromEmail) {
      return new Response(
        JSON.stringify({ error: 'Subject, content, and from email are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate sender email is in allowed list
    if (!ALLOWED_SENDER_EMAILS.includes(fromEmail)) {
      return new Response(
        JSON.stringify({ error: 'Invalid sender email. Must be a verified domain email.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get recipient list
    let emailList: string[] = [];
    const allRecipientEmails = new Set<string>();

    // Handle custom email addresses
    if (emailType === 'custom' && customEmails && customEmails.length > 0) {
      customEmails.forEach((email: string) => allRecipientEmails.add(email));
    }
    
    if (recipientList.includes('all-donors')) {
      const { data: donors } = await supabase
        .from('donors')
        .select('email')
        .not('email', 'is', null);
      donors?.forEach(d => { if (d.email) allRecipientEmails.add(d.email); });
    }
    
    if (recipientList.includes('recurring-donors')) {
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('user_id')
        .eq('status', 'active');
      
      if (subscriptions && subscriptions.length > 0) {
        const userIds = subscriptions.map(s => s.user_id);
        const { data: donors } = await supabase
          .from('donors')
          .select('email')
          .in('user_id', userIds)
          .not('email', 'is', null);
        donors?.forEach(d => { if (d.email) allRecipientEmails.add(d.email); });
      }
    }
    
    if (recipientList.includes('one-time-donors')) {
      // Get donors who have one-time donations but no active subscriptions
      const { data: oneTimeDonations } = await supabase
        .from('donations')
        .select('user_id')
        .eq('type', 'one-time')
        .eq('status', 'completed');
      
      if (oneTimeDonations && oneTimeDonations.length > 0) {
        const userIds = [...new Set(oneTimeDonations.map(d => d.user_id))];
        const { data: donors } = await supabase
          .from('donors')
          .select('email')
          .in('user_id', userIds)
          .not('email', 'is', null);
        donors?.forEach(d => { if (d.email) allRecipientEmails.add(d.email); });
      }
    }
    
    if (recipientList.includes('non-donors')) {
      // Get people who haven't made any donations
      // Get all people emails
      const { data: allPeople } = await supabase
        .from('people')
        .select('email, id')
        .not('email', 'is', null);
      
      // Get all people who have donor_details (have donated)
      const { data: donors } = await supabase
        .from('donor_details')
        .select('person_id');
      
      const donorPersonIds = donors ? new Set(donors.map(d => d.person_id)) : new Set();
      
      // Filter out people who have donated
      allPeople
        ?.filter(p => !donorPersonIds.has(p.id))
        .forEach(p => { if (p.email) allRecipientEmails.add(p.email); });
    }
    
    if (recipientList.includes('custom') && customRecipients) {
      customRecipients.forEach((email: string) => allRecipientEmails.add(email));
    }

    // Convert Set to array
    emailList = Array.from(allRecipientEmails);

    if (emailList.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No recipients found' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Format sender name
    const senderName = fromEmail.includes('thebluekids.com') 
      ? 'Blue Kids' 
      : fromEmail.split('@')[0].charAt(0).toUpperCase() + fromEmail.split('@')[0].slice(1);
    
    // Send emails via Resend
    const results = await Promise.allSettled(
      emailList.map(email =>
        resend.emails.send({
          from: `${senderName} <${fromEmail}>`,
          to: email,
          subject: subject,
          html: content.replace(/\n/g, '<br>'),
          replyTo: fromEmail, // Allow recipients to reply directly to the sender
        })
      )
    );

    const sentCount = results.filter(r => r.status === 'fulfilled').length;
    const failedCount = results.filter(r => r.status === 'rejected').length;

    return new Response(
      JSON.stringify({ 
        success: true,
        sentCount,
        failedCount,
        totalRecipients: emailList.length,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Email send error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to send email' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
