"use client";

import { useMemo, useState } from "react";
import {
  Bell,
  Check,
  ChevronDown,
  Clock3,
  Filter,
  Megaphone,
  Search,
  Send,
  TrendingUp,
  CalendarDays,
  UserPlus,
  IndianRupee,
  AlertTriangle,
  X,
} from "lucide-react";

type StatusFilter = "All" | "Unread" | "Read";
type PriorityFilter = "All Priority" | "Urgent" | "Important" | "Info";

const initialItems = [
  {
    id: 1,
    title: "Coach Deepak submitted 2 new progress cards this week",
    tag: "Progress Update",
    priority: "Info",
    read: false,
    icon: TrendingUp,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    dot: "bg-blue-500",
  },
  {
    id: 2,
    title: "February payroll processed: ₹143K for 4 staff members",
    tag: "Payroll Processed",
    priority: "Info",
    read: false,
    icon: IndianRupee,
    iconBg: "bg-yellow-100",
    iconColor: "text-orange-600",
    dot: "bg-yellow-500",
  },
  {
    id: 3,
    title: "ISL Youth Cup starts in 3 days — 32/64 participants registered",
    tag: "Event Upcoming",
    priority: "Important",
    read: true,
    icon: CalendarDays,
    iconBg: "bg-yellow-100",
    iconColor: "text-orange-600",
    dot: "bg-orange-500",
  },
  {
    id: 4,
    title: "New student Aarav enrolled in U-10 Morning batch",
    tag: "Student Added",
    priority: "Info",
    read: true,
    icon: UserPlus,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    dot: "bg-blue-500",
  },
  {
    id: 5,
    title: "4 students have pending fees totaling ₹18,500 — send reminders",
    tag: "Fee Reminder",
    priority: "Important",
    read: true,
    icon: IndianRupee,
    iconBg: "bg-yellow-100",
    iconColor: "text-orange-600",
    dot: "bg-orange-500",
  },
  {
    id: 6,
    title: "Vihan's attendance dropped to 65% this month — needs follow-up",
    tag: "Attendance Low",
    priority: "Urgent",
    read: true,
    icon: AlertTriangle,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    dot: "bg-red-500",
    urgent: true,
  },
];

const sendOptions = [
  "All (Students + Employees)",
  "All Students",
  "All Employees",
  "Specific Batch",
  "Specific Course",
  "Specific Department",
  "Specific Center",
];

export default function AnnouncementsPage() {
  const [items, setItems] = useState(initialItems);
  const [status, setStatus] = useState<StatusFilter>("All");
  const [priority, setPriority] = useState<PriorityFilter>("All Priority");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState("");

  const unread = items.filter((i) => !i.read).length;
  const urgent = items.filter((i) => i.priority === "Urgent").length;

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const statusOk =
        status === "All" ||
        (status === "Unread" && !item.read) ||
        (status === "Read" && item.read);

      const priorityOk =
        priority === "All Priority" || item.priority === priority;

      const searchOk =
        !search || item.title.toLowerCase().includes(search.toLowerCase());

      return statusOk && priorityOk && searchOk;
    });
  }, [items, status, priority, search]);

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(""), 2200);
  }

  function markAllRead() {
    setItems((prev) => prev.map((item) => ({ ...item, read: true })));
    showToast("All announcements marked as read");
  }

  function markOneRead(id: number) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
  }

  return (
    <main className="min-h-screen bg-[#fffdf0] text-[#17223b]">
      <TopBar />

      {toast && (
        <div className="fixed right-12 top-[116px] z-50 flex h-14 w-[380px] items-center gap-3 rounded-lg bg-emerald-50 px-5 text-emerald-700 shadow-lg">
          <Check size={20} />
          <span className="font-semibold">{toast}</span>
        </div>
      )}

      <div className="px-8 py-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-[30px] font-black">
              <Megaphone size={27} className="text-[#007f72]" />
              Announcements
            </h1>
            <p className="mt-1 text-[16px] text-[#52657d]">
              {unread} unread • {urgent} urgent
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={markAllRead}
              className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold shadow-sm hover:bg-slate-50"
            >
              <Check size={17} />
              Mark All Read
            </button>

            <button
              onClick={() => setModalOpen(true)}
              className="flex h-10 items-center gap-2 rounded-xl bg-[#007f72] px-5 text-sm font-bold text-white shadow-sm hover:bg-[#006f64]"
            >
              <Send size={17} />
              Create Announcement
            </button>
          </div>
        </div>

        <section className="mt-6 grid grid-cols-4 gap-4">
          <Stat title="Total" value={items.length} icon={<Bell size={18} />} />
          <Stat title="Unread" value={unread} dot="bg-[#007f72]" green />
          <Stat title="Urgent" value={urgent} icon={<AlertTriangle size={18} />} red />
          <Stat title="Types" value={6} icon={<Filter size={18} />} />
        </section>

        <section className="mt-5 flex items-center gap-2">
          <div className="flex h-11 w-[360px] items-center gap-3 rounded-xl border border-slate-200 bg-white px-4">
            <Search size={17} className="text-[#52657d]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notifications..."
              className="w-full bg-transparent outline-none placeholder:text-[#52657d]"
            />
          </div>

          <Dropdown value={status} options={["All", "Unread", "Read"]} onSelect={setStatus} width="w-[130px]" />
          <Dropdown value={priority} options={["All Priority", "Urgent", "Important", "Info"]} onSelect={setPriority} width="w-[150px]" />

          <span className="rounded-full bg-[#eef2f6] px-4 py-2 text-sm font-bold text-[#17223b]">
            {filtered.length} results
          </span>
        </section>

        <section className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-[#f8fafc] shadow-sm">
          {filtered.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.id}
                className={`flex min-h-[84px] items-center justify-between border-b border-slate-200 px-6 ${
                  item.read ? "bg-[#eff8f7]" : "bg-[#f8fafc]"
                }`}
              >
                <div className="flex items-center gap-5">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.iconBg}`}
                  >
                    <Icon size={22} className={item.iconColor} />
                  </div>

                  <div>
                    <h3 className="text-[16px] font-semibold text-[#17223b]">
                      {item.title}
                    </h3>

                    <div className="mt-2 flex items-center gap-2 text-[13px] text-[#52657d]">
                      <span>5d ago</span>
                      <span>•</span>
                      <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-bold text-[#17223b]">
                        {item.tag}
                      </span>

                      {item.urgent && (
                        <span className="rounded-full bg-red-500 px-3 py-1 text-[11px] font-bold text-white">
                          Urgent
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => markOneRead(item.id)}
                  className="flex items-center gap-3 text-sm font-semibold text-[#17223b]"
                >
                  <Check size={16} />
                  Read
                  <span className={`h-2.5 w-2.5 rounded-full ${item.dot}`} />
                </button>
              </div>
            );
          })}
        </section>
      </div>

      {modalOpen && (
        <CreateAnnouncementModal
          onClose={() => setModalOpen(false)}
          onSend={() => {
            setModalOpen(false);
            showToast("Announcement sent");
          }}
        />
      )}
    </main>
  );
}

function TopBar() {
  return (
    <>
      <div className="flex h-[42px] items-center justify-center bg-[#079663] text-white">
        <div className="flex items-center gap-3 text-[16px] font-bold">
          <Clock3 size={17} />
          <span>Free trial: 9 days remaining</span>
          <button className="ml-2 flex h-7 items-center gap-3 rounded-full bg-white px-4 text-[14px] font-semibold text-slate-900">
            Upgrade <span className="text-xl leading-none">→</span>
          </button>
          <X size={16} className="opacity-80" />
        </div>
      </div>

      <header className="flex h-[58px] items-center justify-between border-b border-slate-200 bg-white px-7">
        <h2 className="text-[22px] font-black">Welcome, Vijayawada blues</h2>
        <div className="flex items-center gap-5">
          <div className="relative">
            <Bell size={20} />
            <span className="absolute -right-2 -top-3 flex h-5 w-5 items-center justify-center rounded-full bg-red-400 text-[11px] font-bold text-white">
              4
            </span>
          </div>
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-orange-300 to-rose-400" />
        </div>
      </header>
    </>
  );
}

function Stat({
  title,
  value,
  icon,
  dot,
  green,
  red,
}: {
  title: string;
  value: number;
  icon?: React.ReactNode;
  dot?: string;
  green?: boolean;
  red?: boolean;
}) {
  return (
    <div className="h-[92px] rounded-xl border border-slate-200 bg-[#f8fafc] px-5 py-4 shadow-sm">
      <div className="flex justify-between">
        <p className="text-[14px] text-[#52657d]">{title}</p>
        {icon && <span className={red ? "text-red-500" : "text-[#52657d]"}>{icon}</span>}
        {dot && <span className={`h-3 w-3 rounded-full ${dot}`} />}
      </div>
      <p className={`mt-2 text-[28px] font-black ${green ? "text-[#007f72]" : red ? "text-red-600" : ""}`}>
        {value}
      </p>
    </div>
  );
}

function Dropdown<T extends string>({
  value,
  options,
  onSelect,
  width,
}: {
  value: T;
  options: readonly T[];
  onSelect: (v: T) => void;
  width: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`relative ${width}`}>
      <button
        onClick={() => setOpen(!open)}
        className="flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold"
      >
        {value}
        <ChevronDown size={16} />
      </button>

      {open && (
        <div className="absolute left-0 top-12 z-40 w-full overflow-hidden rounded-xl border border-slate-200 bg-white py-2 shadow-lg">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => {
                onSelect(option);
                setOpen(false);
              }}
              className={`flex h-9 w-full items-center justify-between px-3 text-left hover:bg-slate-50 ${
                value === option ? "bg-[#d8ece9] text-[#047c73]" : ""
              }`}
            >
              {option}
              {value === option && <Check size={15} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CreateAnnouncementModal({
  onClose,
  onSend,
}: {
  onClose: () => void;
  onSend: () => void;
}) {
  const [sendTo, setSendTo] = useState(sendOptions[0]);
  const [sendOpen, setSendOpen] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95">
      <div className="relative w-[760px] rounded-xl bg-[#fffdf0] p-8 shadow-2xl">
        <button onClick={onClose} className="absolute right-6 top-6 text-slate-500">
          <X size={20} />
        </button>

        <h2 className="mb-6 flex items-center gap-3 text-[22px] font-black">
          <Megaphone size={20} className="text-[#007f72]" />
          Create Announcement
        </h2>

        <label className="text-sm font-semibold">Announcement Title *</label>
        <input
          placeholder="e.g., Important: Training Session Cancelled"
          className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-4 outline-none placeholder:text-[#52657d]"
        />

        <label className="mt-5 block text-sm font-semibold">Message *</label>
        <textarea
          placeholder="Write your announcement message here..."
          className="mt-2 h-[115px] w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none placeholder:text-[#52657d]"
        />

        <div className="relative mt-5">
          <label className="text-sm font-semibold">Send To</label>
          <button
            onClick={() => setSendOpen(!sendOpen)}
            className="mt-2 flex h-11 w-full items-center justify-between rounded-xl border border-teal-600 bg-white px-4 text-left"
          >
            {sendTo}
            <ChevronDown size={17} />
          </button>

          {sendOpen && (
            <div className="absolute left-0 top-[74px] z-50 w-full overflow-hidden rounded-xl border border-slate-200 bg-white py-2 shadow-xl">
              {sendOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setSendTo(option);
                    setSendOpen(false);
                  }}
                  className={`flex h-10 w-full items-center justify-between px-4 text-left hover:bg-slate-50 ${
                    sendTo === option ? "bg-[#d8ece9] text-[#047c73]" : ""
                  }`}
                >
                  {option}
                  {sendTo === option && <Check size={16} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {!sendOpen && (
          <>
            <div className="mt-5">
              <p className="mb-3 font-semibold">Delivery Channels</p>
              <label className="flex items-center gap-3 text-[#17223b]">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#007f72] text-white">
                  <Check size={12} />
                </span>
                Send In-App Notification
              </label>

              <label className="mt-3 flex items-center gap-3 text-[#52657d]">
                <span className="h-4 w-4 rounded-full border border-teal-300" />
                Send WhatsApp Message
                <span className="rounded-full border border-orange-200 bg-white px-3 py-1 text-xs font-bold text-orange-600">
                  Configure Twilio in Settings
                </span>
              </label>
            </div>

            <div className="mt-5 rounded-xl border border-slate-200 bg-[#f8fafc] p-4">
              <p className="text-sm text-[#52657d]">Preview:</p>
              <p className="mt-3 font-bold">Announcement title...</p>
              <p className="mt-1 text-[#52657d]">Message content...</p>
              <p className="mt-2 text-sm font-semibold text-[#52657d]">
                Audience: {sendTo}
              </p>
            </div>
          </>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={onClose}
            className="h-11 rounded-xl border border-slate-200 bg-white font-semibold"
          >
            Cancel
          </button>

          <button
            onClick={onSend}
            className="flex h-11 items-center justify-center gap-3 rounded-xl bg-[#0f8277] font-bold text-white"
          >
            <Send size={17} />
            Send Announcement
          </button>
        </div>
      </div>
    </div>
  );
}