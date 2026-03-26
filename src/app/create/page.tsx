import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CreateClientContent from '@/components/CreateClientContent';

async function getProducts() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3300';
  try {
    const res = await fetch(`${baseUrl}/api/products?limit=12`, { cache: 'no-store' });
    const data = await res.json();
    return data.success ? data.products : [];
  } catch {
    return [];
  }
}

export default async function CreatePage() {
  const products = await getProducts();

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <CreateClientContent products={products} />
      <Footer />
    </main>
  );
}
