import React, { useState, useMemo } from 'react';
import { Users, DoorClosed, ArrowLeft, AlertCircle, Sparkles, Check, ChevronDown } from 'lucide-react';
import { Siswa } from '../types';

interface MentorLoginProps {
  mentors: Siswa[];
  onSuccess: (mentor: Siswa) => void;
  onBack: () => void;
}

export const MentorLogin: React.FC<MentorLoginProps> = ({ mentors, onSuccess, onBack }) => {
  const [nama, setNama] = useState('');
  const [kamar, setKamar] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Filter autocomplete suggestions based on what the user types
  const filteredSuggestions = useMemo(() => {
    const q = nama.trim().toLowerCase();
    if (!q) return mentors;
    return mentors.filter((m) => m.nama.toLowerCase().includes(q));
  }, [mentors, nama]);

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

  const handleSelectMentor = (mentor: Siswa) => {
    setNama(mentor.nama);
    setKamar(mentor.kamar);
    setShowSuggestions(false);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-maroon-900 to-maroon-700 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto">
      {/* Back button */}
      <button
        id="btn-back-to-roles-mentor"
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cream-100 hover:text-white transition-colors mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Beranda Utama</span>
      </button>

      {/* Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-maroon-600 text-white flex items-center justify-center mx-auto mb-3 shadow-xs">
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
          {/* Nama Mentor with Autocomplete */}
          <div className="relative">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700" htmlFor="mentor-nama">
                Nama Mentor
              </label>
              <button
                type="button"
                onClick={() => setShowSuggestions((prev) => !prev)}
                className="text-[11px] text-maroon-600 hover:text-maroon-800 font-medium flex items-center gap-0.5 cursor-pointer"
              >
                <span>Lihat daftar mentor</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Users className="w-4 h-4" />
              </div>
              <input
                id="mentor-nama"
                type="text"
                value={nama}
                onChange={(e) => {
                  setNama(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Contoh: Arifinsyah Julitama Hasibuan"
                required
                className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-slate-50 focus:bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-maroon-500 focus:border-maroon-500 outline-hidden transition-colors"
                autoComplete="off"
              />
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto divide-y divide-slate-100">
                <div className="p-1.5 bg-slate-50 text-[11px] font-semibold text-slate-500 px-3">
                  Pilih Mentor Terdaftar:
                </div>
                {filteredSuggestions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectMentor(item)}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-maroon-50 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div>
                      <div className="font-semibold text-slate-800">{item.nama}</div>
                      <div className="text-[11px] text-slate-500">Angkatan {item.angkatan}</div>
                    </div>
                    <span className="bg-maroon-100 text-maroon-800 font-medium px-2 py-0.5 rounded text-[11px]">
                      Kamar {item.kamar}
                    </span>
                  </button>
                ))}
              </div>
            )}
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
                className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-slate-50 focus:bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-maroon-500 focus:border-maroon-500 outline-hidden transition-colors"
              />
            </div>
          </div>

          <button
            id="btn-mentor-submit"
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-maroon-600 text-white font-medium text-sm hover:bg-maroon-700 transition-colors shadow-xs flex items-center justify-center cursor-pointer"
          >
            Masuk ke Kamar Mentee
          </button>
        </form>

        {/* Quick click suggestions for testing */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="flex items-center gap-1.5 mb-2.5 text-xs text-slate-500">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-medium">Pilih cepat mentor untuk uji coba:</span>
          </div>
          <div className="space-y-1.5">
            {mentors.slice(0, 3).map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => handleSelectMentor(m)}
                className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg border border-slate-200 hover:border-maroon-400 hover:bg-maroon-50/40 text-xs transition-colors text-left cursor-pointer"
              >
                <span className="font-medium text-slate-700">{m.nama}</span>
                <span className="text-[11px] font-semibold text-maroon-600 bg-maroon-50 px-2 py-0.5 rounded">
                  Kamar {m.kamar}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};
