import { NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const db = await getAdminFirestore();
    const now = new Date().toISOString();

    const snap = await db.collection('coupons')
      .where('active', '==', true)
      .get();

    // 만료되지 않고 사용 한도 초과하지 않은 쿠폰 수
    const count = snap.docs.filter((d) => {
      const data = d.data();
      if (data.expiresAt && data.expiresAt < now) return false;
      if (data.maxUses > 0 && data.usedCount >= data.maxUses) return false;
      return true;
    }).length;

    return NextResponse.json({ success: true, count });
  } catch {
    return NextResponse.json({ success: true, count: 0 });
  }
}
