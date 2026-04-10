'use client';

import { AuthProvider } from '@/context/AuthContext';
import CartSync from '@/components/CartSync';
import { Toaster } from 'sonner';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartSync />
      {children}
      <Toaster position="top-center" richColors />
    </AuthProvider>
  );
}
