'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useAnalyzeSample, useSaveSample } from '@/hooks/use-samples';
import {
  Beaker,
  Camera,
  ChevronRight,
  RefreshCw,
  Save,
  Zap,
} from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

// Constants
const METAL_LIMITS = {
  Cu: {
    name: 'Tembaga (Cu)',
    limit: 2.0,
    gradient: 'from-blue-500 to-cyan-500',
    icon: Zap,
  },
};

type MetalType = keyof typeof METAL_LIMITS;

interface AnalysisResult {
  rgb: string;
  kadar: number;
  status: string;
}

export function SampleTestContainer() {
  const [step, setStep] = useState<'form' | 'result'>('form');
  const [selectedMetal, setSelectedMetal] = useState<MetalType>('Cu');
  const [sampleName, setSampleName] = useState('');
  const [sampleDate, setSampleDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const analyzeMutation = useAnalyzeSample();
  const saveMutation = useSaveSample();

  useEffect(() => {
    if (analyzeMutation.isPending) {
      const interval = setInterval(() => {
        setProgress((prev) => (prev >= 95 ? 95 : prev + 5));
      }, 200);
      return () => {
        clearInterval(interval);
        setProgress(0);
      };
    }
  }, [analyzeMutation.isPending]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleAnalyze = async () => {
    if (!imageFile || !sampleName || !sampleDate || !selectedMetal) {
      toast.warning('Lengkapi semua data sebelum analisis.');
      return;
    }

    setResult(null);

    try {
      const base64Image = await toBase64(imageFile);

      const data = await analyzeMutation.mutateAsync({
        image: base64Image,
        metal_type: selectedMetal,
      });

      const { rgb, concentration, status } = data;
      setProgress(100);
      setTimeout(() => {
        setResult({
          rgb: `RGB(${rgb.join(', ')})`,
          kadar: concentration,
          status: status === 'AMAN' ? 'DIBAWAH BATAS' : 'MELEBIHI BATAS',
        });
        setStep('result');
        toast.success('Analisis selesai!');
      }, 500);
    } catch (error) {
      console.error('Analyze error:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan sistem saat analisis.';
      toast.error(errorMessage);
    }
  };

  const handleSave = async () => {
    if (!result || !imageFile || !selectedMetal) return;

    try {
      const base64Image = await toBase64(imageFile);

      await saveMutation.mutateAsync({
        sample_name: sampleName,
        test_date: sampleDate,
        metal_type: selectedMetal,
        concentration: result.kadar,
        rgb_value: result.rgb,
        image: base64Image,
      });
    } catch (error) {
      console.error('Save error:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Gagal menyimpan hasil analisis.';
      toast.error(errorMessage);
    }
  };

  const handleReset = () => {
    setStep('form');
    setResult(null);
    setImageFile(null);
    setImagePreview(null);
    setSampleName('');
  };

  const renderForm = () => {
    const metal = METAL_LIMITS[selectedMetal];
    return (
      <Card className="w-full max-w-2xl mx-auto shadow-2xl border-none bg-background/80 backdrop-blur-xl animate-in zoom-in-95 duration-500">
        <CardHeader className="border-b bg-muted/20 pb-4">
          <div className="flex items-center justify-between">
            <Badge className={`bg-gradient-to-r ${metal.gradient}`}>
              {metal.name}
            </Badge>
            <CardTitle className="text-xl font-bold">
              Detail Analisis Sample
            </CardTitle>
            <div className="w-16" /> {/* Spacer */}
          </div>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="metal-type">Jenis Logam</Label>
            <Select
              value={selectedMetal}
              onValueChange={(v: MetalType) => setSelectedMetal(v)}
            >
              <SelectTrigger
                id="metal-type"
                className="w-full bg-muted/10 border-muted-foreground/20"
              >
                <SelectValue placeholder="Pilih Logam" />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={4}>
                {Object.entries(METAL_LIMITS).map(([key, metal]) => (
                  <SelectItem key={key} value={key}>
                    {metal.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Sample</Label>
              <Input
                id="name"
                placeholder="Contoh: Larutan Limbah A"
                value={sampleName}
                onChange={(e) => setSampleName(e.target.value)}
                className="bg-muted/10 border-muted-foreground/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Tanggal Uji</Label>
              <Input
                id="date"
                type="date"
                value={sampleDate}
                onChange={(e) => setSampleDate(e.target.value)}
                className="bg-muted/10 border-muted-foreground/20"
              />
            </div>
          </div>

          <Separator className="bg-primary/10" />

          <div className="space-y-2">
            <Label>Unggah Foto Larutan</Label>
            <div
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all ${
                imagePreview
                  ? 'border-primary/40 bg-primary/5'
                  : 'border-muted-foreground/20 hover:border-primary/40 hover:bg-primary/5'
              }`}
              onClick={() => document.getElementById('image-upload')?.click()}
            >
              {imagePreview ? (
                <div className="relative w-full h-48 rounded-xl overflow-hidden shadow-md cursor-pointer">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs font-bold">
                      Klik untuk ganti foto
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="p-4 rounded-full bg-muted text-muted-foreground mb-4 cursor-pointer">
                    <Camera className="h-8 w-8" />
                  </div>
                  <p className="text-sm font-medium">
                    Klik atau tarik foto di sini
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Format: JPG, PNG (Maks 5MB)
                  </p>
                </>
              )}
              <input
                id="image-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
          </div>

          {analyzeMutation.isPending && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span>Menganalisis...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <Button
            className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20"
            disabled={!imageFile || !sampleName || analyzeMutation.isPending}
            onClick={handleAnalyze}
          >
            {analyzeMutation.isPending ? (
              <>
                <RefreshCw className="mr-2 h-5 w-5 animate-spin" /> Sedang
                Proses
              </>
            ) : (
              <>
                Analisis Sample <ChevronRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  };

  const renderResult = () => {
    const metal = METAL_LIMITS[selectedMetal];
    const isSafe = result?.status === 'DIBAWAH BATAS';

    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-1000">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Hasil Analisis Kandungan
          </h2>
          <p className="text-muted-foreground">
            Kandungan {metal.name} dalam sample Anda
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="overflow-hidden border-none shadow-2xl bg-card/60 backdrop-blur-md">
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground">
                Sample Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-inner border border-muted/50">
                {imagePreview ? (
                  <Image
                    src={imagePreview}
                    alt="Sample"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <Skeleton className="w-full h-full" />
                )}
              </div>
              <div className="mt-4 p-4 rounded-lg bg-muted/20 border border-muted/40">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-muted-foreground">
                    Spectral Info:
                  </span>
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {result?.rgb}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card
              className={`border-none shadow-2xl text-white ${isSafe ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-rose-500 shadow-rose-500/20'}`}
            >
              <CardContent className="p-8 text-center flex flex-col items-center justify-center min-h-[200px]">
                <div className="p-3 rounded-full bg-white/20 mb-4 animate-pulse">
                  {isSafe ? (
                    <Zap className="h-8 w-8" />
                  ) : (
                    <Beaker className="h-8 w-8" />
                  )}
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tighter mb-1">
                  {result?.status}
                </h3>
                <p className="text-white/80 text-sm font-medium">
                  Batas Maksimum: {metal.limit} mg/L
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl bg-card/60 backdrop-blur-md">
              <CardContent className="p-8">
                <div className="flex items-baseline justify-center gap-2 mb-2">
                  <span className="text-5xl font-black text-primary">
                    {result?.kadar}
                  </span>
                  <span className="text-xl font-bold text-muted-foreground">
                    mg/L
                  </span>
                </div>
                <p className="text-center text-sm font-medium text-muted-foreground">
                  Konsentrasi Total Terukur
                </p>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button
                variant="outline"
                className="flex-1 h-12"
                onClick={handleReset}
              >
                Uji Ulang
              </Button>
              <Button
                className="flex-[2] h-12 shadow-lg shadow-primary/20"
                onClick={handleSave}
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending ? (
                  <>
                    <RefreshCw className="mr-2 h-5 w-5 animate-spin" /> Sedang
                    Simpan
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-5 w-5" /> Simpan ke Riwayat
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      {step === 'form' && renderForm()}
      {step === 'result' && renderResult()}
    </div>
  );
}
