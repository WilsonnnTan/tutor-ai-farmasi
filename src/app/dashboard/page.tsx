import { SignOutButton } from '@/components/dashboard/sign-out-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { requireUser } from '@/lib/auth/auth-page-helper';
import { FlaskConical, History } from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
  const user = await requireUser();

  return (
    <div className="flex h-screen flex-col items-center justify-center space-y-12 p-8 pt-6">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-muted-foreground text-lg">
          Selamat datang,{' '}
          <span className="font-bold text-foreground">
            {user.name || user.email || 'User'}
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <Link href="/dashboard/sample-test">
          <Card className="group hover:shadow-2xl transition-all duration-500 cursor-pointer border-none bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-background">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-2xl font-bold">
                Uji Kandungan
              </CardTitle>
              <div className="p-3 rounded-2xl bg-indigo-500 text-white shadow-lg group-hover:scale-110 transition-transform">
                <FlaskConical className="h-6 w-6" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Lakukan analisis kandungan logam dalam larutan sample
                menggunakan metode DIC.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/history">
          <Card className="group hover:shadow-2xl transition-all duration-500 cursor-pointer border-none bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-background">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-2xl font-bold">
                Riwayat Analisis
              </CardTitle>
              <div className="p-3 rounded-2xl bg-purple-500 text-white shadow-lg group-hover:scale-110 transition-transform">
                <History className="h-6 w-6" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Tinjau dan kelola hasil pengujian yang telah Anda lakukan
                sebelumnya.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="w-full max-w-xs pt-8">
        <SignOutButton />
      </div>
    </div>
  );
}
