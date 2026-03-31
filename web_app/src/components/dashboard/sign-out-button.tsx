'use client';

import { Button } from '@/components/ui/button';
import { signOut } from '@/lib/auth/auth-client';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function SignOutButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const handleSignOut = async () => {
    setIsPending(true);
    try {
      await signOut();
      router.push('/login');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Button
      onClick={handleSignOut}
      variant="destructive"
      className="w-full"
      disabled={isPending}
    >
      {isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Signing out...
        </>
      ) : (
        'Sign Out'
      )}
    </Button>
  );
}
