'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { Camera, ChevronRight, Info, RefreshCw, Save, Zap } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

// Constants
const METAL_LIMITS = {
  Cu: {
    name: 'Tembaga (Cu) - Indikator Betalain',
    limit: 2.0,
    gradient: 'from-blue-500 to-cyan-500',
    icon: Zap,
    referenceImage: '/metal/cu/output.png',
  },
};

const CROP_CONFIG = {
  width: 100,
  height: 100,
  offsetX: 65,
  offsetY: 750,
};

type MetalType = keyof typeof METAL_LIMITS;

interface AnalysisResult {
  rgb: string;
  kadar: number;
}

export function SampleTestContainer() {
  const [step, setStep] = useState<'form' | 'result'>('form');
  const [selectedMetal, setSelectedMetal] = useState<MetalType>('Cu');
  const [sampleName, setSampleName] = useState('');
  const [sampleDate, setSampleDate] = useState(
    new Date().toLocaleDateString('en-CA'),
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
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
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Ukuran file tidak boleh melebihi 5 MB.');
        return;
      }
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);

      const img = new window.Image();
      img.onload = () => {
        setImageDimensions({
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
      };
      img.src = url;
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

      const { rgb, concentration } = data;
      setProgress(100);
      setTimeout(() => {
        setResult({
          rgb: `RGB(${rgb.join(', ')})`,
          kadar: concentration,
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
    setImageDimensions(null);
    setSampleName('');
    setSampleDate(new Date().toLocaleDateString('en-CA'));
  };

  const calculateCropBox = () => {
    if (!imageDimensions) return null;

    const { width: w, height: h } = imageDimensions;

    const left = Math.max(
      Math.floor((w - CROP_CONFIG.width) / 2) + CROP_CONFIG.offsetX,
      0,
    );
    const top = Math.max(
      Math.floor((h - CROP_CONFIG.height) / 2) + CROP_CONFIG.offsetY,
      0,
    );

    return {
      left: (left / w) * 100,
      top: (top / h) * 100,
      width: (CROP_CONFIG.width / w) * 100,
      height: (CROP_CONFIG.height / h) * 100,
    };
  };

  const renderForm = () => {
    const metal = METAL_LIMITS[selectedMetal];
    return (
      <Card className="w-full max-w-2xl mx-auto shadow-2xl border-none bg-background/80 backdrop-blur-xl">
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

          {metal.referenceImage && (
            <div className="flex items-center justify-between p-4 rounded-xl border border-primary/20 bg-primary/5 animate-in fade-in slide-in-from-top-4 duration-500 hover:bg-primary/10 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg shadow-sm">
                  <Info className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">
                    Grafik Validasi
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Gunakan untuk memvalidasi seberapa akurat model AI.
                  </p>
                </div>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="font-semibold shadow-sm border-primary/20 hover:bg-primary/10 hover:text-primary"
                  >
                    Lihat Skala
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-6xl w-[95vw] sm:rounded-3xl border-none shadow-2xl overflow-y-auto max-h-[90vh]">
                  <DialogHeader className="pt-4 px-2">
                    <DialogTitle className="text-2xl flex items-center gap-2">
                      <Zap className="h-6 w-6 text-primary" />
                      Skala Validasi {metal.name}
                    </DialogTitle>
                    <DialogDescription className="text-base mt-2">
                      Gunakan gambar ini untuk memvalidasi seberapa akurat
                      prediksi dari model AI.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="mt-2 w-full rounded-xl overflow-hidden border border-muted/50 bg-[#fafafa] dark:bg-[#111] flex items-center justify-center p-2 sm:p-4">
                    <Image
                      src={metal.referenceImage}
                      alt={`Skala Validasi ${metal.name}`}
                      width={1920}
                      height={1080}
                      className="w-full h-auto rounded-lg shadow-sm object-contain"
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}

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
                    Format: JPG, PNG (Maks 3.2MB)
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
                Pratinjau Sampel
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-inner border border-muted/50 bg-black/5 flex items-center justify-center">
                {imagePreview ? (
                  <div
                    className="relative w-full h-full"
                    style={{
                      aspectRatio: imageDimensions
                        ? `${imageDimensions.width}/${imageDimensions.height}`
                        : 'auto',
                      maxHeight: '100%',
                      maxWidth: '100%',
                    }}
                  >
                    <Image
                      src={imagePreview}
                      alt="Sample"
                      fill
                      className="object-contain"
                    />
                    {imageDimensions && (
                      <div
                        className="absolute border-2 border-red-500 z-10 pointer-events-none"
                        style={{
                          left: `${calculateCropBox()?.left}%`,
                          top: `${calculateCropBox()?.top}%`,
                          width: `${calculateCropBox()?.width}%`,
                          height: `${calculateCropBox()?.height}%`,
                        }}
                      />
                    )}
                  </div>
                ) : (
                  <Skeleton className="w-full h-full" />
                )}
              </div>
              <div className="mt-4 p-4 rounded-lg bg-muted/20 border border-muted/40">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-muted-foreground">
                    Info Spektral:
                  </span>
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {result?.rgb}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
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
