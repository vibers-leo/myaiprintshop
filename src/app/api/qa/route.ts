import { NextRequest, NextResponse } from 'next/server';
import { getQAsByProduct, getAllQAs, getUnansweredQAs, createQA, answerQA } from '@/lib/product-qa';
import { requireRole, unauthorizedResponse } from '@/lib/auth-middleware';
import { createNotification } from '@/lib/notifications';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// GET: 상품별 Q&A 조회 또는 전체 조회 (관리자)
export async function GET(request: NextRequest) {
  try {
    const productId = request.nextUrl.searchParams.get('productId');
    const unanswered = request.nextUrl.searchParams.get('unanswered');

    if (unanswered === 'true') {
      const auth = await requireRole(request, ['seller', 'admin']);
      if (!auth.authorized) return unauthorizedResponse(auth.error);
      const qas = await getUnansweredQAs();
      return NextResponse.json({ success: true, qas });
    }

    if (productId) {
      const qas = await getQAsByProduct(productId);
      return NextResponse.json({ success: true, qas });
    }

    // 전체 Q&A (관리자용)
    const auth = await requireRole(request, ['admin']);
    if (!auth.authorized) return unauthorizedResponse(auth.error);
    const qas = await getAllQAs();
    return NextResponse.json({ success: true, qas });
  } catch (error) {
    console.error('Q&A GET error:', error);
    return NextResponse.json({ error: 'Q&A 조회 실패' }, { status: 500 });
  }
}

// POST: Q&A 작성 또는 답변
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    // 답변 달기 (벤더/관리자)
    if (action === 'answer') {
      const auth = await requireRole(request, ['seller', 'admin']);
      if (!auth.authorized) return unauthorizedResponse(auth.error);

      const { qaId, answer } = body;
      if (!qaId || !answer) {
        return NextResponse.json({ error: 'qaId와 answer가 필요합니다.' }, { status: 400 });
      }

      const success = await answerQA(qaId, answer, auth.userId || 'admin');
      if (!success) return NextResponse.json({ error: '답변 등록 실패' }, { status: 500 });

      // 질문자에게 알림
      try {
        const qaDoc = await getDoc(doc(db, 'productQA', qaId));
        if (qaDoc.exists()) {
          const qaData = qaDoc.data();
          createNotification({
            userId: qaData.userId,
            type: 'qa',
            title: '질문에 답변이 달렸어요',
            message: `"${qaData.subject}" — 사장님이 직접 답변해주셨어요`,
            link: `/shop/${qaData.productId}`,
          }).catch(() => {});
        }
      } catch {}

      return NextResponse.json({ success: true, message: '답변이 등록되었습니다.' });
    }

    // 질문 작성 (로그인 사용자)
    const auth = await requireRole(request, ['customer', 'seller', 'admin']);
    if (!auth.authorized) return unauthorizedResponse(auth.error);

    const { productId, subject, question, isSecret, email } = body;
    if (!productId || !subject || !question) {
      return NextResponse.json({ error: '상품 ID, 제목, 질문 내용이 필요합니다.' }, { status: 400 });
    }

    const qaId = await createQA({
      productId,
      userId: auth.userId!,
      userName: body.userName || '고객',
      subject,
      question,
      isSecret: isSecret || false,
      email,
    });

    if (!qaId) return NextResponse.json({ error: 'Q&A 작성 실패' }, { status: 500 });
    return NextResponse.json({ success: true, qaId });
  } catch (error) {
    console.error('Q&A POST error:', error);
    return NextResponse.json({ error: 'Q&A 처리 실패' }, { status: 500 });
  }
}
