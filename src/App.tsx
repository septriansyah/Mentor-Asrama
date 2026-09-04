import React, { useState, useEffect } from 'react';
import { ActiveRole, Siswa, Indikator, Penilaian, AssessmentMonth } from './types';
import { StorageService } from './services/storage';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/landing/LandingPage';
import { MentorLogin } from './components/MentorLogin';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { MentorDashboard } from './components/mentor/MentorDashboard';

type Route = 'none' | 'admin' | 'mentor';

function detectRoute(): Route {
  const hash = window.location.hash.toLowerCase();
  const pathname = window.location.pathname.toLowerCase();
  if (hash === '#admin' || pathname.endsWith('/admin') || pathname.includes('/admin/')) {
    return 'admin';
  }
  // #mentor ATAU #mentor/<kamar> (mis. #mentor/212) supaya URL dashboard mentor tetap
  // menampilkan identitasnya, bukan cuma balik ke root.
  if (hash === '#mentor' || hash.startsWith('#mentor/') || pathname.endsWith('/mentor') || pathname.includes('/mentor/')) {
    return 'mentor';
  }
  return 'none';
}

function clearRoute() {
  window.history.replaceState(null, '', window.location.pathname);
}

export default function App() {
  const [activeRole, setActiveRole] = useState<ActiveRole>('none');
  const [currentMentor, setCurrentMentor] = useState<Siswa | null>(null);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);

  // Route state - #admin dan #mentor masing-masing punya halaman login sendiri (bukan modal)
  const [route, setRoute] = useState<Route>('none');

  // Core collections data state
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [indikatorList, setIndikatorList] = useState<Indikator[]>([]);
  const [penilaianList, setPenilaianList] = useState<Penilaian[]>([]);
  const [openMonths, setOpenMonths] = useState<AssessmentMonth[]>([]);

  // Pantau URL untuk #admin / #mentor
  useEffect(() => {
    const handleRouteChange = () => setRoute(detectRoute());
    handleRouteChange();
    window.addEventListener('hashchange', handleRouteChange);
    window.addEventListener('popstate', handleRouteChange);
    return () => {
      window.removeEventListener('hashchange', handleRouteChange);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  // Load initial data
  const refreshData = () => {
    setSiswaList(StorageService.getSiswa());
    setIndikatorList(StorageService.getIndikator());
    setPenilaianList(StorageService.getPenilaian());
    setOpenMonths(StorageService.getOpenMonths());
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Pulihkan sesi login yang tersimpan (kalau ada) - jadi refresh halaman TIDAK logout otomatis.
  // Hanya jalan sekali di awal, setelah data siswa termuat.
  useEffect(() => {
    const session = StorageService.getSession();
    if (!session) return;

    if (session.role === 'admin' && session.adminEmail) {
      setAdminEmail(session.adminEmail);
      setActiveRole('admin');
    } else if (session.role === 'mentor' && session.mentorId) {
      const mentor = StorageService.getSiswa().find((s) => s.id === session.mentorId);
      if (mentor) {
        setCurrentMentor(mentor);
        setActiveRole('mentor');
      } else {
        // Mentor sudah tidak ada di data (dihapus admin) - sesi lama tidak valid lagi
        StorageService.clearSession();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter available mentors for quick login & selection
  const availableMentors = siswaList.filter((s) => s.status === 'Mentor');

  // Handle Admin Login Success
  const handleAdminLoginSuccess = (email: string) => {
    setAdminEmail(email);
    setActiveRole('admin');
    StorageService.saveSession({ role: 'admin', adminEmail: email });
  };

  // Handle Mentor Login Success
  const handleMentorLoginSuccess = (mentor: Siswa) => {
    setCurrentMentor(mentor);
    setActiveRole('mentor');
    StorageService.saveSession({ role: 'mentor', mentorId: mentor.id });
    // URL jadi #mentor/<kamar> supaya jelas ini dashboard mentor kamar berapa, bukan cuma root.
    window.history.replaceState(null, '', `${window.location.pathname}#mentor/${mentor.kamar}`);
  };

  // Handle Logout - ini satu-satunya cara sesi berakhir
  const handleLogout = () => {
    setActiveRole('none');
    setCurrentMentor(null);
    setAdminEmail(null);
    StorageService.clearSession();
    clearRoute();
    setRoute('none');
  };

  // Data mutation handlers
  const handleAddSiswa = (newSiswa: Omit<Siswa, 'id' | 'createdAt' | 'updatedAt'>) => {
    StorageService.addSiswa(newSiswa);
    refreshData();
  };

  const handleUpdateSiswa = (updatedSiswa: Siswa) => {
    StorageService.updateSiswa(updatedSiswa);
    refreshData();
    if (currentMentor && currentMentor.id === updatedSiswa.id) {
      setCurrentMentor(updatedSiswa);
    }
  };

  const handleDeleteSiswa = (id: string) => {
    StorageService.deleteSiswa(id);
    refreshData();
    if (currentMentor && currentMentor.id === id) {
      handleLogout();
    }
  };

  const handleUpdateIndikator = (updatedInd: Indikator) => {
    StorageService.updateIndikator(updatedInd);
    refreshData();
  };

  const handleAddIndikator = (data: { nama: string; deskripsi: string }) => {
    StorageService.addIndikator(data);
    refreshData();
  };

  const handleDeleteIndikator = (id: string) => {
    StorageService.deleteIndikator(id);
    refreshData();
  };

  const handleResetIndikator = () => {
    StorageService.resetIndikator();
    refreshData();
  };

  const handleSavePenilaian = (data: Omit<Penilaian, 'updatedAt' | 'lengkap' | 'id'>) => {
    StorageService.savePenilaian(data);
    refreshData();
  };

  const handleToggleOpenMonth = (bulan: AssessmentMonth) => {
    StorageService.toggleOpenMonth(bulan);
    refreshData();
  };

  const handleResetData = () => {
    refreshData();
    if (activeRole === 'mentor') {
      const freshList = StorageService.getSiswa();
      const stillThere = freshList.find((s) => s.id === currentMentor?.id);
      if (stillThere) {
        setCurrentMentor(stillThere);
      } else {
        handleLogout();
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      {/* Case 1: Active Admin Session */}
      {activeRole === 'admin' && (
        <>
          <Navbar
            activeRole={activeRole}
            currentMentor={currentMentor}
            adminEmail={adminEmail}
            onLogout={handleLogout}
            onResetData={handleResetData}
          />
          <main className="flex-1 pb-16">
            <AdminDashboard
              siswaList={siswaList}
              indikatorList={indikatorList}
              penilaianList={penilaianList}
              onAddSiswa={handleAddSiswa}
              onUpdateSiswa={handleUpdateSiswa}
              onDeleteSiswa={handleDeleteSiswa}
              onUpdateIndikator={handleUpdateIndikator}
              onAddIndikator={handleAddIndikator}
              onDeleteIndikator={handleDeleteIndikator}
              onResetIndikator={handleResetIndikator}
              onSavePenilaian={handleSavePenilaian}
              openMonths={openMonths}
              onToggleOpenMonth={handleToggleOpenMonth}
            />
          </main>
        </>
      )}

      {/* Case 2: Active Mentor Session */}
      {activeRole === 'mentor' && currentMentor && (
        <>
          <Navbar
            activeRole={activeRole}
            currentMentor={currentMentor}
            adminEmail={adminEmail}
            onLogout={handleLogout}
            onResetData={handleResetData}
          />
          <main className="flex-1 pb-16">
            <MentorDashboard
              currentMentor={currentMentor}
              allSiswa={siswaList}
              indikatorList={indikatorList}
              penilaianList={penilaianList}
              onSavePenilaian={handleSavePenilaian}
              openMonths={openMonths}
            />
          </main>
        </>
      )}

      {/* Case 3: Admin login page - URL #admin, belum ada sesi admin aktif */}
      {activeRole === 'none' && route === 'admin' && (
        <AdminLogin
          onSuccess={handleAdminLoginSuccess}
          onBack={() => {
            clearRoute();
            setRoute('none');
          }}
        />
      )}

      {/* Case 4: Mentor login page - URL #mentor, halaman sendiri (bukan modal di atas landing page) */}
      {activeRole === 'none' && route === 'mentor' && (
        <MentorLogin
          mentors={availableMentors}
          onSuccess={handleMentorLoginSuccess}
          onBack={() => {
            clearRoute();
            setRoute('none');
          }}
        />
      )}

      {/* Case 5: Public Front Page */}
      {activeRole === 'none' && route === 'none' && (
        <LandingPage
          onOpenMentorLogin={() => {
            window.location.hash = 'mentor';
          }}
        />
      )}
    </div>
  );
}
