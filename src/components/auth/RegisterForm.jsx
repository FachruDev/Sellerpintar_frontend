'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { validateEmail, validatePassword } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Mail, Lock, AlertCircle, UserPlus } from 'lucide-react';

export function RegisterForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email wajib diisi';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email tidak valid';
    }

    if (!formData.password) {
      newErrors.password = 'Password wajib diisi';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password minimal 6 karakter';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Konfirmasi password tidak sama';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      await register({
        email: formData.email,
        password: formData.password,
      });

      router.push('/dashboard');
    } catch (error) {
      setErrors({
        form: error.message || 'Registrasi gagal. Silakan coba lagi.',
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center ">
      <Card className="w-full max-w-md shadow-xl border-0 relative overflow-hidden backdrop-blur-md bg-white/80 dark:bg-slate-900/70">
        {/* Ornamen sudut */}
        <div className="absolute -top-10 -left-10 w-36 h-36 bg-violet-500/20 rounded-full blur-2xl z-0"></div>
        <div className="absolute -bottom-10 -right-10 w-36 h-36 bg-blue-400/20 rounded-full blur-2xl z-0"></div>
        <CardHeader className="space-y-1 relative z-10">
          <div className="flex items-center gap-2 justify-center mb-2">
            <UserPlus className="w-8 h-8 text-primary" />
            <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
              Daftar Akun Baru
            </CardTitle>
          </div>
          <CardDescription className="text-center">
            Masukkan email dan password untuk membuat akun Anda
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="nama@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
                  autoComplete="email"
                  disabled={isSubmitting}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className={`pl-10 ${errors.password ? 'border-destructive' : ''}`}
                  autoComplete="new-password"
                  disabled={isSubmitting}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="font-medium">
                Konfirmasi Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`pl-10 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                  autoComplete="new-password"
                  disabled={isSubmitting}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">{errors.confirmPassword}</p>
              )}
            </div>
            {errors.form && (
              <Alert variant="destructive" className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Gagal Registrasi</AlertTitle>
                <AlertDescription>{errors.form}</AlertDescription>
              </Alert>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
              size="lg"
            >
              {isSubmitting ? 'Membuat akun...' : 'Daftar'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center relative z-10">
          <p className="text-sm text-muted-foreground">
            Sudah punya akun?{' '}
            <Link
              href="/login"
              className="text-primary underline-offset-2 hover:underline font-semibold"
            >
              Masuk
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}