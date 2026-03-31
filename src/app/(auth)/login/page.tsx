import { AuthLayout } from '@/components/auth/auth-layout';
import { LoginForm } from '@/components/auth/login-form';

export const metadata = {
  title: 'Login - Sistem Analisis Kadar Logam',
  description: 'Masuk ke akun anda',
};

export default function LoginPage() {
  return (
    <AuthLayout title="Selamat Datang Kembali" subtitle="Masuk ke akun anda">
      <LoginForm />
    </AuthLayout>
  );
}
