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
  const [currentMentorId, setCurrentMentorId] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);

  // Route state - #admin dan #mentor masing-masing punya halaman login sendiri (bukan modal)
  const [route, setRoute] = useState<Route>('none');

  // Core collections - sekarang live dari Firestore (real-time, dibagi semua device)
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [indikatorList, setIndikatorList] = useState<Indikator[]>([]);
  const [penilaianList, setPenilaianList] = useState<Penilaian[]>([]);
  const [openMonths, setOpenMonths] = useState<AssessmentMonth[]>([]);

  const [loaded, setLoaded] = useState({ siswa: false, indikator: false, penilaian: false, bulan: false });
  const [firestoreError, setFirestoreError] = useState<string | null>(null);
  const isDataLoading = !(loaded.siswa && loaded.indikator && loaded.penilaian && loaded.bulan);

  // currentMentor selalu diturunkan dari siswaList yang live - otomatis ikut ter-update kalau
  // datanya berubah (atau otomatis jadi null kalau akunnya dihapus admin), tanpa perlu disinkron manual.
  const currentMentor = siswaList.find((s) => s.id === currentMentorId) || null;

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

  // Seed Firestore sekali (kalau masih kosong total) lalu pasang listener real-time untuk semua
  // koleksi. Setiap perubahan dari device/mentor/admin manapun langsung terpantul ke semua device lain.
  useEffect(() => {
    let cancelled = false;

    StorageService.ensureSeeded().catch((err) => {
      if (!cancelled) {
        setFirestoreError(
          'Gagal menghubungi Firestore. Periksa konfigurasi Firebase (VITE_FIREBASE_*) di file .env.local.'
        );
      }
      console.error('ensureSeeded error:', err);
    });

    const onError = (label: string) => (err: Error) => {
      setFirestoreError(
        'Gagal menghubungi Firestore. Periksa konfigurasi Firebase (VITE_FIREBASE_*) dan aturan keamanan (firestore.rules).'
      );
      console.error(`${label} subscription error:`, err);
    };

    const unsubSiswa = StorageService.subscribeSiswa((list) => {
      setSiswaList(list);
      setLoaded((prev) => ({ ...prev, siswa: true }));
    }, onError('siswa'));
    const unsubIndikator = StorageService.subscribeIndikator((list) => {
      setIndikatorList(list);
      setLoaded((prev) => ({ ...prev, indikator: true }));
    }, onError('indikator'));
    const unsubPenilaian = StorageService.subscribePenilaian((list) => {
      setPenilaianList(list);
      setLoaded((prev) => ({ ...prev, penilaian: true }));
    }, onError('penilaian'));
    const unsubOpenMonths = StorageService.subscribeOpenMonths((months) => {
      setOpenMonths(months);
      setLoaded((prev) => ({ ...prev, bulan: true }));
    }, onError('openMonths'));

    return () => {
      cancelled = true;
      unsubSiswa();
      unsubIndikator();
      unsubPenilaian();
      unsubOpenMonths();
    };
  }, []);

  // Pulihkan sesi login yang tersimpan (kalau ada) - jadi refresh halaman TIDAK logout otomatis.
  // Hanya jalan sekali di awal; currentMentor akan otomatis terisi begitu siswaList termuat.
  useEffect(() => {
    const session = StorageService.getSession();
    if (!session) return;

    if (session.role === 'admin' && session.adminEmail) {
      setAdminEmail(session.adminEmail);
      setActiveRole('admin');
    } else if (session.role === 'mentor' && session.mentorId) {
      setCurrentMentorId(session.mentorId);
      setActiveRole('mentor');
    }
  }, []);

  // Kalau mentor yang sedang login datanya dihapus admin (siswaList berubah, currentMentor jadi
  // null), otomatis logout - jangan biarkan mentor "menggantung" di dashboard tanpa data.
  useEffect(() => {
    if (!isDataLoading && activeRole === 'mentor' && currentMentorId && !currentMentor) {
      handleLogout();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDataLoading, activeRole, currentMentorId, currentMentor]);

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
    setCurrentMentorId(mentor.id);
    setActiveRole('mentor');
    StorageService.saveSession({ role: 'mentor', mentorId: mentor.id });
    // URL jadi #mentor/<kamar> supaya jelas ini dashboard mentor kamar berapa, bukan cuma root.
    window.history.replaceState(null, '', `${window.location.pathname}#mentor/${mentor.kamar}`);
  };

  // Handle Logout - ini satu-satunya cara sesi berakhir
  function handleLogout() {
    setActiveRole('none');
    setCurrentMentorId(null);
    setAdminEmail(null);
    StorageService.clearSession();
    clearRoute();
    setRoute('none');
  }

  // Data mutation handlers - tidak perlu refresh manual lagi, listener real-time otomatis update UI
  const handleAddSiswa = (newSiswa: Omit<Siswa, 'id' | 'createdAt' | 'updatedAt'>) => {
    StorageService.addSiswa(newSiswa).catch((err) => console.error('addSiswa failed:', err));
  };

  const handleUpdateSiswa = (updatedSiswa: Siswa) => {
    StorageService.updateSiswa(updatedSiswa).catch((err) => console.error('updateSiswa failed:', err));
  };

  const handleDeleteSiswa = (id: string) => {
    StorageService.deleteSiswa(id).catch((err) => console.error('deleteSiswa failed:', err));
  };

  const handleUpdateIndikator = (updatedInd: Indikator) => {
    StorageService.updateIndikator(updatedInd).catch((err) => console.error('updateIndikator failed:', err));
  };

  const handleAddIndikator = (data: { nama: string; deskripsi: string }) => {
    StorageService.addIndikator(data).catch((err) => console.error('addIndikator failed:', err));
  };

  const handleDeleteIndikator = (id: string) => {
    StorageService.deleteIndikator(id).catch((err) => console.error('deleteIndikator failed:', err));
  };

  const handleResetIndikator = () => {
    StorageService.resetIndikator().catch((err) => console.error('resetIndikator failed:', err));
  };

  const handleSavePenilaian = (data: Omit<Penilaian, 'updatedAt' | 'lengkap' | 'id'>) => {
    StorageService.savePenilaian(data).catch((err) => console.error('savePenilaian failed:', err));
  };

  const handleToggleOpenMonth = (bulan: AssessmentMonth) => {
    StorageService.toggleOpenMonth(bulan).catch((err) => console.error('toggleOpenMonth failed:', err));
  };

  // Tampilkan pesan kalau Firestore gagal dihubungi (biasanya konfigurasi belum diisi)
  if (firestoreError) {
    return (
      <div className="min-h-screen bg-navy-950 text-white flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-3">
          <h1 className="text-lg font-bold">Tidak Bisa Terhubung ke Database</h1>
          <p className="text-sm text-ice-100">{firestoreError}</p>
        </div>
      </div>
    );
  }

  // Tunggu data awal termuat sebelum render dashboard (Firestore bersifat async, beda dari
  // localStorage yang instan) - cukup untuk sesi yang sedang dipulihkan (admin/mentor).
  if (isDataLoading && activeRole !== 'none') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-sm text-slate-500">Memuat data...</p>
      </div>
    );
  }

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
