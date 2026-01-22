import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.SUPABASE_URL,
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_KEY
);

// Allowed MIME types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm', 'video/mpeg'];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

// Max file sizes
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB for images
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB for videos

/**
 * POST /api/admin/social/upload-media
 * Upload media files to Supabase Storage for social media posts
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

    // Parse multipart form data
    const formData = await context.request.formData();
    
    // Debug: Log all form data entries
    console.log('Form data entries:');
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: File(name=${value.name}, size=${value.size}, type=${value.type})`);
      } else {
        console.log(`  ${key}: ${value}`);
      }
    }
    
    // Support both 'file' (single) and 'files' (multiple) field names
    let files: File[] = [];
    const singleFile = formData.get('file') as File | null;
    const multipleFiles = formData.getAll('files') as File[];
    
    console.log('Single file:', singleFile ? `name=${singleFile.name}, size=${singleFile.size}` : 'null');
    console.log('Multiple files count:', multipleFiles.length);
    
    if (singleFile && singleFile.size > 0) {
      files = [singleFile];
    } else if (multipleFiles && multipleFiles.length > 0) {
      files = multipleFiles.filter(f => f && f.size > 0);
    }

    console.log('Files to process:', files.length);

    if (!files || files.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No files provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate and upload each file
    const uploadedFiles: UploadedFile[] = [];
    const errors: string[] = [];

    for (const file of files) {
      // Validate file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        errors.push(`${file.name}: Invalid file type. Allowed: images (JPEG, PNG, GIF, WebP) and videos (MP4, MOV, WebM, MPEG)`);
        continue;
      }

      // Determine if image or video
      const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
      const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;

      // Validate file size
      if (file.size > maxSize) {
        const maxSizeMB = maxSize / (1024 * 1024);
        errors.push(`${file.name}: File too large. Max size: ${maxSizeMB}MB`);
        continue;
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 8);
      const extension = file.name.split('.').pop() || (isVideo ? 'mp4' : 'jpg');
      const filename = `${userId}/${timestamp}-${randomId}.${extension}`;

      // Convert File to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('social-media')
        .upload(filename, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (error) {
        console.error('Storage upload error:', error);
        errors.push(`${file.name}: Upload failed - ${error.message}`);
        continue;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('social-media')
        .getPublicUrl(filename);

      uploadedFiles.push({
        name: file.name,
        path: data.path,
        url: urlData.publicUrl,
        type: isVideo ? 'video' : 'image',
        mimeType: file.type,
        size: file.size,
      });
    }

    // Return results
    if (uploadedFiles.length === 0 && errors.length > 0) {
      return new Response(
        JSON.stringify({ error: errors[0] || 'All uploads failed', details: errors }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // For single file upload, return url directly for easier consumption
    if (uploadedFiles.length === 1) {
      return new Response(
        JSON.stringify({
          success: true,
          url: uploadedFiles[0].url,
          file: uploadedFiles[0],
          errors: errors.length > 0 ? errors : undefined,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // For multiple files, return array
    return new Response(
      JSON.stringify({
        success: true,
        urls: uploadedFiles.map(f => f.url),
        files: uploadedFiles,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Media upload error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to upload media' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

/**
 * DELETE /api/admin/social/upload-media
 * Delete a media file from Supabase Storage
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
    const { path } = body;

    if (!path) {
      return new Response(
        JSON.stringify({ error: 'File path is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Security: Only allow deleting files in user's own folder
    if (!path.startsWith(`${userId}/`)) {
      return new Response(
        JSON.stringify({ error: 'You can only delete your own files' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { error } = await supabase.storage
      .from('social-media')
      .remove([path]);

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Media delete error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to delete media' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

interface UploadedFile {
  name: string;
  path: string;
  url: string;
  type: 'image' | 'video';
  mimeType: string;
  size: number;
}
