"use client";

import { useMemo, useState } from "react";
import {
  Bell,
  ChevronDown,
  Clock3,
  Grid2X2,
  List,
  MessageSquare,
  Moon,
  Plus,
  Search,
  UserPlus,
  Users,
  X,
} from "lucide-react";

type Stage =
  | "all"
  | "inquiry"
  | "trial"
  | "evaluation"
  | "fee_negotiation"
  | "enrolled";

type ViewMode = "kanban" | "list";

const stages = [
  { id: "all", label: "All", dot: "", color: "bg-[#007f72]" },
  { id: "inquiry", label: "Inquiry", dot: "bg-blue-500", color: "bg-blue-500" },
  { id: "trial", label: "Trial", dot: "bg-orange-500", color: "bg-orange-500" },
  { id: "evaluation", label: "Evaluation", dot: "bg-purple-500", color: "bg-purple-500" },
  { id: "fee_negotiation", label: "Fee Negotiation", dot: "bg-orange-600", color: "bg-orange-600" },
  { id: "enrolled", label: "Enrolled", dot: "bg-emerald-500", color: "bg-emerald-500" },
] as const;

const ageGroups = ["U-6", "U-8", "U-10", "U-12", "U-14", "U-16", "U-18", "Senior"];
const sources = ["Direct", "Instagram", "Google", "Referral", "WhatsApp", "Event", "Website", "Other"];

export default function CRMPage() {
  const [view, setView] = useState<ViewMode>("kanban");
  const [activeStage, setActiveStage] = useState<Stage>("all");
  const [prospectOpen, setProspectOpen] = useState(false);
  const [search, setSearch] = useState("");

  const prospects: any[] = [];

  const filteredProspects = useMemo(() => {
    return prospects.filter((p) => {
      const matchesStage = activeStage === "all" || p.stage === activeStage;
      const matchesSearch =
        !search ||
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.phone?.toLowerCase().includes(search.toLowerCase());

      return matchesStage && matchesSearch;
    });
  }, [activeStage, search]);

  function countFor(stage: Stage) {
    if (stage === "all") return prospects.length;
    return prospects.filter((p) => p.stage === stage).length;
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

      <div className="px-8 py-7">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[28px] font-black">Student CRM</h1>
            <p className="mt-1 text-[15px] text-[#52657d]">
              {prospects.length} prospects in pipeline
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex h-10 rounded-xl bg-[#eef2f6] p-1">
              <button
                onClick={() => setView("kanban")}
                className={`flex h-8 items-center gap-2 rounded-xl px-4 text-sm font-semibold ${
                  view === "kanban"
                    ? "bg-[#007f72] text-white shadow-sm"
                    : "text-[#52657d]"
                }`}
              >
                <Grid2X2 size={16} />
                Kanban
              </button>

              <button
                onClick={() => setView("list")}
                className={`flex h-8 items-center gap-2 rounded-xl px-4 text-sm font-semibold ${
                  view === "list"
                    ? "bg-[#007f72] text-white shadow-sm"
                    : "text-[#52657d]"
                }`}
              >
                <List size={16} />
                List
              </button>
            </div>

            <button
              onClick={() => setProspectOpen(true)}
              className="flex h-10 items-center gap-2 rounded-xl bg-[#007f72] px-4 text-sm font-bold text-white shadow-sm hover:bg-[#006f64]"
            >
              <UserPlus size={17} />
              Add Prospect
            </button>
          </div>
        </div>

        <div className="mt-7 flex flex-wrap gap-2">
          {stages.map((stage) => {
            const active = activeStage === stage.id;

            return (
              <button
                key={stage.id}
                onClick={() => setActiveStage(stage.id)}
                className={`flex h-9 items-center gap-3 rounded-xl border px-4 text-sm font-semibold shadow-sm transition ${
                  active
                    ? "border-[#007f72] bg-[#007f72] text-white"
                    : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
                }`}
              >
                {stage.id !== "all" && (
                  <span className={`h-2.5 w-2.5 rounded-full ${stage.dot}`} />
                )}
                {stage.label} ({countFor(stage.id)})
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex h-11 w-[420px] items-center gap-3 rounded-xl border border-slate-200 bg-white px-4">
          <Search size={18} className="text-[#52657d]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search prospects..."
            className="w-full bg-transparent outline-none placeholder:text-[#52657d]"
          />
        </div>

        {view === "kanban" ? (
          <KanbanView activeStage={activeStage} />
        ) : (
          <ListView filteredProspects={filteredProspects} />
        )}
      </div>

      {prospectOpen && <AddProspectModal onClose={() => setProspectOpen(false)} />}
    </main>
  );
}

function KanbanView({ activeStage }: { activeStage: Stage }) {
  const visibleStages =
    activeStage === "all"
      ? stages.filter((s) => s.id !== "all")
      : stages.filter((s) => s.id === activeStage);

  return (
    <div
      className={`mt-6 grid gap-3 ${
        activeStage === "all" ? "grid-cols-5" : "grid-cols-1"
      }`}
    >
      {visibleStages.map((stage) => (
        <div key={stage.id}>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-[16px] font-black">
              <span className={`h-3 w-3 rounded-full ${stage.dot}`} />
              {stage.label}
            </h3>

            <span className="rounded-full bg-[#eef2f6] px-3 py-1 text-xs font-bold text-[#52657d]">
              0
            </span>
          </div>

          <div className="flex h-[220px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-[#fffdf8]">
            <p className="text-sm text-[#52657d]">No prospects</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ListView({ filteredProspects }: { filteredProspects: any[] }) {
  return (
    <div className="mt-6 flex h-[260px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-[#f8fafc] shadow-sm">
      <div className="flex flex-col items-center text-center">
        <Users size={52} className="text-slate-300" />
        <h2 className="mt-5 text-[21px] font-black text-slate-950">
          {filteredProspects.length === 0 ? "No prospects yet" : "Prospects"}
        </h2>
        <p className="mt-2 text-[16px] text-[#52657d]">
          Click "Add Prospect" to start building your pipeline
        </p>
      </div>
    </div>
  );
}

function AddProspectModal({ onClose }: { onClose: () => void }) {
  const [ageOpen, setAgeOpen] = useState(false);
  const [sourceOpen, setSourceOpen] = useState(false);
  const [ageGroup, setAgeGroup] = useState("Select");
  const [source, setSource] = useState("Direct");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75">
      <div className="relative w-[540px] rounded-xl bg-[#fffdf0] p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-slate-500 hover:text-slate-800"
        >
          <X size={20} />
        </button>

        <h2 className="mb-6 text-[22px] font-black">Add New Prospect</h2>

        <div className="grid grid-cols-2 gap-4">
          <ModalInput label="Name *" placeholder="Student name" focused />
          <ModalInput label="Phone *" placeholder="+91..." />
          <ModalInput label="Email" placeholder="email@..." />
          <ModalInput label="Parent Name" placeholder="Guardian" />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <DropdownField
            label="Age Group"
            value={ageGroup}
            open={ageOpen}
            setOpen={setAgeOpen}
            options={ageGroups}
            onSelect={setAgeGroup}
          />

          <ModalInput label="Sport" placeholder="Football" />

          <DropdownField
            label="Source"
            value={source}
            open={sourceOpen}
            setOpen={setSourceOpen}
            options={sources}
            onSelect={setSource}
          />
        </div>

        <div className="mt-4">
          <ModalInput label="Position / Interest" placeholder="Striker, Midfielder..." />
        </div>

        <div className="mt-4">
          <label className="text-sm font-semibold text-slate-700">Notes</label>
          <textarea
            placeholder="How did they find us?"
            className="mt-2 h-[74px] w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none placeholder:text-[#52657d]"
          />
        </div>

        <button
          onClick={onClose}
          className="mt-4 h-11 w-full rounded-xl bg-[#0f8277] font-bold text-white hover:bg-[#0b746a]"
        >
          Add Prospect
        </button>
      </div>
    </div>
  );
}

function ModalInput({
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

      <div
        className={`mt-2 flex h-11 items-center rounded-xl border bg-white px-4 ${
          focused ? "border-teal-600" : "border-slate-200"
        }`}
      >
        <input
          placeholder={placeholder}
          className="w-full bg-transparent outline-none placeholder:text-[#52657d]"
        />
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
        <div className="absolute left-0 top-[74px] z-[70] w-full rounded-xl border border-slate-200 bg-white py-2 shadow-xl">
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
              {value === option && <span>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}