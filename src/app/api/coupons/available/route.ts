import { NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const db = await getAdminFirestore();
    const now = new Date().toISOString();

    const snap = await db.collection('coupons')
      .where('active', '==', true)
      .get();

    const available = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((c: any) => {
        if (c.expiresAt && c.expiresAt < now) return false;
        if (c.maxUses > 0 && c.usedCount >= c.maxUses) return false;
        return true;
      })
      .map((c: any) => ({
        id: c.id,
        code: c.code,
        discountType: c.discountType,
        discountValue: c.discountValue,
        minOrderAmount: c.minOrderAmount || 0,
        description: c.description || '',
        expiresAt: c.expiresAt,
        active: c.active,
      }));

    return NextResponse.json({ success: true, count: available.length, coupons: available });
  } catch (error) {
    console.error('Coupon fetch error:', error);
    return NextResponse.json({ success: false, error: '쿠폰 조회 실패', coupons: [], count: 0 }, { status: 500 });
  }
}
