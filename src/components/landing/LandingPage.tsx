import React, { useState } from 'react';
import { Users, Sparkles, ArrowRight, Menu, X } from 'lucide-react';
import logoFull from '../../assets/logo-full.png';
import logoIcon from '../../assets/logo-icon.png';
import kabinetPhoto from '../../assets/kabinet-satyasena.jpg';

interface LandingPageProps {
  onOpenMentorLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenMentorLogin,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-navy-700 text-slate-900 font-sans antialiased selection:bg-sky-300 selection:text-slate-900">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-navy-700/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="bg-white rounded-xl px-3 py-1.5 shadow-md">
            <img src={logoFull} alt="Satyasena" className="h-7 sm:h-8 w-auto" />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-white/80">
            <a href="#hero" className="hover:text-white transition-colors">
              Home
            </a>
            <a href="#approach" className="hover:text-white transition-colors">
              About
            </a>
          </nav>

          {/* Top Right Action: LOGIN MENTOR BUTTON (Requested in prompt: item 3) */}
          <div className="flex items-center gap-3">
            <button
              id="navbar-btn-login-mentor"
              type="button"
              onClick={onOpenMentorLogin}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-sky-300 hover:bg-sky-400 text-slate-950 font-black text-xs sm:text-sm tracking-wide transition-all transform hover:scale-105 shadow-lg shadow-sky-300/20 cursor-pointer"
            >
              <Users className="w-4 h-4 text-slate-950" />
              <span>LOGIN MENTOR</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((p) => !p)}
              className="md:hidden text-white p-2 rounded-lg hover:bg-white/10"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-navy-800 border-b border-white/10 px-4 py-4 space-y-3">
            <a
              href="#hero"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-white/90 text-sm font-medium py-1"
            >
              Home
            </a>
            <a
              href="#approach"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-white/90 text-sm font-medium py-1"
            >
              About Approach
            </a>
          </div>
        )}
      </header>

      {/* HERO SECTION */}
      <section id="hero" className="relative pt-8 pb-16 sm:pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            {/* Left Column: Big Display Typography */}
            <div className="lg:w-7/12 text-white space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-sky-300 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Kabinet Asrama UPI 2025/2026</span>
              </div>

              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight uppercase leading-[0.9] text-white">
                SATYASENA <br />
                <span className="text-sky-300">MENTOR-MENTEE</span>
              </h1>

              <p className="text-base sm:text-lg text-ice-100 max-w-xl leading-relaxed">
                Asrama Universitas Pendidikan Indonesia adalah rumah sekaligus wahana interaksi lintas kultural bagi mahasiswa. Sistem ini membantu Kabinet Satyasena memantau pembinaan mentor-mentee lintas kelompok melalui evaluasi indikator terstruktur dan lembar kerja interaktif bergaya Excel.
              </p>

              {/* Floating Action Badge & CTA */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={onOpenMentorLogin}
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-sky-300 hover:bg-sky-400 text-slate-950 font-extrabold text-sm sm:text-base tracking-wide transition-all transform hover:scale-105 shadow-xl shadow-sky-300/25 cursor-pointer"
                >
                  <span>MASUK SEBAGAI MENTOR</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Right Column: Satyasena shield badge */}
            <div className="lg:w-5/12 flex justify-center relative">
              <div className="relative w-72 h-72 sm:w-96 sm:h-96">
                {/* Glowing Aura behind badge */}
                <div className="absolute inset-0 rounded-full bg-sky-300/30 blur-3xl" />

                {/* Shield badge panel */}
                <div className="relative w-full h-full rounded-full bg-gradient-to-tr from-navy-900 via-navy-700 to-navy-500 shadow-[inset_-20px_-20px_50px_rgba(0,0,0,0.35),0_25px_60px_rgba(0,0,0,0.4)] flex items-center justify-center overflow-hidden border-2 border-sky-300">
                  <img
                    src={logoIcon}
                    alt="Lambang Satyasena"
                    className="w-2/3 h-2/3 object-contain drop-shadow-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: PROFESSIONAL APPROACH (Curved White Container matching screenshot) */}
      <section id="approach" className="bg-white rounded-t-[2.5rem] sm:rounded-t-[3.5rem] pt-16 pb-20 text-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Half: Split Image & Text */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left: Foto Kabinet Satyasena */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-200 relative h-80 sm:h-96 group">
                <img
                  src={kabinetPhoto}
                  alt="Foto Kabinet Satyasena 2025/2026"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-950/80 via-navy-950/30 to-transparent p-6 pt-16">
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-300 bg-navy-900/60 px-2.5 py-1 rounded-md">
                    Kabinet Satyasena 2025/2026
                  </span>
                  <p className="text-sm font-semibold mt-1.5 text-white/90">
                    Kepengurusan Asrama Mahasiswa UPI Bumi Siliwangi.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Approach Description */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-slate-900">
                  TENTANG <br />
                  <span className="relative inline-block text-slate-900">
                    ASRAMA UPI
                    <span className="absolute bottom-1 left-0 w-full h-2.5 bg-sky-300 -z-10 rounded" />
                  </span>
                </h2>
              </div>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Universitas Pendidikan Indonesia menyediakan fasilitas asrama - baik asrama putra maupun asrama puteri - sebagai tempat tinggal sekaligus wahana interaksi lintas kultural. Asrama menjadi hunian bagi mahasiswa, dosen, peserta pelatihan, tamu fakultas, program studi, lembaga, maupun pusat studi di lingkungan UPI.
              </p>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Kabinet Satyasena 2025/2026 mengelola kehidupan asrama lewat berbagai program: OLKA (Orientasi Lingkungan & Kehidupan Asrama), Keagamaan, Sosial, Pendidikan, Kesenian, hingga Monitoring & Evaluasi (MONEV) - termasuk sistem penilaian mentor-mentee ini.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-navy-950 text-slate-400 py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800 text-center md:text-left">
            <div>
              <div className="inline-block bg-white rounded-lg px-2.5 py-1.5">
                <img src={logoFull} alt="Satyasena" className="h-6 w-auto" />
              </div>
              <p className="text-xs text-slate-400 mt-2 max-w-sm">
                Sistem Penilaian Mentor-Mentee Kabinet Satyasena - Asrama Mahasiswa UPI Bumi Siliwangi.
              </p>
            </div>

            <div className="flex items-center gap-6 text-xs text-slate-300">
              <a href="#hero" className="hover:text-white transition-colors">Home</a>
              <a href="#approach" className="hover:text-white transition-colors">Approach</a>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <span>© 2026 Kabinet Satyasena. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <span className="text-[11px] text-slate-400">
                Akses Administrator via{' '}
                <a
                  href="#admin"
                  className="text-slate-400 hover:text-slate-300 transition-colors font-mono"
                  title="Akses Admin"
                >
                  /admin
                </a>
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
