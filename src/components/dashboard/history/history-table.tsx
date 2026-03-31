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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Sample, useSamples } from '@/hooks/use-samples';
import { Eye, FileDown, Filter, Search } from 'lucide-react';
import Image from 'next/image';
import { useMemo, useState } from 'react';

const METAL_LIMITS = {
  Cu: 2.0,
};

export function HistoryTable() {
  const { data: samples = [], isLoading } = useSamples();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'safe' | 'danger'>(
    'all',
  );

  const getStatus = (s: Sample) => {
    if (s.concentration === null) return 'unknown';
    const limit = METAL_LIMITS[s.metalType as keyof typeof METAL_LIMITS] || 0;
    return s.concentration <= limit ? 'safe' : 'danger';
  };

  const filteredSamples = useMemo(() => {
    return samples.filter((s) => {
      const matchesSearch =
        s.sampleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.metalType.toLowerCase().includes(searchQuery.toLowerCase());

      const status = getStatus(s);
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'safe' && status === 'safe') ||
        (statusFilter === 'danger' && status === 'danger');

      return matchesSearch && matchesStatus;
    });
  }, [samples, searchQuery, statusFilter]);

  const downloadCSV = () => {
    if (filteredSamples.length === 0) return;

    const headers = [
      'No',
      'Nama Sample',
      'Jenis Logam',
      'Konsentrasi (mg/L)',
      'Status',
      'RGB',
      'Tanggal Uji',
    ];
    const rows = filteredSamples.map((s, index) => {
      const status = getStatus(s);
      return [
        index + 1,
        s.sampleName,
        s.metalType,
        s.concentration || '-',
        status === 'safe' ? 'AMAN' : status === 'danger' ? 'BAHAYA' : '-',
        s.rgbValue || '-',
        new Date(s.testDate).toLocaleDateString('id-ID'),
      ];
    });

    const csvContent = [headers, ...rows]
      .map((row) => row.join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `riwayat_analisis_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card className="w-full shadow-lg border-none bg-background/60 backdrop-blur-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Riwayat Analisis
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Kelola dan tinjau hasil pengujian sample Anda
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadCSV}
            disabled={filteredSamples.length === 0}
            className="hidden sm:flex"
          >
            <FileDown className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-end md:items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama sample..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted/30 border-none focus-visible:ring-primary/20"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground whitespace-nowrap">
                <Filter className="h-4 w-4" /> Filter Status:
              </div>
              <Select
                value={statusFilter}
                onValueChange={(v: typeof statusFilter) => setStatusFilter(v)}
              >
                <SelectTrigger className="w-[140px] bg-muted/30 border-none focus:ring-primary/20">
                  <SelectValue placeholder="Semua" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="safe">Aman</SelectItem>
                  <SelectItem value="danger">Bahaya</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator className="opacity-50" />

          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Daftar Hasil Analisis (Cu)
            </h3>
          </div>

          <div className="rounded-xl border border-muted/20 overflow-hidden bg-card/40">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead>Foto</TableHead>
                  <TableHead>Nama Sample</TableHead>
                  <TableHead>Konsentrasi</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Memuat data...
                    </TableCell>
                  </TableRow>
                ) : filteredSamples.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Tidak ada data untuk filter ini.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSamples.map((s, index) => {
                    const status = getStatus(s);
                    return (
                      <TableRow
                        key={s.id}
                        className="hover:bg-muted/30 transition-colors group"
                      >
                        <TableCell className="font-medium text-muted-foreground">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="relative h-10 w-14 rounded-md overflow-hidden border border-muted/30">
                            {s.imagePath ? (
                              <Image
                                src={s.imagePath}
                                alt={s.sampleName}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-muted flex items-center justify-center text-[8px]">
                                No Image
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {s.sampleName}
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-primary">
                            {s.concentration ?? '-'}
                          </span>
                          <span className="text-[10px] ml-1 text-muted-foreground">
                            mg/L
                          </span>
                        </TableCell>
                        <TableCell>
                          {status === 'safe' ? (
                            <Badge
                              variant="secondary"
                              className="bg-emerald-500/10 text-emerald-600 border-none"
                            >
                              AMAN
                            </Badge>
                          ) : status === 'danger' ? (
                            <Badge
                              variant="destructive"
                              className="bg-rose-500/10 text-rose-600 border-none"
                            >
                              BAHAYA
                            </Badge>
                          ) : (
                            <Badge variant="outline">N/A</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedSample(s)}
                              >
                                <Eye className="h-4 w-4 mr-2" /> Detail
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-none shadow-2xl">
                              <DialogHeader>
                                <DialogTitle>{s.sampleName}</DialogTitle>
                                <DialogDescription>
                                  Hasil analisis lengkap untuk pengujian{' '}
                                  {s.metalType}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-6 py-4">
                                <div className="relative aspect-video rounded-xl overflow-hidden border border-muted/30 shadow-inner">
                                  {s.imagePath ? (
                                    <Image
                                      src={s.imagePath}
                                      alt={s.sampleName}
                                      fill
                                      className="object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-muted flex items-center justify-center">
                                      Gambar tidak tersedia
                                    </div>
                                  )}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-1">
                                    <p className="text-[10px] font-bold uppercase text-muted-foreground">
                                      Jenis Logam
                                    </p>
                                    <Badge
                                      variant="secondary"
                                      className="w-full justify-center"
                                    >
                                      {s.metalType}
                                    </Badge>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-[10px] font-bold uppercase text-muted-foreground">
                                      Konsentrasi
                                    </p>
                                    <p className="text-xl font-bold text-primary">
                                      {s.concentration}{' '}
                                      <span className="text-xs font-normal text-muted-foreground">
                                        mg/L
                                      </span>
                                    </p>
                                  </div>
                                </div>
                                <Separator className="opacity-50" />
                                <div className="space-y-3">
                                  <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">
                                      Spectral Info (RGB)
                                    </span>
                                    <span className="font-mono font-bold">
                                      {s.rgbValue || '-'}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">
                                      Tanggal Uji
                                    </span>
                                    <span className="font-medium text-foreground">
                                      {new Date(s.testDate).toLocaleDateString(
                                        'id-ID',
                                        { dateStyle: 'long' },
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">
                                      Status Keamanan
                                    </span>
                                    {status === 'safe' ? (
                                      <Badge className="bg-emerald-500 hover:bg-emerald-600">
                                        DIBAWAH BATAS
                                      </Badge>
                                    ) : (
                                      <Badge variant="destructive">
                                        MELEBIHI BATAS
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
