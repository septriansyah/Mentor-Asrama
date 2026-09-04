import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  DoorClosed,
  Filter,
  X,
  Check,
  AlertCircle,
  GraduationCap,
  Star,
} from 'lucide-react';
import { Siswa, SiswaStatus, kelompokKey, kelompokLabel } from '../../types';

interface SiswaTabProps {
  siswaList: Siswa[];
  onAddSiswa: (data: Omit<Siswa, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateSiswa: (data: Siswa) => void;
  onDeleteSiswa: (id: string) => void;
}

export const SiswaTab: React.FC<SiswaTabProps> = ({
  siswaList,
  onAddSiswa,
  onUpdateSiswa,
  onDeleteSiswa,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Mentor' | 'Mentee'>('all');
  const [kelompokFilter, setKelompokFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSiswa, setEditingSiswa] = useState<Siswa | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Siswa | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    nama: '',
    status: 'Mentee' as SiswaStatus,
    angkatan: new Date().getFullYear(),
    gedung: '',
    lantai: 1,
    kelompok: '',
    kamar: '',
    prioritasSekamar: false,
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Unique kelompok bimbingan (gedung + lantai + kelompok) for filtering
  const kelompokOptions = useMemo(() => {
    const map = new Map<string, string>();
    siswaList.forEach((s) => map.set(kelompokKey(s), kelompokLabel(s)));
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [siswaList]);

  // Filtered List
  const filteredList = useMemo(() => {
    return siswaList.filter((s) => {
      const matchSearch =
        s.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.kamar.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' || s.status === statusFilter;
      const matchKelompok = kelompokFilter === 'all' || kelompokKey(s) === kelompokFilter;
      return matchSearch && matchStatus && matchKelompok;
    });
  }, [siswaList, searchQuery, statusFilter, kelompokFilter]);

  // Metrics
  const metrics = useMemo(() => {
    const mentors = siswaList.filter((s) => s.status === 'Mentor').length;
    const mentees = siswaList.filter((s) => s.status === 'Mentee').length;
    return {
      total: siswaList.length,
      mentors,
      mentees,
      kelompok: kelompokOptions.length,
    };
  }, [siswaList, kelompokOptions]);

  const handleOpenAdd = () => {
    setEditingSiswa(null);
    setFormData({
      nama: '',
      status: 'Mentee',
      angkatan: new Date().getFullYear(),
      gedung: '',
      lantai: 1,
      kelompok: '',
      kamar: '',
      prioritasSekamar: false,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Siswa) => {
    setEditingSiswa(item);
    setFormData({
      nama: item.nama,
      status: item.status,
      angkatan: item.angkatan,
      gedung: item.gedung,
      lantai: item.lantai,
      kelompok: item.kelompok,
      kamar: item.kamar,
      prioritasSekamar: item.prioritasSekamar,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanNama = formData.nama.trim();
    const cleanGedung = formData.gedung.trim();
    const cleanKelompok = formData.kelompok.trim();
    const cleanKamar = formData.kamar.trim();

    if (!cleanNama) {
      setFormError('Nama siswa tidak boleh kosong.');
      return;
    }
    if (!cleanGedung) {
      setFormError('Gedung tidak boleh kosong.');
      return;
    }
    if (!cleanKelompok) {
      setFormError('Nomor kelompok tidak boleh kosong.');
      return;
    }
    if (!cleanKamar) {
      setFormError('Nomor kamar tidak boleh kosong.');
      return;
    }

    const payload = {
      nama: cleanNama,
      status: formData.status,
      angkatan: Number(formData.angkatan),
      gedung: cleanGedung,
      lantai: Number(formData.lantai),
      kelompok: cleanKelompok,
      kamar: cleanKamar,
      prioritasSekamar: formData.prioritasSekamar,
    };

    if (editingSiswa) {
      onUpdateSiswa({ ...editingSiswa, ...payload });
    } else {
      onAddSiswa(payload);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Siswa</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{metrics.total}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs font-semibold text-navy-600 uppercase tracking-wider">Total Mentor</div>
          <div className="text-2xl font-bold text-navy-700 mt-1">{metrics.mentors}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Total Mentee</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{metrics.mentees}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Kelompok</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{metrics.kelompok}</div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama atau nomor kamar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-navy-500 outline-hidden transition-colors"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-700 outline-hidden"
          >
            <option value="all">Semua Status</option>
            <option value="Mentor">Hanya Mentor</option>
            <option value="Mentee">Hanya Mentee</option>
          </select>

          {/* Kelompok Filter */}
          <select
            value={kelompokFilter}
            onChange={(e) => setKelompokFilter(e.target.value)}
            className="text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-700 outline-hidden"
          >
            <option value="all">Semua Kelompok</option>
            {kelompokOptions.map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Add Button */}
        <button
          id="btn-tambah-siswa"
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-navy-600 hover:bg-navy-700 text-white rounded-lg text-xs sm:text-sm font-semibold transition-colors shadow-xs shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Siswa</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">Nama Lengkap</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Angkatan</th>
                <th className="py-3 px-4">Kelompok</th>
                <th className="py-3 px-4">Kamar</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Tidak ada data siswa yang cocok dengan filter atau pencarian.
                  </td>
                </tr>
              ) : (
                filteredList.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 text-center text-slate-400 font-mono">{index + 1}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{item.nama}</td>
                    <td className="py-3 px-4">
                      {item.status === 'Mentor' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-navy-50 text-navy-700 border border-navy-200">
                          Mentor
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          Mentee
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">{item.angkatan}</td>
                    <td className="py-3 px-4">
                      <span
                        className="inline-block max-w-40 truncate font-medium text-slate-700"
                        title={kelompokLabel(item)}
                      >
                        {kelompokLabel(item)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                        <DoorClosed className="w-3 h-3 text-slate-500" />
                        {item.kamar}
                        {item.prioritasSekamar && (
                          <span title="Sekamar langsung dengan mentor">
                            <Star className="w-3 h-3 text-sky-500 fill-sky-500" />
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-slate-500 hover:text-navy-600 hover:bg-navy-50 rounded-md transition-colors cursor-pointer"
                          title="Edit Siswa"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteCandidate(item)}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                          title="Hapus Siswa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-navy-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingSiswa ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="input-nama">
                  Nama Lengkap
                </label>
                <input
                  id="input-nama"
                  type="text"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Contoh: Muhammad Faiq"
                  required
                  className="w-full px-3 py-2 text-sm bg-slate-50 focus:bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-500 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="input-status">
                    Status
                  </label>
                  <select
                    id="input-status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as SiswaStatus })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg outline-hidden"
                  >
                    <option value="Mentee">Mentee</option>
                    <option value="Mentor">Mentor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="input-angkatan">
                    Angkatan
                  </label>
                  <input
                    id="input-angkatan"
                    type="number"
                    value={formData.angkatan}
                    onChange={(e) => setFormData({ ...formData, angkatan: Number(e.target.value) })}
                    placeholder="2026"
                    required
                    className="w-full px-3 py-2 text-sm bg-slate-50 focus:bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-500 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="input-gedung">
                    Gedung
                  </label>
                  <input
                    id="input-gedung"
                    type="text"
                    value={formData.gedung}
                    onChange={(e) => setFormData({ ...formData, gedung: e.target.value })}
                    placeholder="ASPA"
                    required
                    className="w-full px-3 py-2 text-sm bg-slate-50 focus:bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="input-lantai">
                    Lantai
                  </label>
                  <input
                    id="input-lantai"
                    type="number"
                    min={1}
                    value={formData.lantai}
                    onChange={(e) => setFormData({ ...formData, lantai: Number(e.target.value) })}
                    placeholder="2"
                    required
                    className="w-full px-3 py-2 text-sm bg-slate-50 focus:bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="input-kelompok">
                    Kelompok
                  </label>
                  <input
                    id="input-kelompok"
                    type="text"
                    value={formData.kelompok}
                    onChange={(e) => setFormData({ ...formData, kelompok: e.target.value })}
                    placeholder="1"
                    required
                    className="w-full px-3 py-2 text-sm bg-slate-50 focus:bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-500 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="input-kamar">
                  Nomor Kamar (fisik)
                </label>
                <input
                  id="input-kamar"
                  type="text"
                  value={formData.kamar}
                  onChange={(e) => setFormData({ ...formData, kamar: e.target.value })}
                  placeholder="Contoh: 212"
                  required
                  className="w-full px-3 py-2 text-sm bg-slate-50 focus:bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-500 outline-hidden"
                />
              </div>

              {formData.status === 'Mentee' && (
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.prioritasSekamar}
                    onChange={(e) => setFormData({ ...formData, prioritasSekamar: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-navy-600 focus:ring-navy-500"
                  />
                  <span>Prioritas Sekamar (sekamar langsung dengan mentor)</span>
                </label>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-navy-600 hover:bg-navy-700 text-white rounded-lg transition-colors shadow-xs cursor-pointer"
                >
                  {editingSiswa ? 'Simpan Perubahan' : 'Tambah Siswa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Hapus Data Siswa?</h4>
            <p className="text-xs text-slate-600 mt-1 mb-5">
              Apakah Anda yakin ingin menghapus <strong>{deleteCandidate.nama}</strong> ({deleteCandidate.status}, Kamar {deleteCandidate.kamar})? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteSiswa(deleteCandidate.id);
                  setDeleteCandidate(null);
                }}
                className="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                Hapus Siswa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
