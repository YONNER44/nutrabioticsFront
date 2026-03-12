'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { Role } from '@/lib/types';

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles: Role[];
}

export default function RouteGuard({ children, allowedRoles }: RouteGuardProps) {
  const { user } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (!allowedRoles.includes(user.role)) {
      router.replace(`/${user.role}`);
    }
  }, [user, allowedRoles, router, mounted]);

  if (!mounted || !user || !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return <>{children}</>;
}
