"use client";

import { useState } from "react";
import {
  Bell,
  Calendar,
  CalendarDays,
  ChevronDown,
  Clock3,
  MessageSquare,
  Moon,
  Plus,
  X,
} from "lucide-react";

export default function EventsPage() {
  const [eventOpen, setEventOpen] = useState(false);

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
            <h1 className="text-[28px] font-black">Events</h1>
            <p className="mt-1 text-[15px] text-[#52657d]">0 events</p>
          </div>

          <button
            onClick={() => setEventOpen(true)}
            className="flex h-10 items-center gap-2 rounded-xl bg-[#007f72] px-5 text-sm font-bold text-white shadow-sm hover:bg-[#006f64]"
          >
            <Plus size={18} />
            Create Event
          </button>
        </div>

        <div className="mt-8 flex h-[315px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-[#f8fafc] shadow-sm">
          <div className="flex flex-col items-center text-center">
            <CalendarDays size={52} className="text-slate-400" />

            <h2 className="mt-5 text-[21px] font-black text-slate-950">
              No events yet
            </h2>

            <p className="mt-2 text-[16px] text-[#52657d]">
              Create your first event to get started
            </p>

            <button
              onClick={() => setEventOpen(true)}
              className="mt-5 h-10 rounded-xl bg-[#007f72] px-5 text-sm font-bold text-white hover:bg-[#006f64]"
            >
              Create Event
            </button>
          </div>
        </div>
      </div>

      {eventOpen && <CreateEventModal onClose={() => setEventOpen(false)} />}
    </main>
  );
}

function CreateEventModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75">
      <div className="relative w-[620px] rounded-xl bg-[#fffdf0] p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-slate-500 hover:text-slate-800"
        >
          <X size={20} />
        </button>

        <h2 className="mb-6 text-[22px] font-black text-[#17223b]">
          Create Event
        </h2>

        <div>
          <ModalInput
            label="Title *"
            placeholder="Annual Football Tournament"
            focused
          />
        </div>

        <div className="mt-4">
          <label className="text-sm font-semibold text-slate-700">
            Description
          </label>
          <textarea
            placeholder="Event details..."
            className="mt-2 h-[92px] w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none placeholder:text-slate-500"
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <ModalSelect label="Type" placeholder="Tournament" />
          <ModalInput label="Venue" placeholder="Stadium, City" />
          <ModalInput
            label="Start Date *"
            placeholder="dd-mm-yyyy"
            icon={<Calendar size={17} />}
          />
          <ModalInput
            label="End Date"
            placeholder="dd-mm-yyyy"
            icon={<Calendar size={17} />}
          />
          <ModalInput label="Max Participants" placeholder="100" />
          <ModalInput label="Entry Fee (₹)" placeholder="0" />
        </div>

        <button
          onClick={onClose}
          className="mt-4 h-11 w-full rounded-xl bg-[#0f8277] font-bold text-white hover:bg-[#0b746a]"
        >
          Create Event
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