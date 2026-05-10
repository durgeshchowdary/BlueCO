'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

const landingLinks = [
  { href: '#features', label: 'Features' },
  { href: '#reviews', label: 'Reviews' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
  { href: '#contact', label: 'Contact' },
];

const appLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/students', label: 'Students' },
  { href: '/coaches', label: 'Coaches' },
  { href: '/batches', label: 'Batches' },
  { href: '/attendance', label: 'Attendance' },
  { href: '/payments', label: 'Payments' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const isLanding = pathname === '/';
  const navLinks = isLanding ? landingLinks : appLinks;

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${isLanding ? 'border-b border-white/5 bg-slate-950/80 backdrop-blur-xl' : 'border-b border-slate-100 bg-white/95 backdrop-blur-md'}`}>
      <div className="container flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-3">
          <span className={`flex h-10 w-10 items-center justify-center rounded-xl font-black ${isLanding ? 'bg-white text-slate-950' : 'bg-accent text-slate-950'}`}>PG</span>
          <span className={`text-xl font-black tracking-tight ${isLanding ? 'text-white' : 'text-slate-900'}`}>PlayGrid AI</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <div className={`flex items-center gap-1 rounded-full p-1 ${isLanding ? 'border border-white/10 bg-white/5 backdrop-blur-md' : ''}`}>
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                    isLanding 
                      ? 'text-slate-300 hover:text-white hover:bg-white/10' 
                      : active 
                        ? 'bg-accent text-slate-950 shadow-md' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="flex items-center gap-3 md:gap-4">
          {isLanding ? (
            <>
              <Link
                href="/login"
                className="text-xs font-bold text-white transition hover:text-cyan-400 md:text-sm"
              >
                Login
              </Link>
              <Link
                href="#contact"
                className="rounded-full bg-cyan-500 px-3 py-2 text-[10px] font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-400 md:px-6 md:py-2.5 md:text-sm"
              >
                Start Free Trial
              </Link>
            </>
          ) : (
            <button
              type="button"
              aria-label="Sign out"
              onClick={() => {
                localStorage.removeItem('isAuthenticated');
                window.location.href = '/';
              }}
              className="text-sm font-bold text-slate-600 hover:text-red-500"
            >
              Logout
            </button>
          )}
        </div>

        <button
          type="button"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          onClick={() => setMenuOpen(!menuOpen)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10 md:hidden"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {menuOpen && (
        <div className={`border-t px-4 py-4 md:hidden ${isLanding ? 'border-white/10 bg-slate-950' : 'border-slate-100 bg-white'}`}>
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-2xl px-4 py-3 text-sm font-bold transition ${
                  isLanding ? 'text-slate-300 hover:bg-white/10 hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="mt-6">
            {isLanding ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex-1 rounded-2xl border border-white/10 py-3 text-center text-sm font-bold text-white transition hover:bg-white/5"
                >
                  Login
                </Link>
                <Link
                  href="#contact"
                  onClick={() => setMenuOpen(false)}
                  className="flex-[1.5] rounded-2xl bg-cyan-500 py-3 text-center text-sm font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-400"
                >
                  Start Free Trial
                </Link>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem('isAuthenticated');
                  window.location.href = '/';
                }}
                className="w-full rounded-2xl px-4 py-3 text-left text-sm font-bold text-red-500 hover:bg-slate-50"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
