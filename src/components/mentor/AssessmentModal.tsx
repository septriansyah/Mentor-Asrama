import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, Save, Award, Info } from 'lucide-react';
import { Siswa, Indikator, Penilaian, PenilaianMap, AssessmentMonth } from '../../types';

interface AssessmentModalProps {
  mentee: Siswa;
  mentorNama: string;
  indikatorList: Indikator[];
  bulan: AssessmentMonth;
  existingPenilaian: Penilaian | undefined;
  onClose: () => void;
  onSave: (data: Omit<Penilaian, 'updatedAt' | 'lengkap' | 'id'>) => void;
}

export const AssessmentModal: React.FC<AssessmentModalProps> = ({
  mentee,
  mentorNama,
  indikatorList,
  bulan,
  existingPenilaian,
  onClose,
  onSave,
}) => {
  const [scores, setScores] = useState<PenilaianMap>({});
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (existingPenilaian?.nilai) {
      setScores({ ...existingPenilaian.nilai });
    } else {
      // Default empty
      setScores({});
    }
  }, [existingPenilaian]);

  const handleScoreChange = (indikatorId: string, val: number | string) => {
    setValidationError(null);
    if (val === '') {
      const next = { ...scores };
      delete next[indikatorId];
      setScores(next);
      return;
    }

    const num = Number(val);
    if (isNaN(num)) return;
    const clamped = Math.max(0, Math.min(100, Math.round(num)));
    setScores((prev) => ({
      ...prev,
      [indikatorId]: clamped,
    }));
  };

  // Calculate live statistics - jumlah indikator mengikuti indikatorList, tidak lagi tetap 5
  const scoreKeys = indikatorList.map((ind) => String(ind.urutan));
  const filledCount = scoreKeys.filter((k) => typeof scores[k] === 'number' && !isNaN(scores[k])).length;
  const isComplete = scoreKeys.length > 0 && filledCount === scoreKeys.length;

  const totalScore = scoreKeys.reduce((acc, k) => acc + (scores[k] || 0), 0);
  const averageScore = filledCount > 0 ? (totalScore / filledCount).toFixed(1) : '-';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validate that at least some values are valid numbers within 0-100
    for (const k of Object.keys(scores)) {
      const num = scores[k];
      if (typeof num !== 'number' || num < 0 || num > 100) {
        setValidationError('Semua nilai yang diinput harus berada dalam rentang 0 s/d 100.');
        return;
      }
    }

    onSave({
      siswaId: mentee.id,
      bulan,
      kamar: mentee.kamar,
      nilai: scores,
      diisiOleh: mentorNama,
    });
  };

  // Helper for score badge colors
  const getScoreColor = (val: number | undefined) => {
    if (val === undefined) return 'text-slate-400 bg-slate-100';
    if (val >= 85) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (val >= 70) return 'text-blue-700 bg-blue-50 border-blue-200';
    if (val >= 60) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-rose-700 bg-rose-50 border-rose-200';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div
        id="modal-assessment"
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden my-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-navy-900 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider bg-navy-500/30 text-sky-100 px-2 py-0.5 rounded">
                Form Penilaian Mentee - Bulan {bulan}
              </span>
              <span className="text-xs text-slate-300">Kamar {mentee.kamar}</span>
            </div>
            <h3 className="text-lg font-bold leading-tight">{mentee.nama}</h3>
            <p className="text-xs text-slate-400">Angkatan {mentee.angkatan}</p>
          </div>
          <button
            id="btn-close-assessment-modal"
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Status Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-medium">Status Kelengkapan:</span>
            {isComplete ? (
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Lengkap ({scoreKeys.length}/{scoreKeys.length})
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-100/80 px-2.5 py-0.5 rounded-full">
                <AlertCircle className="w-3.5 h-3.5" />
                Belum Lengkap ({filledCount}/{scoreKeys.length})
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 font-medium text-slate-700">
            <Award className="w-4 h-4 text-navy-600" />
            <span>Rata-rata:</span>
            <span className="font-bold text-slate-900 text-sm">{averageScore}</span>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {validationError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          <div className="text-xs text-slate-500 flex items-start gap-1.5 mb-2">
            <Info className="w-4 h-4 text-navy-500 shrink-0 mt-0.5" />
            <span>
              Masukkan skor angka <strong>0 s/d 100</strong> untuk masing-masing indikator. Anda dapat mengetik angka langsung atau menggeser slider.
            </span>
          </div>

          {/* 5 Indicators */}
          <div className="space-y-4">
            {indikatorList.map((indikator) => {
              const key = String(indikator.urutan);
              const currentValue = scores[key];
              const numVal = currentValue !== undefined ? currentValue : 0;
              const hasVal = currentValue !== undefined;

              return (
                <div
                  key={indikator.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-navy-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0">
                          {indikator.urutan}
                        </span>
                        <h4 className="text-sm font-semibold text-slate-900">{indikator.nama}</h4>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 ml-7 leading-relaxed">
                        {indikator.deskripsi}
                      </p>
                    </div>

                    {/* Numeric Input Box */}
                    <div className="shrink-0 flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={hasVal ? currentValue : ''}
                        onChange={(e) => handleScoreChange(key, e.target.value)}
                        placeholder="0-100"
                        className={`w-18 py-1.5 px-2 text-center text-sm font-bold border rounded-lg focus:ring-2 focus:ring-navy-500 outline-hidden transition-all ${getScoreColor(
                          currentValue
                        )}`}
                      />
                    </div>
                  </div>

                  {/* Visual Slider for mobile and quick adjustment */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={hasVal ? numVal : 50}
                      onChange={(e) => handleScoreChange(key, e.target.value)}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-navy-600"
                    />
                    <span className="text-[11px] font-mono text-slate-400 w-8 text-right shrink-0">
                      {hasVal ? `${numVal}` : '-'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3 sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-medium transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              id="btn-save-assessment"
              type="submit"
              className="py-2.5 px-5 rounded-xl bg-navy-600 hover:bg-navy-700 text-white text-sm font-medium transition-colors shadow-xs inline-flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Penilaian</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
