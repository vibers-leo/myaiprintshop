import { NextRequest, NextResponse } from 'next/server';
import { getUserRole } from './users';

export type UserRole = 'customer' | 'seller' | 'admin';

export interface AuthResult {
  authorized: boolean;
  userId?: string;
  roles?: UserRole[];
  error?: string;
}

/**
 * API 요청에서 Firebase Auth 토큰을 검증하고 사용자 역할을 확인합니다.
 *
 * @param request NextRequest 객체
 * @param allowedRoles 허용된 역할 배열
 * @returns AuthResult - 인증 결과 및 사용자 정보
 */
export async function requireRole(
  request: NextRequest,
  allowedRoles: UserRole[]
): Promise<AuthResult> {
  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        authorized: false,
        error: 'Missing or invalid authorization header',
      };
    }

    const token = authHeader.substring(7); // "Bearer " 제거

    let userId: string;

    // 개발 모드: 토큰을 그대로 userId로 사용 (테스트용)
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Development mode: Using token as userId (no Firebase Admin verification)');
      userId = token;
    } else {
      // 프로덕션: Firebase Admin SDK로 토큰 검증
      try {
        const { verifyIdToken } = await import('./firebase-admin');
        const decodedToken = await verifyIdToken(token);
        userId = decodedToken.uid;
        console.log(`✅ Token verified for user: ${userId}`);
      } catch (error) {
        console.error('❌ Token verification failed:', error);
        return {
          authorized: false,
          error: 'Invalid or expired token',
        };
      }
    }

    // 사용자 역할 확인
    const userRoles = await getUserRole(userId);
    const hasPermission = userRoles.some((role) =>
      allowedRoles.includes(role)
    );

    if (!hasPermission) {
      return {
        authorized: false,
        userId,
        roles: userRoles,
        error: `Insufficient permissions. Required: ${allowedRoles.join(', ')}. Has: ${userRoles.join(', ')}`,
      };
    }

    return {
      authorized: true,
      userId,
      roles: userRoles,
    };
  } catch (error) {
    console.error('Auth middleware error:', error);
    return {
      authorized: false,
      error: error instanceof Error ? error.message : 'Authentication failed',
    };
  }
}

/**
 * 인증 실패 시 표준 에러 응답을 생성합니다.
 */
export function unauthorizedResponse(message?: string): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: message || 'Unauthorized',
    },
    { status: 401 }
  );
}

/**
 * 권한 부족 시 표준 에러 응답을 생성합니다.
 */
export function forbiddenResponse(message?: string): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: message || 'Forbidden',
    },
    { status: 403 }
  );
}

/**
 * Admin 권한 필요한 API 요청을 검증합니다.
 * requireRole의 편의 함수입니다.
 */
export async function requireAdmin(request: NextRequest): Promise<AuthResult> {
  return requireRole(request, ['admin']);
}

/**
 * 사용자가 자신의 리소스에만 접근하는지 확인합니다.
 *
 * @param userId 인증된 사용자 ID
 * @param resourceOwnerId 리소스 소유자 ID
 * @param roles 사용자 역할 배열
 * @returns 접근 허용 여부 (admin은 항상 true)
 */
export function canAccessResource(
  userId: string,
  resourceOwnerId: string,
  roles: UserRole[]
): boolean {
  // Admin은 모든 리소스 접근 가능
  if (roles.includes('admin')) {
    return true;
  }

  // 본인 리소스만 접근 가능
  return userId === resourceOwnerId;
}
