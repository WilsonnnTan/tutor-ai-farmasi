'use client';

import { Button } from '@/components/ui/button';
import { signOut, useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center space-y-6 text-center">
      <h1 className="text-4xl font-bold">Dashboard</h1>
      <p className="text-slate-600">
        Selamat datang,{' '}
        <span className="font-semibold text-indigo-600">
          {session?.user?.name || session?.user?.email || 'User'}
        </span>
      </p>
      <div className="w-full max-w-xs space-y-4">
        <Button
          onClick={handleSignOut}
          variant="destructive"
          className="w-full"
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
}
