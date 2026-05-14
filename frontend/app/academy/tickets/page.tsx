"use client";

import { useState } from "react";
import {
  Bell,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Inbox,
  MessageSquare,
  Moon,
  Plus,
  Send,
  X,
} from "lucide-react";

const categories = ["Billing", "Technical", "Feature Request", "Bug Report", "General"];
const priorities = ["Low", "Medium", "High", "Urgent"];

export default function TicketsPage() {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState("");

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  }

  return (
    <main className="min-h-screen bg-[#fffdf0] text-[#17223b]">
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
          <MessageSquare size={20} />
          <Moon size={20} />
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-orange-300 to-rose-400" />
        </div>
      </header>

      {toast && (
        <div className="fixed right-12 top-[116px] z-50 flex h-14 w-[380px] items-center gap-3 rounded-lg bg-emerald-50 px-5 text-emerald-700 shadow-lg">
          <CheckCircle2 size={20} fill="currentColor" />
          <span className="font-semibold">{toast}</span>
        </div>
      )}

      <div className="px-8 py-7">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[30px] font-black">Tickets</h1>
            <p className="mt-1 text-[16px] text-[#52657d]">
              Support tickets & notifications
            </p>
          </div>

          <button
            onClick={() => setOpen(true)}
            className="flex h-10 items-center gap-2 rounded-xl bg-[#007f72] px-5 text-sm font-bold text-white shadow-sm hover:bg-[#006f64]"
          >
            <Plus size={18} />
            New Ticket
          </button>
        </div>

        <section className="mt-7 grid grid-cols-4 gap-4">
          <StatCard title="Open" value="0" tone="blue" />
          <StatCard title="In Progress" value="0" tone="orange" />
          <StatCard title="Resolved" value="0" tone="green" />
          <StatCard title="Total" value="0" tone="slate" />
        </section>

        <section className="mt-7 grid grid-cols-[1fr_2.05fr] gap-5">
          <div className="h-[260px] rounded-xl border border-slate-200 bg-[#f8fafc] p-7 shadow-sm">
            <h2 className="text-[17px] font-black">Tickets</h2>

            <div className="flex h-[190px] flex-col items-center justify-center text-center">
              <MessageSquare size={42} className="text-slate-300" />
              <p className="mt-4 text-[16px] text-[#52657d]">No tickets yet</p>
            </div>
          </div>

          <div className="h-[260px] rounded-xl border border-slate-200 bg-[#f8fafc] p-7 shadow-sm">
            <div className="flex h-full flex-col items-center justify-center text-center">
              <MessageSquare size={58} className="text-slate-300" />
              <h2 className="mt-5 text-[21px] font-black">Select a ticket</h2>
              <p className="mt-2 text-[16px] text-[#52657d]">
                Click on a ticket to view details and respond
              </p>
            </div>
          </div>
        </section>
      </div>

      {open && (
        <CreateTicketModal
          onClose={() => setOpen(false)}
          onSubmit={() => {
            setOpen(false);
            showToast("Support ticket submitted");
          }}
        />
      )}
    </main>
  );
}

function StatCard({
  title,
  value,
  tone,
}: {
  title: string;
  value: string;
  tone: "blue" | "orange" | "green" | "slate";
}) {
  const iconColor = {
    blue: "text-blue-500",
    orange: "text-orange-500",
    green: "text-emerald-500",
    slate: "text-slate-500",
  };

  return (
    <div className="h-[92px] rounded-xl border border-slate-200 bg-[#f8fafc] px-5 py-4 shadow-sm">
      <div className="flex justify-between">
        <p className="text-[14px] text-[#52657d]">{title}</p>
        <Inbox size={17} className={iconColor[tone]} />
      </div>
      <p className="mt-2 text-[28px] font-black">{value}</p>
    </div>
  );
}

function CreateTicketModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: () => void;
}) {
  const [category, setCategory] = useState("general");
  const [priority, setPriority] = useState("medium");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [priorityOpen, setPriorityOpen] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75">
      <div className="relative w-[620px] rounded-xl bg-[#fffdf0] p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-slate-500 hover:text-slate-800"
        >
          <X size={20} />
        </button>

        <h2 className="mb-6 text-[22px] font-black">Create Support Ticket</h2>

        <div className="grid grid-cols-2 gap-4">
          <DropdownField
            label="Category"
            value={category}
            open={categoryOpen}
            setOpen={setCategoryOpen}
            options={categories}
            onSelect={(v) => setCategory(v.toLowerCase())}
          />

          <DropdownField
            label="Priority"
            value={priority}
            open={priorityOpen}
            setOpen={setPriorityOpen}
            options={priorities}
            onSelect={(v) => setPriority(v.toLowerCase())}
          />
        </div>

        <div className="mt-4">
          <label className="text-sm font-semibold text-slate-700">Subject *</label>
          <input
            placeholder="Brief description of your issue"
            className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-4 outline-none placeholder:text-[#52657d]"
          />
        </div>

        <div className="mt-4">
          <label className="text-sm font-semibold text-slate-700">Message *</label>
          <textarea
            placeholder="Describe your issue in detail..."
            className="mt-2 h-[120px] w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none placeholder:text-[#52657d]"
          />
        </div>

        <button
          onClick={onSubmit}
          className="mt-4 flex h-11 w-full items-center justify-center gap-3 rounded-xl bg-[#0f8277] font-bold text-white hover:bg-[#0b746a]"
        >
          <Send size={17} />
          Submit Ticket
        </button>
      </div>
    </div>
  );
}

function DropdownField({
  label,
  value,
  open,
  setOpen,
  options,
  onSelect,
}: {
  label: string;
  value: string;
  open: boolean;
  setOpen: (v: boolean) => void;
  options: string[];
  onSelect: (v: string) => void;
}) {
  return (
    <div className="relative">
      <label className="text-sm font-semibold text-slate-700">{label}</label>

      <button
        onClick={() => setOpen(!open)}
        className="mt-2 flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 text-left"
      >
        {value}
        <ChevronDown size={17} />
      </button>

      {open && (
        <div className="absolute left-0 top-[74px] z-[70] w-full overflow-hidden rounded-xl border border-slate-200 bg-white py-2 shadow-xl">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => {
                onSelect(option);
                setOpen(false);
              }}
              className={`flex h-10 w-full items-center justify-between px-4 text-left hover:bg-slate-50 ${
                value.toLowerCase() === option.toLowerCase()
                  ? "bg-[#d8ece9] text-[#047c73]"
                  : ""
              }`}
            >
              {option}
              {value.toLowerCase() === option.toLowerCase() && <span>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}