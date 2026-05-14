"use client";

import { useMemo, useState } from "react";
import {
  Calendar,
  Clock,
  ClipboardCheck,
  Plus,
  Sparkles,
  X,
} from "lucide-react";

type Session = {
  id: number;
  title: string;
  course: string;
  batch: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  drills: string;
};

export default function EmployeeTrainingSessionsPage() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "all">("upcoming");
  const [open, setOpen] = useState(false);

  const [sessions, setSessions] = useState<Session[]>([]);

  const [form, setForm] = useState({
    title: "",
    course: "Any",
    batch: "",
    date: "2026-05-13",
    time: "16:00",
    duration: "60",
    location: "",
    drills: "",
  });

  const visibleSessions = useMemo(() => {
    if (activeTab === "all") return sessions;

    return sessions.filter(
      (s) => new Date(s.date) >= new Date("2026-05-13")
    );
  }, [activeTab, sessions]);

  const createSession = () => {
    if (!form.title.trim()) return;

    setSessions((prev) => [
      {
        id: Date.now(),
        title: form.title,
        course: form.course,
        batch: form.batch || "Evening",
        date: form.date,
        time: form.time,
        duration: form.duration,
        location: form.location || "Main Ground",
        drills: form.drills || "Passing, Sprints",
      },
      ...prev,
    ]);

    setOpen(false);

    setForm({
      title: "",
      course: "Any",
      batch: "",
      date: "2026-05-13",
      time: "16:00",
      duration: "60",
      location: "",
      drills: "",
    });
  };

  return (
    <div className="min-h-screen bg-[#fffdf1] px-8 py-7 text-[#172236]">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-[30px] font-extrabold">
            Training Sessions
          </h1>

          <p className="mt-1 text-[16px] text-slate-500">
            {sessions.length} sessions
          </p>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="flex h-[46px] items-center gap-3 rounded-xl bg-[#087f73] px-6 text-[15px] font-bold text-white"
        >
          <Plus size={18} />
          New Session
        </button>
      </div>

      <div className="mb-7 inline-flex rounded-2xl bg-[#eef3f9] p-1">
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`rounded-xl px-5 py-2 text-[15px] font-semibold ${
            activeTab === "upcoming"
              ? "bg-white text-[#172236] shadow-sm"
              : "text-slate-500"
          }`}
        >
          Upcoming
        </button>

        <button
          onClick={() => setActiveTab("all")}
          className={`rounded-xl px-5 py-2 text-[15px] font-semibold ${
            activeTab === "all"
              ? "bg-white text-[#172236] shadow-sm"
              : "text-slate-500"
          }`}
        >
          All
        </button>
      </div>

      {visibleSessions.length === 0 ? (
        <div className="flex h-[188px] items-center justify-center rounded-2xl border border-[#d8dee8] bg-[#f8fafc] shadow-sm">
          <div className="text-center">
            <Sparkles className="mx-auto mb-4 text-slate-300" size={46} />

            <p className="text-[18px] text-slate-500">
              No sessions yet. Create your first training session above.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleSessions.map((session) => (
            <div
              key={session.id}
              className="rounded-2xl border border-[#d8dee8] bg-[#f8fafc] p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-extrabold">
                    {session.title}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {session.course} • {session.batch}
                  </p>
                </div>

                <span className="rounded-full bg-[#dff8ef] px-3 py-1 text-sm font-bold text-[#087f73]">
                  Upcoming
                </span>
              </div>

              <div className="mt-5 grid grid-cols-4 gap-3">
                <Info icon={Calendar} label="Date" value={session.date} />
                <Info icon={Clock} label="Time" value={session.time} />
                <Info
                  icon={Clock}
                  label="Duration"
                  value={`${session.duration} min`}
                />
                <Info
                  icon={ClipboardCheck}
                  label="Location"
                  value={session.location}
                />
              </div>

              <p className="mt-4 text-sm text-slate-600">
                <b>Drills:</b> {session.drills}
              </p>
            </div>
          ))}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="relative max-h-[88vh] w-[610px] overflow-y-auto rounded-2xl bg-[#fffdf1] p-7">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-6 top-6"
            >
              <X size={22} />
            </button>

            <h2 className="mb-6 text-[24px] font-extrabold">
              Plan Training Session
            </h2>

            <div className="space-y-5">
              <Field label="Title *">
                <input
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                  placeholder="e.g. Sprint & Passing Drills"
                  className="input"
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Course">
                  <select
                    value={form.course}
                    onChange={(e) =>
                      setForm({ ...form, course: e.target.value })
                    }
                    className="input"
                  >
                    <option>Any</option>
                    <option>Football</option>
                    <option>Fitness</option>
                  </select>
                </Field>

                <Field label="Batches (any)">
                  <p className="text-xs text-slate-500">
                    Tap to schedule across multiple batches
                  </p>
                </Field>
              </div>

              <div className="flex flex-wrap gap-2">
                {["Morning", "Afternoon", "Evening", "Weekend"].map((b) => (
                  <button
                    key={b}
                    onClick={() => setForm({ ...form, batch: b })}
                    className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${
                      form.batch === b
                        ? "border-[#087f73] bg-[#dff8ef] text-[#087f73]"
                        : "border-[#d8dee8] bg-white text-slate-500"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Field label="Date *">
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) =>
                      setForm({ ...form, date: e.target.value })
                    }
                    className="input"
                  />
                </Field>

                <Field label="Time">
                  <input
                    type="time"
                    value={form.time}
                    onChange={(e) =>
                      setForm({ ...form, time: e.target.value })
                    }
                    className="input"
                  />
                </Field>

                <Field label="Duration">
                  <input
                    value={form.duration}
                    onChange={(e) =>
                      setForm({ ...form, duration: e.target.value })
                    }
                    className="input"
                  />
                </Field>
              </div>

              <Field label="Locations">
                <div className="flex flex-wrap gap-2">
                  {[
                    "Main Ground",
                    "Court 1",
                    "Court 2",
                    "Indoor Hall",
                    "Pool",
                    "Practice Field",
                    "Stadium",
                  ].map((loc) => (
                    <button
                      key={loc}
                      onClick={() => setForm({ ...form, location: loc })}
                      className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${
                        form.location === loc
                          ? "border-[#087f73] bg-[#dff8ef] text-[#087f73]"
                          : "border-[#d8dee8] bg-white text-slate-500"
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Drills">
                <input
                  value={form.drills}
                  onChange={(e) =>
                    setForm({ ...form, drills: e.target.value })
                  }
                  placeholder="Passing, Sprints"
                  className="input"
                />
              </Field>

              <button
                onClick={createSession}
                className="w-full rounded-xl bg-[#087f73] py-3 text-[15px] font-bold text-white"
              >
                Create Training Session
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .input {
          width: 100%;
          height: 44px;
          border-radius: 12px;
          border: 1px solid #d8dee8;
          background: #fffdf1;
          padding: 0 14px;
          font-size: 15px;
          outline: none;
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <p className="mb-2 text-[14px] font-semibold">
        {label}
      </p>
      {children}
    </label>
  );
}

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-[#d8dee8] bg-white p-3">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Icon size={15} />
        {label}
      </div>

      <p className="font-bold">{value}</p>
    </div>
  );
}