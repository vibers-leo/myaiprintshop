import { NextRequest, NextResponse } from 'next/server';
import {
  getReviewsByProduct,
  getReviewsByUser,
  createReview,
  deleteReview,
  replyToReview
} from '@/lib/reviews';
import { updateProduct } from '@/lib/products';
import { requireRole, unauthorizedResponse } from '@/lib/auth-middleware';
import { earnPoints, POINT_CONFIG } from '@/lib/points';
import { createNotification } from '@/lib/notifications';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// GET: 리뷰 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const userId = searchParams.get('userId');
    
    if (productId) {
      const reviews = await getReviewsByProduct(productId);
      return NextResponse.json({ success: true, reviews });
    }
    
    if (userId) {
      const reviews = await getReviewsByUser(userId);
      return NextResponse.json({ success: true, reviews });
    }
    
    return NextResponse.json(
      { error: 'productId 또는 userId가 필요합니다.' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: '리뷰 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// PATCH: 리뷰 답변 (관리자/벤더)
export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireRole(request, ['seller', 'admin']);
    if (!auth.authorized) return unauthorizedResponse(auth.error);

    const { reviewId, replyContent } = await request.json();
    if (!reviewId || !replyContent) {
      return NextResponse.json({ error: 'reviewId와 replyContent가 필요합니다.' }, { status: 400 });
    }

    const success = await replyToReview(reviewId, replyContent, auth.userId || 'admin');
    if (!success) return NextResponse.json({ error: '답변 등록 실패' }, { status: 500 });

    // 리뷰 작성자에게 알림
    try {
      const reviewDoc = await getDoc(doc(db, 'reviews', reviewId));
      if (reviewDoc.exists()) {
        const reviewData = reviewDoc.data();
        createNotification({
          userId: reviewData.userId,
          type: 'review',
          title: '리뷰에 사장님 답변이 달렸습니다',
          message: replyContent.slice(0, 50),
          link: `/shop/${reviewData.productId}`,
        }).catch(() => {});
      }
    } catch {}

    return NextResponse.json({ success: true, message: '답변이 등록되었습니다.' });
  } catch (error) {
    console.error('Review reply error:', error);
    return NextResponse.json({ error: '답변 처리 실패' }, { status: 500 });
  }
}

// POST: 리뷰 등록
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, userId, userName, rating, content } = body;

    if (!productId || !userId || !rating || !content) {
      return NextResponse.json(
        { error: '필수 리뷰 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    const reviewId = await createReview({
      productId,
      userId,
      userName: userName || '익명',
      rating: Number(rating),
      content,
      orderId: body.orderId,
      images: body.images || [],
    });
    
    if (!reviewId) {
      return NextResponse.json(
        { error: '리뷰 등록에 실패했습니다.' },
        { status: 500 }
      );
    }
    
    // 상품 평점/리뷰수 자동 업데이트
    try {
      const reviews = await getReviewsByProduct(productId);
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      await updateProduct(productId, {
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: reviews.length,
      });
    } catch {}

    // 리뷰 포인트 적립
    if (userId) {
      const hasImages = body.images && body.images.length > 0;
      const reward = hasImages ? POINT_CONFIG.photoReviewReward : POINT_CONFIG.reviewReward;
      earnPoints(userId, reward, hasImages ? '포토리뷰 작성' : '리뷰 작성', 'review', reviewId).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      message: '리뷰가 등록되었습니다.',
      reviewId,
    });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: '리뷰 등록 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
