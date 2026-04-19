import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BrandsClient from '@/components/store/BrandsClient';

export const metadata: Metadata = {
  title: '브랜드 디렉토리',
  description: 'GOODZZ에 입점한 브랜드들을 만나보세요. 각 브랜드의 스토어에서 특별한 굿즈를 확인하세요.',
};

async function fetchBrands() {
  try {
    const { getAdminFirestore } = await import('@/lib/firebase-admin');
    const db = await getAdminFirestore();
    const snap = await db.collection('vendors').where('status', '==', 'approved').get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch {
    return [];
  }
}

export default async function BrandsPage() {
  const brands = await fetchBrands();

  return (
    <>
      <Navbar />
      <BrandsClient brands={brands} />
      <Footer />
    </>
  );
}
