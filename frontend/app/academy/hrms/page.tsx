"use client";

import { useRef, useState } from "react";
import {
  Bell,
  BriefcaseBusiness,
  Calendar,
  CalendarCheck,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Download,
  IndianRupee,
  MessageSquare,
  Moon,
  Play,
  Search,
  Upload,
  UserPlus,
  Users,
  X,
} from "lucide-react";

type Tab = "employees" | "payroll" | "leaves" | "attendance";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const employees = [
  {
    id: "EMP001",
    name: "Durgesh",
    role: "Head Coach",
    department: "Football",
    salary: 25000,
    status: "Active",
  },
];

export default function HRMSPage() {
  const [tab, setTab] = useState<Tab>("employees");
  const [employeeOpen, setEmployeeOpen] = useState(false);
  const [payrollOpen, setPayrollOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [monthOpen, setMonthOpen] = useState(false);
  const [month, setMonth] = useState("May");
  const [toast, setToast] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(""), 2200);
  }

  function handleExportCSV() {
    const headers = ["ID", "Name", "Role", "Department", "Salary", "Status"];
    const rows = employees.map((e) => [
      e.id,
      e.name,
      e.role,
      e.department,
      e.salary,
      e.status,
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "employees.csv";
    link.click();

    window.URL.revokeObjectURL(url);
    showToast("Employees CSV exported");
  }

  function handleImportCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      console.log("Imported CSV:", event.target?.result);
      showToast("CSV imported successfully");
      e.target.value = "";
    };

    reader.readAsText(file);
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

      {toast && (
        <div className="fixed right-12 top-[116px] z-50 flex h-14 w-[380px] items-center gap-3 rounded-lg bg-emerald-50 px-5 text-emerald-700 shadow-lg">
          <CheckCircle2 size={20} fill="currentColor" />
          <span className="font-semibold">{toast}</span>
        </div>
      )}

      <div className="px-8 py-7">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[28px] font-black">HRMS</h1>
            <p className="mt-1 text-[15px] text-[#52657d]">0 employees</p>
          </div>

          <div className="flex items-center gap-2.5">
            <TopButton icon={<Download size={17} />} onClick={handleExportCSV}>
              Export
            </TopButton>

            <TopButton
              icon={<Upload size={17} />}
              onClick={() => fileInputRef.current?.click()}
            >
              Import CSV
            </TopButton>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              hidden
              onChange={handleImportCSV}
            />

            <button
              onClick={() => setEmployeeOpen(true)}
              className="flex h-10 items-center gap-2 rounded-xl bg-[#007f72] px-4 text-sm font-bold text-white shadow-sm hover:bg-[#006f64]"
            >
              <UserPlus size={17} />
              Add Employee
            </button>
          </div>
        </div>

        <div className="mt-7 inline-flex h-11 items-center gap-1 rounded-xl bg-[#eef2f6] p-1">
          <TabButton active={tab === "employees"} onClick={() => setTab("employees")} icon={<BriefcaseBusiness size={17} />} label="Employees" />
          <TabButton active={tab === "payroll"} onClick={() => setTab("payroll")} icon={<IndianRupee size={17} />} label="Payroll" />
          <TabButton active={tab === "leaves"} onClick={() => setTab("leaves")} icon={<Calendar size={17} />} label="Leaves" />
          <TabButton active={tab === "attendance"} onClick={() => setTab("attendance")} icon={<Calendar size={17} />} label="Attendance" />
        </div>

        {tab === "employees" && <EmployeesTab />}
        {tab === "payroll" && (
          <PayrollTab
            month={month}
            setMonth={setMonth}
            monthOpen={monthOpen}
            setMonthOpen={setMonthOpen}
            onRun={() => setPayrollOpen(true)}
          />
        )}
        {tab === "leaves" && <LeavesTab onApply={() => setLeaveOpen(true)} />}
        {tab === "attendance" && (
          <AttendanceTab onPresent={() => showToast("All marked as present")} />
        )}
      </div>

      {employeeOpen && <AddEmployeeModal onClose={() => setEmployeeOpen(false)} />}
      {payrollOpen && <RunPayrollModal onClose={() => setPayrollOpen(false)} />}
      {leaveOpen && <ApplyLeaveModal onClose={() => setLeaveOpen(false)} />}
    </main>
  );
}

function TopButton({
  children,
  icon,
  onClick,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold shadow-sm hover:bg-slate-50"
    >
      {icon}
      {children}
    </button>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex h-9 items-center gap-2 rounded-xl px-4 text-[15px] font-semibold transition ${
        active
          ? "bg-[#fffdf0] text-slate-950 shadow-sm ring-1 ring-black/5"
          : "text-slate-500 hover:text-slate-800"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function StatCard({
  value,
  label,
  tone,
  badge,
}: {
  value: string;
  label: string;
  tone: "green" | "blue" | "orange" | "purple" | "red" | "slate";
  badge?: string;
}) {
  const styles = {
    green: "bg-emerald-50 border-emerald-200 text-emerald-700",
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    orange: "bg-orange-50 border-orange-200 text-orange-700",
    purple: "bg-purple-50 border-purple-200 text-purple-700",
    red: "bg-red-50 border-red-200 text-red-700",
    slate: "bg-slate-50 border-slate-200 text-slate-700",
  };

  return (
    <div className={`h-[98px] rounded-xl border p-4 shadow-sm ${styles[tone]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[25px] font-black leading-none">{value}</p>
          <p className="mt-3 text-[12px] font-semibold">{label}</p>
        </div>
        {badge && (
          <span className="rounded-full border bg-white/50 px-3 py-1 text-[12px] font-bold">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}

function EmployeesTab() {
  return (
    <>
      <section className="mt-3 grid grid-cols-4 gap-4">
        <StatCard value="0" label="Employees" tone="green" badge="Active" />
        <StatCard value="0" label="Coaches" tone="blue" badge="0%" />
        <StatCard value="₹0K" label="Payroll" tone="orange" badge="Monthly" />
        <StatCard value="₹0K" label="Avg Salary" tone="purple" />
      </section>

      <div className="mt-4 rounded-xl border border-slate-200 bg-[#f8fafc] shadow-sm">
        <div className="flex gap-3 p-3">
          <div className="flex h-11 flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4">
            <Search size={18} className="text-slate-400" />
            <input
              className="w-full bg-transparent outline-none"
              placeholder="Search by name, role, phone..."
            />
          </div>

          <button className="flex h-11 w-[200px] items-center justify-between rounded-xl border border-slate-200 bg-white px-4">
            All Departments <ChevronDown size={17} />
          </button>
        </div>

        <TableHeader cols={["ID", "Name", "Role", "Department", "Salary", "Status"]} />
        <Empty text="No employees found." />
      </div>
    </>
  );
}

function PayrollTab({
  month,
  setMonth,
  monthOpen,
  setMonthOpen,
  onRun,
}: {
  month: string;
  setMonth: (m: string) => void;
  monthOpen: boolean;
  setMonthOpen: (v: boolean) => void;
  onRun: () => void;
}) {
  return (
    <>
      <section className="mt-3 grid grid-cols-4 gap-4">
        <StatCard value="0/0" label="Paid This Period" tone="green" />
        <StatCard value="₹0K" label="Total Disbursed" tone="blue" />
        <StatCard value="₹0K" label="Bonuses" tone="orange" />
        <StatCard value="0" label="Pending Approval" tone="purple" />
      </section>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[15px] text-[#52657d]">Period:</span>

          <div className="relative">
            <button
              onClick={() => setMonthOpen(!monthOpen)}
              className="flex h-10 w-[140px] items-center justify-between rounded-xl border border-slate-200 bg-white px-4"
            >
              {month} <ChevronDown size={17} />
            </button>

            {monthOpen && (
              <div className="absolute left-0 top-11 z-40 w-[140px] rounded-lg border border-slate-200 bg-white py-2 shadow-lg">
                {months.map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setMonth(m);
                      setMonthOpen(false);
                    }}
                    className={`flex h-9 w-full items-center justify-between px-3 text-left hover:bg-slate-50 ${
                      month === m ? "bg-[#d8ece9] text-[#047c73]" : ""
                    }`}
                  >
                    {m}
                    {month === m && <Check size={15} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button className="h-10 w-[110px] rounded-xl border border-slate-200 bg-white px-4 text-left">
            2026
          </button>

          <button className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 font-semibold">
            <Clock3 size={17} />
            Refresh from Attendance
          </button>
        </div>

        <button
          onClick={onRun}
          className="flex h-10 items-center gap-2 rounded-xl bg-[#007f72] px-4 font-bold text-white"
        >
          <Play size={16} />
          Run Payroll
        </button>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-[#f8fafc] shadow-sm">
        <TableHeader cols={["Employee", "Period", "Attendance", "Base", "Bonus", "Deductions", "Net", "Status"]} />
        <Empty text='No payroll records. Click "Run Payroll" to generate.' />
      </div>
    </>
  );
}

function LeavesTab({ onApply }: { onApply: () => void }) {
  return (
    <>
      <section className="mt-3 grid grid-cols-4 gap-4">
        <StatCard value="0" label="Pending Approval" tone="blue" />
        <StatCard value="0" label="Approved" tone="green" />
        <StatCard value="0" label="Total Days Used" tone="orange" />
        <StatCard value="0" label="Rejected" tone="red" />
      </section>

      <div className="mt-5 flex justify-end">
        <button
          onClick={onApply}
          className="flex h-10 items-center gap-2 rounded-xl bg-[#007f72] px-4 font-bold text-white"
        >
          <CalendarCheck size={17} />
          Apply Leave
        </button>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-[#f8fafc] shadow-sm">
        <TableHeader cols={["Employee", "Type", "Dates", "Days", "Status"]} />
        <Empty text="No leave requests." />
      </div>
    </>
  );
}

function AttendanceTab({ onPresent }: { onPresent: () => void }) {
  return (
    <>
      <section className="mt-3 grid grid-cols-5 gap-4">
        <StatCard value="0" label="Present" tone="green" />
        <StatCard value="0" label="Absent" tone="red" />
        <StatCard value="0" label="Late" tone="orange" />
        <StatCard value="0" label="Leave" tone="slate" />
        <StatCard value="0" label="Half-Day" tone="purple" />
      </section>

      <div className="mt-4 rounded-xl border border-slate-200 bg-[#f8fafc] p-3 shadow-sm">
        <div className="flex gap-3">
          <button className="flex h-11 w-[190px] items-center justify-between rounded-xl border border-slate-200 bg-white px-4">
            May, 2026 <Calendar size={17} />
          </button>
          <button className="flex h-11 w-[240px] items-center justify-between rounded-xl border border-slate-200 bg-white px-4">
            Select Employee <ChevronDown size={17} />
          </button>
          <button className="flex h-11 w-[210px] items-center justify-between rounded-xl border border-slate-200 bg-white px-4">
            All Departments <ChevronDown size={17} />
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-[#f8fafc] p-3 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-bold">Quick Mark — 14/05/2026</h3>

          <div className="flex gap-2">
            <button className="flex h-10 w-[180px] items-center justify-between rounded-xl border border-slate-200 bg-white px-4">
              14-05-2026 <Calendar size={17} />
            </button>

            <button
              onClick={onPresent}
              className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 font-semibold"
            >
              <CheckCircle2 size={18} />
              All Present
            </button>
          </div>
        </div>

        <div className="grid grid-cols-6 text-[15px] font-medium text-[#52657d]">
          <div>ID</div>
          <div>Employee</div>
          <div>Role</div>
          <div>Dept</div>
          <div>Status</div>
          <div>Action</div>
        </div>
      </div>
    </>
  );
}

function TableHeader({ cols }: { cols: string[] }) {
  return (
    <div
      className="grid h-12 items-center border-b border-slate-200 px-3 text-[15px] font-medium text-[#52657d]"
      style={{ gridTemplateColumns: `repeat(${cols.length}, minmax(0, 1fr))` }}
    >
      {cols.map((c) => (
        <div key={c}>{c}</div>
      ))}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="flex h-[120px] items-center justify-center text-[16px] text-[#52657d]">
      {text}
    </div>
  );
}

function ModalShell({
  title,
  children,
  onClose,
  width = "w-[620px]",
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  width?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75">
      <div className={`${width} max-h-[86vh] overflow-y-auto rounded-xl bg-[#fffdf0] p-8 shadow-2xl relative`}>
        <button onClick={onClose} className="absolute right-6 top-6 text-slate-500">
          <X size={20} />
        </button>

        <h2 className="mb-6 text-[22px] font-black">{title}</h2>
        {children}
      </div>
    </div>
  );
}

function AddEmployeeModal({ onClose }: { onClose: () => void }) {
  return (
    <ModalShell title="Add Employee" onClose={onClose} width="w-[610px]">
      <div className="grid grid-cols-2 gap-4">
        <ModalInput label="Name *" placeholder="Full name" focused />
        <ModalInput label="Email *" placeholder="chowdarydurgesh0@gmail.c" />
        <ModalInput label="Password *" placeholder="••••••••••••" type="password" />
        <ModalInput label="Phone" placeholder="" />
        <ModalSelect label="Role" placeholder="Select" />
        <div />
        <ModalSelect label="Department" placeholder="Select" />
        <ModalInput label="Designation" placeholder="Head Coach" />
        <ModalInput label="Base Salary (₹)" placeholder="25000" />
        <ModalInput label="Join Date" placeholder="dd-mm-yyyy" icon={<Calendar size={17} />} />
        <ModalInput label="PAN" placeholder="ABCDE1234F" />
        <ModalInput label="Aadhar" placeholder="1234 5678 9012" />
        <ModalInput label="Bank Account" placeholder="" />
        <ModalInput label="Bank IFSC" placeholder="" />
      </div>

      <button className="mt-4 h-11 w-full rounded-lg bg-[#0f8277] font-bold text-white">
        Add Employee
      </button>
    </ModalShell>
  );
}

function RunPayrollModal({ onClose }: { onClose: () => void }) {
  return (
    <ModalShell title="Run Payroll" onClose={onClose} width="w-[560px]">
      <div className="grid grid-cols-2 gap-4">
        <ModalSelect label="Month" placeholder="May" focused />
        <ModalInput label="Year" placeholder="2026" />
      </div>

      <div className="mt-4 rounded-md bg-slate-50 p-3 text-[14px] leading-relaxed text-[#52657d]">
        Regenerative payroll: refreshes attendance-based salary for pending records,
        preserving manual bonus/deductions. Approved (paid) records remain locked.
      </div>

      <button className="mt-4 h-11 w-full rounded-xl bg-[#0f8277] font-bold text-white">
        Generate / Refresh Payroll
      </button>
    </ModalShell>
  );
}

function ApplyLeaveModal({ onClose }: { onClose: () => void }) {
  return (
    <ModalShell title="Apply Leave" onClose={onClose} width="w-[620px]">
      <ModalSelect label="Leave Type" placeholder="Casual Leave" focused />

      <div className="mt-4 grid grid-cols-2 gap-4">
        <ModalInput label="Start Date" placeholder="dd-mm-yyyy" icon={<Calendar size={17} />} />
        <ModalInput label="End Date" placeholder="dd-mm-yyyy" icon={<Calendar size={17} />} />
      </div>

      <div className="mt-4">
        <ModalInput label="Reason" placeholder="Reason for leave" />
      </div>

      <button className="mt-4 h-11 w-full rounded-xl bg-[#0f8277] font-bold text-white">
        Apply
      </button>
    </ModalShell>
  );
}

function ModalInput({
  label,
  placeholder,
  type = "text",
  icon,
  focused,
}: {
  label: string;
  placeholder: string;
  type?: string;
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
          type={type}
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
  focused,
}: {
  label: string;
  placeholder: string;
  focused?: boolean;
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      <button
        className={`mt-2 flex h-11 w-full items-center justify-between rounded-xl border bg-white px-4 ${
          focused ? "border-teal-600" : "border-slate-200"
        }`}
      >
        {placeholder}
        <ChevronDown size={17} />
      </button>
    </div>
  );
}