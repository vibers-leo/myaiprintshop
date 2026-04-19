import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CreateClientContent from '@/components/CreateClientContent';

async function getProducts() {
  try {
    const { getAdminFirestore } = await import('@/lib/firebase-admin');
    const db = await getAdminFirestore();
    const snap = await db.collection('products').where('isActive', '==', true).limit(12).get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch {
    return [];
  }
}

export default async function CreatePage() {
  const products = await getProducts();

  return (
    <main className="min-h-[100dvh]">
      <Navbar />
      <CreateClientContent products={products} />
      <Footer />
    </main>
  );
}
