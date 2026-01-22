import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

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

    const formData = await context.request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate file type
    const validTypes = ['application/pdf', 'text/html'];
    const validExtensions = ['.pdf', '.html'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      return new Response(
        JSON.stringify({ error: 'Invalid file type. Please upload a PDF or HTML file.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return new Response(
        JSON.stringify({ error: 'File size exceeds 10MB limit' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      import.meta.env.SUPABASE_URL,
      import.meta.env.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_KEY
    );

    // Get current year from settings (or use current year)
    const { data: yearSetting } = await supabase
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', 'annual_report_year')
      .single();

    const year = yearSetting?.setting_value || new Date().getFullYear().toString();
    
    // Generate file path
    const fileName = `${year}-annual-report${fileExtension}`;
    const filePath = `documents/annual-reports/${fileName}`;

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('public')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: true // Overwrite if exists
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return new Response(
        JSON.stringify({ error: 'Failed to upload file to storage' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('public')
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;

    // Update site_settings with file path and URL
    const { error: settingsError } = await supabase
      .from('site_settings')
      .upsert({
        setting_key: 'annual_report_file_path',
        setting_value: filePath,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'setting_key'
      });

    // Also update the URL setting
    await supabase
      .from('site_settings')
      .upsert({
        setting_key: 'annual_report_url',
        setting_value: publicUrl,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'setting_key'
      });

    if (settingsError) {
      console.error('Settings update error:', settingsError);
      // Don't fail - file was uploaded successfully
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'File uploaded successfully',
        filePath,
        url: publicUrl
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Upload annual report error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to upload file' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
