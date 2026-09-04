import React, { useState } from 'react';
import { Shield, Lock, Mail, ArrowLeft, AlertCircle } from 'lucide-react';
import logoFull from '../assets/logo-full.png';

const ADMIN_EMAIL = 'admin@mentor.id';
const ADMIN_PASSWORD = 'SPM-Adm1n#2026';

interface AdminLoginProps {
  onSuccess: (email: string) => void;
  onBack: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setError('Email dan password wajib diisi.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      // Cocokkan persis email DAN password - tidak ada jalan pintas.
      if (cleanEmail.toLowerCase() === ADMIN_EMAIL && cleanPassword === ADMIN_PASSWORD) {
        onSuccess(cleanEmail);
      } else {
        setError('Email atau password salah.');
      }
    }, 300);
  };

  return (
    <div className="min-h-screen bg-navy-900 text-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto space-y-6">
        {/* Back button */}
        <button
          id="btn-back-to-home"
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda Utama</span>
        </button>

        {/* Logo */}
        <div className="flex justify-center">
          <div className="bg-white rounded-xl px-4 py-2 shadow-md">
            <img src={logoFull} alt="Satyasena" className="h-8 w-auto" />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
          <div className="bg-navy-700 text-white p-6 text-center relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-sky-300/20 blur-xl pointer-events-none" />

            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md text-sky-300 flex items-center justify-center mx-auto mb-3 shadow-xs">
              <Shield className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black uppercase tracking-tight text-white">
              Portal Administrator
            </h2>
            <p className="text-xs text-ice-100 mt-1">
              Area Khusus Pengelola & Master Control
            </p>
          </div>

          <div className="p-6 sm:p-8">
            {error && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5" htmlFor="admin-email">
                  Email Administrator
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="admin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@mentor.id"
                    required
                    className="w-full pl-10 pr-3.5 py-3 text-sm bg-slate-50 focus:bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-navy-700 focus:border-navy-700 outline-hidden transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5" htmlFor="admin-password">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="admin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-3.5 py-3 text-sm bg-slate-50 focus:bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-navy-700 focus:border-navy-700 outline-hidden transition-colors"
                  />
                </div>
              </div>

              <button
                id="btn-admin-submit"
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-navy-700 hover:bg-navy-800 text-white font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center cursor-pointer disabled:opacity-50 mt-2"
              >
                {isLoading ? 'Memverifikasi...' : 'Masuk Master Control'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
