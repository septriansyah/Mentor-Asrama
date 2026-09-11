export type SiswaStatus = 'Mentor' | 'Mentee';

export interface Siswa {
  id: string;
  nama: string;
  status: SiswaStatus;
  angkatan: number;
  kamar: string; // nomor kamar fisik tempat siswa tinggal
  gedung: string; // ASPA, ASPI, RUSPI, dst.
  lantai: number;
  kelompok: string; // nomor kelompok bimbingan (unik per gedung+lantai, BUKAN unik global)
  prioritasSekamar: boolean; // true jika mentee ini sekamar langsung dengan mentornya
  createdAt: string;
  updatedAt: string;
}

// Satu kelompok bimbingan = kombinasi gedung + lantai + kelompok (nomor kelompok saja tidak unik
// lintas gedung/lantai). Gunakan kelompokKey untuk pencocokan mentor<->mentee, kelompokLabel untuk tampilan.
export function kelompokKey(s: Pick<Siswa, 'gedung' | 'lantai' | 'kelompok'>): string {
  return `${s.gedung}|${s.lantai}|${s.kelompok}`;
}

export function kelompokLabel(s: Pick<Siswa, 'gedung' | 'lantai' | 'kelompok'>): string {
  return `${s.gedung} Lt.${s.lantai} - Kelompok ${s.kelompok}`;
}

export interface OpsiNilai {
  id: string;
  label: string;
  score: number;
}

// Sub-komponen dari satu indikator gabungan (mis. "Keaktifan" = Kepanitiaan + Antusiasme).
// Setiap komponen dipilih terpisah di popup yang sama, lalu skornya DIJUMLAHKAN menjadi
// satu nilai untuk indikator induknya (disimpan di Penilaian.nilai[indikator.urutan]).
export interface IndikatorKomponen {
  id: string;
  nama: string;
  opsiNilai: OpsiNilai[];
}

export interface Indikator {
  id: string;
  urutan: number; // urutan unik per indikator; jumlah indikator TIDAK dibatasi 5
  nama: string;
  deskripsi: string;
  opsiNilai?: OpsiNilai[];
  komponen?: IndikatorKomponen[]; // jika terisi, indikator ini gabungan - opsiNilai di atas tidak dipakai
  updatedAt: string;
}

export interface PenilaianMap {
  [indikatorUrutan: string]: number;
}

// Penilaian diisi per bulan (September - Desember), indikator yang dipakai SAMA setiap bulan -
// satu mentee bisa punya sampai 4 record Penilaian terpisah, satu per bulan.
export const ASSESSMENT_MONTHS = ['September', 'Oktober', 'November', 'Desember'] as const;
export type AssessmentMonth = (typeof ASSESSMENT_MONTHS)[number];

export function penilaianId(siswaId: string, bulan: string): string {
  return `${siswaId}__${bulan}`;
}

// Key penyimpanan skor satu komponen di dalam indikator gabungan, di PenilaianMap yang sama.
// Skor total indikator (sum semua komponen) tetap disimpan di nilai[indikatorUrutan] seperti biasa.
export function komponenNilaiKey(indikatorUrutan: number, komponenId: string): string {
  return `${indikatorUrutan}__${komponenId}`;
}

export interface Penilaian {
  id: string; // penilaianId(siswaId, bulan) - unik per (mentee, bulan)
  siswaId: string;
  bulan: AssessmentMonth;
  kamar: string;
  nilai: PenilaianMap;
  catatan?: string; // catatan bebas dari mentor untuk mentee ini, khusus bulan ini
  diisiOleh: string; // nama mentor
  lengkap: boolean; // true jika semua indikator (sejumlah apapun) sudah diisi untuk bulan ini
  updatedAt: string;
}

// Jumlah indikator bisa berubah (admin bisa menambah/menghapus), jadi "lengkap" selalu dihitung
// relatif terhadap indikatorList SAAT INI, bukan angka tetap.
export function isPenilaianLengkap(nilai: PenilaianMap, indikatorList: Indikator[]): boolean {
  if (indikatorList.length === 0) return false;
  return indikatorList.every((ind) => {
    const v = nilai[String(ind.urutan)];
    return typeof v === 'number' && !isNaN(v);
  });
}

export type ActiveRole = 'none' | 'admin' | 'mentor';
export type AdminTab = 'siswa' | 'indikator' | 'penilaian';
