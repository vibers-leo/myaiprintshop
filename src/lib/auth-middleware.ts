import { NextRequest, NextResponse } from "next/server";
import { verifyIdToken, isAdminUser } from "./firebase-admin";

/**
 * API 라우트에서 관리자 인증을 검사하는 헬퍼 함수.
 * 인증 실패 시 NextResponse를 반환하고, 성공 시 null을 반환합니다.
 */
export async function requireAdmin(request: NextRequest): Promise<NextResponse | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "관리자 인증이 필요합니다." },
      { status: 401 }
    );
  }

  const token = authHeader.split("Bearer ")[1];
  const decoded = await verifyIdToken(token);
  if (!decoded || !decoded.email) {
    return NextResponse.json(
      { error: "유효하지 않은 인증 토큰입니다." },
      { status: 401 }
    );
  }

  const admin = await isAdminUser(decoded.email);
  if (!admin) {
    return NextResponse.json(
      { error: "관리자 권한이 없습니다." },
      { status: 403 }
    );
  }

  return null; // 인증 성공
}
