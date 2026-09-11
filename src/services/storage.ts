import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import { Siswa, Indikator, Penilaian, isPenilaianLengkap, AssessmentMonth } from '../types';
import { INITIAL_SISWA, INITIAL_INDIKATOR } from '../data/initialData';

// Kunci localStorage HANYA untuk sesi login (per-device, memang tidak perlu dibagi antar device).
// Semua data lain (siswa, indikator, penilaian, bulan terbuka) sekarang tersimpan di Firestore
// supaya benar-benar dibagi (shared) dan real-time antar semua mentor & admin, di device manapun.
const SESSION_KEY = 'sistem_penilaian_session_v1';

export interface AuthSession {
  role: 'admin' | 'mentor';
  adminEmail?: string;
  mentorId?: string;
}

const siswaCol = collection(db, 'siswa');
const indikatorCol = collection(db, 'indikator');
const penilaianCol = collection(db, 'penilaian');
const settingsCol = collection(db, 'settings');
const openMonthsRef = doc(settingsCol, 'openMonths');

// Firestore batch write dibatasi 500 operasi - kirim per potongan supaya aman untuk data besar.
async function batchWriteAll(docs: { ref: ReturnType<typeof doc>; data: any }[]) {
  const chunkSize = 450;
  for (let i = 0; i < docs.length; i += chunkSize) {
    const batch = writeBatch(db);
    docs.slice(i, i + chunkSize).forEach(({ ref, data }) => batch.set(ref, data));
    await batch.commit();
  }
}

export const StorageService = {
  // Seed Firestore SEKALI SAJA saat koleksi masih benar-benar kosong (database baru). Setelah itu
  // tidak pernah menimpa data lagi - CRUD lewat aplikasi jadi satu-satunya sumber kebenaran.
  async ensureSeeded(): Promise<void> {
    const siswaSnap = await getDocs(siswaCol);
    if (siswaSnap.empty) {
      await batchWriteAll(
        INITIAL_SISWA.map((s) => ({ ref: doc(siswaCol, s.id), data: s }))
      );
    }

    const indikatorSnap = await getDocs(indikatorCol);
    if (indikatorSnap.empty) {
      await batchWriteAll(
        INITIAL_INDIKATOR.map((i) => ({ ref: doc(indikatorCol, i.id), data: i }))
      );
    }
  },

  // --- Siswa (real-time) ---
  subscribeSiswa(callback: (list: Siswa[]) => void, onError?: (err: Error) => void): () => void {
    return onSnapshot(
      siswaCol,
      (snap) => callback(snap.docs.map((d) => d.data() as Siswa)),
      onError
    );
  },

  async addSiswa(newSiswa: Omit<Siswa, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    const id = `siswa-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const timestamp = new Date().toISOString();
    const created: Siswa = { ...newSiswa, id, createdAt: timestamp, updatedAt: timestamp };
    await setDoc(doc(siswaCol, id), created);
  },

  async updateSiswa(updated: Siswa): Promise<void> {
    const record = { ...updated, updatedAt: new Date().toISOString() };
    await setDoc(doc(siswaCol, updated.id), record);

    // Kalau nomor kamar berubah, sinkronkan ke SEMUA record penilaian bulanan siswa ini.
    const q = query(penilaianCol, where('siswaId', '==', updated.id));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const batch = writeBatch(db);
      snap.docs.forEach((d) => batch.update(d.ref, { kamar: updated.kamar }));
      await batch.commit();
    }
  },

  async deleteSiswa(id: string): Promise<void> {
    await deleteDoc(doc(siswaCol, id));

    const q = query(penilaianCol, where('siswaId', '==', id));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const batch = writeBatch(db);
      snap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }
  },

  // --- Indikator (real-time) ---
  subscribeIndikator(callback: (list: Indikator[]) => void, onError?: (err: Error) => void): () => void {
    return onSnapshot(
      indikatorCol,
      (snap) => {
        const list = snap.docs.map((d) => d.data() as Indikator);
        callback(list.sort((a, b) => a.urutan - b.urutan));
      },
      onError
    );
  },

  async updateIndikator(updated: Indikator): Promise<void> {
    await updateDoc(doc(indikatorCol, updated.id), {
      ...updated,
      updatedAt: new Date().toISOString(),
    } as any);
  },

  async addIndikator(data: { nama: string; deskripsi: string }): Promise<void> {
    const snap = await getDocs(indikatorCol);
    const list = snap.docs.map((d) => d.data() as Indikator);
    const nextUrutan = list.length > 0 ? Math.max(...list.map((i) => i.urutan)) + 1 : 1;
    const id = `ind-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const created: Indikator = {
      id,
      urutan: nextUrutan,
      nama: data.nama,
      deskripsi: data.deskripsi,
      opsiNilai: [],
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(indikatorCol, id), created);
  },

  async deleteIndikator(id: string): Promise<void> {
    await deleteDoc(doc(indikatorCol, id));
  },

  async resetIndikator(): Promise<void> {
    const snap = await getDocs(indikatorCol);
    const batch = writeBatch(db);
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
    await batchWriteAll(
      INITIAL_INDIKATOR.map((i) => ({ ref: doc(indikatorCol, i.id), data: i }))
    );
  },

  // --- Penilaian (real-time) ---
  subscribePenilaian(callback: (list: Penilaian[]) => void, onError?: (err: Error) => void): () => void {
    return onSnapshot(
      penilaianCol,
      (snap) => callback(snap.docs.map((d) => d.data() as Penilaian)),
      onError
    );
  },

  async savePenilaian(
    penilaianData: Omit<Penilaian, 'updatedAt' | 'lengkap' | 'id'>
  ): Promise<void> {
    const indikatorSnap = await getDocs(indikatorCol);
    const indikatorList = indikatorSnap.docs.map((d) => d.data() as Indikator);
    const isComplete = isPenilaianLengkap(penilaianData.nilai, indikatorList);
    const id = `${penilaianData.siswaId}__${penilaianData.bulan}`;

    const record: Penilaian = {
      ...penilaianData,
      id,
      lengkap: isComplete,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(penilaianCol, id), record);
  },

  // --- Bulan penilaian yang dibuka admin (real-time) ---
  subscribeOpenMonths(
    callback: (months: AssessmentMonth[]) => void,
    onError?: (err: Error) => void
  ): () => void {
    return onSnapshot(
      openMonthsRef,
      (snap) => {
        const data = snap.data();
        callback(Array.isArray(data?.months) ? data.months : []);
      },
      onError
    );
  },

  async toggleOpenMonth(bulan: AssessmentMonth): Promise<void> {
    const snap = await getDoc(openMonthsRef);
    const current: AssessmentMonth[] = snap.exists() && Array.isArray(snap.data()?.months)
      ? snap.data()!.months
      : [];
    const next = current.includes(bulan)
      ? current.filter((m) => m !== bulan)
      : [...current, bulan];
    await setDoc(openMonthsRef, { months: next });
  },

  // --- Sesi login: TETAP di localStorage - memang khusus per-device, bukan data yang dibagi ---
  getSession(): AuthSession | null {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  saveSession(session: AuthSession): void {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  },

  clearSession(): void {
    localStorage.removeItem(SESSION_KEY);
  },

  // --- Export CSV: bekerja dari data yang SUDAH dimuat di komponen (bukan fetch ulang), supaya
  // ekspor otomatis terbatas sesuai scope pemanggilnya (mentor cuma kelompoknya, admin semua). ---
  generateCSVData(
    siswaList: Siswa[],
    indikatorList: Indikator[],
    penilaianList: Penilaian[],
    bulan: AssessmentMonth
  ): { headers: string[]; rows: (string | number)[][] } {
    const bulanPenilaian = penilaianList.filter((p) => p.bulan === bulan);

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
      'Catatan',
    ];

    const mentees = siswaList.filter((s) => s.status === 'Mentee');
    const rows = mentees.map((mentee, index) => {
      const p = bulanPenilaian.find((item) => item.siswaId === mentee.id);
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
        p?.catatan || '-',
      ];
    });

    return { headers, rows };
  },

  exportToCSV(
    siswaList: Siswa[],
    indikatorList: Indikator[],
    penilaianList: Penilaian[],
    bulan: AssessmentMonth
  ): void {
    const { headers, rows } = this.generateCSVData(siswaList, indikatorList, penilaianList, bulan);
    const csvRows: string[] = [];

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

    const csvContent = '﻿' + csvRows.join('\r\n');
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
