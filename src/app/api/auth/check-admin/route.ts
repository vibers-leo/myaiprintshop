import { NextRequest, NextResponse } from "next/server";
import { verifyIdToken, isAdminUser } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ isAdmin: false, error: "인증 토큰이 필요합니다." }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decoded = await verifyIdToken(token);
    if (!decoded || !decoded.email) {
      return NextResponse.json({ isAdmin: false, error: "유효하지 않은 토큰입니다." }, { status: 401 });
    }

    const admin = await isAdminUser(decoded.email);
    return NextResponse.json({ isAdmin: admin, email: decoded.email });
  } catch (error) {
    console.error("Admin check error:", error);
    return NextResponse.json({ isAdmin: false, error: "인증 확인 중 오류가 발생했습니다." }, { status: 500 });
  }
}
