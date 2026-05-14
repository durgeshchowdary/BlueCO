"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";

import {
  Bell,
  BookOpen,
  Building2,
  ChevronLeft,
  ClipboardList,
  CreditCard,
  HelpCircle,
  LayoutDashboard,
  MessageSquare,
  Moon,
  Ticket,
  UserCircle2,
  Users,
  Video,
  X,
} from "lucide-react";

const menu = [
  {
    section: "ACTIVE PITCH",
    items: [
      {
        name: "Dashboard",
        href: "/super-admin/dashboard",
        icon: LayoutDashboard,
      },
      {
        name: "Academies",
        href: "/super-admin/academies",
        icon: Building2,
      },
      {
        name: "Trial Monitor",
        href: "/super-admin/trial-monitor",
        icon: ClipboardList,
      },
    ],
  },

  {
    section: "BACK-OFFICE",
    items: [
      {
        name: "Delivery Logs",
        href: "/super-admin/delivery-logs",
        icon: ClipboardList,
      },
      {
        name: "Finance",
        href: "/super-admin/finance",
        icon: CreditCard,
      },
      {
        name: "Invoices",
        href: "/super-admin/invoices",
        icon: CreditCard,
      },
      {
        name: "CRM",
        href: "/super-admin/crm",
        icon: Users,
      },
      {
        name: "Video Analysis",
        href: "/super-admin/video-analysis",
        icon: Video,
      },
    ],
  },

  {
    section: "SUPPORT",
    items: [
      {
        name: "Tickets",
        href: "/super-admin/tickets",
        icon: Ticket,
      },
      {
        name: "Announcements",
        href: "/super-admin/announcements",
        icon: Bell,
      },
      {
        name: "Help Center",
        href: "/super-admin/help-center",
        icon: HelpCircle,
      },
    ],
  },
];

export default function SuperAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const [darkMode, setDarkMode] = useState(false);

  return (
    <div
      className={`flex min-h-screen ${
        darkMode ? "bg-[#111827]" : "bg-[#fffdf0]"
      }`}
    >
      {/* SIDEBAR */}

      <aside className="flex w-[250px] flex-col border-r border-[#d8e0ec] bg-[#f7fafc]">
        <div className="flex h-[78px] items-center px-6">
          <h1 className="text-[22px] font-extrabold tracking-tight">
            <span className="text-[#061739]">Out-</span>
            <span className="text-[#ff5a4e]">Play</span>
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-6">
          {menu.map((group) => (
            <div key={group.section} className="mb-7">
              <p className="mb-3 px-3 text-[11px] font-bold tracking-[1.4px] text-[#8b97ab]">
                {group.section}
              </p>

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;

                  const active = pathname === item.href;

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex h-[46px] items-center gap-3 rounded-2xl px-4 text-[15px] font-semibold transition-all ${
                        active
                          ? "bg-[#dff1ee] text-[#00796b]"
                          : "text-[#536987] hover:bg-[#edf3f8]"
                      }`}
                    >
                      <Icon size={19} />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-[#d8e0ec] p-4">
          <button className="flex h-[40px] w-[40px] items-center justify-center rounded-xl text-[#536987] hover:bg-[#edf3f8]">
            <ChevronLeft size={18} />
          </button>
        </div>
      </aside>

      {/* MAIN */}

      <div className="flex-1">
        {/* HEADER */}

        <header className="flex h-[78px] items-center justify-between border-b border-[#d8e0ec] bg-[#f8fbff] px-8">
          <h2 className="text-[18px] font-extrabold text-[#061739]">
            Welcome, OutPlay Super Admin
          </h2>

          <div className="relative flex items-center gap-6">
            {/* NOTIFICATIONS */}

            <button
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setMessagesOpen(false);
                setProfileOpen(false);
              }}
              className="relative"
            >
              <Bell size={21} className="text-[#061739]" />

              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#ff6b6b] text-[10px] font-bold text-white">
                6
              </span>
            </button>

            {/* CHAT */}

            <button
              onClick={() => {
                setMessagesOpen(!messagesOpen);
                setNotificationsOpen(false);
                setProfileOpen(false);
              }}
            >
              <MessageSquare size={21} className="text-[#061739]" />
            </button>

            {/* DARK MODE */}

            <button onClick={() => setDarkMode(!darkMode)}>
              <Moon size={21} className="text-[#061739]" />
            </button>

            {/* PROFILE */}

            <button
              onClick={() => {
                setProfileOpen(!profileOpen);
                setNotificationsOpen(false);
                setMessagesOpen(false);
              }}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-200"
            >
              <UserCircle2
                size={28}
                className="text-[#7a3d00]"
              />
            </button>

            {/* NOTIFICATION POPUP */}

            {notificationsOpen && (
              <Popup
                title="Notifications"
                onClose={() => setNotificationsOpen(false)}
              >
                <div className="space-y-3">
                  <div className="rounded-xl bg-[#f8fbff] p-3">
                    <p className="font-bold">
                      2 academies payment overdue
                    </p>

                    <p className="mt-1 text-[#536987]">
                      Finance alert detected.
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#f8fbff] p-3">
                    <p className="font-bold">
                      New CRM lead added
                    </p>

                    <p className="mt-1 text-[#536987]">
                      Trial pipeline updated.
                    </p>
                  </div>
                </div>
              </Popup>
            )}

            {/* MESSAGES */}

            {messagesOpen && (
              <Popup
                title="Messages"
                onClose={() => setMessagesOpen(false)}
              >
                <div className="space-y-3">
                  <div className="rounded-xl bg-[#f8fbff] p-3">
                    <p className="font-bold">
                      Support Team
                    </p>

                    <p className="mt-1 text-[#536987]">
                      No unread messages.
                    </p>
                  </div>
                </div>
              </Popup>
            )}

            {/* PROFILE MENU */}

            {profileOpen && (
              <Popup
                title="Super Admin"
                onClose={() => setProfileOpen(false)}
              >
                <div>
                  <p className="font-semibold">
                    outplayadmin@gmail.com
                  </p>

                  <button
                    onClick={() => {
                      localStorage.removeItem("token");
                      localStorage.removeItem("role");
                      localStorage.removeItem("user");
                      localStorage.removeItem(
                        "permissions"
                      );

                      document.cookie =
                        "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

                      document.cookie =
                        "role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

                      window.location.href = "/login";
                    }}
                    className="mt-4 w-full rounded-xl bg-[#00796b] py-2 text-[14px] font-bold text-white hover:bg-[#00695f]"
                  >
                    Logout
                  </button>
                </div>
              </Popup>
            )}
          </div>
        </header>

        {/* PAGE */}

<main className="min-h-[calc(100vh-78px)] bg-[#fffdf0] text-[#061739]">
  {children}
</main>      </div>
    </div>
  );
}

function Popup({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="absolute right-0 top-14 z-[999] w-[310px] rounded-2xl border border-[#d8e0ec] bg-white p-4 shadow-2xl">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[16px] font-extrabold text-[#061739]">
          {title}
        </h3>

        <button onClick={onClose}>
          <X size={17} />
        </button>
      </div>

      <div className="text-[13px] text-[#061739]">
        {children}
      </div>
    </div>
  );
}