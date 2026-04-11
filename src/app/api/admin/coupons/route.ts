import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore, verifyIdToken, isAdminUser } from '@/lib/firebase-admin';

async function verifyAdmin(request: NextRequest): Promise<NextResponse | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }
  try {
    const token = authHeader.split('Bearer ')[1];
    const decoded = await verifyIdToken(token);
    if (!decoded?.email || !(await isAdminUser(decoded.email))) {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }
    return null; // 인증 성공
  } catch {
    return NextResponse.json({ error: '인증 실패' }, { status: 401 });
  }
}

export async function GET(request: NextRequest) {
  const authError = await verifyAdmin(request);
  if (authError) return authError;

  try {
    const db = await getAdminFirestore();
    const snap = await db.collection('coupons').orderBy('createdAt', 'desc').get();
    const coupons = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ coupons });
  } catch (error) {
    console.error('Failed to fetch coupons:', error);
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = await verifyAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { code, discountType, discountValue, minOrderAmount, expiresAt, maxUses, description } = body;

    if (!code || !discountType || !discountValue) {
      return NextResponse.json({ error: '필수 항목을 입력해주세요.' }, { status: 400 });
    }

    const numDiscount = Number(discountValue);
    const numMinOrder = Number(minOrderAmount) || 0;
    const numMaxUses = Number(maxUses) || 0;

    // 입력값 검증
    if (numDiscount <= 0) {
      return NextResponse.json({ error: '할인 값은 0보다 커야 합니다.' }, { status: 400 });
    }
    if (discountType === 'percent' && numDiscount > 100) {
      return NextResponse.json({ error: '할인율은 100%를 초과할 수 없습니다.' }, { status: 400 });
    }
    if (numMinOrder < 0 || numMaxUses < 0) {
      return NextResponse.json({ error: '음수 값은 허용되지 않습니다.' }, { status: 400 });
    }
    if (expiresAt && new Date(expiresAt) < new Date()) {
      return NextResponse.json({ error: '만료일은 현재보다 미래여야 합니다.' }, { status: 400 });
    }

    const db = await getAdminFirestore();

    // 중복 코드 체크
    const existing = await db.collection('coupons').where('code', '==', code.toUpperCase()).get();
    if (!existing.empty) {
      return NextResponse.json({ error: '이미 존재하는 쿠폰 코드입니다.' }, { status: 409 });
    }

    const coupon = {
      code: code.toUpperCase(),
      discountType,
      discountValue: numDiscount,
      minOrderAmount: numMinOrder,
      maxUses: numMaxUses,
      usedCount: 0,
      description: description || '',
      expiresAt: expiresAt || null,
      active: true,
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection('coupons').add(coupon);

    return NextResponse.json({ success: true, id: docRef.id, coupon: { id: docRef.id, ...coupon } });
  } catch (error) {
    console.error('Failed to create coupon:', error);
    return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const authError = await verifyAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { id, active } = body;

    if (!id || typeof active !== 'boolean') {
      return NextResponse.json({ error: 'id와 active 필드가 필요합니다.' }, { status: 400 });
    }

    const db = await getAdminFirestore();
    await db.collection('coupons').doc(id).update({ active });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update coupon:', error);
    return NextResponse.json({ error: 'Failed to update coupon' }, { status: 500 });
  }
}
