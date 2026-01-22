/**
 * API endpoint to verify keywords with Keywords Everywhere API
 * Used to validate SEO keywords in titles and meta descriptions
 */

import type { APIRoute } from 'astro';
import { getKeywordData, analyzeKeywords } from '../../../utils/keywords-api';

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

    const { keywords } = await context.request.json();

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Keywords array is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Fetch keyword data from Keywords Everywhere API
    const keywordData = await getKeywordData(keywords, {
      country: 'us',
      currency: 'USD'
    });

    // Analyze keywords for recommendations
    const analysis = analyzeKeywords(keywordData.data);

    return new Response(
      JSON.stringify({
        success: true,
        keywords: keywordData.data,
        analysis,
        credits: keywordData.credits,
        time: keywordData.time
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error: any) {
    console.error('Keyword verification error:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to verify keywords',
        details: error.toString()
      }),
      {
        status: error.status || 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
