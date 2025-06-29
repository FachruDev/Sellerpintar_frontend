'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { Loader2 } from 'lucide-react';
import { Analytics } from "@vercel/analytics/next"

export default function LoginPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  // Redirect ke dashboard kalo udah login
  useEffect(() => {
    if (isAuthenticated && !loading) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, loading, router]);

  // loding
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="animate-spin w-12 h-12 text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-100/60 via-slate-100 to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 p-4">
      <Analytics/>
      <div className="w-full max-w-md flex flex-col gap-8">
        <div className="text-center flex flex-col items-center gap-2">
          <span className="inline-flex items-center bg-primary/10 text-primary rounded-full px-4 py-1 text-sm font-medium mb-1">
            Project Management
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">
            Masuk ke Akun Anda
          </h1>
          <p className="text-muted-foreground">
            Silakan login untuk mengelola proyek dan kolaborasi tim.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}