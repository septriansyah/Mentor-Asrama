import React, { useState } from 'react';
import {
  Users,
  Award,
  Sparkles,
  ArrowRight,
  FileSpreadsheet,
  Layers,
  HeartHandshake,
  Menu,
  X,
} from 'lucide-react';
interface LandingPageProps {
  onOpenMentorLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenMentorLogin,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-maroon-700 text-slate-900 font-sans antialiased selection:bg-gold-300 selection:text-slate-900">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-maroon-700/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5">
            <span className="text-2xl sm:text-3xl font-black tracking-tighter text-white uppercase italic">
              INSPIRE
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-gold-300 shadow-[0_0_12px_#f0c419]" />
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
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gold-300 hover:bg-gold-400 text-slate-950 font-black text-xs sm:text-sm tracking-wide transition-all transform hover:scale-105 shadow-lg shadow-gold-300/20 cursor-pointer"
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
          <div className="md:hidden bg-maroon-800 border-b border-white/10 px-4 py-4 space-y-3">
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
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gold-300 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Modern Mentoring & Character Development</span>
              </div>

              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight uppercase leading-[0.9] text-white">
                MENTORING <br />
                <span className="text-gold-300">AS A LIFESTYLE</span>
              </h1>

              <p className="text-base sm:text-lg text-cream-100 max-w-xl leading-relaxed">
                Platform terintegrasi penilaian mentor-mentee berbasis kamar. Evaluasi terstandar 5 indikator dengan lembar isian interaktif bergaya Excel dan pilihan rubrik terstruktur.
              </p>

              {/* Floating Action Badge & CTA */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={onOpenMentorLogin}
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gold-300 hover:bg-gold-400 text-slate-950 font-extrabold text-sm sm:text-base tracking-wide transition-all transform hover:scale-105 shadow-xl shadow-gold-300/25 cursor-pointer"
                >
                  <span>MASUK SEBAGAI MENTOR</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                {/* Floating Preview Card (matching left card in screenshot) */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3.5 rounded-2xl flex items-center gap-3 shadow-lg">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-maroon-500 flex items-center justify-center text-white shadow-inner">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-white uppercase tracking-wider">
                      Excel Spreadsheet
                    </div>
                    <div className="text-[11px] text-gold-100">
                      5 Indikator & Pilihan Sel Dinamis
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Tennis Ball Graphic matching the screenshot */}
            <div className="lg:w-5/12 flex justify-center relative">
              <div className="relative w-72 h-72 sm:w-96 sm:h-96">
                {/* Glowing Aura behind ball */}
                <div className="absolute inset-0 rounded-full bg-gold-300/30 blur-3xl" />

                {/* 3D Rendered Tennis Ball Vector matching the image */}
                <div className="relative w-full h-full rounded-full bg-gradient-to-tr from-gold-600 via-gold-400 to-gold-200 shadow-[inset_-20px_-20px_50px_rgba(0,0,0,0.35),0_25px_60px_rgba(0,0,0,0.4)] flex items-center justify-center overflow-hidden border-2 border-gold-300">
                  {/* Characteristic Curved White Seam 1 */}
                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none opacity-85"
                    viewBox="0 0 400 400"
                    fill="none"
                  >
                    <path
                      d="M 50,200 C 50,110 110,50 200,50 C 270,50 320,110 320,170 C 320,230 270,290 200,290 C 130,290 80,340 80,400"
                      stroke="#ffffff"
                      strokeWidth="12"
                      strokeLinecap="round"
                      filter="drop-shadow(0 2px 4px rgba(0,0,0,0.25))"
                    />
                    <path
                      d="M 350,200 C 350,290 290,350 200,350 C 130,350 80,290 80,230 C 80,170 130,110 200,110 C 270,110 320,60 320,0"
                      stroke="#ffffff"
                      strokeWidth="12"
                      strokeLinecap="round"
                      filter="drop-shadow(0 2px 4px rgba(0,0,0,0.25))"
                    />
                  </svg>

                  {/* Felt Texture & Radial Highlight */}
                  <div className="absolute top-10 left-12 w-28 h-28 rounded-full bg-white/40 blur-xl pointer-events-none" />

                  {/* Circular Button inside ball or beside (matching screenshot circular 'Book' button) */}
                  <div
                    onClick={onOpenMentorLogin}
                    className="relative z-10 w-24 h-24 rounded-full bg-white text-slate-950 font-black text-xs tracking-wider flex flex-col items-center justify-center shadow-2xl hover:scale-110 transition-transform cursor-pointer border-4 border-gold-300"
                  >
                    <span>BUKA</span>
                    <span className="text-maroon-700 text-[10px]">NILAI</span>
                  </div>
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-16">
            {/* Left Court Image Card */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-200 relative group">
                <img
                  src="https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=800&auto=format&fit=crop"
                  alt="Professional Tennis & Mentoring Court"
                  className="w-full h-80 sm:h-96 object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-maroon-950/70 via-transparent to-transparent flex items-end p-6">
                  <div className="text-white">
                    <span className="text-xs font-bold uppercase tracking-wider text-gold-300 bg-maroon-900/60 px-2.5 py-1 rounded-md">
                      Standar Kamar & Evaluasi
                    </span>
                    <p className="text-sm font-semibold mt-1.5 text-white/90">
                      Sesi pembinaan terarah dengan rubrik objektif & transparan.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Approach Description */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-slate-900">
                  PROFESSIONAL <br />
                  <span className="relative inline-block text-slate-900">
                    APPROACH
                    <span className="absolute bottom-1 left-0 w-full h-2.5 bg-gold-300 -z-10 rounded" />
                  </span>
                </h2>
              </div>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Pendekatan mentoring kami menggabungkan kedisiplinan tinggi, keteladanan adab, keaktifan kolaboratif, serta kepemimpinan mandiri. Setiap mentor memantau perkembangan mentee secara berkala dalam lingkungan asrama yang kondusif.
              </p>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Melalui lembar kerja berbasis Excel dengan 5 indikator baku, seluruh data terekam secara sistematis, terukur, dan dapat diekspor langsung oleh pengurus untuk evaluasi menyeluruh.
              </p>

              {/* Round action button matching screenshot */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onOpenMentorLogin}
                  className="w-20 h-20 rounded-full border-2 border-slate-900 hover:border-maroon-700 hover:bg-maroon-700 hover:text-white transition-all flex flex-col items-center justify-center text-xs font-bold uppercase tracking-wider shadow-sm cursor-pointer group"
                >
                  <span className="group-hover:scale-110 transition-transform">Mulai</span>
                </button>
              </div>
            </div>
          </div>

          {/* 4 Feature Cards (Matching the 4 pills in screenshot) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-maroon-700 text-white p-6 rounded-3xl space-y-3 shadow-md hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-gold-300">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base tracking-tight">Qualified Coaches</h3>
              <p className="text-xs text-cream-100 leading-relaxed">
                Mentor pilihan yang membimbing langsung sesuai nomor kamar/kelompok binaan.
              </p>
            </div>

            <div className="bg-maroon-700 text-white p-6 rounded-3xl space-y-3 shadow-md hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-gold-300">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base tracking-tight">5 Fixed Rubrics</h3>
              <p className="text-xs text-cream-100 leading-relaxed">
                Kedisiplinan, Keaktifan, Adab, Kepemimpinan, dan Tanggung Jawab.
              </p>
            </div>

            <div className="bg-maroon-700 text-white p-6 rounded-3xl space-y-3 shadow-md hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-gold-300">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base tracking-tight">Room Collaboration</h3>
              <p className="text-xs text-cream-100 leading-relaxed">
                Kekompakan kelompok kamar dipantau terpisah untuk menjaga suasana kekeluargaan.
              </p>
            </div>

            <div className="bg-maroon-700 text-white p-6 rounded-3xl space-y-3 shadow-md hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-gold-300">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base tracking-tight">Excel Spreadsheet</h3>
              <p className="text-xs text-cream-100 leading-relaxed">
                Pengisian nilai interaktif dengan sel dropdown sesuai rubrik yang diatur admin.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* FOOTER */}
      <footer className="bg-maroon-950 text-slate-400 py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800 text-center md:text-left">
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="text-2xl font-black tracking-tighter text-white uppercase italic">
                  INSPIRE
                </span>
                <span className="w-2 h-2 rounded-full bg-gold-300" />
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Sistem Penilaian Mentor-Mentee Berbasis Kamar dengan Standarisasi 5 Indikator Baku.
              </p>
            </div>

            <div className="flex items-center gap-6 text-xs text-slate-300">
              <a href="#hero" className="hover:text-white transition-colors">Home</a>
              <a href="#approach" className="hover:text-white transition-colors">Approach</a>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <span>© 2026 INSPIRE MENTORING. All rights reserved.</span>
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
