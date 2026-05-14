"use client";

import { useState } from "react";
import {
  Bell,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Eye,
  Mail,
  Plus,
  Printer,
  Search,
  Share2,
  Star,
  X,
} from "lucide-react";

type Tab = "classroom" | "attendance" | "progress";
type AttendanceView = "mark" | "view";
type AttendanceStatus = "P" | "A" | "L" | "Lv" | "Not marked";

const students = [
  {
    name: "Kiaansh G",
    id: "STUD002",
    phone: "9550222018",
    batch: "Evening",
    attendance: 80,
    fee: "Pending",
    height: "176",
    weight: "62",
    bmi: "20.0",
    initial: "K",
  },
  {
    name: "Prem Lam",
    id: "STUD001",
    phone: "",
    batch: "Evening",
    attendance: 80,
    fee: "Pending",
    height: "-",
    weight: "-",
    bmi: "-",
    initial: "P",
  },
];

export default function EmployeeDashboardPage() {
  const [tab, setTab] = useState<Tab>("classroom");
  const [attendanceView, setAttendanceView] = useState<AttendanceView>("mark");
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({
    STUD002: "Not marked",
    STUD001: "Not marked",
  });
  const [progressOpen, setProgressOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(students[1]);

  const marked = Object.values(attendance).filter((x) => x !== "Not marked");
  const present = Object.values(attendance).filter((x) => x === "P");

  const markAllPresent = () => {
    setAttendance({
      STUD002: "P",
      STUD001: "P",
    });
  };

  const shareWhatsApp = () => {
    const text = `Athletic Progress Report for ${selectedStudent.name}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const sendEmail = () => {
    window.location.href = `mailto:?subject=Athletic Progress Report&body=Progress report for ${selectedStudent.name}`;
  };

  return (
    <div className="min-h-screen bg-[#fffdf1] px-8 py-6 text-[#172236]">
      <div className="mb-8 flex justify-end">
        <div className="relative">
          <Bell size={21} />
          <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            3
          </span>
        </div>
      </div>

      <section className="mb-6 flex items-center gap-4">
        <div className="flex h-[70px] w-[70px] items-center justify-center rounded-full border-4 border-emerald-200 bg-emerald-100 text-2xl font-black text-emerald-700">
          P
        </div>

        <div>
          <p className="text-sm text-slate-500">Welcome back,</p>
          <h1 className="text-[32px] font-black leading-none">Prabhakar!</h1>

          <div className="mt-2 flex items-center gap-2">
            <span className="rounded-full border border-emerald-300 bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-700">
              Coach
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold">
              Coaching
            </span>
            <span className="text-sm text-slate-500">Evening</span>
          </div>
        </div>
      </section>

      {tab === "classroom" && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-yellow-300 bg-[#fffdf1] px-5 py-4 text-[#b85c00]">
          <span>
            Student attendance pending: {marked.length}/2 marked today
          </span>

          <button
            onClick={() => {
              setTab("attendance");
              setAttendanceView("mark");
            }}
            className="rounded-xl border bg-white px-4 py-2 text-sm font-bold text-[#172236] shadow-sm"
          >
            Mark Now
          </button>
        </div>
      )}

      <section className="mb-6 grid grid-cols-4 gap-4">
        <StatCard title="My Attendance" value="100%" sub="1 sessions this month" color="emerald" />
        <StatCard title="Assigned Batches" value="1" sub="2 students total" color="orange" />
        <StatCard title="Pending Leaves" value="0" sub="CL: 12 | SL: 12 | PL: 15" color="red" />
        <StatCard title="Progress Cards" value="0" sub="Created by you" color="blue" />
      </section>

      <div className="mb-4 flex h-11 items-center justify-center gap-4 rounded-2xl bg-[#eef3f9]">
        <TabButton label="Classroom" active={tab === "classroom"} onClick={() => setTab("classroom")} />
        <TabButton label="Attendance" active={tab === "attendance"} onClick={() => setTab("attendance")} />
        <TabButton label="Progress" active={tab === "progress"} onClick={() => setTab("progress")} />
      </div>

      {tab === "classroom" && <Classroom />}
      {tab === "attendance" && (
        <Attendance
          view={attendanceView}
          setView={setAttendanceView}
          attendance={attendance}
          setAttendance={setAttendance}
          markAllPresent={markAllPresent}
          presentCount={present.length}
        />
      )}
      {tab === "progress" && (
        <Progress
          setProgressOpen={setProgressOpen}
          setSelectedStudent={setSelectedStudent}
          shareWhatsApp={shareWhatsApp}
          sendEmail={sendEmail}
        />
      )}

      {progressOpen && (
        <ProgressModal
          student={selectedStudent}
          onClose={() => setProgressOpen(false)}
        />
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  sub,
  color,
}: {
  title: string;
  value: string;
  sub: string;
  color: "emerald" | "orange" | "red" | "blue";
}) {
  const colors = {
    emerald: "border-l-4 border-emerald-500 text-emerald-600",
    orange: "border-l-4 border-orange-500 text-orange-500",
    red: "border-l-4 border-red-500 text-red-500",
    blue: "border-l-4 border-blue-500 text-blue-600",
  };

  return (
    <div className={`rounded-xl border bg-[#f8fafc] p-5 shadow-sm ${colors[color]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <h2 className="mt-1 text-[30px] font-black">{value}</h2>
          <p className="text-sm text-slate-500">{sub}</p>
        </div>
        <Calendar size={18} />
      </div>
    </div>
  );
}

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl px-5 py-2 text-[16px] font-semibold ${
        active ? "bg-white text-[#172236] shadow-sm" : "text-slate-500"
      }`}
    >
      {label}
    </button>
  );
}

function Classroom() {
  return (
    <div className="rounded-2xl border border-[#d8dee8] bg-[#f8fafc] p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-bold">
          Student Oversight & Performance{" "}
          <span className="ml-2 rounded-full bg-slate-100 px-2 py-1 text-xs">2</span>
        </h2>

        <div className="flex gap-2">
          <div className="flex h-10 items-center gap-2 rounded-xl border bg-white px-4">
            <Search size={17} className="text-slate-400" />
            <input className="bg-transparent outline-none" placeholder="Search..." />
          </div>

          <button className="flex h-10 items-center gap-8 rounded-xl border bg-white px-4">
            All <ChevronDown size={16} />
          </button>
        </div>
      </div>

      <table className="w-full text-left">
        <thead className="border-b text-slate-500">
          <tr>
            <th className="py-3">Student</th>
            <th>Batch</th>
            <th>Course</th>
            <th>Attendance</th>
            <th>Fee Status</th>
            <th>Performance</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {students.map((s) => (
            <tr key={s.id} className="border-b">
              <td className="py-3">
                <div className="flex items-center gap-3">
                  <Avatar initial={s.initial} />
                  <div>
                    <p className="font-bold">{s.name}</p>
                    <p className="text-sm text-slate-500">{s.phone}</p>
                  </div>
                </div>
              </td>
              <td>
                <span className="rounded-full border bg-white px-3 py-1 text-sm font-bold">
                  {s.batch}
                </span>
              </td>
              <td>-</td>
              <td>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-16 rounded-full bg-teal-100">
                    <div className="h-2 w-[80%] rounded-full bg-[#087f73]" />
                  </div>
                  {s.attendance}%
                </div>
              </td>
              <td>
                <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-bold text-red-600">
                  Pending
                </span>
              </td>
              <td className="text-yellow-400">★★★★☆</td>
              <td>
                <button className="font-bold">Profile</button>
                <button className="ml-5 text-xl">+</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Attendance({
  view,
  setView,
  attendance,
  setAttendance,
  markAllPresent,
  presentCount,
}: {
  view: AttendanceView;
  setView: (v: AttendanceView) => void;
  attendance: Record<string, AttendanceStatus>;
  setAttendance: React.Dispatch<React.SetStateAction<Record<string, AttendanceStatus>>>;
  markAllPresent: () => void;
  presentCount: number;
}) {
  return (
    <div className="rounded-2xl border border-[#d8dee8] bg-[#f8fafc] p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <button
          onClick={() => setView("mark")}
          className={`flex items-center gap-2 rounded-xl px-5 py-3 font-bold ${
            view === "mark" ? "bg-[#087f73] text-white" : "border bg-white"
          }`}
        >
          <CheckCircle2 size={18} /> Mark Attendance
        </button>

        <button
          onClick={() => setView("view")}
          className={`flex items-center gap-2 rounded-xl px-5 py-3 font-bold ${
            view === "view" ? "bg-[#087f73] text-white" : "border bg-white"
          }`}
        >
          <Eye size={18} /> View Attendance
        </button>
      </div>

      {view === "mark" ? (
        <>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-bold">Mark Attendance</h2>
              <p className="text-sm text-slate-500">{presentCount} present / 2 total</p>
            </div>

            <div className="flex gap-2">
              <input type="date" defaultValue="2026-05-13" className="h-10 rounded-xl border bg-white px-4" />
              <button className="rounded-xl border bg-white px-6">All</button>
              <button onClick={markAllPresent} className="rounded-xl bg-[#087f73] px-6 font-bold text-white">
                All Present
              </button>
            </div>
          </div>

          <div className="mb-5 h-2 rounded-full bg-teal-100">
            <div className="h-2 rounded-full bg-[#087f73]" style={{ width: `${presentCount * 50}%` }} />
          </div>

          <table className="w-full text-left">
            <thead className="border-b text-slate-500">
              <tr>
                <th className="py-3">Student</th>
                <th>Batch</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-b">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <Avatar initial={s.initial} />
                      <p className="font-bold">{s.name}</p>
                    </div>
                  </td>
                  <td>
                    <span className="rounded-full border bg-white px-3 py-1 text-sm font-bold">
                      Evening
                    </span>
                  </td>
                  <td className="text-slate-500">{attendance[s.id]}</td>
                  <td className="space-x-2">
                    {(["P", "A", "L", "Lv"] as AttendanceStatus[]).map((x) => (
                      <button
                        key={x}
                        onClick={() =>
                          setAttendance((prev) => ({
                            ...prev,
                            [s.id]: x,
                          }))
                        }
                        className={`rounded-xl border px-4 py-2 font-bold shadow-sm ${
                          attendance[s.id] === x
                            ? "bg-[#087f73] text-white"
                            : "bg-white"
                        }`}
                      >
                        {x}
                      </button>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <div>
          <h2 className="mb-4 text-xl font-bold">Attendance Records</h2>

          <div className="rounded-xl border bg-white p-5">
            {students.map((s) => (
              <div key={s.id} className="flex justify-between border-b py-3 last:border-b-0">
                <span className="font-bold">{s.name}</span>
                <span className="text-slate-500">{attendance[s.id]}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Progress({
  setProgressOpen,
  setSelectedStudent,
  shareWhatsApp,
  sendEmail,
}: {
  setProgressOpen: (v: boolean) => void;
  setSelectedStudent: (student: typeof students[number]) => void;
  shareWhatsApp: () => void;
  sendEmail: () => void;
}) {
  return (
    <div>
      <div className="mb-5 flex justify-end gap-3">
        <button onClick={shareWhatsApp} className="flex items-center gap-2 rounded-xl border bg-white px-4 py-2 font-bold">
          <Share2 size={16} /> WhatsApp
        </button>
        <button onClick={sendEmail} className="flex items-center gap-2 rounded-xl border bg-white px-4 py-2 font-bold">
          <Mail size={16} /> Email
        </button>
        <button onClick={() => window.print()} className="flex items-center gap-2 rounded-xl border bg-white px-4 py-2 font-bold">
          <Printer size={16} /> Print
        </button>
        <button onClick={() => setProgressOpen(true)} className="flex items-center gap-2 rounded-xl border bg-white px-5 py-2 font-bold">
          <Plus size={16} /> Add Progress Card...
          <ChevronDown size={16} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {students.map((s) => (
          <div key={s.id} className="overflow-hidden rounded-2xl border border-[#d8dee8] bg-[#f8fafc] shadow-sm">
            <div className="flex items-start justify-between bg-[#079b7f] p-6 text-white">
              <div>
                <h2 className="text-2xl font-black">ATHLETIC PROGRESS REPORT</h2>
                <p>2026-05-05</p>
              </div>
              <span className="rounded-xl bg-orange-500 px-4 py-2 font-bold">
                Developing
              </span>
            </div>

            <div className="grid grid-cols-2 gap-6 p-6">
              <Radar />

              <div>
                <div className="mb-4 rounded-xl border bg-white p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#079b7f] text-2xl font-black text-white">
                      {s.initial}
                    </div>
                    <div>
                      <h3 className="text-xl font-black">{s.name}</h3>
                      <p className="text-sm text-slate-500">{s.id}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <span className="rounded-full border border-teal-300 px-3 py-1 text-sm font-bold text-teal-700">
                      Course
                    </span>
                    <span className="rounded-full border border-blue-300 px-3 py-1 text-sm font-bold text-blue-600">
                      Evening
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <Mini title="Height" value={s.height} sub="cm" />
                  <Mini title="Weight" value={s.weight} sub="kg" />
                  <Mini title="BMI" value={s.bmi} sub="Normal" />
                </div>

                <div className="mt-4 rounded-xl border bg-white p-5">
                  <h4 className="mb-3 font-bold text-slate-500">TOP SKILLS</h4>
                  <Skill label="Dribbling" />
                  <Skill label="Passing" />
                </div>

                <button
                  onClick={() => {
                    setSelectedStudent(s);
                    setProgressOpen(true);
                  }}
                  className="mt-4 w-full rounded-xl bg-[#087f73] py-3 font-bold text-white"
                >
                  Add Progress
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProgressModal({
  student,
  onClose,
}: {
  student: typeof students[number];
  onClose: () => void;
}) {
  const skills = [
    "Dribbling",
    "Passing",
    "Shooting",
    "Fitness",
    "Teamwork",
    "Positioning",
    "Speed",
    "Stamina",
  ];

  const [ratings, setRatings] = useState<Record<string, number>>({});

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75">
      <div className="relative w-[560px] rounded-2xl bg-[#fffdf1] p-7 shadow-2xl">
        <button onClick={onClose} className="absolute right-6 top-6">
          <X size={20} />
        </button>

        <h2 className="mb-6 flex items-center gap-3 text-2xl font-black">
          🏅 Progress — {student.name}
        </h2>

        <div className="space-y-4">
          {skills.map((skill) => (
            <div key={skill} className="flex items-center justify-between">
              <p className="font-semibold">{skill}</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((x) => (
                  <button
                    key={x}
                    onClick={() =>
                      setRatings((prev) => ({
                        ...prev,
                        [skill]: x,
                      }))
                    }
                    className={
                      (ratings[skill] || 0) >= x
                        ? "text-yellow-400"
                        : "text-slate-300"
                    }
                  >
                    <Star size={23} fill="currentColor" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <label className="mt-7 block">
          <p className="mb-2 font-semibold">Coach Notes</p>
          <textarea
            placeholder="Performance notes..."
            className="h-24 w-full rounded-xl border bg-[#fffdf1] p-4 outline-none"
          />
        </label>

        <button
          onClick={onClose}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#087f73] py-3 font-bold text-white"
        >
          <CheckCircle2 size={18} />
          Save Progress Card
        </button>
      </div>
    </div>
  );
}

function Avatar({ initial }: { initial: string }) {
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-300 font-bold">
      {initial}
    </div>
  );
}

function Mini({
  title,
  value,
  sub,
}: {
  title: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-4 text-center">
      <p className="font-bold text-blue-600">{title}</p>
      <h3 className="mt-2 text-2xl font-black text-blue-600">{value}</h3>
      <p className="text-xs text-blue-600">{sub}</p>
    </div>
  );
}

function Skill({ label }: { label: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <p className="text-sm text-slate-600">{label}</p>
      <div className="flex items-center gap-3">
        <div className="h-2 w-14 rounded-full bg-blue-100">
          <div className="h-2 w-8 rounded-full bg-blue-500" />
        </div>
        <b>3/5</b>
      </div>
    </div>
  );
}

function Radar() {
  return (
    <div className="flex items-center justify-center">
      <div className="relative h-[300px] w-[300px]">
        <div className="absolute inset-10 rotate-45 border border-slate-300" />
        <div className="absolute inset-16 rotate-45 border border-slate-300" />
        <div className="absolute inset-24 rotate-45 border border-slate-300" />

        <div className="absolute left-1/2 top-10 -translate-x-1/2 text-xs text-slate-500">
          Dribbling
        </div>
        <div className="absolute right-0 top-1/2 text-xs text-slate-500">
          Passing
        </div>
        <div className="absolute bottom-2 right-10 text-xs text-slate-500">
          Shooting
        </div>
        <div className="absolute bottom-2 left-10 text-xs text-slate-500">
          Fitness
        </div>
        <div className="absolute left-0 top-1/2 text-xs text-slate-500">
          Teamwork
        </div>

        <div
          className="absolute left-[75px] top-[85px] h-[145px] w-[145px] bg-[#087f73]/50"
          style={{
            clipPath:
              "polygon(50% 0%, 95% 35%, 75% 100%, 25% 100%, 5% 35%)",
          }}
        />
      </div>
    </div>
  );
}