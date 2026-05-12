'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Calendar, 
  Dribbble,
  Wallet,
  PieChart,
  Target,
  MessageSquare,
  ClipboardList,
  Ticket,
  Megaphone,
  HelpCircle,
  Settings
} from 'lucide-react';

const menuGroups = [
  {
    title: 'ACTIVE PITCH',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/students', label: 'Students', icon: Users },
      { href: '/coaches', label: 'HRMS', icon: Briefcase },
      { href: '/events', label: 'Events', icon: Calendar },
      { href: '/batches', label: 'Training Sessions', icon: Dribbble },
    ]
  },
  {
    title: 'BACK-OFFICE',
    items: [
      { href: '/payments', label: 'Finance', icon: Wallet },
      { href: '/kpi', label: 'KPI Dashboard', icon: PieChart },
      { href: '/crm', label: 'Student CRM', icon: Target },
      { href: '/chat', label: 'Chat', icon: MessageSquare },
      { href: '/delivery-logs', label: 'Delivery Logs', icon: ClipboardList },
    ]
  },
  {
    title: 'SUPPORT',
    items: [
      { href: '/tickets', label: 'Tickets', icon: Ticket },
      { href: '/announcements', label: 'Announcements', icon: Megaphone },
      { href: '/settings', label: 'Settings', icon: Settings },
      { href: '/help-center', label: 'Help Center', icon: HelpCircle },
    ]
  }
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[280px] flex-col border-r border-slate-200 bg-[#fcfdfd] lg:flex">
      {/* Logo Section */}
      <div className="flex items-center gap-3 px-8 py-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-black shadow-lg shadow-blue-200">
          OP
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-black tracking-tight text-slate-900">OUT-PLAY</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Enterprise</span>
        </div>
      </div>

      {/* Menu Groups */}
      <div className="flex-1 overflow-y-auto px-4 pb-8 scrollbar-hide">
        <div className="space-y-8">
          {menuGroups.map((group) => (
            <div key={group.title}>
              <p className="mb-4 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                {group.title}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                        active 
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-100' 
                          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <item.icon size={18} className={active ? 'text-white' : 'text-slate-400'} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Profile/Logout */}
      <div className="border-t border-slate-100 p-6">
        <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
              VB
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-bold text-slate-800 truncate">Vijayawada Blues</span>
              <span className="text-[10px] font-medium text-slate-400">Pro Academy</span>
            </div>
          </div>
          <button 
            type="button"
            aria-label="Sign out"
            onClick={() => {
              localStorage.removeItem('isAuthenticated');
              window.location.href = '/';
            }}
            className="p-1 text-slate-400 hover:text-red-500 transition"
          >
            <HelpCircle size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
