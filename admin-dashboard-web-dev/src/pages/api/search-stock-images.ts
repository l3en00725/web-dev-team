import type { APIRoute } from 'astro';

const PEXELS_API_KEY = import.meta.env.PEXELS_API_KEY;

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

    const url = new URL(context.request.url);
    const query = url.searchParams.get('q');
    const page = parseInt(url.searchParams.get('page') || '1');
    const perPage = parseInt(url.searchParams.get('per_page') || '12');

    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Search query is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!PEXELS_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'PEXELS_API_KEY not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const params = new URLSearchParams({
      query,
      page: String(page),
      per_page: String(perPage),
      orientation: 'landscape', // Good for social sharing (1200x630)
    });

    const response = await fetch(
      `https://api.pexels.com/v1/search?${params}`,
      {
        headers: {
          'Authorization': PEXELS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Pexels API error:', response.status, errorText);
      throw new Error(`Pexels API error: ${response.status}`);
    }

    const data = await response.json();

    return new Response(
      JSON.stringify({
        success: true,
        photos: data.photos.map((photo: any) => ({
          id: photo.id,
          url: photo.src.large, // Use large size for preview
          originalUrl: photo.src.original,
          landscapeUrl: photo.src.landscape, // Perfect for OG images (1200x630)
          photographer: photo.photographer,
          photographerUrl: photo.photographer_url,
          alt: photo.alt || query,
        })),
        totalResults: data.total_results,
        page: data.page,
        perPage: data.per_page,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Stock image search error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to search stock images' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
