import React, { useState, useMemo } from 'react';
import { Search, Filter, CheckCircle2, AlertCircle, FileSpreadsheet, LayoutGrid, Lock, LockOpen } from 'lucide-react';
import { Siswa, Indikator, Penilaian, ASSESSMENT_MONTHS, AssessmentMonth, isPenilaianLengkap } from '../../types';
import { ExcelSpreadsheet } from '../spreadsheet/ExcelSpreadsheet';

interface SemuaPenilaianTabProps {
  siswaList: Siswa[];
  indikatorList: Indikator[];
  penilaianList: Penilaian[];
  onSavePenilaian?: (data: Omit<Penilaian, 'updatedAt' | 'lengkap' | 'id'>) => void;
  openMonths: AssessmentMonth[];
  onToggleOpenMonth: (bulan: AssessmentMonth) => void;
}

export const SemuaPenilaianTab: React.FC<SemuaPenilaianTabProps> = ({
  siswaList,
  indikatorList,
  penilaianList,
  onSavePenilaian = () => {},
  openMonths,
  onToggleOpenMonth,
}) => {
  const [viewMode, setViewMode] = useState<'excel' | 'summary'>('excel');
  const [selectedBulan, setSelectedBulan] = useState<AssessmentMonth>(ASSESSMENT_MONTHS[0]);

  const mentees = useMemo(() => {
    return siswaList.filter((s) => s.status === 'Mentee');
  }, [siswaList]);

  const bulanPenilaianList = useMemo(
    () => penilaianList.filter((p) => p.bulan === selectedBulan),
    [penilaianList, selectedBulan]
  );

  // Metrics summary, untuk bulan yang sedang dipilih
  const summary = useMemo(() => {
    const total = mentees.length;
    let lengkap = 0;
    const allScores: number[] = [];

    mentees.forEach((mentee) => {
      const p = bulanPenilaianList.find((item) => item.siswaId === mentee.id);
      if (p?.nilai) {
        // Hanya ambil skor TOTAL per indikator (nilai[urutan]) - bukan semua key di nilai,
        // karena indikator gabungan (komponen) juga menyimpan skor tiap komponen di key terpisah.
        const vals = indikatorList
          .map((ind) => p.nilai[String(ind.urutan)])
          .filter((v) => typeof v === 'number' && !isNaN(v));
        if (isPenilaianLengkap(p.nilai, indikatorList)) lengkap++;
        vals.forEach((v) => allScores.push(v));
      }
    });

    const belum = total - lengkap;
    const globalAvg =
      allScores.length > 0
        ? (allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(1)
        : '-';

    return { total, lengkap, belum, globalAvg };
  }, [mentees, bulanPenilaianList, indikatorList]);

  return (
    <div className="space-y-6">
      {/* Month Tabs + kontrol buka/kunci - indikator sama tiap bulan, nilai diisi terpisah per bulan.
          Bulan yang dikunci tidak bisa dipilih/diisi mentor sampai admin membukanya di sini. */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kontrol Bulan Penilaian</span>
          <span className="text-[11px] text-slate-400">Klik ikon gembok untuk buka/kunci bulan bagi mentor</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {ASSESSMENT_MONTHS.map((m) => {
            const isOpenMonth = openMonths.includes(m);
            return (
              <div key={m} className="flex items-center shrink-0 rounded-full border border-slate-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setSelectedBulan(m)}
                  className={`px-4 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                    selectedBulan === m
                      ? 'bg-navy-700 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {m}
                </button>
                <button
                  type="button"
                  onClick={() => onToggleOpenMonth(m)}
                  title={isOpenMonth ? `Kunci bulan ${m} untuk mentor` : `Buka bulan ${m} untuk mentor`}
                  className={`px-2.5 py-1.5 border-l border-slate-200 transition-colors cursor-pointer ${
                    isOpenMonth
                      ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                      : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {isOpenMonth ? <LockOpen className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Mentee</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{summary.total}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Penilaian Lengkap</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{summary.lengkap}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Belum Lengkap</div>
          <div className="text-2xl font-bold text-amber-700 mt-1">{summary.belum}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-navy-600 uppercase tracking-wider">Rata-rata Nilai</div>
          <div className="text-2xl font-bold text-navy-700 mt-1">{summary.globalAvg}</div>
        </div>
      </div>

      {/* Excel Mode Indicator & Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-sky-600" />
          <h3 className="text-sm font-bold text-slate-800">
            Lembar Kerja Excel Penilaian Seluruh Kelompok
          </h3>
        </div>
        <span className="text-xs text-slate-500">
          Klik pada sel nilai indikator untuk membuka dropdown opsi admin
        </span>
      </div>

      {/* Interactive Excel Spreadsheet View */}
      <ExcelSpreadsheet
        mentees={mentees}
        indikatorList={indikatorList}
        penilaianList={bulanPenilaianList}
        bulan={selectedBulan}
        onSavePenilaian={onSavePenilaian}
        currentMentorName="Admin"
      />
    </div>
  );
};
