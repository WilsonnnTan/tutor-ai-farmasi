import { HistoryTable } from '@/components/dashboard/history/history-table';
import { requireUser } from '@/lib/auth/auth-page-helper';

export default async function HistoryPage() {
  await requireUser();
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Data Riwayat</h2>
      </div>
      <HistoryTable />
    </div>
  );
}
