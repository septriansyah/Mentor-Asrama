import { Siswa, Indikator, Penilaian, isPenilaianLengkap, AssessmentMonth, penilaianId } from '../types';
import { INITIAL_SISWA, INITIAL_INDIKATOR, INITIAL_PENILAIAN, SISWA_SEED_VERSION } from '../data/initialData';

// v3 pada PENILAIAN: skema Penilaian sekarang wajib punya field `bulan` (penilaian per bulan
// September-Desember). Key dinaikkan supaya data lama tanpa `bulan` tidak "hilang" secara diam-diam
// dari tampilan (tidak akan cocok dengan tab bulan manapun) - browser lama mulai bersih.
const STORAGE_KEYS = {
  SISWA: 'sistem_penilaian_siswa_v2',
  SISWA_SEED_VERSION: 'sistem_penilaian_siswa_seed_version',
  INDIKATOR: 'sistem_penilaian_indikator_v1',
  PENILAIAN: 'sistem_penilaian_nilai_v3',
  OPEN_MONTHS: 'sistem_penilaian_bulan_terbuka_v1',
  SESSION: 'sistem_penilaian_session_v1',
};

export interface AuthSession {
  role: 'admin' | 'mentor';
  adminEmail?: string;
  mentorId?: string;
}

export const StorageService = {
  getSiswa(): Siswa[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SISWA);
      const storedVersion = Number(localStorage.getItem(STORAGE_KEYS.SISWA_SEED_VERSION) || '0');

      // Roster dasar (initialData.ts) berubah sejak terakhir disimpan di browser ini - seed ulang
      // supaya siswa/gedung baru otomatis muncul tanpa perlu klik reset manual. Nilai yang sudah
      // diisi mentor tetap aman karena Penilaian tersimpan terpisah dan id siswa lama tidak berubah.
      if (!stored || storedVersion < SISWA_SEED_VERSION) {
        localStorage.setItem(STORAGE_KEYS.SISWA, JSON.stringify(INITIAL_SISWA));
        localStorage.setItem(STORAGE_KEYS.SISWA_SEED_VERSION, String(SISWA_SEED_VERSION));
        return INITIAL_SISWA;
      }
      return JSON.parse(stored);
    } catch {
      return INITIAL_SISWA;
    }
  },

  saveSiswa(siswaList: Siswa[]): void {
    localStorage.setItem(STORAGE_KEYS.SISWA, JSON.stringify(siswaList));
  },

  addSiswa(newSiswa: Omit<Siswa, 'id' | 'createdAt' | 'updatedAt'>): Siswa {
    const list = this.getSiswa();
    const id = `siswa-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const timestamp = new Date().toISOString();
    const created: Siswa = {
      ...newSiswa,
      id,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    list.push(created);
    this.saveSiswa(list);
    return created;
  },

  updateSiswa(updated: Siswa): void {
    const list = this.getSiswa();
    const index = list.findIndex((s) => s.id === updated.id);
    if (index !== -1) {
      list[index] = {
        ...updated,
        updatedAt: new Date().toISOString(),
      };
      this.saveSiswa(list);

      // If room changed, sync it across ALL of this mentee's monthly assessment records
      const penilaianList = this.getPenilaian();
      let touched = false;
      penilaianList.forEach((p) => {
        if (p.siswaId === updated.id) {
          p.kamar = updated.kamar;
          touched = true;
        }
      });
      if (touched) {
        this.savePenilaianList(penilaianList);
      }
    }
  },

  deleteSiswa(id: string): void {
    const list = this.getSiswa().filter((s) => s.id !== id);
    this.saveSiswa(list);

    // Also remove assessment if any
    const penilaianList = this.getPenilaian().filter((p) => p.siswaId !== id);
    this.savePenilaianList(penilaianList);
  },

  getIndikator(): Indikator[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.INDIKATOR);
      if (!stored) {
        localStorage.setItem(STORAGE_KEYS.INDIKATOR, JSON.stringify(INITIAL_INDIKATOR));
        return INITIAL_INDIKATOR;
      }
      const parsed: Indikator[] = JSON.parse(stored);
      // Jumlah indikator boleh berapa saja (admin bisa menambah/menghapus) - hanya jaga agar
      // tidak kosong total.
      if (!Array.isArray(parsed) || parsed.length === 0) {
        localStorage.setItem(STORAGE_KEYS.INDIKATOR, JSON.stringify(INITIAL_INDIKATOR));
        return INITIAL_INDIKATOR;
      }
      // Merge with default opsiNilai if missing
      const merged = parsed.map((item) => {
        if (!item.opsiNilai || item.opsiNilai.length === 0) {
          const defaultInd = INITIAL_INDIKATOR.find((d) => d.id === item.id);
          return { ...item, opsiNilai: defaultInd?.opsiNilai || [] };
        }
        return item;
      });
      return merged.sort((a, b) => a.urutan - b.urutan);
    } catch {
      return INITIAL_INDIKATOR;
    }
  },

  updateIndikator(updated: Indikator): void {
    const list = this.getIndikator();
    const index = list.findIndex((i) => i.id === updated.id);
    if (index !== -1) {
      list[index] = {
        ...updated,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEYS.INDIKATOR, JSON.stringify(list));
    }
  },

  addIndikator(data: { nama: string; deskripsi: string }): Indikator {
    const list = this.getIndikator();
    const nextUrutan = list.length > 0 ? Math.max(...list.map((i) => i.urutan)) + 1 : 1;
    const created: Indikator = {
      id: `ind-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      urutan: nextUrutan,
      nama: data.nama,
      deskripsi: data.deskripsi,
      opsiNilai: [],
      updatedAt: new Date().toISOString(),
    };
    const updated = [...list, created];
    localStorage.setItem(STORAGE_KEYS.INDIKATOR, JSON.stringify(updated));
    return created;
  },

  deleteIndikator(id: string): void {
    const list = this.getIndikator().filter((i) => i.id !== id);
    localStorage.setItem(STORAGE_KEYS.INDIKATOR, JSON.stringify(list));
  },

  resetIndikator(): void {
    localStorage.setItem(STORAGE_KEYS.INDIKATOR, JSON.stringify(INITIAL_INDIKATOR));
  },

  getPenilaian(): Penilaian[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PENILAIAN);
      if (!stored) {
        localStorage.setItem(STORAGE_KEYS.PENILAIAN, JSON.stringify(INITIAL_PENILAIAN));
        return INITIAL_PENILAIAN;
      }
      return JSON.parse(stored);
    } catch {
      return INITIAL_PENILAIAN;
    }
  },

  savePenilaianList(list: Penilaian[]): void {
    localStorage.setItem(STORAGE_KEYS.PENILAIAN, JSON.stringify(list));
  },

  savePenilaian(penilaianData: Omit<Penilaian, 'updatedAt' | 'lengkap' | 'id'>): Penilaian {
    const list = this.getPenilaian();
    const isComplete = isPenilaianLengkap(penilaianData.nilai, this.getIndikator());

    const record: Penilaian = {
      ...penilaianData,
      id: penilaianId(penilaianData.siswaId, penilaianData.bulan),
      lengkap: isComplete,
      updatedAt: new Date().toISOString(),
    };

    // Satu mentee bisa punya beberapa record (satu per bulan) - cocokkan siswaId DAN bulan.
    const index = list.findIndex((p) => p.siswaId === record.siswaId && p.bulan === record.bulan);
    if (index !== -1) {
      list[index] = record;
    } else {
      list.push(record);
    }

    this.savePenilaianList(list);
    return record;
  },

  resetData(): void {
    localStorage.setItem(STORAGE_KEYS.SISWA, JSON.stringify(INITIAL_SISWA));
    localStorage.setItem(STORAGE_KEYS.SISWA_SEED_VERSION, String(SISWA_SEED_VERSION));
    localStorage.setItem(STORAGE_KEYS.INDIKATOR, JSON.stringify(INITIAL_INDIKATOR));
    localStorage.setItem(STORAGE_KEYS.PENILAIAN, JSON.stringify(INITIAL_PENILAIAN));
  },

  // Bulan mana yang boleh diisi mentor - default TERTUTUP SEMUA sampai admin membuka secara
  // eksplisit dari dashboard admin.
  getOpenMonths(): AssessmentMonth[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.OPEN_MONTHS);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  setOpenMonths(months: AssessmentMonth[]): void {
    localStorage.setItem(STORAGE_KEYS.OPEN_MONTHS, JSON.stringify(months));
  },

  toggleOpenMonth(bulan: AssessmentMonth): void {
    const current = this.getOpenMonths();
    const next = current.includes(bulan)
      ? current.filter((m) => m !== bulan)
      : [...current, bulan];
    this.setOpenMonths(next);
  },

  // Sesi login (admin/mentor) - disimpan supaya refresh halaman TIDAK otomatis logout.
  // Hanya logout eksplisit (tombol Keluar) yang menghapus sesi ini.
  getSession(): AuthSession | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SESSION);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  saveSession(session: AuthSession): void {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  },

  clearSession(): void {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  },

  generateCSVData(bulan: AssessmentMonth): { headers: string[]; rows: (string | number)[][] } {
    const siswaList = this.getSiswa();
    const indikatorList = this.getIndikator();
    const penilaianList = this.getPenilaian().filter((p) => p.bulan === bulan);

    // Headers: No, Gedung, Lantai, Kelompok, Status, Angkatan, Nama, Kamar, Prioritas Sekamar,
    // Bulan, <nama tiap indikator - jumlahnya dinamis>, Diisi Oleh, Status Kelengkapan
    const headers = [
      'No',
      'Gedung',
      'Lantai',
      'Kelompok',
      'Status',
      'Angkatan',
      'Nama',
      'Kamar',
      'Prioritas Sekamar',
      'Bulan',
      ...indikatorList.map((ind, i) => ind.nama || `Indikator ${i + 1}`),
      'Diisi Oleh',
      'Status Kelengkapan',
    ];

    // Siswa (terutama Mentee, tapi mencakup data siswa lengkap yang dinilai)
    const mentees = siswaList.filter((s) => s.status === 'Mentee');
    const rows = mentees.map((mentee, index) => {
      const p = penilaianList.find((item) => item.siswaId === mentee.id);
      const indikatorVals = indikatorList.map((ind) => {
        const v = p?.nilai?.[String(ind.urutan)];
        return v !== undefined ? v : '-';
      });
      const diisiOleh = p?.diisiOleh || '-';
      const statusKelengkapan = p?.lengkap ? 'Lengkap' : 'Belum Lengkap';

      return [
        index + 1,
        mentee.gedung,
        mentee.lantai,
        mentee.kelompok,
        mentee.status,
        mentee.angkatan,
        mentee.nama,
        mentee.kamar,
        mentee.prioritasSekamar ? 'Ya' : '-',
        bulan,
        ...indikatorVals,
        diisiOleh,
        statusKelengkapan,
      ];
    });

    return { headers, rows };
  },

  exportToCSV(bulan: AssessmentMonth): void {
    const { headers, rows } = this.generateCSVData(bulan);
    const csvRows: string[] = [];

    // Format safely with quotes escaping
    const escapeCSV = (val: string | number) => {
      const str = String(val ?? '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    csvRows.push(headers.map(escapeCSV).join(','));
    rows.forEach((row) => {
      csvRows.push(row.map(escapeCSV).join(','));
    });

    const csvContent = '\uFEFF' + csvRows.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const today = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `penilaian_mentee_${bulan}_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};
