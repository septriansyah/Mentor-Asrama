import React, { useState } from 'react';
import { Users, DoorClosed, ArrowLeft, AlertCircle } from 'lucide-react';
import { Siswa } from '../types';
import logoFull from '../assets/logo-full.png';

interface MentorLoginProps {
  mentors: Siswa[];
  onSuccess: (mentor: Siswa) => void;
  onBack: () => void;
}

export const MentorLogin: React.FC<MentorLoginProps> = ({ mentors, onSuccess, onBack }) => {
  const [nama, setNama] = useState('');
  const [kamar, setKamar] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanNama = nama.trim().toLowerCase();
    const cleanKamar = kamar.trim();

    if (!cleanNama || !cleanKamar) {
      setError('Nama Mentor dan Nomor Kamar wajib diisi.');
      return;
    }

    // Sistem cari di siswa dengan status == "Mentor", nama cocok (case-insensitive & trim), kamar exact match
    const matchedMentor = mentors.find(
      (m) =>
        m.status === 'Mentor' &&
        m.nama.trim().toLowerCase() === cleanNama &&
        m.kamar.trim() === cleanKamar
    );

    if (matchedMentor) {
      onSuccess(matchedMentor);
    } else {
      // Check if mentor exists with that name but different room to give a helpful specific hint
      const mentorWithSameName = mentors.find(
        (m) => m.status === 'Mentor' && m.nama.trim().toLowerCase() === cleanNama
      );
      if (mentorWithSameName) {
        setError(
          `Nama "${mentorWithSameName.nama}" ditemukan, tetapi nomor kamar tidak cocok (bukan kamar ${cleanKamar}). Silakan periksa nomor kamar Anda.`
        );
      } else {
        setError(
          'Kombinasi Nama Mentor dan Nomor Kamar tidak ditemukan di database. Pastikan nama terdaftar sebagai Mentor dan nomor kamar sesuai.'
        );
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-navy-900 to-navy-700 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto">
      {/* Back button */}
      <button
        id="btn-back-to-roles-mentor"
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ice-100 hover:text-white transition-colors mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Beranda Utama</span>
      </button>

      {/* Logo */}
      <div className="flex justify-center mb-6">
        <div className="bg-white rounded-xl px-4 py-2 shadow-md">
          <img src={logoFull} alt="Satyasena" className="h-8 w-auto" />
        </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-navy-600 text-white flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Users className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Masuk sebagai Mentor</h2>
          <p className="text-xs text-slate-500 mt-1">
            Masukkan Nama Lengkap dan Nomor Kamar dampingan Anda
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nama Mentor */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="mentor-nama">
              Nama Mentor
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Users className="w-4 h-4" />
              </div>
              <input
                id="mentor-nama"
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Contoh: Arifinsyah Julitama Hasibuan"
                required
                className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-slate-50 focus:bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-navy-500 focus:border-navy-500 outline-hidden transition-colors"
                autoComplete="off"
              />
            </div>
          </div>

          {/* Nomor Kamar */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="mentor-kamar">
              Nomor Kamar
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <DoorClosed className="w-4 h-4" />
              </div>
              <input
                id="mentor-kamar"
                type="text"
                value={kamar}
                onChange={(e) => setKamar(e.target.value)}
                placeholder="Contoh: 212"
                required
                className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-slate-50 focus:bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-navy-500 focus:border-navy-500 outline-hidden transition-colors"
              />
            </div>
          </div>

          <button
            id="btn-mentor-submit"
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-navy-600 text-white font-medium text-sm hover:bg-navy-700 transition-colors shadow-xs flex items-center justify-center cursor-pointer"
          >
            Masuk ke Kamar Mentee
          </button>
        </form>
      </div>
      </div>
    </div>
  );
};
