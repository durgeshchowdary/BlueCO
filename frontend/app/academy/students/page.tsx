"use client";

import React, { useMemo, useState } from "react";
import {
  Users,
  CalendarCheck,
  IndianRupee,
  Medal,
  Download,
  Upload,
  UserPlus,
  Search,
  ChevronDown,
  Calendar,
  CheckCircle2,
  X,
  TrendingUp,
  AlertTriangle,
  Award,
  Star,
} from "lucide-react";

type Tab = "students" | "attendance" | "fees" | "progress";
type FeeMode = "single" | "multiple" | "active";

export default function AcademyStudentsPage() {
  const [tab, setTab] = useState<Tab>("students");
  const [feeOpen, setFeeOpen] = useState(false);
  const [feeMode, setFeeMode] = useState<FeeMode>("single");
  const [progressOpen, setProgressOpen] = useState(false);

  const students: any[] = [];
  const totalStudents = students.length;

  const today = new Date();
  const formattedToday = today.toLocaleDateString("en-GB").replaceAll("/", "-");

  const tabs = [
    { id: "students", label: "Students", icon: Users },
    { id: "attendance", label: "Attendance", icon: CalendarCheck },
    { id: "fees", label: "Fees", icon: IndianRupee },
    { id: "progress", label: "Progress", icon: Medal },
  ] as const;

  return (
    <div className="min-h-screen bg-[#fffdf0]">
      <div className="px-8 pt-8 pb-10">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[28px] font-bold text-slate-950 leading-tight">
              Students
            </h1>
            <p className="text-[15px] text-slate-500 mt-1">
              {totalStudents} students enrolled
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <TopButton icon={Download}>Export</TopButton>
            <TopButton icon={Upload}>Import CSV</TopButton>
            <TopButton icon={IndianRupee} onClick={() => setFeeOpen(true)}>
              Generate Fees
            </TopButton>
            <button className="h-10 px-4 rounded-xl bg-[#007f72] hover:bg-[#006f64] text-white text-sm font-semibold flex items-center gap-2 shadow-sm">
              <UserPlus size={17} />
              Add Student
            </button>
          </div>
        </div>

        <div className="mt-7">
          <div className="inline-flex h-11 items-center gap-1 rounded-xl bg-[#eef2f6] p-1">
            {tabs.map((item) => {
              const Icon = item.icon;
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={[
                    "h-9 px-4 rounded-xl text-[15px] font-medium flex items-center gap-2 transition-all",
                    active
                      ? "bg-[#fffdf0] text-slate-950 shadow-sm ring-1 ring-black/5"
                      : "text-slate-500 hover:text-slate-800",
                  ].join(" ")}
                >
                  <Icon size={17} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {tab === "students" && <StudentsTab />}
        {tab === "attendance" && <AttendanceTab formattedToday={formattedToday} />}
        {tab === "fees" && <FeesTab />}
        {tab === "progress" && (
          <ProgressTab onAdd={() => setProgressOpen(true)} />
        )}
      </div>

      {feeOpen && (
        <GenerateFeesModal
          mode={feeMode}
          setMode={setFeeMode}
          onClose={() => setFeeOpen(false)}
        />
      )}

      {progressOpen && (
        <ProgressCardModal onClose={() => setProgressOpen(false)} />
      )}
    </div>
  );
}

function TopButton({
  children,
  icon: Icon,
  onClick,
}: {
  children: React.ReactNode;
  icon: any;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm font-medium flex items-center gap-2 shadow-sm hover:bg-slate-50"
    >
      <Icon size={17} />
      {children}
    </button>
  );
}

function StatCard({
  icon: Icon,
  value,
  label,
  tone,
  badge,
}: {
  icon?: any;
  value: string;
  label: string;
  tone: "green" | "orange" | "red" | "blue" | "purple" | "yellow";
  badge?: string;
}) {
  const styles: any = {
    green: "bg-emerald-50 border-emerald-200 text-emerald-700",
    orange: "bg-orange-50 border-orange-200 text-orange-700",
    red: "bg-red-50 border-red-200 text-red-700",
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    purple: "bg-purple-50 border-purple-200 text-purple-700",
    yellow: "bg-yellow-50 border-yellow-200 text-yellow-700",
  };

  return (
    <div
      className={[
        "h-[98px] rounded-xl border p-4 shadow-sm flex flex-col justify-between",
        styles[tone],
      ].join(" ")}
    >
      <div className="flex items-center justify-between">
        {Icon ? <Icon size={18} /> : <span />}
        {badge && (
          <span className="px-3 py-1 rounded-full border bg-white/45 text-[12px] font-semibold">
            {badge}
          </span>
        )}
      </div>
      <div>
        <div className="text-[25px] font-bold leading-none">{value}</div>
        <div className="text-[12px] font-semibold mt-2">{label}</div>
      </div>
    </div>
  );
}

function StudentsTab() {
  return (
    <>
      <div className="grid grid-cols-4 gap-4 mt-4">
        <StatCard icon={CalendarCheck} value="0%" label="Attendance Rate" tone="green" badge="This Month" />
        <StatCard icon={AlertTriangle} value="0" label="Low Attendance" tone="orange" badge="Action" />
        <StatCard icon={IndianRupee} value="0" label="Fees Overdue" tone="red" badge="0%" />
        <StatCard icon={TrendingUp} value="₹0K" label="Collected" tone="blue" />
      </div>

      <div className="mt-3 rounded-xl border border-slate-200 bg-[#f8fafc] shadow-sm overflow-hidden">
        <div className="p-3 flex gap-3">
          <div className="flex-1 h-11 rounded-xl border border-slate-200 bg-white flex items-center px-4 gap-3">
            <Search size={18} className="text-slate-400" />
            <input
              placeholder="Search by name, ID, email..."
              className="w-full bg-transparent outline-none text-[15px] text-slate-700 placeholder:text-slate-500"
            />
          </div>
          <button className="w-[190px] h-11 rounded-xl border border-slate-200 bg-white flex items-center justify-between px-4 text-[15px] font-medium">
            Filter by batch <ChevronDown size={17} />
          </button>
        </div>

        <div className="grid grid-cols-[50px_110px_1.5fr_1fr_1fr_1fr_1fr] h-12 border-t border-slate-200 items-center px-3 text-[14px] text-slate-600 font-medium">
          <div className="w-5 h-5 rounded-full border border-teal-600" />
          <div>ID</div>
          <div>Name</div>
          <div>Sport</div>
          <div>Batch</div>
          <div>Phone</div>
          <div className="grid grid-cols-2">
            <span>Status</span>
            <span>BMI</span>
          </div>
        </div>

        <div className="h-[120px] flex items-center justify-center text-slate-500 text-[15px]">
          No students yet. Add your first student to get started.
        </div>
      </div>
    </>
  );
}

function AttendanceTab({ formattedToday }: { formattedToday: string }) {
  return (
    <>
      <div className="mt-3 rounded-xl border border-slate-200 bg-[#f8fafc] shadow-sm p-3 flex gap-3">
        <button className="w-[190px] h-11 rounded-xl border border-slate-200 bg-white flex items-center justify-between px-4 text-[15px]">
          May, 2026 <Calendar size={17} />
        </button>
        <button className="w-[240px] h-11 rounded-xl border border-slate-200 bg-white flex items-center justify-between px-4 text-[14px]">
          Select student <ChevronDown size={17} />
        </button>
        <button className="w-[180px] h-11 rounded-xl border border-slate-200 bg-white flex items-center justify-between px-4 text-[14px]">
          Batch <ChevronDown size={17} />
        </button>
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 bg-[#f8fafc] shadow-sm p-3">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-slate-950">Quick Mark — {formattedToday}</h3>
          <div className="flex gap-2">
            <button className="w-[180px] h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-between px-4">
              {formattedToday} <Calendar size={17} />
            </button>
            <button className="h-10 px-5 rounded-xl border border-slate-200 bg-white flex items-center gap-2 font-medium">
              <CheckCircle2 size={18} /> All Present
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 text-slate-600 text-[15px] font-medium">
          <div>Student</div>
          <div>Batch</div>
          <div>Status</div>
          <div>Action</div>
        </div>
      </div>
    </>
  );
}

function FeesTab() {
  return (
    <>
      <div className="grid grid-cols-4 gap-4 mt-3">
        <StatCard value="₹0K" label="Collected" tone="green" />
        <StatCard value="₹0K" label="Pending" tone="orange" />
        <StatCard value="0%" label="Collection Rate" tone="blue" />
        <StatCard value="0" label="Overdue" tone="red" />
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 bg-[#f8fafc] shadow-sm overflow-hidden">
        <div className="grid grid-cols-6 h-12 items-center px-3 border-b border-slate-200 text-slate-600 text-[15px] font-medium">
          <div>Fee ID</div>
          <div>Student</div>
          <div>Amount</div>
          <div>Type</div>
          <div>Due Date</div>
          <div>Status</div>
        </div>
        <div className="h-[120px] flex items-center justify-center text-slate-500 text-[15px]">
          No fees yet. Click "Generate Fees" to create.
        </div>
      </div>
    </>
  );
}

function ProgressTab({ onAdd }: { onAdd: () => void }) {
  return (
    <>
      <div className="grid grid-cols-4 gap-4 mt-3">
        <StatCard value="0" label="Cards Generated" tone="purple" />
        <StatCard value="0/5" label="Avg Rating" tone="green" />
        <StatCard value="0" label="Pending Assessment" tone="blue" />
        <StatCard value="0" label="Total Students" tone="yellow" />
      </div>

      <div className="flex justify-end mt-5">
        <button
          onClick={onAdd}
          className="h-10 px-5 rounded-xl bg-[#007f72] hover:bg-[#006f64] text-white font-semibold flex items-center gap-2"
        >
          <Medal size={17} /> Add Progress Card
        </button>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-[#f8fafc] shadow-sm p-7 h-[230px]">
        <h3 className="font-semibold text-slate-950">Student Progress Cards</h3>
        <p className="text-sm text-slate-500 mt-2">
          Click on a card below to view detailed Digital Athlete ID
        </p>
        <div className="h-[130px] flex items-center justify-center text-slate-500 text-[18px]">
          No progress cards yet. Add your first assessment.
        </div>
      </div>
    </>
  );
}

function GenerateFeesModal({
  mode,
  setMode,
  onClose,
}: {
  mode: FeeMode;
  setMode: (m: FeeMode) => void;
  onClose: () => void;
}) {
  const modes = [
    ["single", "Single Student"],
    ["multiple", "Multiple (0)"],
    ["active", "All Active (0)"],
  ] as const;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center">
      <div className="w-[760px] rounded-xl bg-[#fffdf0] p-8 shadow-2xl relative">
        <button onClick={onClose} className="absolute right-6 top-6 text-slate-500">
          <X size={20} />
        </button>

        <div className="flex items-center gap-3">
          <IndianRupee className="text-[#007f72]" size={24} />
          <h2 className="text-[22px] font-bold text-slate-950">Generate Fees</h2>
        </div>

        <p className="text-[14px] text-slate-500 mt-2 leading-relaxed">
          Pick one student, several, or all active. Choose the amount, due date, and fee type —
          duplicates for the same period are blocked automatically.
        </p>

        <div className="mt-7 h-11 rounded-xl bg-[#eef2f6] p-1 grid grid-cols-3">
          {modes.map(([id, label]) => (
            <button
              key={id}
              onClick={() => setMode(id)}
              className={[
                "rounded-xl text-sm font-medium",
                mode === id
                  ? "bg-[#fffdf0] shadow-sm ring-1 ring-black/5 text-slate-950"
                  : "text-slate-500",
              ].join(" ")}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-5">
          {mode === "single" && (
            <>
              <label className="text-sm font-semibold text-slate-700">Select Student</label>
              <button className="mt-2 w-full h-12 rounded-xl border border-slate-200 bg-white px-4 flex items-center justify-between text-[16px]">
                Choose a student <ChevronDown size={18} />
              </button>
            </>
          )}

          {mode === "multiple" && (
            <>
              <div className="h-12 rounded-xl border border-slate-200 bg-white px-4 flex items-center gap-3">
                <Search size={18} className="text-slate-400" />
                <input
                  placeholder="Search students..."
                  className="w-full bg-transparent outline-none"
                />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-[#007f72] text-white text-sm font-semibold">
                  All
                </span>
                <div className="flex gap-2">
                  <button className="h-9 px-4 rounded-xl border bg-white text-sm">
                    Select All
                  </button>
                  <button className="h-9 px-4 rounded-xl border bg-white text-sm">
                    Clear
                  </button>
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-500">0 selected</p>
              <div className="mt-5 h-5 rounded-full border bg-white" />
            </>
          )}

          {mode === "active" && (
            <div className="h-[145px] rounded-xl border border-emerald-200 bg-emerald-50 flex flex-col items-center justify-center text-emerald-700">
              <Users size={38} />
              <h3 className="text-[22px] font-bold mt-2">0 Active Students</h3>
              <p className="text-sm font-medium mt-1">
                Fees will be generated for all active students
              </p>
            </div>
          )}
        </div>

        <div className="my-7 border-t border-slate-200" />

        <div className="grid grid-cols-2 gap-4">
          <Field label="Amount (₹) *" placeholder="5000" />
          <Field label="Due Date *" placeholder="dd-mm-yyyy" icon={Calendar} />
          <Field label="Fee Type" placeholder="Monthly" icon={ChevronDown} />
          <Field label="Description" placeholder="Monthly training fee" />
        </div>

        <p className="text-sm text-slate-500 mt-4">All 0 active students</p>

        <button className="mt-4 w-full h-12 rounded-xl bg-[#07966f] hover:bg-[#078663] text-white font-bold flex items-center justify-center gap-4">
          <IndianRupee size={19} /> Generate Fees
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  placeholder,
  icon: Icon,
}: {
  label: string;
  placeholder: string;
  icon?: any;
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      <div className="mt-2 h-12 rounded-xl border border-slate-200 bg-white px-4 flex items-center justify-between">
        <input
          placeholder={placeholder}
          className="w-full bg-transparent outline-none text-[16px] placeholder:text-slate-500"
        />
        {Icon && <Icon size={18} />}
      </div>
    </div>
  );
}

function ProgressCardModal({ onClose }: { onClose: () => void }) {
  const skills = ["Dribbling", "Passing", "Shooting", "Fitness", "Teamwork"];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center">
      <div className="w-[610px] rounded-xl bg-[#fffdf0] p-8 shadow-2xl relative">
        <button onClick={onClose} className="absolute right-6 top-6 text-slate-500">
          <X size={20} />
        </button>

        <h2 className="text-[22px] font-bold text-slate-950">Create Progress Card</h2>

        <div className="mt-6">
          <label className="text-sm font-semibold text-slate-700">Student *</label>
          <button className="mt-2 w-full h-12 rounded-xl border border-teal-600 bg-white px-4 flex items-center justify-between text-[16px]">
            Select student <ChevronDown size={18} />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {skills.map((skill) => (
            <div key={skill} className="grid grid-cols-[110px_110px_1fr] items-center gap-4">
              <span className="text-sm font-medium text-slate-700">{skill}</span>
              <input
                placeholder="0-5"
                className="h-11 rounded-xl border border-slate-200 bg-white px-4 outline-none placeholder:text-slate-500"
              />
              <div className="flex gap-1 text-slate-300">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={17} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <label className="text-sm font-semibold text-slate-700">Coach Comments</label>
          <input
            placeholder="Performance notes..."
            className="mt-2 w-full h-11 rounded-xl border border-slate-200 bg-white px-4 outline-none placeholder:text-slate-500"
          />
        </div>

        <button className="mt-4 w-full h-12 rounded-xl bg-[#0f8277] hover:bg-[#0b746a] text-white font-bold">
          Save Progress Card
        </button>
      </div>
    </div>
  );
}