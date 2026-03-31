import { SampleTestContainer } from '@/components/dashboard/sample-test/sample-test-container';
import { requireUser } from '@/lib/auth/auth-page-helper';

export default async function SampleTestPage() {
  await requireUser();
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] p-8">
      <div className="w-full max-w-4xl space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold font-black tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Analisis Sample
          </h2>
        </div>
        <SampleTestContainer />
      </div>
    </div>
  );
}
