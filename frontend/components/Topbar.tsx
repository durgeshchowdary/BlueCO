'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell,
  HelpCircle,
  LogOut,
  MessageSquare,
  Moon,
  Settings,
  Sun,
  UserCircle,
} from 'lucide-react';

export default function Topbar({
  academyName = 'Vijayawada blues',
}: {
  academyName?: string;
}) {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem('playgrid-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = storedTheme ? storedTheme === 'dark' : prefersDark;

    setDarkMode(shouldUseDark);
    document.documentElement.classList.toggle('app-dark', shouldUseDark);
  }, []);

  const toggleTheme = useCallback(() => {
    const nextDarkMode = !darkMode;

    setDarkMode(nextDarkMode);
    localStorage.setItem('playgrid-theme', nextDarkMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('app-dark', nextDarkMode);
  }, [darkMode]);

  const logout = useCallback(() => {
    localStorage.removeItem('playgrid_token');
    localStorage.removeItem('playgrid_user');
    localStorage.removeItem('playgrid_role');
    localStorage.removeItem('playgrid_permissions');
    localStorage.removeItem('isAuthenticated');
    document.cookie = 'pg_role=; Max-Age=0; path=/';
    document.cookie = 'pg_token=; Max-Age=0; path=/';
    document.cookie = 'pg_permissions=; Max-Age=0; path=/';
    router.push('/');
  }, [router]);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 shadow-sm lg:px-8">
      <h2 className="text-lg font-bold text-slate-800 md:text-xl">
        Welcome, {academyName}
      </h2>

      <div className="flex items-center gap-2 text-slate-600 md:gap-4">
        <button
          type="button"
          onClick={() => router.push('/announcements')}
          title="Notifications"
          aria-label="Open notifications"
          className="relative rounded-xl p-2 transition hover:bg-slate-100 hover:text-blue-600"
        >
          <Bell size={20} />
          <span className="absolute right-0 top-0 rounded-full bg-red-500 px-1.5 text-[10px] font-bold leading-4 text-white">
            6
          </span>
        </button>

        <button
          type="button"
          onClick={() => router.push('/chat')}
          title="Chat"
          aria-label="Open chat"
          className="rounded-xl p-2 transition hover:bg-slate-100 hover:text-blue-600"
        >
          <MessageSquare size={20} />
        </button>

        <button
          type="button"
          onClick={toggleTheme}
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          className="rounded-xl p-2 transition hover:bg-slate-100 hover:text-blue-600"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen((prev) => !prev)}
            title="Profile"
            aria-label="Open profile menu"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-black text-blue-700 ring-2 ring-transparent transition hover:ring-blue-200"
          >
            DC
          </button>

          {profileOpen ? (
            <div className="absolute right-0 mt-3 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white py-2 text-sm shadow-xl">
              <div className="border-b border-slate-100 px-4 py-3">
                <p className="font-black text-slate-900">Durgesh Chowdary</p>
                <p className="text-xs font-semibold text-slate-500">
                  Vijayawada Blues
                </p>
              </div>

              <Link
                href="/settings"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600"
              >
                <Settings size={17} />
                Settings
              </Link>

              <Link
                href="/help-center"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600"
              >
                <HelpCircle size={17} />
                Help Center
              </Link>

              <Link
                href="/tickets"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600"
              >
                <UserCircle size={17} />
                Support Tickets
              </Link>

              <button
                type="button"
                onClick={logout}
                className="flex w-full items-center gap-3 px-4 py-3 text-left font-bold text-red-600 hover:bg-red-50"
              >
                <LogOut size={17} />
                Log out
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
