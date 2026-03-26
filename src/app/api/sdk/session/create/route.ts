import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey, logApiUsage } from '@/lib/api-auth';
import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

/**
 * POST /api/sdk/session/create
 *
 * Buy Button SDK가 세션을 생성하는 엔드포인트
 *
 * 프로세스:
 * 1. API 키 검증
 * 2. 파트너의 SDK 사용 권한 확인
 * 3. 15분 유효한 세션 생성
 * 4. 세션 ID와 결제 URL 반환
 *
 * 사용 예시:
 * ```javascript
 * const response = await fetch('/api/sdk/session/create', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     apiKey: 'sk_live_xxx',
 *     productId: 'prod_123',
 *     options: { size: 'M', color: 'black' }
 *   })
 * });
 * const { sessionId, checkoutUrl } = await response.json();
 * ```
 */
export async function POST(request: NextRequest) {
  try {
    const { apiKey, productId, options } = await request.json();

    // 1. API 키 검증
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'API key is required',
          hint: 'Include apiKey in request body',
        },
        { status: 400 }
      );
    }

    const partner = await validateApiKey(apiKey);
    if (!partner) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid API key',
          hint: 'Check your API key in the partner dashboard',
        },
        { status: 401 }
      );
    }

    // 2. SDK 사용 권한 확인
    if (partner.features && !partner.features.sdkEnabled) {
      return NextResponse.json(
        {
          success: false,
          error: 'SDK feature is not enabled for your account',
          hint: 'Contact support to enable SDK access',
        },
        { status: 403 }
      );
    }

    // 3. 상품 ID 검증
    if (!productId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Product ID is required',
          hint: 'Include productId in request body',
        },
        { status: 400 }
      );
    }

    // 4. 15분 유효한 세션 생성
    const now = Date.now();
    const expiresAt = now + 900000; // 15분 (900,000ms)

    const sessionRef = await addDoc(collection(db, 'sdk_sessions'), {
      partnerId: partner.id,
      partnerName: partner.name,
      productId,
      options: options || {},
      createdAt: Timestamp.now(),
      expiresAt: Timestamp.fromMillis(expiresAt),
      used: false,
    });

    const sessionId = sessionRef.id;

    // 5. API 사용량 로깅
    await logApiUsage(partner.id, '/api/sdk/session/create', {
      productId,
      sessionId,
    });

    console.log(`✅ SDK session created: ${sessionId} for partner ${partner.name}`);

    // 6. 세션 ID와 결제 URL 반환
    return NextResponse.json({
      success: true,
      sessionId,
      checkoutUrl: `/embed/checkout?sessionId=${sessionId}`,
      expiresIn: 900, // 초 단위 (15분)
      expiresAt: new Date(expiresAt).toISOString(),
    });
  } catch (error) {
    console.error('❌ Error creating SDK session:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create session',
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/sdk/session/create
 *
 * CORS preflight 요청 처리
 * (실제 CORS 헤더는 middleware.ts에서 처리)
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
  });
}
