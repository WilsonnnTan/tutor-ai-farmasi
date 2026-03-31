import { TestTube } from 'lucide-react';
import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar - Desktop Only */}
      <div className="hidden w-1/2 flex-col justify-between bg-indigo-600 p-12 text-white lg:flex">
        <div>
          <div className="mb-6 flex items-center gap-3">
            <TestTube className="h-10 w-10 text-white" />
            <h1 className="text-2xl font-bold">Sistem Analisis Kadar Logam</h1>
          </div>
          <p className="max-w-md text-lg text-indigo-100/90">
            analisis kandungan logam dalam larutan berbasis Digital Image
            Colorimetry dan Machine Learning
          </p>
        </div>

        <div className="rounded-2xl border border-indigo-400/30 bg-indigo-700/50 p-8 backdrop-blur-md">
          <h3 className="mb-6 text-xl font-bold text-white">Fitur Unggulan</h3>
          <ul className="space-y-4 text-indigo-100/90">
            <li className="flex items-start gap-3">
              <span className="mt-1 text-white">✓</span>
              <span>Analisis logam berbasis citra warna larutan</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 text-white">✓</span>
              <span>
                Prediksi konsentrasi logam dalam larutan secara real-time
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 text-white">✓</span>
              <span>Riwayat pengujian dengan ekspor ke Excel/CSV</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex w-full items-center justify-center bg-gray-50 p-6 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="mb-8 flex flex-col items-center justify-center lg:hidden">
            <div className="mb-4 flex items-center gap-3">
              <TestTube className="h-10 w-10 text-indigo-600" />
              <h1 className="text-2xl font-bold text-slate-800">
                Sistem Analisis Kadar Logam
              </h1>
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">{title}</h2>
            <p className="text-slate-500">{subtitle}</p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
