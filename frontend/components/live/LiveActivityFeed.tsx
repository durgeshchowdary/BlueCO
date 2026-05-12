"use client";

export default function LiveActivityFeed() {
  const events = [
    "Attendance synchronized",
    "AI Ops alert resolved",
    "Payment received",
    "Coach session updated",
    "Operational health stable",
  ];

  return (
    <div>
      <h3 className="mb-5 text-sm font-black uppercase tracking-widest text-slate-700">
        Live Activity
      </h3>

      <div className="space-y-3">
        {events.map((event) => (
          <div
            key={event}
            className="rounded-2xl border border-slate-200 bg-white p-4"
          >
            <p className="text-sm font-semibold text-slate-700">
              {event}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
