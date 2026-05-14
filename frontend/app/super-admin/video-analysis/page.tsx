"use client";

import { useEffect, useState } from "react";
import { Brain, Camera, RefreshCw, Video, X, Zap } from "lucide-react";
import api from "../../../lib/api";

export default function VideoAnalysisPage() {
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    title: "U-10 vs Baroda FC - Semi Final",
    url: "",
    sport: "Football",
    notes: "",
  });

  const loadAnalyses = async () => {
    try {
      setLoading(true);
      const res = await api.get("/super-admin/video-analysis");
      setAnalyses(res.data.analyses || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyses();
  }, []);

  const createAnalysis = async () => {
    if (!form.title.trim()) return;

    await api.post("/super-admin/video-analysis", form);
    setShowModal(false);

    setForm({
      title: "U-10 vs Baroda FC - Semi Final",
      url: "",
      sport: "Football",
      notes: "",
    });

    loadAnalyses();
  };

  return (
    <div className="min-h-screen bg-[#fffdf0] px-6 py-6 text-[#061739]">
      <div className="mb-7 flex items-start justify-between">
        <div>
          <h1 className="text-[26px] font-extrabold tracking-tight">
            Video Analysis
          </h1>
          <p className="mt-1 text-[14px] text-[#536987]">
            AI-powered match & training video intelligence
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={loadAnalyses}
            className="flex h-[42px] items-center gap-2 rounded-xl border bg-white px-5 text-[14px] font-bold"
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="flex h-[42px] items-center gap-2 rounded-xl bg-[#9333ea] px-5 text-[14px] font-extrabold text-white shadow-sm hover:bg-[#7e22ce]"
          >
            <Camera size={16} />
            New Analysis
          </button>
        </div>
      </div>

      {loading ? (
        <section className="rounded-2xl border bg-white p-6 font-bold text-[#9333ea]">
          Loading video analyses...
        </section>
      ) : analyses.length === 0 ? (
        <section className="flex h-[320px] items-center justify-center rounded-2xl border border-dashed border-[#d8e0ec] bg-[#f8fbff] shadow-sm">
          <div className="text-center">
            <Video size={48} className="mx-auto text-[#b8c1cf]" />
            <h2 className="mt-6 text-[20px] font-extrabold">
              No analyses yet
            </h2>
            <p className="mt-3 text-[14px] text-[#536987]">
              Upload a match video to get AI-powered tactical insights
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-5 inline-flex h-[42px] items-center gap-2 rounded-xl bg-[#9333ea] px-5 text-[14px] font-extrabold text-white"
            >
              <Camera size={16} />
              Create First Analysis
            </button>
          </div>
        </section>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {analyses.map((item) => (
            <div
              key={item._id}
              className="rounded-2xl border border-[#d8e0ec] bg-[#f8fbff] p-5 shadow-sm"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                  <Video size={22} />
                </div>

                <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-700">
                  {item.status}
                </span>
              </div>

              <h2 className="text-[16px] font-black">{item.title}</h2>
              <p className="mt-2 text-sm text-[#536987]">{item.sport}</p>
              <p className="mt-3 line-clamp-3 text-sm text-[#536987]">
                {item.notes || "No notes added"}
              </p>

              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  className="mt-4 inline-block text-sm font-bold text-[#9333ea]"
                >
                  Open video →
                </a>
              )}
            </div>
          ))}
        </div>
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
              <div className="flex items-center gap-3">
                <Brain size={22} className="text-[#9333ea]" />
                <h2 className="text-[20px] font-extrabold">
                  Create Video Analysis
                </h2>
              </div>

              <button onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5">
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="h-[44px] w-full rounded-xl border border-[#00897b] bg-[#fffdf0] px-4 text-[14px] outline-none"
              />

              <input
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="Video URL"
                className="h-[44px] w-full rounded-xl border bg-[#fffdf0] px-4 text-[14px]"
              />

              <select
                value={form.sport}
                onChange={(e) => setForm({ ...form, sport: e.target.value })}
                className="h-[44px] w-full rounded-xl border bg-[#fffdf0] px-4 text-[14px]"
              >
                <option>Football</option>
                <option>Cricket</option>
                <option>Basketball</option>
                <option>Badminton</option>
                <option>Volleyball</option>
              </select>

              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Match details, key players to watch..."
                className="h-[70px] w-full resize-none rounded-xl border bg-[#fffdf0] px-4 py-3 text-[14px]"
              />

              <button
                onClick={createAnalysis}
                className="flex h-[44px] w-full items-center justify-center gap-3 rounded-xl bg-[#9333ea] text-[14px] font-extrabold text-white"
              >
                <Zap size={17} />
                Start AI Analysis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}