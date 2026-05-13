"use client";

import { useMemo, useState } from "react";
import {
  Bell,
  Check,
  ChevronDown,
  Filter,
  IndianRupee,
  Megaphone,
  Search,
  Send,
  Shield,
  TriangleAlert,
  X,
} from "lucide-react";

type ReadFilter = "All" | "Unread" | "Read";
type PriorityFilter = "All Priority" | "Urgent" | "Important" | "Info";

type Announcement = {
  id: string;
  title: string;
  date: string;
  type: string;
  priority: PriorityFilter;
  read: boolean;
  icon: "rupee" | "shield" | "alert";
};

const initialAnnouncements: Announcement[] = [
  {
    id: "1",
    title: "2 academies have overdue payments totaling ₹2,387",
    date: "4/28/2026",
    type: "Fee Overdue",
    priority: "Urgent",
    read: false,
    icon: "rupee",
  },
  {
    id: "2",
    title: "Platform uptime: 99.9% this month. All systems healthy.",
    date: "4/28/2026",
    type: "System Alert",
    priority: "Urgent",
    read: false,
    icon: "shield",
  },
  {
    id: "3",
    title: "AI detected 3 duplicate invoices — ₹7102 risk",
    date: "4/28/2026",
    type: "Duplicate Detected",
    priority: "Urgent",
    read: false,
    icon: "alert",
  },
];

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] =
    useState<Announcement[]>(initialAnnouncements);

  const [search, setSearch] = useState("");
  const [readFilter, setReadFilter] = useState<ReadFilter>("All");
  const [priorityFilter, setPriorityFilter] =
    useState<PriorityFilter>("Urgent");

  const [showReadDrop, setShowReadDrop] = useState(false);
  const [showPriorityDrop, setShowPriorityDrop] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState("");

  const [form, setForm] = useState({
    title: "",
    message: "",
    sendTo: "All (Students + Employees)",
    inApp: true,
    whatsapp: false,
  });

  const filtered = useMemo(() => {
    let data = [...announcements];

    if (readFilter === "Unread") data = data.filter((a) => !a.read);
    if (readFilter === "Read") data = data.filter((a) => a.read);

    if (priorityFilter !== "All Priority") {
      data = data.filter((a) => a.priority === priorityFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.type.toLowerCase().includes(q) ||
          a.priority.toLowerCase().includes(q)
      );
    }

    return data;
  }, [announcements, search, readFilter, priorityFilter]);

  const unreadCount = announcements.filter((a) => !a.read).length;
  const urgentCount = announcements.filter((a) => a.priority === "Urgent").length;
  const typeCount = new Set(announcements.map((a) => a.type)).size;

  const markAllRead = () => {
    setAnnouncements((prev) => prev.map((a) => ({ ...a, read: true })));
    setToast("All notifications marked as read");
    setTimeout(() => setToast(""), 2500);
  };

  const createAnnouncement = () => {
    if (!form.title.trim() || !form.message.trim()) return;

    const newItem: Announcement = {
      id: String(Date.now()),
      title: form.title,
      date: new Date().toLocaleDateString("en-US"),
      type: "Manual Announcement",
      priority: "Info",
      read: false,
      icon: "shield",
    };

    setAnnouncements((prev) => [newItem, ...prev]);
    setShowModal(false);
    setToast("Announcement sent successfully");
    setTimeout(() => setToast(""), 2500);

    setForm({
      title: "",
      message: "",
      sendTo: "All (Students + Employees)",
      inApp: true,
      whatsapp: false,
    });
  };

  return (
    <div className="min-h-screen bg-[#fffdf0] px-6 py-6 text-[#061739]">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Megaphone size={24} className="text-[#00796b]" />
            <h1 className="text-[26px] font-extrabold tracking-tight">
              Announcements
            </h1>
          </div>

          <p className="mt-1 text-[14px] text-[#536987]">
            {unreadCount} unread • {urgentCount} urgent
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={markAllRead}
            className="flex h-[38px] items-center gap-2 rounded-xl border border-[#d8e0ec] bg-white px-4 text-[13px] font-bold shadow-sm hover:bg-slate-50"
          >
            <Check size={15} />
            Mark All Read
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="flex h-[38px] items-center gap-2 rounded-xl bg-[#00796b] px-4 text-[13px] font-bold text-white shadow-sm hover:bg-[#006b5f]"
          >
            <Send size={15} />
            Create Announcement
          </button>
        </div>
      </div>

      <section className="mb-5 grid grid-cols-4 gap-4">
        <StatCard label="Total" value={announcements.length} icon={<Bell />} />
        <StatCard label="Unread" value={unreadCount} icon={<span />} green />
        <StatCard label="Urgent" value={urgentCount} icon={<TriangleAlert />} red />
        <StatCard label="Types" value={typeCount} icon={<Filter />} />
      </section>

      <section className="mb-5 flex items-center gap-3">
        <div className="relative w-[360px]">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#536987]"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notifications..."
            className="h-[42px] w-full rounded-xl border border-[#d8e0ec] bg-white pl-10 pr-4 text-[14px] outline-none focus:border-[#00897b]"
          />
        </div>

        <Dropdown
          value={readFilter}
          open={showReadDrop}
          setOpen={setShowReadDrop}
          options={["All", "Unread", "Read"]}
          onSelect={(v) => setReadFilter(v as ReadFilter)}
        />

        <Dropdown
          value={priorityFilter === "All Priority" ? "All Priority" : priorityFilter}
          open={showPriorityDrop}
          setOpen={setShowPriorityDrop}
          options={["All Priority", "Urgent", "Important", "Info"]}
          onSelect={(v) => setPriorityFilter(v as PriorityFilter)}
        />

        <span className="rounded-full bg-[#eef3f8] px-3 py-2 text-[12px] font-bold">
          {filtered.length} results
        </span>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#d8e0ec] bg-[#eef7f8] shadow-sm">
        {filtered.map((item, index) => (
          <div
            key={item.id}
            className={`grid grid-cols-[64px_1fr_130px] items-center border-b border-[#d8e0ec] px-5 py-4 ${
              index === 0 ? "border-l-4 border-l-[#ef4444]" : ""
            }`}
          >
            <div
              className={`flex h-[42px] w-[42px] items-center justify-center rounded-xl ${
                item.priority === "Urgent" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
              }`}
            >
              {item.icon === "rupee" && <IndianRupee size={22} />}
              {item.icon === "shield" && <Shield size={22} />}
              {item.icon === "alert" && <TriangleAlert size={22} />}
            </div>

            <div>
              <h2 className="text-[15px] font-extrabold">{item.title}</h2>
              <div className="mt-2 flex items-center gap-2 text-[12px] text-[#536987]">
                <span>{item.date}</span>
                <span>•</span>
                <span className="rounded-full border border-[#d8e0ec] bg-white px-3 py-1 text-[11px] font-bold text-[#061739]">
                  {item.type}
                </span>
                <span className="rounded-full bg-red-500 px-3 py-1 text-[11px] font-bold text-white">
                  {item.priority}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 text-[13px] font-bold">
              <button
                onClick={() =>
                  setAnnouncements((prev) =>
                    prev.map((a) =>
                      a.id === item.id ? { ...a, read: !a.read } : a
                    )
                  )
                }
                className="flex items-center gap-2"
              >
                <Check size={15} />
                {item.read ? "Unread" : "Read"}
              </button>
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  item.read ? "bg-slate-300" : "bg-red-500"
                }`}
              />
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="flex h-[220px] items-center justify-center text-[14px] text-[#536987]">
            No announcements found
          </div>
        )}
      </section>

      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-[720px] rounded-2xl bg-[#fffdf0] p-7 shadow-2xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Megaphone size={22} className="text-[#00796b]" />
                <h2 className="text-[20px] font-extrabold">
                  Create Announcement
                </h2>
              </div>

              <button onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <label className="mb-5 block">
              <span className="mb-2 block text-[13px] font-bold">
                Announcement Title *
              </span>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g., Important: Training Session Cancelled"
                className="h-[44px] w-full rounded-xl border border-[#00897b] bg-[#fffdf0] px-4 text-[14px] outline-none"
              />
            </label>

            <label className="mb-5 block">
              <span className="mb-2 block text-[13px] font-bold">
                Message *
              </span>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Write your announcement message here..."
                className="h-[105px] w-full resize-none rounded-xl border border-[#d8e0ec] bg-[#fffdf0] px-4 py-3 text-[14px] outline-none focus:border-[#00897b]"
              />
            </label>

            <label className="mb-5 block">
              <span className="mb-2 block text-[13px] font-bold">Send To</span>
              <select
                value={form.sendTo}
                onChange={(e) => setForm({ ...form, sendTo: e.target.value })}
                className="h-[44px] w-full rounded-xl border border-[#d8e0ec] bg-[#fffdf0] px-4 text-[14px] outline-none focus:border-[#00897b]"
              >
                <option>All (Students + Employees)</option>
                <option>Students Only</option>
                <option>Employees Only</option>
                <option>Coaches Only</option>
              </select>
            </label>

            <div className="mb-5">
              <p className="mb-3 text-[13px] font-bold">Delivery Channels</p>

              <label className="mb-3 flex cursor-pointer items-center gap-3 text-[14px]">
                <input
                  type="checkbox"
                  checked={form.inApp}
                  onChange={(e) => setForm({ ...form, inApp: e.target.checked })}
                  className="h-4 w-4 accent-[#00796b]"
                />
                Send In-App Notification
              </label>

              <label className="flex cursor-pointer items-center gap-3 text-[14px] text-[#536987]">
                <input
                  type="checkbox"
                  checked={form.whatsapp}
                  onChange={(e) =>
                    setForm({ ...form, whatsapp: e.target.checked })
                  }
                  className="h-4 w-4 accent-[#00796b]"
                />
                Send WhatsApp Message
                <span className="rounded-full bg-orange-50 px-3 py-1 text-[12px] font-bold text-orange-600">
                  Configure Twilio in Settings
                </span>
              </label>
            </div>

            <div className="mb-5 rounded-xl border border-[#d8e0ec] bg-[#f8fbff] p-4">
              <p className="mb-3 text-[12px] font-bold text-[#536987]">
                Preview:
              </p>
              <h3 className="text-[14px] font-extrabold">
                {form.title || "Announcement title..."}
              </h3>
              <p className="mt-2 text-[14px] text-[#536987]">
                {form.message || "Message content..."}
              </p>
              <p className="mt-2 text-[12px] font-bold text-[#536987]">
                Audience: {form.sendTo}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="h-[42px] rounded-xl border border-[#d8e0ec] bg-white text-[14px] font-bold"
              >
                Cancel
              </button>

              <button
                onClick={createAnnouncement}
                className="flex h-[42px] items-center justify-center gap-2 rounded-xl bg-[#00796b] text-[14px] font-bold text-white"
              >
                <Send size={16} />
                Send Announcement
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed right-8 top-5 z-[1000] flex w-[380px] items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-[13px] font-bold text-emerald-700 shadow-lg">
          <Check size={18} />
          {toast}
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  green,
  red,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  green?: boolean;
  red?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-[#d8e0ec] bg-[#f8fbff] p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-[#536987]">{label}</p>
        <div
          className={
            red ? "text-red-500" : green ? "text-[#00796b]" : "text-[#536987]"
          }
        >
          {icon}
        </div>
      </div>
      <h2
        className={`mt-2 text-[24px] font-extrabold ${
          red ? "text-red-500" : green ? "text-[#00796b]" : ""
        }`}
      >
        {value}
      </h2>
    </div>
  );
}

function Dropdown({
  value,
  open,
  setOpen,
  options,
  onSelect,
}: {
  value: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  options: string[];
  onSelect: (value: string) => void;
}) {
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-[42px] w-[150px] items-center justify-between rounded-xl border border-[#d8e0ec] bg-white px-4 text-[13px] font-bold"
      >
        {value}
        <ChevronDown size={15} />
      </button>

      {open && (
        <div className="absolute top-12 z-50 w-[150px] rounded-xl border border-[#d8e0ec] bg-white p-2 shadow-xl">
          {options.map((item) => (
            <button
              key={item}
              onClick={() => {
                onSelect(item);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[13px] ${
                value === item ? "bg-[#d9f0ee] text-[#00796b]" : ""
              }`}
            >
              {item}
              {value === item && <Check size={14} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}