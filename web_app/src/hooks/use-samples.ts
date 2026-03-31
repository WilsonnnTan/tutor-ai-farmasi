import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface Sample {
  id: string;
  sampleName: string;
  testDate: string;
  metalType: string;
  concentration: number | null;
  rgbValue: string | null;
  imagePath: string | null;
}

export const useSamples = () => {
  return useQuery<Sample[]>({
    queryKey: ['samples'],
    queryFn: async () => {
      const res = await fetch('/api/samples');
      const data = await res.json();
      if (data.status !== 'success')
        throw new Error(data.message || 'Gagal memuat riwayat');
      return data.data;
    },
  });
};

export const useAnalyzeSample = () => {
  return useMutation({
    mutationFn: async (payload: { image: string; metal_type: string }) => {
      const res = await fetch('/api/samples/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.status !== 'success')
        throw new Error(data.message || 'Gagal menganalisis sample');
      return data.data;
    },
  });
};

export const useSaveSample = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      sample_name: string;
      test_date: string;
      metal_type: string;
      concentration: number;
      rgb_value: string;
      image: string;
    }) => {
      const res = await fetch('/api/samples/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.status !== 'success')
        throw new Error(data.message || 'Gagal menyimpan hasil');
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['samples'] });
      toast.success('Hasil analisis berhasil disimpan ke riwayat.');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
