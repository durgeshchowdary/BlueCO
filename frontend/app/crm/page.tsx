'use client';

import { useMemo, useState } from 'react';
import {
  LayoutGrid,
  List,
  Plus,
  Search,
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';

type Stage = 'Inquiry' | 'Trial' | 'Evaluation' | 'Fee Negotiation' | 'Enrolled';

type Prospect = {
  id: string;
  name: string;
  phone: string;
  sport: string;
  stage: Stage;
  source: string;
  notes: string;
};

const stages: { name: Stage; color: string; border: string }[] = [
  { name: 'Inquiry', color: 'bg-blue-500', border: 'border-blue-200' },
  { name: 'Trial', color: 'bg-amber-500', border: 'border-amber-200' },
  { name: 'Evaluation', color: 'bg-violet-500', border: 'border-violet-200' },
  { name: 'Fee Negotiation', color: 'bg-orange-500', border: 'border-orange-200' },
  { name: 'Enrolled', color: 'bg-emerald-500', border: 'border-emerald-200' },
];

export default function CRMPage() {
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [search, setSearch] = useState('');
  const [activeStage, setActiveStage] = useState<Stage | 'All'>('All');
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({
    name: '',
    phone: '',
    sport: '',
    stage: 'Inquiry' as Stage,
    source: '',
    notes: '',
  });

  const filteredProspects = useMemo(() => {
    return prospects.filter((prospect) => {
      const q = search.toLowerCase();

      const matchesSearch =
        prospect.name.toLowerCase().includes(q) ||
        prospect.phone.toLowerCase().includes(q) ||
        prospect.sport.toLowerCase().includes(q) ||
        prospect.source.toLowerCase().includes(q);

      const matchesStage = activeStage === 'All' || prospect.stage === activeStage;

      return matchesSearch && matchesStage;
    });
  }, [prospects, search, activeStage]);

  const getStageCount = (stage: Stage | 'All') => {
    if (stage === 'All') return prospects.length;
    return prospects.filter((prospect) => prospect.stage === stage).length;
  };

  const handleAddProspect = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.name.trim() || !form.phone.trim() || !form.sport.trim()) {
      setFormError('Add the prospect name, phone, and sport to continue.');
      return;
    }

    const newProspect: Prospect = {
      id: crypto.randomUUID(),
      name: form.name,
      phone: form.phone,
      sport: form.sport,
      stage: form.stage,
      source: form.source || 'Walk-in',
      notes: form.notes,
    };

    setProspects((prev) => [newProspect, ...prev]);
    closeProspectForm();
  };

  const closeProspectForm = () => {
    setForm({
      name: '',
      phone: '',
      sport: '',
      stage: 'Inquiry',
      source: '',
      notes: '',
    });
    setFormError('');
    setShowForm(false);
  };

  const deleteProspect = (id: string) => {
    setProspects((prev) => prev.filter((prospect) => prospect.id !== id));
  };

  const moveStage = (id: string, stage: Stage) => {
    setProspects((prev) =>
      prev.map((prospect) =>
        prospect.id === id ? { ...prospect, stage } : prospect,
      ),
    );
  };

  return (
    <main className="min-h-screen bg-[#f8f5e8] text-slate-900">
      <Sidebar />

      <section className="lg:pl-[280px]">
        <Topbar academyName="Vijayawada Blues" />

        <section className="p-5 md:p-8">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-black text-slate-900">
                Student CRM
              </h1>
              <p className="mt-1 text-lg text-slate-500">
                {prospects.length} prospects in pipeline
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex overflow-hidden rounded-2xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setView('kanban')}
                  className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold ${
                    view === 'kanban'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-600'
                  }`}
                >
                  <LayoutGrid size={18} />
                  Kanban
                </button>

                <button
                  type="button"
                  onClick={() => setView('list')}
                  className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold ${
                    view === 'list'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-600'
                  }`}
                >
                  <List size={18} />
                  List
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setFormError('');
                  setShowForm((prev) => !prev);
                }}
                className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-blue-700"
              >
                <Plus size={18} />
                Add Prospect
              </button>
            </div>
          </div>

          {showForm ? (
            <form
              onSubmit={handleAddProspect}
              className="mb-8 grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-3"
            >
              <input
                aria-label="Prospect name"
                required
                placeholder="Aarav Sharma"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              />

              <input
                aria-label="Prospect phone"
                required
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              />

              <input
                aria-label="Prospect sport"
                required
                placeholder="Cricket"
                value={form.sport}
                onChange={(e) => setForm({ ...form, sport: e.target.value })}
                className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              />

              <select
                aria-label="Pipeline stage"
                value={form.stage}
                onChange={(e) =>
                  setForm({ ...form, stage: e.target.value as Stage })
                }
                className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              >
                {stages.map((stage) => (
                  <option key={stage.name} value={stage.name}>
                    {stage.name}
                  </option>
                ))}
              </select>

              <input
                aria-label="Lead source"
                placeholder="Walk-in camp"
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
                className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              />

              <input
                aria-label="Prospect notes"
                placeholder="Interested in weekend U14 batch"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              />

              {formError ? (
                <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600 md:col-span-3">
                  {formError}
                </p>
              ) : null}

              <div className="grid gap-3 md:col-span-3 md:grid-cols-[1fr_2fr]">
                <button
                  type="button"
                  onClick={closeProspectForm}
                  className="rounded-2xl border border-slate-200 bg-white px-6 py-3 font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700"
                >
                  Save Prospect
                </button>
              </div>
            </form>
          ) : null}

          <div className="mb-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setActiveStage('All')}
              className={`rounded-2xl px-5 py-3 text-sm font-bold ${
                activeStage === 'All'
                  ? 'bg-blue-600 text-white'
                  : 'border border-slate-200 bg-white text-slate-700'
              }`}
            >
              All ({getStageCount('All')})
            </button>

            {stages.map((stage) => (
              <button
                key={stage.name}
                type="button"
                onClick={() => setActiveStage(stage.name)}
                className={`flex items-center gap-3 rounded-2xl px-5 py-3 text-sm font-semibold ${
                  activeStage === stage.name
                    ? 'bg-blue-600 text-white'
                    : 'border border-slate-200 bg-white text-slate-700'
                }`}
              >
                <span className={`h-3 w-3 rounded-full ${stage.color}`} />
                {stage.name} ({getStageCount(stage.name)})
              </button>
            ))}
          </div>

          <div className="relative mb-8 max-w-xl">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search prospects..."
              className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-4 text-base font-medium outline-none focus:border-blue-500"
            />
          </div>

          {view === 'kanban' ? (
            <div className="grid gap-6 xl:grid-cols-5">
              {stages.map((stage) => {
                const items = filteredProspects.filter(
                  (prospect) => prospect.stage === stage.name,
                );

                return (
                  <div key={stage.name}>
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`h-4 w-4 rounded-full ${stage.color}`} />
                        <h3 className="text-xl font-black text-slate-900">
                          {stage.name}
                        </h3>
                      </div>

                      <span className="rounded-full bg-slate-200 px-3 py-1 text-sm font-bold">
                        {items.length}
                      </span>
                    </div>

                    <div
                      className={`min-h-[320px] rounded-3xl border-2 border-dashed bg-white p-4 shadow-sm ${stage.border}`}
                    >
                      {items.length ? (
                        <div className="space-y-4">
                          {items.map((prospect) => (
                            <div
                              key={prospect.id}
                              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                            >
                              <h4 className="font-bold">{prospect.name}</h4>
                              <p className="text-sm text-slate-500">
                                {prospect.phone}
                              </p>
                              <p className="mt-2 text-sm font-semibold text-blue-600">
                                {prospect.sport}
                              </p>

                              <select
                                value={prospect.stage}
                                onChange={(e) =>
                                  moveStage(prospect.id, e.target.value as Stage)
                                }
                                className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                              >
                                {stages.map((s) => (
                                  <option key={s.name} value={s.name}>
                                    {s.name}
                                  </option>
                                ))}
                              </select>

                              <button
                                type="button"
                                onClick={() => deleteProspect(prospect.id)}
                                className="mt-3 text-sm font-bold text-red-500"
                              >
                                Delete
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex h-[260px] items-center justify-center text-slate-500">
                          No prospects
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left">
                <thead className="border-b border-slate-200 bg-slate-50 text-sm text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Name</th>
                    <th className="px-5 py-4">Phone</th>
                    <th className="px-5 py-4">Sport</th>
                    <th className="px-5 py-4">Stage</th>
                    <th className="px-5 py-4">Source</th>
                    <th className="px-5 py-4">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProspects.length ? (
                    filteredProspects.map((prospect) => (
                      <tr key={prospect.id} className="border-b border-slate-100">
                        <td className="px-5 py-4 font-bold">{prospect.name}</td>
                        <td className="px-5 py-4">{prospect.phone}</td>
                        <td className="px-5 py-4">{prospect.sport}</td>
                        <td className="px-5 py-4">{prospect.stage}</td>
                        <td className="px-5 py-4">{prospect.source}</td>
                        <td className="px-5 py-4">
                          <button
                            type="button"
                            onClick={() => deleteProspect(prospect.id)}
                            className="font-bold text-red-500"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-5 py-16 text-center text-slate-500">
                        No prospects found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
