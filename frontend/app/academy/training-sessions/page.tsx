"use client";

import { useState } from "react";
import {
  Bell,
  Calendar,
  Check,
  ChevronDown,
  Clock,
  Clock3,
  MessageSquare,
  Moon,
  Plus,
  Sparkles,
  X,
} from "lucide-react";

type Tab = "upcoming" | "all";

export default function TrainingSessionsPage() {
  const [tab, setTab] = useState<Tab>("upcoming");
  const [open, setOpen] = useState(false);

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
        <h2 className="text-[22px] font-black text-[#17223b]">
          Welcome, Vijayawada blues
        </h2>

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

      <div className="px-8 py-7">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[28px] font-black">Training Sessions</h1>
            <p className="mt-1 text-[15px] text-[#52657d]">0 sessions</p>
          </div>

          <button
            onClick={() => setOpen(true)}
            className="flex h-10 items-center gap-2 rounded-xl bg-[#007f72] px-5 text-sm font-bold text-white shadow-sm hover:bg-[#006f64]"
          >
            <Plus size={18} />
            New Session
          </button>
        </div>

        <div className="mt-8 inline-flex h-11 items-center gap-1 rounded-xl bg-[#eef2f6] p-1">
          <button
            onClick={() => setTab("upcoming")}
            className={`h-9 rounded-xl px-4 text-[15px] font-semibold ${
              tab === "upcoming"
                ? "bg-[#fffdf0] text-slate-950 shadow-sm ring-1 ring-black/5"
                : "text-slate-500"
            }`}
          >
            Upcoming
          </button>

          <button
            onClick={() => setTab("all")}
            className={`h-9 rounded-xl px-4 text-[15px] font-semibold ${
              tab === "all"
                ? "bg-[#fffdf0] text-slate-950 shadow-sm ring-1 ring-black/5"
                : "text-slate-500"
            }`}
          >
            All
          </button>
        </div>

        <div className="mt-7 flex h-[180px] items-center justify-center rounded-xl border border-slate-200 bg-[#f8fafc] shadow-sm">
          <div className="flex flex-col items-center text-center">
            <Sparkles size={44} className="text-slate-400" />

            <p className="mt-4 text-[18px] text-[#52657d]">
              No sessions yet. Create your first training session above.
            </p>
          </div>
        </div>
      </div>

      {open && <TrainingSessionModal onClose={() => setOpen(false)} />}
    </main>
  );
}

function TrainingSessionModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75">
      <div className="relative max-h-[86vh] w-[620px] overflow-y-auto rounded-xl bg-[#fffdf0] p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-slate-500 hover:text-slate-800"
        >
          <X size={20} />
        </button>

        <h2 className="mb-6 text-[22px] font-black text-[#17223b]">
          Plan Training Session
        </h2>

        <ModalInput
          label="Title *"
          placeholder="e.g. Sprint & Passing Drills"
          focused
        />

        <div className="mt-4 grid grid-cols-2 gap-4">
          <ModalSelect label="Course" placeholder="Any" />

          <div>
            <label className="text-sm font-semibold text-slate-700">
              Batches (any)
            </label>
            <p className="mt-3 text-[12px] font-medium text-[#52657d]">
              Tap to schedule across multiple batches
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {["Morning", "Afternoon", "Evening", "Weekend"].map((chip) => (
            <button
              key={chip}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[13px] font-semibold text-[#52657d]"
            >
              {chip}
            </button>
          ))}
        </div>

        <div className="mt-3 flex gap-2">
          <input
            placeholder="Custom batch (e.g. U-14 Squad)..."
            className="h-10 flex-1 rounded-xl border border-slate-200 bg-white px-4 outline-none placeholder:text-slate-500"
          />
          <button className="h-10 rounded-xl border border-slate-200 bg-white px-4 font-semibold">
            Add
          </button>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-4">
          <ModalInput
            label="Date *"
            placeholder="14-05-2026"
            icon={<Calendar size={17} />}
          />
          <ModalInput
            label="Time"
            placeholder="16:00"
            icon={<Clock size={17} />}
          />
          <ModalInput label="Duration (min)" placeholder="60" />
        </div>

        <div className="mt-5">
          <label className="text-sm font-semibold text-slate-700">
            Locations (any)
          </label>
          <p className="mt-2 text-[12px] font-medium text-[#52657d]">
            Run the same session across multiple grounds/courts
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {[
              "Main Ground",
              "Court 1",
              "Court 2",
              "Indoor Hall",
              "Pool",
              "Practice Field",
              "Stadium",
            ].map((chip) => (
              <button
                key={chip}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[13px] font-semibold text-[#52657d]"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          <input
            placeholder="Custom ground / venue..."
            className="h-10 flex-1 rounded-xl border border-slate-200 bg-white px-4 outline-none placeholder:text-slate-500"
          />
          <button className="h-10 rounded-xl border border-slate-200 bg-white px-4 font-semibold">
            Add
          </button>
        </div>

        <div className="mt-5">
          <ModalInput
            label="Drills (comma-separated)"
            placeholder="Passing, Sprints, Match Play"
          />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4">
          <ModalInput label="Max Participants" placeholder="30" />
          <ModalSelect label="Coach" placeholder="Select coach" />
        </div>

        <button
          onClick={onClose}
          className="mt-5 h-11 w-full rounded-xl bg-[#0f8277] font-bold text-white hover:bg-[#0b746a]"
        >
          Save Training Session
        </button>
      </div>
    </div>
  );
}

function ModalInput({
  label,
  placeholder,
  icon,
  focused,
}: {
  label: string;
  placeholder: string;
  icon?: React.ReactNode;
  focused?: boolean;
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-700">{label}</label>

      <div
        className={`mt-2 flex h-11 items-center rounded-xl border bg-white px-4 ${
          focused ? "border-teal-600" : "border-slate-200"
        }`}
      >
        <input
          placeholder={placeholder}
          className="w-full bg-transparent outline-none placeholder:text-slate-500"
        />
        {icon}
      </div>
    </div>
  );
}

function ModalSelect({
  label,
  placeholder,
}: {
  label: string;
  placeholder: string;
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-700">{label}</label>

      <button className="mt-2 flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 text-left">
        {placeholder}
        <ChevronDown size={17} />
      </button>
    </div>
  );
}