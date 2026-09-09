import React, { useState, useMemo, useEffect } from 'react';
import { CheckCircle2, DoorClosed, Lock } from 'lucide-react';
import {
  Siswa,
  Indikator,
  Penilaian,
  kelompokKey,
  kelompokLabel,
  ASSESSMENT_MONTHS,
  AssessmentMonth,
} from '../../types';
import { ExcelSpreadsheet } from '../spreadsheet/ExcelSpreadsheet';

interface MentorDashboardProps {
  currentMentor: Siswa;
  allSiswa: Siswa[];
  indikatorList: Indikator[];
  penilaianList: Penilaian[];
  onSavePenilaian: (data: Omit<Penilaian, 'updatedAt' | 'lengkap' | 'id'>) => void;
  openMonths: AssessmentMonth[];
}

export const MentorDashboard: React.FC<MentorDashboardProps> = ({
  currentMentor,
  allSiswa,
  indikatorList,
  penilaianList,
  onSavePenilaian,
  openMonths,
}) => {
  const [selectedBulan, setSelectedBulan] = useState<AssessmentMonth>(ASSESSMENT_MONTHS[0]);
  const isSelectedBulanOpen = openMonths.includes(selectedBulan);

  // Bulan yang dipilih mentor harus selalu salah satu bulan yang sudah dibuka admin - kalau
  // pilihan saat ini terkunci (atau belum ada default), pindah otomatis ke bulan terbuka pertama.
  useEffect(() => {
    if (openMonths.length > 0 && !openMonths.includes(selectedBulan)) {
      const firstOpen = ASSESSMENT_MONTHS.find((m) => openMonths.includes(m));
      if (firstOpen) setSelectedBulan(firstOpen);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openMonths]);

  // Penilaian bulan yang sedang aktif dipilih mentor - indikator yang dipakai sama tiap bulan.
  const bulanPenilaianList = useMemo(
    () => penilaianList.filter((p) => p.bulan === selectedBulan),
    [penilaianList, selectedBulan]
  );

  // Mentor HANYA melihat mentee di kelompok bimbingannya sendiri (gedung + lantai + kelompok),
  // BUKAN berdasarkan nomor kamar fisik - satu kelompok berisi mentee dari beberapa kamar berbeda.
  const currentKelompokKey = kelompokKey(currentMentor);
  const roomMentees = useMemo(() => {
    return allSiswa.filter(
      (s) => s.status === 'Mentee' && kelompokKey(s) === currentKelompokKey
    );
  }, [allSiswa, currentKelompokKey]);

  // Statistics for this room, for the currently selected month
  const stats = useMemo(() => {
    let lengkapCount = 0;
    roomMentees.forEach((m) => {
      const p = bulanPenilaianList.find((item) => item.siswaId === m.id);
      if (p?.lengkap) lengkapCount++;
    });
    return {
      total: roomMentees.length,
      lengkap: lengkapCount,
      belumLengkap: roomMentees.length - lengkapCount,
    };
  }, [roomMentees, bulanPenilaianList]);

  return (
    <div className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Top Banner Card with Brand Maroon + Gold Theme */}
      <div className="bg-navy-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-sky-300/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-sky-300 text-xs font-bold mb-3">
              <DoorClosed className="w-3.5 h-3.5" />
              <span>{kelompokLabel(currentMentor)}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Halo, {currentMentor.nama}
            </h2>
            <p className="text-xs sm:text-sm text-ice-100 mt-1 max-w-xl leading-relaxed">
              Anda bertugas sebagai Mentor Pendamping di {kelompokLabel(currentMentor)} (Kamar {currentMentor.kamar}). Isi nilai indikator mentee dampingan Anda langsung di lembar Excel interaktif di bawah.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-4 py-3 text-center min-w-[90px]">
              <div className="text-[11px] font-bold uppercase tracking-wider text-sky-100">
                Mentee
              </div>
              <div className="text-2xl font-black text-white">{stats.total}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-4 py-3 text-center min-w-[90px]">
              <div className="text-[11px] font-bold uppercase tracking-wider text-sky-300">
                Lengkap
              </div>
              <div className="text-2xl font-black text-sky-300">{stats.lengkap}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-4 py-3 text-center min-w-[90px]">
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                Belum
              </div>
              <div className="text-2xl font-black text-amber-300">{stats.belumLengkap}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Month Tabs - indikator yang dipakai sama, tapi nilai diisi terpisah tiap bulan.
          Bulan yang belum dibuka admin tidak bisa dipilih. */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">Bulan:</span>
        {ASSESSMENT_MONTHS.map((m) => {
          const isOpenMonth = openMonths.includes(m);
          return (
            <button
              key={m}
              type="button"
              disabled={!isOpenMonth}
              onClick={() => setSelectedBulan(m)}
              title={isOpenMonth ? undefined : `Bulan ${m} belum dibuka oleh admin`}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-colors shrink-0 ${
                !isOpenMonth
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : selectedBulan === m
                  ? 'bg-navy-700 text-white shadow-xs cursor-pointer'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-navy-300 cursor-pointer'
              }`}
            >
              {!isOpenMonth && <Lock className="w-3 h-3" />}
              <span>{m}</span>
            </button>
          );
        })}
      </div>

      {!isSelectedBulanOpen ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center">
          <Lock className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">Belum ada bulan penilaian yang dibuka</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Admin belum membuka bulan penilaian manapun untuk kelompok Anda. Hubungi admin untuk membuka salah satu bulan di atas sebelum Anda bisa mengisi nilai.
          </p>
        </div>
      ) : (
        <>
      <div>
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span>Daftar Mentee {kelompokLabel(currentMentor)}</span>
          <span className="text-xs bg-navy-100 text-navy-700 font-bold px-2.5 py-0.5 rounded-full">
            {roomMentees.length} Siswa
          </span>
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Penilaian bulan <strong>{selectedBulan}</strong> - klik sel nilai indikator pada tabel Excel untuk memilih opsi penilaian dari admin.
        </p>
      </div>

      <ExcelSpreadsheet
        mentees={roomMentees}
        indikatorList={indikatorList}
        penilaianList={bulanPenilaianList}
        bulan={selectedBulan}
        onSavePenilaian={onSavePenilaian}
        currentMentorName={currentMentor.nama}
        roomLock={currentKelompokKey}
        roomLockLabel={kelompokLabel(currentMentor)}
        showExport={false}
      />
        </>
      )}
    </div>
  );
};
