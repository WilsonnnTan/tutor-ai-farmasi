'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useDeleteSamples, useSamples } from '@/hooks/use-samples';
import { Eye, FileDown, Search, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useMemo, useState } from 'react';

export function HistoryTable() {
  const { data: samples = [], isLoading } = useSamples();
  const deleteMutation = useDeleteSamples();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filteredSamples = useMemo(() => {
    return samples.filter((s) => {
      return (
        s.sampleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.metalType.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [samples, searchQuery]);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === filteredSamples.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredSamples.map((s) => s.id)));
    }
  }, [selectedIds.size, filteredSamples]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(Array.from(selectedIds));
      setSelectedIds(new Set());
    } catch {
      // Error handled in mutation toast
    }
  };

  const downloadCSV = () => {
    if (filteredSamples.length === 0) return;

    const headers = [
      'No',
      'Nama Sample',
      'Jenis Logam',
      'Konsentrasi (mg/L)',
      'RGB',
      'Tanggal Uji',
    ];
    const rows = filteredSamples.map((s, index) => {
      return [
        index + 1,
        s.sampleName,
        s.metalType,
        s.concentration || '-',
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
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama sample..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted/30 border-none focus-visible:ring-primary/20"
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              {selectedIds.size > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full md:w-auto animate-in fade-in slide-in-from-left-2"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Hapus ({selectedIds.size})
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Hapus Data?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Anda akan menghapus {selectedIds.size} data sample
                        terpilih. Tindakan ini tidak dapat dibatalkan.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Hapus
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={downloadCSV}
                disabled={filteredSamples.length === 0}
                className="flex-1 md:flex-none"
              >
                <FileDown className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>

          <Separator className="opacity-50" />

          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Daftar Hasil Analisis (Cu)
            </h3>
          </div>

          <div className="rounded-xl border border-muted/20 overflow-x-auto bg-card/40">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[50px] text-center">
                    <Checkbox
                      checked={
                        filteredSamples.length > 0 &&
                        selectedIds.size === filteredSamples.length
                      }
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead className="w-[50px] hidden md:table-cell text-center">
                    #
                  </TableHead>
                  <TableHead className="text-center">Foto</TableHead>
                  <TableHead className="text-center">Nama Sample</TableHead>
                  <TableHead className="text-center">Konsentrasi</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
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
                    return (
                      <TableRow
                        key={s.id}
                        className={`hover:bg-muted/30 transition-colors group ${
                          selectedIds.has(s.id) ? 'bg-muted/40' : ''
                        }`}
                      >
                        <TableCell className="text-center">
                          <Checkbox
                            checked={selectedIds.has(s.id)}
                            onCheckedChange={() => toggleSelect(s.id)}
                            aria-label={`Select ${s.sampleName}`}
                          />
                        </TableCell>
                        <TableCell className="font-medium text-muted-foreground hidden md:table-cell text-center">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="relative h-10 w-14 rounded-md overflow-hidden border border-muted/30 mx-auto">
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
                        <TableCell className="font-semibold text-center">
                          {s.sampleName}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-bold text-primary">
                            {s.concentration ?? '-'}
                          </span>
                          <span className="text-[10px] ml-1 text-muted-foreground">
                            mg/L
                          </span>
                        </TableCell>

                        <TableCell className="text-center">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all duration-300 shadow-sm"
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
