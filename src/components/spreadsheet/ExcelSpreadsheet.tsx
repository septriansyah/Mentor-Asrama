import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  FileSpreadsheet,
  Search,
  Filter,
  Download,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Info,
  Edit3,
  X,
  Sparkles,
  Save,
  Check,
  Star,
} from 'lucide-react';
import {
  Siswa,
  Indikator,
  Penilaian,
  OpsiNilai,
  kelompokKey,
  kelompokLabel,
  AssessmentMonth,
} from '../../types';
import { StorageService } from '../../services/storage';

// Nomor kolom bergaya Excel (0 = A, 1 = B, ..., 25 = Z, 26 = AA, ...) - dipakai supaya jumlah
// indikator TIDAK dibatasi 5, kolom E-I dst mengikuti berapa pun indikator yang admin buat.
function excelColumnLetter(index: number): string {
  let n = index + 1;
  let s = '';
  while (n > 0) {
    const rem = (n - 1) % 26;
    s = String.fromCharCode(65 + rem) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

interface ExcelSpreadsheetProps {
  mentees: Siswa[];
  indikatorList: Indikator[];
  penilaianList: Penilaian[]; // sudah difilter oleh parent untuk `bulan` yang aktif
  bulan: AssessmentMonth;
  onSavePenilaian: (data: Omit<Penilaian, 'updatedAt' | 'lengkap' | 'id'>) => void;
  currentMentorName?: string;
  roomLock?: string; // If mentor, lock to their kelompok (kelompokKey value)
  roomLockLabel?: string; // Human-readable label for roomLock, e.g. "ASPA Lt.2 - Kelompok 1"
  readOnly?: boolean;
}

interface ActiveCell {
  menteeId: string;
  indikatorUrutan: string;
  columnLetter: string;
  rowIndex: number;
}

export const ExcelSpreadsheet: React.FC<ExcelSpreadsheetProps> = ({
  mentees,
  indikatorList,
  penilaianList,
  bulan,
  onSavePenilaian,
  currentMentorName = 'Admin',
  roomLock,
  roomLockLabel,
  readOnly = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [kamarFilter, setKamarFilter] = useState<string>(roomLock || 'all');
  const [activeCell, setActiveCell] = useState<ActiveCell | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null);
  const [customValue, setCustomValue] = useState<string>('');
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const popoverRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setActiveCell(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered mentees - pengelompokan berdasarkan kelompok bimbingan (gedung+lantai+kelompok),
  // BUKAN nomor kamar fisik, karena satu kelompok berisi mentee dari beberapa kamar berbeda.
  const filteredMentees = useMemo(() => {
    return mentees.filter((m) => {
      const matchSearch =
        m.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.kamar.toLowerCase().includes(searchQuery.toLowerCase());
      const matchKamar = roomLock
        ? kelompokKey(m) === roomLock
        : kamarFilter === 'all' || kelompokKey(m) === kamarFilter;
      return matchSearch && matchKamar;
    });
  }, [mentees, searchQuery, kamarFilter, roomLock]);

  // Unique kelompok options (key -> readable label) for the filter dropdown
  const kelompokOptions = useMemo(() => {
    const map = new Map<string, string>();
    mentees.forEach((m) => map.set(kelompokKey(m), kelompokLabel(m)));
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [mentees]);

  // Get score for mentee & indicator
  const getScore = (menteeId: string, urutan: string): number | undefined => {
    const p = penilaianList.find((item) => item.siswaId === menteeId);
    return p?.nilai?.[urutan];
  };

  // Handle cell click to open Excel dropdown
  const handleCellClick = (
    e: React.MouseEvent<HTMLTableCellElement>,
    menteeId: string,
    indikatorUrutan: string,
    columnLetter: string,
    rowIndex: number
  ) => {
    if (readOnly) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setDropdownPos({
      top: rect.bottom + window.scrollY + 4,
      left: Math.max(12, Math.min(window.innerWidth - 320, rect.left + window.scrollX - 40)),
    });
    setActiveCell({ menteeId, indikatorUrutan, columnLetter, rowIndex });

    const currentScore = getScore(menteeId, indikatorUrutan);
    setCustomValue(currentScore !== undefined ? String(currentScore) : '');
  };

  // Set score for active cell
  const handleSelectScore = (score: number) => {
    if (!activeCell) return;
    const { menteeId, indikatorUrutan } = activeCell;
    const mentee = mentees.find((m) => m.id === menteeId);
    if (!mentee) return;

    const existing = penilaianList.find((p) => p.siswaId === menteeId);
    const existingNilai = existing?.nilai || {};

    const updatedNilai = {
      ...existingNilai,
      [indikatorUrutan]: score,
    };

    onSavePenilaian({
      siswaId: menteeId,
      bulan,
      kamar: mentee.kamar,
      nilai: updatedNilai,
      diisiOleh: currentMentorName,
    });

    setSavedNotice(`Sel diperbarui: Nilai ${score} tersimpan`);
    setTimeout(() => setSavedNotice(null), 2500);
    setActiveCell(null);
  };

  // Clear score for active cell
  const handleClearScore = () => {
    if (!activeCell) return;
    const { menteeId, indikatorUrutan } = activeCell;
    const mentee = mentees.find((m) => m.id === menteeId);
    if (!mentee) return;

    const existing = penilaianList.find((p) => p.siswaId === menteeId);
    if (!existing) return;

    const updatedNilai = { ...existing.nilai };
    delete updatedNilai[indikatorUrutan];

    onSavePenilaian({
      siswaId: menteeId,
      bulan,
      kamar: mentee.kamar,
      nilai: updatedNilai,
      diisiOleh: currentMentorName,
    });

    setSavedNotice(`Nilai sel berhasil dihapus`);
    setTimeout(() => setSavedNotice(null), 2500);
    setActiveCell(null);
  };

  // Active indicator definition for popover
  const activeIndikator = useMemo(() => {
    if (!activeCell) return null;
    return indikatorList.find((ind) => String(ind.urutan) === activeCell.indikatorUrutan) || null;
  }, [activeCell, indikatorList]);

  // Active mentee definition for popover
  const activeMentee = useMemo(() => {
    if (!activeCell) return null;
    return mentees.find((m) => m.id === activeCell.menteeId) || null;
  }, [activeCell, mentees]);

  // Kolom bergaya Excel: A: No, B: Nama, C: Angkatan, D: Kelompok, lalu satu kolom per indikator
  // (E, F, G, ... mengikuti jumlah indikator - tidak lagi tetap 5), diakhiri Rata-rata & Status.
  const indicatorCols = indikatorList.map((_, i) => excelColumnLetter(4 + i));
  const rataRataCol = excelColumnLetter(4 + indikatorList.length);
  const statusCol = excelColumnLetter(4 + indikatorList.length + 1);
  const firstIndCol = indicatorCols[0] || 'E';
  const lastIndCol = indicatorCols[indicatorCols.length - 1] || 'E';

  return (
    <div className="bg-white rounded-2xl border border-slate-300 shadow-md overflow-hidden flex flex-col font-sans">
      {/* Excel Title Bar & Formula Toolbar */}
      <div className="bg-sky-600 text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-ice-100" />
          <span className="font-bold text-sm tracking-wide">Excel Lembar Penilaian Mentee</span>
          <span className="text-[11px] bg-black/20 text-ice-50 px-2 py-0.5 rounded-md font-mono">
            {roomLock ? roomLockLabel || roomLock : 'Semua Kelompok'}
          </span>
          <span className="text-[11px] bg-black/20 text-sky-100 px-2 py-0.5 rounded-md font-mono">
            Bulan {bulan}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {savedNotice && (
            <span className="inline-flex items-center gap-1 text-sky-100 text-xs bg-black/25 px-2.5 py-1 rounded-md animate-in fade-in">
              <Check className="w-3.5 h-3.5" />
              {savedNotice}
            </span>
          )}
          <button
            type="button"
            onClick={() => StorageService.exportToCSV(mentees, indikatorList, penilaianList, bulan)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-sky-700 hover:bg-sky-50 rounded-lg font-semibold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Excel Formula & Controls Bar */}
      <div className="bg-slate-100 border-b border-slate-300 p-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Cell Name Box & Formula Bar */}
        <div className="flex items-center gap-2 flex-1 min-w-[280px]">
          <div className="bg-white border border-slate-300 px-2.5 py-1.5 rounded font-mono font-bold text-slate-700 w-16 text-center shadow-inner">
            {activeCell ? `${activeCell.columnLetter}${activeCell.rowIndex + 1}` : 'A1'}
          </div>
          <div className="bg-white border border-slate-300 px-3 py-1.5 rounded flex-1 flex items-center gap-2 text-slate-600 shadow-inner">
            <span className="font-serif italic font-bold text-slate-400">fx</span>
            <span className="truncate">
              {activeCell && activeMentee && activeIndikator
                ? `${activeMentee.nama} - [${activeIndikator.nama}]: ${
                    getScore(activeCell.menteeId, activeCell.indikatorUrutan) !== undefined
                      ? getScore(activeCell.menteeId, activeCell.indikatorUrutan)
                      : '(Belum Terisi - Klik sel untuk memilih)'
                  }`
                : `Pilih salah satu sel nilai indikator (kolom ${firstIndCol} s/d ${lastIndCol}) untuk memunculkan dropdown pilihan nilai`}
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          {!roomLock && (
            <div className="flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={kamarFilter}
                onChange={(e) => setKamarFilter(e.target.value)}
                className="bg-white border border-slate-300 rounded px-2 py-1 text-slate-700 text-xs outline-hidden"
              >
                <option value="all">Semua Kelompok</option>
                {kelompokOptions.map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari siswa..."
              className="bg-white border border-slate-300 rounded pl-7 pr-2.5 py-1 text-xs text-slate-700 focus:ring-1 focus:ring-sky-600 outline-hidden w-36 sm:w-44"
            />
          </div>
        </div>
      </div>

      {/* Excel Table Grid Container */}
      <div className="overflow-x-auto select-none">
        <table className="w-full text-left text-xs border-collapse border border-slate-300">
          {/* Excel Alphabetical Column Headers */}
          <thead>
            <tr className="bg-slate-200 text-slate-700 font-bold border-b border-slate-300 text-center">
              <th className="w-10 border-r border-slate-300 py-1 bg-slate-200 text-slate-500 font-mono">
                #
              </th>
              <th className="w-10 border-r border-slate-300 py-1 font-mono">A</th>
              <th className="border-r border-slate-300 py-1 font-mono min-w-[180px]">B</th>
              <th className="w-20 border-r border-slate-300 py-1 font-mono">C</th>
              <th className="w-24 border-r border-slate-300 py-1 font-mono">D</th>
              {indikatorList.map((ind, i) => (
                <th
                  key={ind.id}
                  className="w-24 border-r border-slate-300 py-1 font-mono text-sky-600"
                >
                  {indicatorCols[i]}
                </th>
              ))}
              <th className="w-20 border-r border-slate-300 py-1 font-mono">{rataRataCol}</th>
              <th className="w-28 border-slate-300 py-1 font-mono">{statusCol}</th>
            </tr>

            {/* Semantic Column Labels */}
            <tr className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-300 text-center">
              <th className="border-r border-slate-300 py-2 text-slate-500 font-mono"></th>
              <th className="border-r border-slate-300 py-2">No</th>
              <th className="border-r border-slate-300 py-2 text-left px-3">Nama Mentee</th>
              <th className="border-r border-slate-300 py-2">Angkatan</th>
              <th className="border-r border-slate-300 py-2">Kelompok</th>
              {indikatorList.map((ind) => (
                <th
                  key={ind.id}
                  className="border-r border-slate-300 py-2 px-1 text-center"
                  title={`${ind.nama}: ${ind.deskripsi}`}
                >
                  <div className="font-bold text-slate-900 leading-tight">I{ind.urutan}</div>
                  <div className="text-[10px] text-slate-500 font-normal truncate max-w-[90px] mx-auto">
                    {ind.nama}
                  </div>
                </th>
              ))}
              <th className="border-r border-slate-300 py-2 text-center">Rata²</th>
              <th className="py-2 text-center">Status</th>
            </tr>
          </thead>

          {/* Table Data Rows with Row Index Numbers */}
          <tbody className="divide-y divide-slate-200">
            {filteredMentees.length === 0 ? (
              <tr>
                <td colSpan={6 + indikatorList.length} className="py-10 text-center text-slate-400">
                  Tidak ada data mentee yang sesuai filter atau pencarian.
                </td>
              </tr>
            ) : (
              filteredMentees.map((mentee, rIdx) => {
                const assessment = penilaianList.find((p) => p.siswaId === mentee.id);
                const scores = assessment?.nilai || {};
                const values = indikatorList
                  .map((ind) => scores[String(ind.urutan)])
                  .filter((v) => typeof v === 'number' && !isNaN(v)) as number[];
                const isComplete = indikatorList.length > 0 && values.length === indikatorList.length;
                const average =
                  values.length > 0
                    ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)
                    : '-';

                return (
                  <tr key={mentee.id} className="hover:bg-navy-50/30 transition-colors">
                    {/* Excel Row Number Index */}
                    <td className="border-r border-slate-300 py-2 px-1 text-center bg-slate-100 text-slate-500 font-mono text-xs">
                      {rIdx + 1}
                    </td>

                    {/* Column A: No */}
                    <td className="border-r border-slate-200 py-2 px-2 text-center text-slate-500 font-mono">
                      {rIdx + 1}
                    </td>

                    {/* Column B: Nama Mentee */}
                    <td className="border-r border-slate-200 py-2 px-3 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{mentee.nama}</div>
                      <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                        <span>Kamar {mentee.kamar}</span>
                        {mentee.prioritasSekamar && (
                          <span title="Sekamar langsung dengan mentor">
                            <Star className="w-2.5 h-2.5 text-sky-500 fill-sky-500" />
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Column C: Angkatan */}
                    <td className="border-r border-slate-200 py-2 px-2 text-center text-slate-600 font-mono">
                      {mentee.angkatan}
                    </td>

                    {/* Column D: Kelompok Bimbingan (gedung + lantai + kelompok) */}
                    <td className="border-r border-slate-200 py-2 px-2 text-center">
                      <span
                        className="inline-block max-w-full truncate bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-medium text-xs"
                        title={kelompokLabel(mentee)}
                      >
                        {mentee.gedung} {mentee.lantai}.{mentee.kelompok}
                      </span>
                    </td>

                    {/* Kolom indikator interaktif - jumlahnya dinamis mengikuti indikatorList */}
                    {indikatorList.map((ind, i) => {
                      const urutan = String(ind.urutan);
                      const val = scores[urutan];
                      const isCellActive =
                        activeCell?.menteeId === mentee.id &&
                        activeCell?.indikatorUrutan === urutan;

                      let cellBg = 'bg-white';
                      let scoreColor = 'text-slate-700';
                      if (val !== undefined) {
                        if (val >= 85) scoreColor = 'text-emerald-700 font-bold bg-emerald-50/50';
                        else if (val >= 70) scoreColor = 'text-blue-700 font-bold bg-blue-50/50';
                        else if (val >= 60) scoreColor = 'text-amber-700 font-semibold bg-amber-50/50';
                        else scoreColor = 'text-rose-700 font-semibold bg-rose-50/50';
                      }

                      return (
                        <td
                          key={ind.id}
                          onClick={(e) =>
                            handleCellClick(
                              e,
                              mentee.id,
                              urutan,
                              indicatorCols[i],
                              rIdx
                            )
                          }
                          className={`border-r border-slate-200 py-2 px-2 text-center cursor-pointer font-mono text-xs transition-all relative ${cellBg} ${scoreColor} ${
                            isCellActive
                              ? 'ring-2 ring-sky-600 bg-sky-50/70 z-10 font-bold'
                              : 'hover:bg-slate-100'
                          }`}
                          title="Klik untuk memilih nilai dari dropdown opsi admin"
                        >
                          <div className="flex items-center justify-center gap-1">
                            <span>{val !== undefined ? val : '-'}</span>
                            <ChevronDown className="w-2.5 h-2.5 text-slate-300 opacity-60" />
                          </div>
                        </td>
                      );
                    })}

                    {/* Column J: Rata-rata */}
                    <td className="border-r border-slate-200 py-2 px-2 text-center font-mono font-bold text-slate-900 bg-slate-50/50">
                      {average}
                    </td>

                    {/* Column K: Status Kelengkapan */}
                    <td className="py-2 px-2 text-center">
                      {isComplete ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Lengkap
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                          Belum ({values.length}/{indikatorList.length})
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Excel Sheet Tabs at Bottom */}
      <div className="bg-slate-200 border-t border-slate-300 px-3 py-1 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-1">
          <div className="bg-white border-t-2 border-sky-600 px-3 py-1 font-semibold text-slate-800 rounded-t shadow-xs flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-600" />
            <span>Sheet1 - Penilaian Kamar</span>
          </div>
        </div>
        <div className="text-[11px] text-slate-500 font-mono">
          Total Baris: {filteredMentees.length} Siswa • Klik sel {firstIndCol}-{lastIndCol} untuk membuka dropdown opsi nilai
        </div>
      </div>

      {/* Excel Floating Cell Dropdown Popover */}
      {activeCell && dropdownPos && activeIndikator && (
        <div
          ref={popoverRef}
          style={{
            position: 'absolute',
            top: `${dropdownPos.top}px`,
            left: `${dropdownPos.left}px`,
            zIndex: 60,
          }}
          className="w-80 bg-white rounded-xl shadow-2xl border-2 border-sky-600 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="bg-sky-600 text-white p-3 flex items-start justify-between gap-2">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-sky-100">
                Sel {activeCell.columnLetter}{activeCell.rowIndex + 1} • Indikator #{activeIndikator.urutan}
              </div>
              <div className="font-bold text-sm text-white">{activeIndikator.nama}</div>
              <div className="text-[11px] text-ice-100 mt-0.5 leading-snug line-clamp-2">
                {activeIndikator.deskripsi}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveCell(null)}
              className="text-white/80 hover:text-white p-0.5 rounded cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mentee target */}
          <div className="bg-slate-50 px-3 py-1.5 border-b border-slate-200 text-xs flex items-center justify-between">
            <span className="text-slate-500">Mentee:</span>
            <span className="font-bold text-slate-800">{activeMentee?.nama}</span>
          </div>

          {/* Dropdown Options List (Configured by Admin) */}
          <div className="p-2 space-y-1 max-h-56 overflow-y-auto">
            <div className="text-[11px] font-bold text-slate-500 px-2 py-0.5 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-sky-600" />
              <span>Pilihan Nilai (Standar Admin):</span>
            </div>

            {activeIndikator.opsiNilai && activeIndikator.opsiNilai.length > 0 ? (
              activeIndikator.opsiNilai.map((opt) => {
                const isSelected =
                  getScore(activeCell.menteeId, activeCell.indikatorUrutan) === opt.score;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectScore(opt.score)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-sky-100 border border-sky-300 text-navy-900 font-bold'
                        : 'hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    <span className="leading-snug">{opt.label}</span>
                    <span className="ml-2 font-mono font-bold bg-sky-600 text-white px-2 py-0.5 rounded text-xs shrink-0">
                      {opt.score}
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="text-xs text-slate-400 p-2">Belum ada opsi dropdown. Gunakan input angka manual.</div>
            )}
          </div>

          {/* Manual Numeric Input Option */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center gap-2">
            <span className="text-xs text-slate-600 shrink-0 font-medium">Input Angka:</span>
            <input
              type="number"
              min="0"
              max="100"
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              placeholder="0-100"
              className="w-20 bg-white border border-slate-300 rounded px-2 py-1 text-xs text-center font-mono font-bold outline-hidden focus:ring-1 focus:ring-sky-600"
            />
            <button
              type="button"
              onClick={() => {
                const num = Number(customValue);
                if (!isNaN(num) && num >= 0 && num <= 100) {
                  handleSelectScore(num);
                }
              }}
              className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded text-xs font-semibold cursor-pointer"
            >
              Set
            </button>
            <button
              type="button"
              onClick={handleClearScore}
              className="ml-auto text-xs text-red-600 hover:text-red-700 hover:underline cursor-pointer"
            >
              Hapus
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
