import { AuthLayout } from '@/components/auth/auth-layout';
import { RegisterForm } from '@/components/auth/register-form';

export const metadata = {
  title: 'Register - Sistem Analisis Kadar Logam',
  description: 'Daftar akun baru',
};

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Buat Akun Baru"
      subtitle="Daftar untuk menggunakan sistem"
    >
      <RegisterForm />
    </AuthLayout>
  );
}
