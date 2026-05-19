'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Label from '@/components/ui/Label';
import AuthRedirect from '@/components/auth/AuthRedirect';
import { useAuth } from '@/hooks/useAuth';
import authService from '@/services/authService';
import { ROUTES } from '@/constants/routes';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuth();
  const [formError, setFormError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values) => {
    setFormError('');
    try {
      const data = await authService.login(values);
      setAuth(data.user, data.token);
      router.push(ROUTES.DASHBOARD);
    } catch (error) {
      setFormError(
        error.response?.data?.message || 'Login failed. Please check your credentials.'
      );
    }
  };

  return (
    <AuthRedirect>
      <div>
        <h2 className="mb-1 text-xl font-semibold text-zinc-900">Sign in</h2>
        <p className="mb-6 text-sm text-zinc-500">Enter your credentials to continue</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {formError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {formError}
            </div>
          )}

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              error={errors.email}
              {...register('email')}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              error={errors.password}
              {...register('password')}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" loading={isSubmitting}>
            Sign in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Don&apos;t have an account?{' '}
          <Link href={ROUTES.REGISTER} className="font-medium text-zinc-900 hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </AuthRedirect>
  );
}
