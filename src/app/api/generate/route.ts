import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

// 인메모리 레이트 리밋 (IP당 분당 5회, 시간당 30회)
const rateLimitMap = new Map<string, { timestamps: number[] }>();
let lastCleanup = Date.now();

const RATE_LIMIT = { perMinute: 5, perHour: 30 };
const ONE_MINUTE = 60_000;
const ONE_HOUR = 3_600_000;
const CLEANUP_INTERVAL = 5 * 60_000; // 5분마다 전체 정리
const MAX_ENTRIES = 500;

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();

  // 주기적 전체 정리 (5분마다 또는 엔트리 초과 시)
  if (now - lastCleanup > CLEANUP_INTERVAL || rateLimitMap.size > MAX_ENTRIES) {
    const cutoff = now - ONE_HOUR;
    for (const [key, r] of rateLimitMap) {
      r.timestamps = r.timestamps.filter(t => t > cutoff);
      if (r.timestamps.length === 0) rateLimitMap.delete(key);
    }
    lastCleanup = now;
  }

  let record = rateLimitMap.get(ip);
  if (!record) {
    record = { timestamps: [] };
    rateLimitMap.set(ip, record);
  }

  // 1시간 이내 기록만 유지
  record.timestamps = record.timestamps.filter(t => t > now - ONE_HOUR);

  // 분당 체크
  const recentMinute = record.timestamps.filter(t => t > now - ONE_MINUTE);
  if (recentMinute.length >= RATE_LIMIT.perMinute) {
    return { allowed: false, retryAfter: Math.ceil((recentMinute[0] + ONE_MINUTE - now) / 1000) };
  }

  // 시간당 체크
  if (record.timestamps.length >= RATE_LIMIT.perHour) {
    return { allowed: false, retryAfter: Math.ceil((record.timestamps[0] + ONE_HOUR - now) / 1000) };
  }

  record.timestamps.push(now);
  return { allowed: true };
}

// Mock images for final fallback
const MOCK_IMAGES = [
  'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1636955860106-9eb84e578c3c?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600',
];

/**
 * Pollinations.ai image generation (Free fallback from ai-recipe)
 */
async function generateWithPollinations(prompt: string): Promise<string> {
  const encodedPrompt = encodeURIComponent(prompt + ', high quality, clean merchandise design, professional vector style');
  const seed = Math.floor(Math.random() * 1000000);
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?seed=${seed}&width=1024&height=1024&nologo=true`;
}

/**
 * Gemini API Integration for Image Generation
 * Uses Gemini 1.5 Flash for Prompt Engineering
 * and uses Imagen 3 via Gemini API (Google AI Studio) for image generation.
 */
export async function POST(req: NextRequest) {
  try {
    // 레이트 리밋 체크
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
        { status: 429, headers: { 'Retry-After': String(rateCheck.retryAfter || 60) } }
      );
    }

    const { prompt, style, removeBackground } = await req.json();
    const apiKey = process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      console.warn('GOOGLE_API_KEY is missing. Falling back to demo mode.');
    }

    // ------------------------------------------------------------------
    // Step 1: Prompt Engineering with Gemini 1.5 Flash
    // ------------------------------------------------------------------
    let enhancedPrompt = prompt;
    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const systemInstruction = `
          You are a professional AI Art Prompt Engineer for GOODZZ, a premium custom goods shop.
          Transform the user's idea into a high-quality, professional English prompt for Imagen 3.
          
          Design Guidelines:
          - Style: ${style || 'Clean & Professional Vector'}
          - Formatting: Flat design, vector art, sticker style, or clean digital illustration.
          - Background: ${removeBackground ? 'Pure solid white background, isolated object, no shadows' : 'Clean minimalist studio background'}
          - Quality: 8k resolution, sharp edges, vibrant colors, premium texture.
          - Constraints: Focus on designs that look good on T-shirts, mugs, and stickers. Return ONLY the English prompt.
        `;
        
        const result = await model.generateContent([systemInstruction, `User Input: ${prompt}`]);
        enhancedPrompt = result.response.text().trim();
        console.log('[Gemini] Enhanced Prompt:', enhancedPrompt);
      } catch (err) {
        console.error('Gemini Prompt Enhancement Error:', err);
      }
    }

    // ------------------------------------------------------------------
    // Step 2: Image Generation (Imagen 3 via Gemini API)
    // ------------------------------------------------------------------
    // Check for real mode (requires Gemini API Key)
    const isRealMode = !!apiKey;

    if (!isRealMode) {
      console.log('[AI-Recipe] Using Pollinations.ai fallback...');
      const pollinationsUrl = await generateWithPollinations(enhancedPrompt);
      
      return NextResponse.json({ 
        url: pollinationsUrl,
        enhancedPrompt,
        mode: 'pollinations',
        message: 'Running with free AI fallback (Pollinations.ai)'
      });
    }

    try {
      console.log('[Gemini] Generating image with Imagen 3...');
      
      // Using the Gemini API Imagen endpoint
      // Reference: https://ai.google.dev/gemini-api/docs/image-generation
      const imagenModel = 'imagen-3.0-generate-001';
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${imagenModel}:predict?key=${apiKey}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instances: [
            {
              prompt: enhancedPrompt,
            },
          ],
          parameters: {
            sampleCount: 1,
            aspectRatio: "1:1",
            outputMimeType: "image/png"
          },
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Gemini Imagen API error: ${response.status} ${errorBody}`);
      }
      
      const data = await response.json();
      const base64Image = data.predictions?.[0]?.bytesBase64Encoded;

      if (!base64Image) {
        throw new Error('No image bytes returned from Gemini API');
      }

      return NextResponse.json({
        url: `data:image/png;base64,${base64Image}`,
        enhancedPrompt,
        mode: 'real'
      });
    } catch (genErr) {
      console.error('Image Generation Error:', genErr);
      // Fallback to Pollinations instead of static Unsplash
      const fallbackUrl = await generateWithPollinations(enhancedPrompt);
      return NextResponse.json({ 
        url: fallbackUrl,
        enhancedPrompt,
        mode: 'fallback-pollinations',
        message: 'Real generation failed, used Pollinations fallback. Error: ' + (genErr instanceof Error ? genErr.message : String(genErr))
      });
    }

  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

