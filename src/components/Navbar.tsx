import React from 'react';
import { ShieldCheck, UserCheck, LogOut } from 'lucide-react';
import { ActiveRole, Siswa } from '../types';
import logoFull from '../assets/logo-full.png';

interface NavbarProps {
  activeRole: ActiveRole;
  currentMentor: Siswa | null;
  adminEmail: string | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeRole,
  currentMentor,
  adminEmail,
  onLogout,
}) => {
  return (
    <header className="bg-navy-700 text-white sticky top-0 z-30 shadow-md border-b border-white/10">
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
              <div className="bg-white rounded-lg px-2 py-1 shadow-xs group-hover:shadow-sm transition-shadow">
                <img src={logoFull} alt="Satyasena" className="h-5 sm:h-6 w-auto" />
              </div>
              <div className="hidden sm:block pl-2 border-l border-white/20">
                <p className="text-[11px] text-ice-100 font-semibold tracking-wide uppercase">
                  {activeRole === 'admin' ? 'Portal Administrator' : 'Portal Penilaian Mentor'}
                </p>
              </div>
            </button>
          </div>

          {/* User state and actions */}
          <div className="flex items-center gap-3">
            {activeRole === 'admin' && (
              <div className="flex items-center gap-2 bg-white/10 text-white text-xs px-3 py-1.5 rounded-full border border-white/15">
                <ShieldCheck className="w-4 h-4 text-sky-300" />
                <span className="font-medium hidden sm:inline">Admin:</span>
                <span className="font-bold text-sky-300">{adminEmail || 'Admin'}</span>
              </div>
            )}

            {activeRole === 'mentor' && currentMentor && (
              <div className="flex items-center gap-2 bg-white/10 text-white text-xs px-3 py-1.5 rounded-full border border-white/15">
                <UserCheck className="w-4 h-4 text-sky-300" />
                <div className="flex items-center gap-1.5">
                  <span className="font-bold truncate max-w-[120px] sm:max-w-[180px]">
                    {currentMentor.nama}
                  </span>
                  <span className="bg-sky-300 text-slate-950 font-black px-2 py-0.5 rounded-full text-[10px]">
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
          </div>
        </div>
      </div>
    </header>
  );
};
