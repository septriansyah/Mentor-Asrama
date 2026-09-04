import React, { useState } from 'react';
import {
  Sliders,
  Save,
  CheckCircle2,
  RotateCcw,
  Plus,
  Trash2,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Indikator, OpsiNilai } from '../../types';

interface IndikatorTabProps {
  indikatorList: Indikator[];
  onUpdateIndikator: (item: Indikator) => void;
  onAddIndikator: (data: { nama: string; deskripsi: string }) => void;
  onDeleteIndikator: (id: string) => void;
  onResetIndikator: () => void;
}

export const IndikatorTab: React.FC<IndikatorTabProps> = ({
  indikatorList,
  onUpdateIndikator,
  onAddIndikator,
  onDeleteIndikator,
  onResetIndikator,
}) => {
  const [items, setItems] = useState<Indikator[]>(indikatorList);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [expandedOptions, setExpandedOptions] = useState<Record<string, boolean>>({});
  const [newIndikator, setNewIndikator] = useState({ nama: '', deskripsi: '' });

  // New option temp state per indicator
  const [newOptionState, setNewOptionState] = useState<
    Record<string, { label: string; score: number }>
  >({});

  React.useEffect(() => {
    setItems(indikatorList);
  }, [indikatorList]);

  const handleChange = (id: string, field: 'nama' | 'deskripsi', value: string) => {
    setItems((prev) =>
      prev.map((ind) => (ind.id === id ? { ...ind, [field]: value } : ind))
    );
  };

  const toggleExpand = (id: string) => {
    setExpandedOptions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Add new dropdown option for an indicator
  const handleAddOption = (indicatorId: string) => {
    const input = newOptionState[indicatorId];
    if (!input || !input.label.trim()) return;

    setItems((prev) =>
      prev.map((ind) => {
        if (ind.id === indicatorId) {
          const currentOptions = ind.opsiNilai || [];
          const newOpt: OpsiNilai = {
            id: `opt-${indicatorId}-${Date.now()}`,
            label: input.label.trim(),
            score: Number(input.score) || 75,
          };
          return {
            ...ind,
            opsiNilai: [...currentOptions, newOpt],
          };
        }
        return ind;
      })
    );

    setNewOptionState((prev) => ({
      ...prev,
      [indicatorId]: { label: '', score: 80 },
    }));
  };

  // Delete dropdown option
  const handleDeleteOption = (indicatorId: string, optionId: string) => {
    setItems((prev) =>
      prev.map((ind) => {
        if (ind.id === indicatorId) {
          return {
            ...ind,
            opsiNilai: (ind.opsiNilai || []).filter((o) => o.id !== optionId),
          };
        }
        return ind;
      })
    );
  };

  // Update specific option score or label
  const handleUpdateOption = (
    indicatorId: string,
    optionId: string,
    field: 'label' | 'score',
    val: any
  ) => {
    setItems((prev) =>
      prev.map((ind) => {
        if (ind.id === indicatorId) {
          return {
            ...ind,
            opsiNilai: (ind.opsiNilai || []).map((o) =>
              o.id === optionId
                ? { ...o, [field]: field === 'score' ? Number(val) || 0 : val }
                : o
            ),
          };
        }
        return ind;
      })
    );
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    items.forEach((ind) => onUpdateIndikator(ind));
    setSuccessMessage(`Semua ${items.length} indikator beserta pilihan dropdown Excel berhasil disimpan.`);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Kembalikan indikator dan opsi dropdown ke default sistem? Indikator tambahan yang sudah dibuat akan dihapus.')) {
      onResetIndikator();
      setSuccessMessage('Indikator dikembalikan ke pengaturan default sistem.');
      setTimeout(() => setSuccessMessage(null), 3500);
    }
  };

  const handleAddIndikator = () => {
    const nama = newIndikator.nama.trim();
    const deskripsi = newIndikator.deskripsi.trim();
    if (!nama || !deskripsi) return;
    onAddIndikator({ nama, deskripsi });
    setNewIndikator({ nama: '', deskripsi: '' });
    setSuccessMessage(`Indikator "${nama}" berhasil ditambahkan.`);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const handleDeleteIndikator = (ind: Indikator) => {
    if (items.length <= 1) {
      window.alert('Minimal harus ada 1 indikator.');
      return;
    }
    if (
      window.confirm(
        `Hapus indikator "${ind.nama}"? Nilai yang sudah pernah diisi untuk indikator ini tidak akan terhitung lagi.`
      )
    ) {
      onDeleteIndikator(ind.id);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header & info banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Konfigurasi Indikator & Pilihan Dropdown Excel
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Atur nama, deskripsi panduan, serta <strong>pilihan opsi dropdown skor</strong> untuk setiap indikator. Jumlah indikator dan jumlah opsi dropdown tidak dibatasi - tambah sesuai kebutuhan. Pilihan ini akan langsung muncul saat Mentor atau Admin mengklik sel di tabel Excel.
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-600 transition-colors shrink-0 cursor-pointer"
            title="Kembalikan ke daftar indikator default"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Default</span>
          </button>
        </div>

        {successMessage && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}
      </div>

      {/* Form of 5 Indicators */}
      <form onSubmit={handleSaveAll} className="space-y-5">
        {items.map((ind) => {
          const isExpanded = expandedOptions[ind.id] !== false;
          const currentNewOpt = newOptionState[ind.id] || { label: '', score: 85 };

          return (
            <div
              key={ind.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4"
            >
              {/* Indicator Header & Name */}
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-maroon-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                  {ind.urutan}
                </span>
                <div className="flex-1">
                  <label
                    htmlFor={`ind-nama-${ind.id}`}
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
                  >
                    Nama Indikator #{ind.urutan}
                  </label>
                  <input
                    id={`ind-nama-${ind.id}`}
                    type="text"
                    value={ind.nama}
                    onChange={(e) => handleChange(ind.id, 'nama', e.target.value)}
                    placeholder={`Nama Indikator ${ind.urutan}`}
                    required
                    className="w-full px-3.5 py-2 text-sm font-bold text-slate-900 bg-slate-50 focus:bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-maroon-500 outline-hidden transition-colors"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteIndikator(ind)}
                  className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors cursor-pointer shrink-0 self-start"
                  title="Hapus indikator ini"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Indicator Description */}
              <div className="ml-11">
                <label
                  htmlFor={`ind-desc-${ind.id}`}
                  className="block text-xs font-medium text-slate-500 mb-1"
                >
                  Deskripsi & Panduan Penilaian bagi Mentor:
                </label>
                <textarea
                  id={`ind-desc-${ind.id}`}
                  rows={2}
                  value={ind.deskripsi}
                  onChange={(e) => handleChange(ind.id, 'deskripsi', e.target.value)}
                  placeholder="Jelaskan aspek yang dinilai pada indikator ini..."
                  required
                  className="w-full px-3.5 py-2 text-xs sm:text-sm text-slate-700 bg-slate-50 focus:bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-maroon-500 outline-hidden transition-colors resize-y"
                />
              </div>

              {/* Collapsible Dropdown Options Manager */}
              <div className="ml-11 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <button
                    type="button"
                    onClick={() => toggleExpand(ind.id)}
                    className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-maroon-600 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-maroon-600" />
                    <span>Pilihan Dropdown Excel ({(ind.opsiNilai || []).length} Opsi)</span>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <span className="text-[11px] text-slate-400">
                    Opsi yang muncul saat sel diklik
                  </span>
                </div>

                {isExpanded && (
                  <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    {/* Existing options */}
                    <div className="space-y-1.5">
                      {(ind.opsiNilai || []).map((opt) => (
                        <div
                          key={opt.id}
                          className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200"
                        >
                          <input
                            type="text"
                            value={opt.label}
                            onChange={(e) =>
                              handleUpdateOption(ind.id, opt.id, 'label', e.target.value)
                            }
                            className="flex-1 text-xs text-slate-800 bg-transparent border-b border-transparent focus:border-maroon-500 outline-hidden px-1 py-0.5"
                            placeholder="Deskripsi Pilihan..."
                          />
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="text-[11px] text-slate-400">Skor:</span>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={opt.score}
                              onChange={(e) =>
                                handleUpdateOption(ind.id, opt.id, 'score', e.target.value)
                              }
                              className="w-14 text-xs font-mono font-bold text-center bg-slate-100 border border-slate-300 rounded px-1 py-0.5"
                            />
                            <button
                              type="button"
                              onClick={() => handleDeleteOption(ind.id, opt.id)}
                              className="text-slate-400 hover:text-red-500 p-1 rounded transition-colors cursor-pointer"
                              title="Hapus opsi"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add new option row */}
                    <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
                      <input
                        type="text"
                        value={currentNewOpt.label}
                        onChange={(e) =>
                          setNewOptionState((prev) => ({
                            ...prev,
                            [ind.id]: {
                              label: e.target.value,
                              score: currentNewOpt.score,
                            },
                          }))
                        }
                        placeholder="Tambah teks pilihan baru (contoh: Sangat Aktif)..."
                        className="flex-1 text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 outline-hidden focus:ring-1 focus:ring-maroon-500"
                      />
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[11px] text-slate-500">Skor:</span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={currentNewOpt.score}
                          onChange={(e) =>
                            setNewOptionState((prev) => ({
                              ...prev,
                              [ind.id]: {
                                label: currentNewOpt.label,
                                score: Number(e.target.value) || 0,
                              },
                            }))
                          }
                          className="w-14 text-xs font-mono font-bold text-center bg-white border border-slate-300 rounded-lg px-1 py-1.5"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddOption(ind.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-maroon-600 hover:bg-maroon-700 text-white rounded-lg text-xs font-semibold shrink-0 cursor-pointer transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Tambah Indikator Baru */}
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-5 space-y-3">
          <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Plus className="w-4 h-4 text-maroon-600" />
            <span>Tambah Indikator Baru</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={newIndikator.nama}
              onChange={(e) => setNewIndikator((prev) => ({ ...prev, nama: e.target.value }))}
              placeholder="Nama indikator baru (contoh: Kebersihan)"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 focus:bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-maroon-500 outline-hidden transition-colors"
            />
            <input
              type="text"
              value={newIndikator.deskripsi}
              onChange={(e) => setNewIndikator((prev) => ({ ...prev, deskripsi: e.target.value }))}
              placeholder="Deskripsi & panduan penilaian..."
              className="w-full px-3.5 py-2 text-sm bg-slate-50 focus:bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-maroon-500 outline-hidden transition-colors"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleAddIndikator}
              disabled={!newIndikator.nama.trim() || !newIndikator.deskripsi.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-maroon-600 hover:bg-maroon-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Indikator</span>
            </button>
          </div>
        </div>

        {/* Save button bar */}
        <div className="pt-2 flex justify-end">
          <button
            id="btn-save-indicators"
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-maroon-600 hover:bg-maroon-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Perubahan Indikator & Dropdown</span>
          </button>
        </div>
      </form>
    </div>
  );
};
