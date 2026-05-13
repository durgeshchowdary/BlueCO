"use client";

import { useState } from "react";
import { Brain, Camera, Video, X, Zap } from "lucide-react";

export default function VideoAnalysisPage() {
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    title: "U-10 vs Baroda FC - Semi Final",
    url: "",
    sport: "Football",
    notes: "",
  });

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

        <button
          onClick={() => setShowModal(true)}
          className="flex h-[42px] items-center gap-2 rounded-xl bg-[#9333ea] px-5 text-[14px] font-extrabold text-white shadow-sm hover:bg-[#7e22ce]"
        >
          <Camera size={16} />
          New Analysis
        </button>
      </div>

      <section className="flex h-[320px] items-center justify-center rounded-2xl border border-dashed border-[#d8e0ec] bg-[#f8fbff] shadow-sm">
        <div className="text-center">
          <Video size={48} className="mx-auto text-[#b8c1cf]" />

          <h2 className="mt-6 text-[20px] font-extrabold text-[#061739]">
            No analyses yet
          </h2>

          <p className="mt-3 text-[14px] text-[#536987]">
            Upload a match video to get AI-powered tactical insights
          </p>

          <button
            onClick={() => setShowModal(true)}
            className="mt-5 inline-flex h-[42px] items-center gap-2 rounded-xl bg-[#9333ea] px-5 text-[14px] font-extrabold text-white shadow-sm hover:bg-[#7e22ce]"
          >
            <Camera size={16} />
            Create First Analysis
          </button>
        </div>
      </section>

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

                <h2 className="text-[20px] font-extrabold text-[#1f2937]">
                  Create Video Analysis
                </h2>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="text-[#536987] hover:text-[#061739]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-[13px] font-bold text-[#1f2937]">
                  Title *
                </span>

                <input
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                  className="h-[44px] w-full rounded-xl border border-[#00897b] bg-[#fffdf0] px-4 text-[14px] outline-none"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[13px] font-bold text-[#1f2937]">
                  Video URL
                </span>

                <input
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  placeholder="https://youtube.com/watch?v=... or direct MP4 URL"
                  className="h-[44px] w-full rounded-xl border border-[#d8e0ec] bg-[#fffdf0] px-4 text-[14px] outline-none focus:border-[#00897b]"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[13px] font-bold text-[#1f2937]">
                  Sport
                </span>

                <select
                  value={form.sport}
                  onChange={(e) =>
                    setForm({ ...form, sport: e.target.value })
                  }
                  className="h-[44px] w-full rounded-xl border border-[#d8e0ec] bg-[#fffdf0] px-4 text-[14px] outline-none focus:border-[#00897b]"
                >
                  <option>Football</option>
                  <option>Cricket</option>
                  <option>Basketball</option>
                  <option>Badminton</option>
                  <option>Volleyball</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-[13px] font-bold text-[#1f2937]">
                  Notes
                </span>

                <textarea
                  value={form.notes}
                  onChange={(e) =>
                    setForm({ ...form, notes: e.target.value })
                  }
                  placeholder="Match details, key players to watch..."
                  className="h-[70px] w-full resize-none rounded-xl border border-[#d8e0ec] bg-[#fffdf0] px-4 py-3 text-[14px] outline-none focus:border-[#00897b]"
                />
              </label>

              <button
                onClick={() => setShowModal(false)}
                className="flex h-[44px] w-full items-center justify-center gap-3 rounded-xl bg-[#9333ea] text-[14px] font-extrabold text-white shadow-sm hover:bg-[#7e22ce]"
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