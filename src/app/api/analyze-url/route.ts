import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface AnalysisResult {
  brandColors: string[];
  keywords: string[];
  logoUrl: string | null;
  targetAudience: string;
  theme: string;
}

/**
 * AI URL 분석 API
 *
 * 웹사이트 URL을 받아서 Gemini로 분석하여:
 * - 브랜드 색상
 * - 키워드
 * - 로고 URL
 * - 타겟 고객층
 * - 테마
 * 를 추출합니다.
 */
export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL이 필요합니다.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      console.warn('GOOGLE_API_KEY is missing. Using fallback data.');
      // Fallback for demo
      return NextResponse.json({
        brandColors: ['#3B82F6', '#8B5CF6', '#EC4899'],
        keywords: ['modern', 'tech', 'creative'],
        logoUrl: null,
        targetAudience: 'MZ세대',
        theme: 'modern',
      });
    }

    // Step 1: Fetch website content
    console.log(`[analyze-url] Fetching: ${url}`);
    const htmlContent = await fetchWebsiteContent(url);

    // Step 2: Extract images for logo detection
    const images = extractImages(htmlContent, url);
    const logoUrl = extractLogo(htmlContent, images);

    // Step 3: Gemini analysis
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
Analyze this website and extract brand information in JSON format.

Website URL: ${url}
HTML Content (first 5000 chars):
${htmlContent.substring(0, 5000)}

Extract:
1. brandColors: Top 3 hex color codes that represent the brand (e.g., ["#FF5733", "#3498DB", "#2ECC71"])
2. keywords: 5-10 keywords describing the brand/business (e.g., ["coffee", "cozy", "vintage", "artisan"])
3. targetAudience: Primary target customer group (e.g., "MZ세대", "기업", "학생", "가족")
4. theme: Overall design theme (e.g., "modern", "vintage", "cute", "minimalist", "luxury")

Return ONLY valid JSON without markdown code blocks:
{
  "brandColors": ["#...", "#...", "#..."],
  "keywords": ["...", "...", "..."],
  "targetAudience": "...",
  "theme": "..."
}
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    // Remove markdown code blocks if present
    const jsonText = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    let analysis: Partial<AnalysisResult>;
    try {
      analysis = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('[analyze-url] JSON parse error:', parseError);
      console.error('[analyze-url] Response text:', responseText);

      // Fallback
      analysis = {
        brandColors: ['#3B82F6', '#8B5CF6'],
        keywords: ['business', 'professional'],
        targetAudience: '일반',
        theme: 'modern',
      };
    }

    const finalResult: AnalysisResult = {
      brandColors: analysis.brandColors || ['#3B82F6', '#8B5CF6'],
      keywords: analysis.keywords || ['business'],
      logoUrl: logoUrl,
      targetAudience: analysis.targetAudience || '일반',
      theme: analysis.theme || 'modern',
    };

    console.log('[analyze-url] Analysis result:', finalResult);

    return NextResponse.json(finalResult);
  } catch (error) {
    console.error('[analyze-url] Error:', error);
    return NextResponse.json(
      { error: 'URL 분석 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 웹사이트 HTML 가져오기
 */
async function fetchWebsiteContent(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      signal: AbortSignal.timeout(10000), // 10초 타임아웃
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.text();
  } catch (error) {
    console.error('[fetchWebsiteContent] Error:', error);
    // Return minimal HTML on error
    return '<html><body>Error fetching content</body></html>';
  }
}

/**
 * HTML에서 이미지 URL 추출
 */
function extractImages(html: string, baseUrl: string): string[] {
  const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
  const matches = [...html.matchAll(imgRegex)];

  return matches
    .map(m => m[1])
    .filter(src => src && !src.startsWith('data:'))
    .map(src => {
      // 상대 경로를 절대 경로로 변환
      try {
        return new URL(src, baseUrl).href;
      } catch {
        return src;
      }
    })
    .slice(0, 10); // 최대 10개만
}

/**
 * 로고 URL 추출
 * 우선순위: og:image > favicon > 첫 번째 이미지
 */
function extractLogo(html: string, images: string[]): string | null {
  // og:image
  const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
  if (ogImageMatch) {
    return ogImageMatch[1];
  }

  // favicon
  const faviconMatch = html.match(/<link\s+rel=["'](?:icon|shortcut icon)["']\s+href=["']([^"']+)["']/i);
  if (faviconMatch) {
    return faviconMatch[1];
  }

  // 첫 번째 이미지
  return images[0] || null;
}
