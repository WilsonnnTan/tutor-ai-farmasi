import { SignOutButton } from '@/components/dashboard/sign-out-button';
import { requireUser } from '@/lib/auth/auth-page-helper';

export default async function DashboardPage() {
  const user = await requireUser();

  return (
    <div className="flex h-screen flex-col items-center justify-center space-y-6 text-center">
      <h1 className="text-4xl font-bold font-heading">Dashboard</h1>
      <p className="text-slate-600">
        Selamat datang,{' '}
        <span className="font-semibold text-indigo-600">
          {user.name || user.email || 'User'}
        </span>
      </p>
      <div className="w-full max-w-xs space-y-4">
        <SignOutButton />
      </div>
    </div>
  );
}
