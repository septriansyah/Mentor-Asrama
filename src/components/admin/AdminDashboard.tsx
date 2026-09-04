import React, { useState } from 'react';
import { Users, Sliders, ClipboardList, ShieldCheck } from 'lucide-react';
import { Siswa, Indikator, Penilaian, AdminTab, AssessmentMonth } from '../../types';
import { SiswaTab } from './SiswaTab';
import { IndikatorTab } from './IndikatorTab';
import { SemuaPenilaianTab } from './SemuaPenilaianTab';

interface AdminDashboardProps {
  siswaList: Siswa[];
  indikatorList: Indikator[];
  penilaianList: Penilaian[];
  onAddSiswa: (data: Omit<Siswa, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateSiswa: (data: Siswa) => void;
  onDeleteSiswa: (id: string) => void;
  onUpdateIndikator: (item: Indikator) => void;
  onAddIndikator: (data: { nama: string; deskripsi: string }) => void;
  onDeleteIndikator: (id: string) => void;
  onResetIndikator: () => void;
  onSavePenilaian?: (data: Omit<Penilaian, 'updatedAt' | 'lengkap' | 'id'>) => void;
  openMonths: AssessmentMonth[];
  onToggleOpenMonth: (bulan: AssessmentMonth) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  siswaList,
  indikatorList,
  penilaianList,
  onAddSiswa,
  onUpdateSiswa,
  onDeleteSiswa,
  onUpdateIndikator,
  onAddIndikator,
  onDeleteIndikator,
  onResetIndikator,
  onSavePenilaian,
  openMonths,
  onToggleOpenMonth,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('siswa');

  const navItems: { id: AdminTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'siswa', label: 'Data Siswa', icon: Users },
    { id: 'indikator', label: 'Indikator Penilaian', icon: Sliders },
    { id: 'penilaian', label: 'Semua Penilaian', icon: ClipboardList },
  ];

  return (
    <div className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Banner */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Dashboard Administrator</h2>
            <span className="text-xs bg-navy-900 text-white font-medium px-2 py-0.5 rounded-md">
              Master Control
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Kelola master siswa, indikator evaluasi, dan rekap nilai lintas kamar per bulan.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Navigation Sidebar (Desktop) / Horizontal Tabs (Mobile) */}
        <aside className="md:w-60 shrink-0">
          <nav className="bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs space-y-1 flex md:flex-col overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`tab-admin-${item.id}`}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-navy-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          {activeTab === 'siswa' && (
            <SiswaTab
              siswaList={siswaList}
              onAddSiswa={onAddSiswa}
              onUpdateSiswa={onUpdateSiswa}
              onDeleteSiswa={onDeleteSiswa}
            />
          )}

          {activeTab === 'indikator' && (
            <IndikatorTab
              indikatorList={indikatorList}
              onUpdateIndikator={onUpdateIndikator}
              onAddIndikator={onAddIndikator}
              onDeleteIndikator={onDeleteIndikator}
              onResetIndikator={onResetIndikator}
            />
          )}

          {activeTab === 'penilaian' && (
            <SemuaPenilaianTab
              siswaList={siswaList}
              indikatorList={indikatorList}
              penilaianList={penilaianList}
              onSavePenilaian={onSavePenilaian}
              openMonths={openMonths}
              onToggleOpenMonth={onToggleOpenMonth}
            />
          )}
        </main>
      </div>
    </div>
  );
};
