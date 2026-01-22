import type { APIRoute } from 'astro';
import Anthropic from '@anthropic-ai/sdk';

/**
 * Clean up generated content by removing intros, outros, and explanatory text
 */
function cleanGeneratedContent(content: string): string {
  if (!content) return content;

  let cleaned = content.trim();

  // Remove common intro patterns
  const introPatterns = [
    /^Here's\s+(a\s+)?(social\s+media\s+)?post\s+(about|for):\s*/i,
    /^Here's\s+(a\s+)?(social\s+media\s+)?content:\s*/i,
    /^Here\s+is\s+(a\s+)?(social\s+media\s+)?post:\s*/i,
    /^Post\s+content:\s*/i,
    /^Social\s+media\s+post:\s*/i,
    /^Content:\s*/i,
  ];

  for (const pattern of introPatterns) {
    cleaned = cleaned.replace(pattern, '');
  }

  // Remove content wrapped in quotes (first and last if they match)
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || 
      (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1).trim();
  }

  // Remove separators like "---" at the start
  cleaned = cleaned.replace(/^---+\s*/m, '');

  // Remove outro patterns (anything after common outro phrases)
  const outroPatterns = [
    /\n\s*---\s*\n.*$/s, // Everything after a separator line
    /\n\s*\*?This\s+version\s+works.*$/is,
    /\n\s*\*?Would\s+you\s+like\s+me\s+to.*$/is,
    /\n\s*\*?Let\s+me\s+know\s+if.*$/is,
    /\n\s*\*?Would\s+you\s+prefer.*$/is,
    /\n\s*\*?Do\s+you\s+want.*$/is,
    /\n\s*\*?I\s+can\s+(also\s+)?adapt.*$/is,
    /\n\s*\*?Feel\s+free\s+to.*$/is,
  ];

  for (const pattern of outroPatterns) {
    cleaned = cleaned.replace(pattern, '');
  }

  // Clean up extra whitespace
  cleaned = cleaned.trim();

  return cleaned;
}

/**
 * POST /api/admin/social/generate-content
 * Generate social media post content using Claude AI
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

    const anthropicKey = import.meta.env.ANTHROPIC_API_KEY;
    if (!anthropicKey) {
      return new Response(
        JSON.stringify({ error: 'Anthropic API key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await context.request.json();
    const { prompt, platforms, tone, includeEmojis, includeHashtags } = body;

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const anthropic = new Anthropic({
      apiKey: anthropicKey,
    });

    // Build the system prompt based on options
    const platformsList = platforms?.length > 0 ? platforms.join(', ') : 'general social media';
    const toneInstruction = tone ? `Use a ${tone} tone.` : 'Use an inspiring, warm tone.';
    const emojiInstruction = includeEmojis !== false ? 'Include relevant emojis to add visual appeal.' : 'Do not use emojis.';
    const hashtagInstruction = includeHashtags !== false ? 'Include 2-4 relevant hashtags at the end.' : 'Do not include hashtags.';

    const systemPrompt = `You are a social media content writer for The Blue Kids, a nonprofit youth sports organization based in New Jersey. 
The Blue Kids provides free sports clinics (basketball, baseball, soccer, etc.) to underserved children, teaching them athletic skills, teamwork, and life lessons.

CRITICAL INSTRUCTIONS:
- Output ONLY the exact social media post content that should be published
- Do NOT include any introductions like "Here's a post..." or "Here's a social media post..."
- Do NOT include any outros like "Would you like me to..." or "Let me know if..."
- Do NOT include any explanations, options, or commentary
- Do NOT wrap the content in quotes
- Just output the raw post text that will be copied directly to social media

Your posts should:
- Highlight the positive impact on kids and community
- Inspire donations and volunteer support
- Share success stories and upcoming events
- Connect emotionally with the audience

${toneInstruction}
${emojiInstruction}
${hashtagInstruction}

Keep posts concise and optimized for ${platformsList}.
For Twitter/X, keep under 280 characters.
For LinkedIn, be slightly more professional.
For Instagram/Facebook, be warm and community-focused.`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Write a social media post about: ${prompt}

Remember: Output ONLY the post content itself, nothing else. No introduction, no explanation, no questions.`,
        },
      ],
    });

    // Extract the text content
    const textContent = message.content.find(block => block.type === 'text');
    let generatedContent = textContent ? textContent.text : '';

    // Clean up any intro/outro text that might have slipped through
    generatedContent = cleanGeneratedContent(generatedContent);

    return new Response(
      JSON.stringify({ 
        success: true, 
        content: generatedContent,
        usage: {
          inputTokens: message.usage.input_tokens,
          outputTokens: message.usage.output_tokens,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error generating content:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to generate content' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
