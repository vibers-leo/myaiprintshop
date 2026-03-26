import { NextRequest, NextResponse } from 'next/server';
import { markSessionUsed } from '@/lib/sdk-sessions';

/**
 * POST /api/sdk/session/[sessionId]/use
 *
 * 세션을 사용됨으로 표시
 * 결제가 시작되면 호출하여 세션 재사용 방지
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await context.params;

    // 세션 사용 처리
    await markSessionUsed(sessionId);

    return NextResponse.json({
      success: true,
      message: 'Session marked as used',
    });
  } catch (error) {
    console.error('Error marking session as used:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to mark session as used',
      },
      { status: 500 }
    );
  }
}
