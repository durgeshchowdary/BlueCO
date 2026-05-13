"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Inbox,
  MessageSquare,
  Plus,
  Send,
  X,
} from "lucide-react";

type TicketStatus = "open" | "progress" | "resolved";
type Ticket = {
  id: string;
  category: string;
  priority: string;
  subject: string;
  message: string;
  status: TicketStatus;
};

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    category: "general",
    priority: "medium",
    subject: "",
    message: "",
  });

  const counts = useMemo(
    () => ({
      open: tickets.filter((t) => t.status === "open").length,
      progress: tickets.filter((t) => t.status === "progress").length,
      resolved: tickets.filter((t) => t.status === "resolved").length,
      total: tickets.length,
    }),
    [tickets]
  );

  const submitTicket = () => {
    if (!form.subject.trim() || !form.message.trim()) return;

    const newTicket: Ticket = {
      id: `TCK-${String(Date.now()).slice(-5)}`,
      category: form.category,
      priority: form.priority,
      subject: form.subject,
      message: form.message,
      status: "open",
    };

    setTickets((prev) => [newTicket, ...prev]);
    setSelectedTicket(newTicket);
    setShowModal(false);

    setForm({
      category: "general",
      priority: "medium",
      subject: "",
      message: "",
    });
  };

  return (
    <div className="min-h-screen bg-[#fffdf0] px-6 py-6 text-[#061739]">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-[26px] font-extrabold tracking-tight">
            Tickets
          </h1>
          <p className="mt-1 text-[14px] text-[#536987]">
            Manage all academy tickets & notifications
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex h-[38px] items-center gap-2 rounded-xl bg-[#00796b] px-4 text-[13px] font-bold text-white shadow-sm hover:bg-[#006b5f]"
        >
          <Plus size={15} />
          New Ticket
        </button>
      </div>

      <section className="mb-6 grid grid-cols-4 gap-4">
        <StatCard
          label="Open"
          value={counts.open}
          icon={<AlertCircle size={16} className="text-blue-500" />}
        />
        <StatCard
          label="In Progress"
          value={counts.progress}
          icon={<Clock size={16} className="text-amber-500" />}
        />
        <StatCard
          label="Resolved"
          value={counts.resolved}
          icon={<CheckCircle size={16} className="text-emerald-500" />}
        />
        <StatCard
          label="Total"
          value={counts.total}
          icon={<Inbox size={16} className="text-[#536987]" />}
        />
      </section>

      <section className="grid grid-cols-[420px_1fr] gap-4">
        <div className="min-h-[260px] rounded-2xl border border-[#d8e0ec] bg-[#f8fbff] p-6 shadow-sm">
          <h2 className="mb-5 text-[16px] font-extrabold">Tickets</h2>

          {tickets.length === 0 ? (
            <div className="flex h-[180px] flex-col items-center justify-center text-center">
              <MessageSquare size={42} className="text-[#c2cbd8]" />
              <p className="mt-4 text-[14px] text-[#536987]">
                No tickets yet
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <button
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`w-full rounded-xl border p-4 text-left transition ${
                    selectedTicket?.id === ticket.id
                      ? "border-[#00897b] bg-[#fffdf0]"
                      : "border-[#d8e0ec] bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-[14px] font-extrabold">
                      {ticket.subject}
                    </h3>
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-[10px] font-bold text-blue-700">
                      {ticket.status}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-[12px] text-[#536987]">
                    {ticket.message}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="min-h-[260px] rounded-2xl border border-[#d8e0ec] bg-[#f8fbff] p-6 shadow-sm">
          {selectedTicket ? (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-[18px] font-extrabold">
                    {selectedTicket.subject}
                  </h2>
                  <p className="mt-1 text-[13px] text-[#536987]">
                    {selectedTicket.id} · {selectedTicket.category} ·{" "}
                    {selectedTicket.priority}
                  </p>
                </div>

                <span className="rounded-full bg-blue-100 px-3 py-1 text-[12px] font-bold text-blue-700">
                  {selectedTicket.status}
                </span>
              </div>

              <div className="rounded-xl border border-[#d8e0ec] bg-white p-4 text-[14px] leading-6 text-[#334155]">
                {selectedTicket.message}
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={() =>
                    setTickets((prev) =>
                      prev.map((t) =>
                        t.id === selectedTicket.id
                          ? { ...t, status: "progress" }
                          : t
                      )
                    )
                  }
                  className="rounded-xl border bg-white px-4 py-2 text-[13px] font-bold"
                >
                  Mark In Progress
                </button>

                <button
                  onClick={() =>
                    setTickets((prev) =>
                      prev.map((t) =>
                        t.id === selectedTicket.id
                          ? { ...t, status: "resolved" }
                          : t
                      )
                    )
                  }
                  className="rounded-xl bg-[#00796b] px-4 py-2 text-[13px] font-bold text-white"
                >
                  Resolve
                </button>
              </div>
            </div>
          ) : (
            <div className="flex h-[210px] flex-col items-center justify-center text-center">
              <MessageSquare size={52} className="text-[#c2cbd8]" />
              <h2 className="mt-5 text-[17px] font-extrabold">
                Select a ticket
              </h2>
              <p className="mt-2 text-[14px] text-[#536987]">
                Click on a ticket to view details and respond
              </p>
            </div>
          )}
        </div>
      </section>

      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-[560px] rounded-2xl bg-[#fffdf0] p-7 shadow-2xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-[20px] font-extrabold text-[#1f2937]">
                Create Support Ticket
              </h2>

              <button
                onClick={() => setShowModal(false)}
                className="text-[#536987] hover:text-[#061739]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label>
                <span className="mb-2 block text-[13px] font-bold">
                  Category
                </span>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className="h-[44px] w-full rounded-xl border border-[#00897b] bg-[#fffdf0] px-4 text-[14px] outline-none"
                >
                  <option>general</option>
                  <option>billing</option>
                  <option>technical</option>
                  <option>academy</option>
                </select>
              </label>

              <label>
                <span className="mb-2 block text-[13px] font-bold">
                  Priority
                </span>
                <select
                  value={form.priority}
                  onChange={(e) =>
                    setForm({ ...form, priority: e.target.value })
                  }
                  className="h-[44px] w-full rounded-xl border border-[#d8e0ec] bg-[#fffdf0] px-4 text-[14px] outline-none focus:border-[#00897b]"
                >
                  <option>low</option>
                  <option>medium</option>
                  <option>high</option>
                  <option>urgent</option>
                </select>
              </label>
            </div>

            <label className="mt-5 block">
              <span className="mb-2 block text-[13px] font-bold">
                Subject *
              </span>
              <input
                value={form.subject}
                onChange={(e) =>
                  setForm({ ...form, subject: e.target.value })
                }
                placeholder="Brief description of your issue"
                className="h-[44px] w-full rounded-xl border border-[#d8e0ec] bg-[#fffdf0] px-4 text-[14px] outline-none focus:border-[#00897b]"
              />
            </label>

            <label className="mt-5 block">
              <span className="mb-2 block text-[13px] font-bold">
                Message *
              </span>
              <textarea
                value={form.message}
                onChange={(e) =>
                  setForm({ ...form, message: e.target.value })
                }
                placeholder="Describe your issue in detail..."
                className="h-[112px] w-full resize-none rounded-xl border border-[#d8e0ec] bg-[#fffdf0] px-4 py-3 text-[14px] outline-none focus:border-[#00897b]"
              />
            </label>

            <button
              onClick={submitTicket}
              className="mt-5 flex h-[44px] w-full items-center justify-center gap-3 rounded-xl bg-[#00796b] text-[14px] font-extrabold text-white shadow-sm hover:bg-[#006b5f]"
            >
              <Send size={16} />
              Submit Ticket
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#d8e0ec] bg-[#f8fbff] p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-medium text-[#536987]">{label}</p>
        {icon}
      </div>
      <h2 className="mt-2 text-[24px] font-extrabold">{value}</h2>
    </div>
  );
}