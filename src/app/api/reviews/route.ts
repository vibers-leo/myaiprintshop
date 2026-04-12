import { NextRequest, NextResponse } from 'next/server';
import {
  getReviewsByProduct,
  getReviewsByUser,
  createReview,
  deleteReview
} from '@/lib/reviews';
import { updateProduct } from '@/lib/products';

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
