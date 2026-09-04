import React from 'react';
import { ShieldCheck, UserCheck, LogOut, RotateCcw, ArrowLeft } from 'lucide-react';
import { ActiveRole, Siswa } from '../types';
import { StorageService } from '../services/storage';

interface NavbarProps {
  activeRole: ActiveRole;
  currentMentor: Siswa | null;
  adminEmail: string | null;
  onLogout: () => void;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeRole,
  currentMentor,
  adminEmail,
  onLogout,
  onResetData,
}) => {
  return (
    <header className="bg-maroon-700 text-white sticky top-0 z-30 shadow-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand logo & title */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-2 text-left cursor-pointer group"
              title="Kembali ke Beranda"
            >
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black tracking-tighter text-white uppercase italic group-hover:text-gold-300 transition-colors">
                  INSPIRE
                </span>
                <span className="w-2 h-2 rounded-full bg-gold-300 shadow-[0_0_8px_#f0c419]" />
              </div>
              <div className="hidden sm:block pl-2 border-l border-white/20">
                <p className="text-[11px] text-cream-100 font-semibold tracking-wide uppercase">
                  {activeRole === 'admin' ? 'Portal Administrator' : 'Portal Penilaian Mentor'}
                </p>
              </div>
            </button>
          </div>

          {/* User state and actions */}
          <div className="flex items-center gap-3">
            {activeRole === 'admin' && (
              <div className="flex items-center gap-2 bg-white/10 text-white text-xs px-3 py-1.5 rounded-full border border-white/15">
                <ShieldCheck className="w-4 h-4 text-gold-300" />
                <span className="font-medium hidden sm:inline">Admin:</span>
                <span className="font-bold text-gold-300">{adminEmail || 'Admin'}</span>
              </div>
            )}

            {activeRole === 'mentor' && currentMentor && (
              <div className="flex items-center gap-2 bg-white/10 text-white text-xs px-3 py-1.5 rounded-full border border-white/15">
                <UserCheck className="w-4 h-4 text-gold-300" />
                <div className="flex items-center gap-1.5">
                  <span className="font-bold truncate max-w-[120px] sm:max-w-[180px]">
                    {currentMentor.nama}
                  </span>
                  <span className="bg-gold-300 text-slate-950 font-black px-2 py-0.5 rounded-full text-[10px]">
                    Kamar {currentMentor.kamar}
                  </span>
                </div>
              </div>
            )}

            {activeRole !== 'none' && (
              <button
                id="btn-logout"
                type="button"
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white/90 hover:text-white bg-white/10 hover:bg-red-600/80 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                title="Keluar ke Halaman Utama"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            )}

            {/* Quick Reset Demo Data Option */}
            <button
              id="btn-reset-demo"
              type="button"
              onClick={() => {
                if (window.confirm('Reset seluruh data siswa, indikator, dan nilai ke data awal (411 siswa)? Semua nilai yang sudah diisi akan hilang.')) {
                  StorageService.resetData();
                  onResetData();
                }
              }}
              className="text-xs text-gold-100 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              title="Reset ke data awal (411 siswa)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
