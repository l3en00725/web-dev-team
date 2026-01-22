import type { APIRoute } from 'astro';
import { runPageSpeedTest, parsePageSpeedResults } from '../../../utils/pagespeed';

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
    const testUrl = url.searchParams.get('url');
    const strategy = (url.searchParams.get('strategy') || 'mobile') as 'mobile' | 'desktop';

    if (!testUrl) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameter: url' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate URL format
    try {
      new URL(testUrl);
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid URL format' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Run PageSpeed test
    const response = await runPageSpeedTest(testUrl, strategy);
    const results = parsePageSpeedResults(response, strategy);

    return new Response(JSON.stringify({
      success: true,
      data: results,
      timestamp: new Date().toISOString(),
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('PageSpeed test error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to run PageSpeed test',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
