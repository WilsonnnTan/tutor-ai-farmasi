import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  Box, 
  Lightbulb, 
  Save, 
  FlaskConical, 
  Calendar,
  Smartphone,
  Info,
  Zap,
  CheckCircle2
} from 'lucide-react';

export default function TestingInstructions() {
  const steps = [
    {
      title: "Pilih Jenis Logam",
      description: (
        <>
          Pilih parameter logam yang ingin diuji (contoh: <span className="font-semibold text-foreground">Tembaga/Cu</span>) pada menu dropdown yang tersedia.
        </>
      ),
      icon: <Zap className="h-5 w-5 text-indigo-500" />,
    },
    {
      title: "Lengkapi Data Sampel",
      description: (
        <>
          Masukkan <span className="font-semibold text-foreground">Nama Sampel</span> dan <span className="font-semibold text-foreground">Tanggal Uji</span> yang sesuai untuk mempermudah pelacakan di riwayat analisis.
        </>
      ),
      icon: <Calendar className="h-5 w-5 text-indigo-500" />,
    },
    {
      title: "Upload Foto Larutan Sampel",
      description: (
        <>
          <p className="mb-4">
            Pastikan foto yang diunggah memiliki kualitas yang baik dan sesuai dengan kondisi standar berikut:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-indigo-50 dark:border-indigo-900/20 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-center gap-3 mb-3 text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
                <Box className="h-4 w-4" />
                Kondisi Pengambilan Foto
              </div>
              <ul className="text-xs space-y-2 text-muted-foreground list-none">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-emerald-500" />
                  <span>Kotak fotografi interior <span className="font-medium text-foreground">Putih</span></span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-emerald-500" />
                  <span>Ukuran kotak <span className="font-medium text-foreground">25 x 18 x 9 cm</span></span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-emerald-500" />
                  <span>Sumber cahaya layar <span className="font-medium text-foreground">#FFFFFF</span></span>
                </li>
              </ul>
            </div>
            
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-indigo-50 dark:border-indigo-900/20 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-center gap-3 mb-3 text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
                <Smartphone className="h-4 w-4" />
                Spesifikasi Kamera
              </div>
              <ul className="text-xs space-y-2 text-muted-foreground list-none">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-emerald-500" />
                  <span>Model: <span className="font-medium text-foreground">Samsung A32</span></span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-emerald-500" />
                  <span>Resolusi: <span className="font-medium text-foreground">16 MP</span></span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-emerald-500" />
                  <span>Aperture: <span className="font-medium text-foreground">f/1.8</span></span>
                </li>
              </ul>
            </div>
          </div>
        </>
      ),
      icon: <Camera className="h-5 w-5 text-indigo-500" />,
    },
    {
      title: "Mulai Analisis",
      description: (
        <>
          Klik tombol <Badge variant="secondary" className="font-bold px-2 py-0">Analisis Sampel</Badge> untuk memproses foto menggunakan sistem AI.
        </>
      ),
      icon: <FlaskConical className="h-5 w-5 text-indigo-500" />,
    },
    {
      title: "Simpan Hasil",
      description: (
        <>
          Setelah hasil keluar, klik <Badge variant="secondary" className="font-bold px-2 py-0">Simpan Hasil Analisis</Badge> untuk menyimpan data secara permanen ke database.
        </>
      ),
      icon: <Save className="h-5 w-5 text-indigo-500" />,
    },
  ];

  return (
    <Card className="w-full max-w-4xl border-none bg-gradient-to-br from-slate-50 to-white dark:from-slate-900/40 dark:to-background shadow-xl overflow-hidden">
      <CardHeader className="dark:bg-indigo-500/10 border-b border-indigo-100 dark:border-indigo-900/30">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500 text-white shadow-md">
            <Info className="h-5 w-5" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Cara Pengujian</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 md:p-10">
        <div className="space-y-0">
          {steps.map((step, index) => (
            <div key={index} className="flex group">
              {/* Connector */}
              <div className="flex flex-col items-center mr-6 md:mr-8">
                <div className="relative flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold shadow-lg z-10 transition-transform group-hover:scale-110 duration-300">
                    {index + 1}
                  </div>
                  {/* Subtle outer glow for the active number */}
                  <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-md -z-0 scale-125"></div>
                </div>
                {index !== steps.length - 1 && (
                  <div className="w-0.5 min-h-[3rem] flex-1 bg-gradient-to-b from-indigo-500/50 to-indigo-100 dark:from-indigo-500/30 dark:to-indigo-900/10 my-2"></div>
                )}
              </div>

              {/* Content */}
              <div className={`flex-1 ${index !== steps.length - 1 ? 'pb-10' : 'pb-0'}`}>
                <h3 className="text-xl font-bold mb-3 flex items-center gap-3 text-slate-800 dark:text-slate-100">
                  <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30">
                    {step.icon}
                  </span>
                  {step.title}
                </h3>
                <div className="text-muted-foreground leading-relaxed">
                  {step.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
