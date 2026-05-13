"use client";

import { useMemo, useState } from "react";
import {
  Grid2X2,
  List,
  Plus,
  Search,
  Users,
  X,
  ChevronDown,
} from "lucide-react";

type ViewMode = "kanban" | "list";

type Stage =
  | "Inquiry"
  | "Trial"
  | "Evaluation"
  | "Fee Negotiation"
  | "Enrolled";

type Prospect = {
  id: string;
  name: string;
  phone: string;
  email: string;
  parent: string;
  ageGroup: string;
  sport: string;
  source: string;
  interest: string;
  notes: string;
  stage: Stage;
};

const stages: { name: Stage; dot: string }[] = [
  { name: "Inquiry", dot: "bg-blue-500" },
  { name: "Trial", dot: "bg-amber-500" },
  { name: "Evaluation", dot: "bg-purple-500" },
  { name: "Fee Negotiation", dot: "bg-orange-500" },
  { name: "Enrolled", dot: "bg-emerald-500" },
];

export default function CRMPage() {
  const [view, setView] = useState<ViewMode>("kanban");
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    parent: "",
    ageGroup: "",
    sport: "Football",
    source: "Direct",
    interest: "",
    notes: "",
  });

  const filteredProspects = useMemo(() => {
    if (!search.trim()) return prospects;

    const q = search.toLowerCase();

    return prospects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.phone.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.parent.toLowerCase().includes(q)
    );
  }, [prospects, search]);

  const addProspect = () => {
    if (!form.name.trim() || !form.phone.trim()) return;

    const newProspect: Prospect = {
      id: `PROS-${Date.now()}`,
      name: form.name,
      phone: form.phone,
      email: form.email,
      parent: form.parent,
      ageGroup: form.ageGroup,
      sport: form.sport,
      source: form.source,
      interest: form.interest,
      notes: form.notes,
      stage: "Inquiry",
    };

    setProspects((prev) => [newProspect, ...prev]);
    setShowModal(false);

    setForm({
      name: "",
      phone: "",
      email: "",
      parent: "",
      ageGroup: "",
      sport: "Football",
      source: "Direct",
      interest: "",
      notes: "",
    });
  };

  return (
    <div className="min-h-screen bg-[#fffdf0] px-6 py-6 text-[#061739]">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h1 className="text-[26px] font-extrabold tracking-tight">
            Student CRM
          </h1>
          <p className="mt-1 text-[14px] text-[#536987]">
            {prospects.length} prospects in pipeline
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex rounded-2xl bg-[#edf1f6] p-1">
            <button
              onClick={() => setView("kanban")}
              className={`flex h-[36px] items-center gap-2 rounded-xl px-4 text-[13px] font-bold ${
                view === "kanban"
                  ? "bg-[#00796b] text-white shadow-sm"
                  : "text-[#536987]"
              }`}
            >
              <Grid2X2 size={15} />
              Kanban
            </button>

            <button
              onClick={() => setView("list")}
              className={`flex h-[36px] items-center gap-2 rounded-xl px-4 text-[13px] font-bold ${
                view === "list"
                  ? "bg-[#00796b] text-white shadow-sm"
                  : "text-[#536987]"
              }`}
            >
              <List size={15} />
              List
            </button>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex h-[38px] items-center gap-2 rounded-xl bg-[#00796b] px-4 text-[13px] font-bold text-white shadow-sm"
          >
            <Plus size={15} />
            Add Prospect
          </button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <button className="h-[34px] rounded-xl bg-[#00796b] px-4 text-[13px] font-bold text-white shadow-sm">
          All ({prospects.length})
        </button>

        {stages.map((stage) => (
          <button
            key={stage.name}
            className="flex h-[34px] items-center gap-2 rounded-xl border border-[#d8e0ec] bg-white px-4 text-[13px] font-bold text-[#061739] shadow-sm"
          >
            <span className={`h-2 w-2 rounded-full ${stage.dot}`} />
            {stage.name} (
            {filteredProspects.filter((p) => p.stage === stage.name).length})
          </button>
        ))}
      </div>

      <div className="relative mb-5 w-[420px]">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#536987]"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search prospects..."
          className="h-[42px] w-full rounded-xl border border-[#d8e0ec] bg-white pl-10 pr-4 text-[14px] outline-none focus:border-[#00897b]"
        />
      </div>

      {view === "kanban" ? (
        <div className="grid grid-cols-5 gap-3">
          {stages.map((stage) => {
            const items = filteredProspects.filter(
              (p) => p.stage === stage.name
            );

            return (
              <div key={stage.name}>
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`h-3 w-3 rounded-full ${stage.dot}`} />
                    <h2 className="text-[14px] font-extrabold">
                      {stage.name}
                    </h2>
                  </div>

                  <span className="rounded-full bg-[#eef3f8] px-3 py-1 text-[12px] font-bold">
                    {items.length}
                  </span>
                </div>

                <div className="min-h-[220px] rounded-2xl border border-dashed border-[#d8e0ec] bg-[#fffef6] p-4">
                  {items.length === 0 ? (
                    <div className="flex h-[180px] items-center justify-center text-[13px] text-[#536987]">
                      No prospects
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {items.map((p) => (
                        <div
                          key={p.id}
                          className="rounded-xl border border-[#d8e0ec] bg-white p-4 shadow-sm"
                        >
                          <h3 className="text-[14px] font-extrabold">
                            {p.name}
                          </h3>
                          <p className="mt-1 text-[12px] text-[#536987]">
                            {p.phone}
                          </p>
                          <p className="mt-2 text-[12px] text-[#536987]">
                            {p.sport} · {p.source}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <section className="flex h-[270px] items-center justify-center rounded-2xl border border-dashed border-[#d8e0ec] bg-[#f8fbff] shadow-sm">
          {filteredProspects.length === 0 ? (
            <div className="text-center">
              <Users size={48} className="mx-auto text-[#cbd5e1]" />
              <h2 className="mt-4 text-[20px] font-extrabold">
                No prospects yet
              </h2>
              <p className="mt-2 text-[14px] text-[#536987]">
                Click "Add Prospect" to start building your pipeline
              </p>
            </div>
          ) : (
            <div className="w-full self-start">
              <div className="grid grid-cols-5 border-b border-[#d8e0ec] px-5 py-3 text-[13px] font-bold text-[#536987]">
                <div>Name</div>
                <div>Phone</div>
                <div>Parent</div>
                <div>Sport</div>
                <div>Stage</div>
              </div>

              {filteredProspects.map((p) => (
                <div
                  key={p.id}
                  className="grid grid-cols-5 border-b border-[#d8e0ec] px-5 py-3 text-[13px]"
                >
                  <div className="font-bold">{p.name}</div>
                  <div>{p.phone}</div>
                  <div>{p.parent || "-"}</div>
                  <div>{p.sport}</div>
                  <div>{p.stage}</div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-[500px] rounded-2xl bg-[#fffdf0] p-7 shadow-2xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-[20px] font-extrabold text-[#1f2937]">
                Add New Prospect
              </h2>

              <button
                onClick={() => setShowModal(false)}
                className="text-[#536987] hover:text-[#061739]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Name *">
                <input
                  autoFocus
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  placeholder="Student name"
                  className="input"
                />
              </Field>

              <Field label="Phone *">
                <input
                  value={form.phone}
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value })
                  }
                  placeholder="+91..."
                  className="input"
                />
              </Field>

              <Field label="Email">
                <input
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  placeholder="email@..."
                  className="input"
                />
              </Field>

              <Field label="Parent Name">
                <input
                  value={form.parent}
                  onChange={(e) =>
                    setForm({ ...form, parent: e.target.value })
                  }
                  placeholder="Guardian"
                  className="input"
                />
              </Field>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <Field label="Age Group">
                <select
                  value={form.ageGroup}
                  onChange={(e) =>
                    setForm({ ...form, ageGroup: e.target.value })
                  }
                  className="input"
                >
                  <option>Select</option>
                  <option>U-10</option>
                  <option>U-13</option>
                  <option>U-16</option>
                  <option>U-18</option>
                </select>
              </Field>

              <Field label="Sport">
                <input
                  value={form.sport}
                  onChange={(e) =>
                    setForm({ ...form, sport: e.target.value })
                  }
                  className="input"
                />
              </Field>

              <Field label="Source">
                <select
                  value={form.source}
                  onChange={(e) =>
                    setForm({ ...form, source: e.target.value })
                  }
                  className="input"
                >
                  <option>Direct</option>
                  <option>Instagram</option>
                  <option>Referral</option>
                  <option>Website</option>
                </select>
              </Field>
            </div>

            <div className="mt-4">
              <Field label="Position / Interest">
                <input
                  value={form.interest}
                  onChange={(e) =>
                    setForm({ ...form, interest: e.target.value })
                  }
                  placeholder="Striker, Midfielder..."
                  className="input"
                />
              </Field>
            </div>

            <div className="mt-4">
              <Field label="Notes">
                <textarea
                  value={form.notes}
                  onChange={(e) =>
                    setForm({ ...form, notes: e.target.value })
                  }
                  placeholder="How did they find us?"
                  className="input h-[66px] resize-none py-3"
                />
              </Field>
            </div>

            <button
              onClick={addProspect}
              className="mt-5 h-[42px] w-full rounded-xl bg-[#00796b] text-[14px] font-extrabold text-white shadow-sm hover:bg-[#006b5f]"
            >
              Add Prospect
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .input {
          height: 42px;
          width: 100%;
          border-radius: 12px;
          border: 1px solid #d8e0ec;
          background: #fffdf0;
          padding: 0 14px;
          font-size: 14px;
          outline: none;
        }

        .input:focus {
          border-color: #00897b;
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
      <span className="mb-2 block text-[13px] font-bold text-[#1f2937]">
        {label}
      </span>
      {children}
    </label>
  );
}