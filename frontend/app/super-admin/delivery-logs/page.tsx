"use client";

import { useMemo, useState } from "react";
import {
  RefreshCw,
  Send,
  Search,
  ChevronDown,
  Eye,
  X,
  Check,
} from "lucide-react";

const logs = [
  {
    id: 1,
    channel: "Email",
    recipient: "chowdarydurgesh0@gmail.com",
    subject: "Your 10x Growth Journey Starts Today: Welcome to Out-Play!",
    status: "sent",
    route: "Academy",
    sent: "5/8/2026, 9:18:37 PM",
  },
];

export default function DeliveryLogsPage() {
  const [tab, setTab] = useState("All");

  const [status, setStatus] = useState("Any Status");
  const [route, setRoute] = useState("Any Route");
  const [days, setDays] = useState("7d");

  const [showStatus, setShowStatus] = useState(false);
  const [showRoute, setShowRoute] = useState(false);
  const [showDays, setShowDays] = useState(false);

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleRefresh = () => {
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
    }, 1200);
  };

  const filtered = useMemo(() => {
    let data = logs;

    if (tab !== "All") {
      data = data.filter(
        (item) => item.channel.toLowerCase() === tab.toLowerCase()
      );
    }

    if (search.trim()) {
      data = data.filter(
        (item) =>
          item.recipient.toLowerCase().includes(search.toLowerCase()) ||
          item.subject.toLowerCase().includes(search.toLowerCase())
      );
    }

    return data;
  }, [tab, search]);

  return (
    <div className="min-h-screen bg-[#f7f4e8] p-6">
      {/* HEADER */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-black text-[#0f2240]">
            Delivery Logs
          </h1>

          <p className="mt-1 text-[14px] text-[#64748b]">
            Last 7 days · {filtered.length} message
            {filtered.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex h-[42px] items-center gap-2 rounded-2xl border border-[#d9dfd8] bg-white px-4 text-[14px] font-semibold text-[#0f2240]"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />

            {loading ? "Refreshing..." : "Refresh"}
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="flex h-[42px] items-center gap-2 rounded-2xl bg-[#00796b] px-4 text-[14px] font-semibold text-white"
          >
            <Send size={16} />
            Send Test
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="mt-6 grid grid-cols-5 gap-3">
        {[
          ["SMS", "0", "#fcecec"],
          ["WhatsApp", "0", "#edf8f3"],
          ["Email", "1", "#eef2ff"],
          ["Sent", "1", "#eef9f1"],
          ["Errors", "0", "#fdf0f0"],
        ].map((item, i) => (
          <div
            key={i}
            className="h-[120px] rounded-[22px] border border-[#dce4dd] p-4"
            style={{ background: item[2] }}
          >
            <div className="flex justify-end">
              <span className="rounded-full border border-[#d5dce6] bg-white/50 px-3 py-[4px] text-[11px] font-semibold text-[#0f2240]">
                {item[0]}
              </span>
            </div>

            <div className="mt-5 text-[28px] font-black leading-none text-[#0f2240]">
              {item[1]}
            </div>
          </div>
        ))}
      </div>

      {/* FILTERS */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        {["All", "SMS", "WhatsApp", "Email"].map((item) => (
          <button
            key={item}
            onClick={() => setTab(item)}
            className={`rounded-2xl px-4 py-2.5 text-[14px] font-semibold transition ${
              tab === item
                ? "bg-white text-[#0f2240] shadow-md"
                : "bg-[#ece8dc] text-[#475569]"
            }`}
          >
            {item}
          </button>
        ))}

        {/* STATUS */}
        <div className="relative">
          <button
            onClick={() => setShowStatus(!showStatus)}
            className="flex h-[44px] items-center gap-2 rounded-2xl border border-[#d8e0ec] bg-white px-4 text-[14px]"
          >
            {status}
            <ChevronDown size={16} />
          </button>

          {showStatus && (
            <div className="absolute z-50 mt-2 w-56 rounded-2xl border bg-white p-2 shadow-xl">
              {["Any Status", "Sent / Delivered", "Failed"].map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setStatus(item);
                    setShowStatus(false);
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-[13px] hover:bg-[#edf7f3]"
                >
                  {item}
                  {status === item && <Check size={15} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ROUTE */}
        <div className="relative">
          <button
            onClick={() => setShowRoute(!showRoute)}
            className="flex h-[44px] items-center gap-2 rounded-2xl border border-[#d8e0ec] bg-white px-4 text-[14px]"
          >
            {route}
            <ChevronDown size={16} />
          </button>

          {showRoute && (
            <div className="absolute z-50 mt-2 w-56 rounded-2xl border bg-white p-2 shadow-xl">
              {[
                "Any Route",
                "Academy Keys",
                "Out-Play Relay",
                "Failover",
                "Mocked",
              ].map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setRoute(item);
                    setShowRoute(false);
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-[13px] hover:bg-[#edf7f3]"
                >
                  {item}
                  {route === item && <Check size={15} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* DAYS */}
        <div className="relative">
          <button
            onClick={() => setShowDays(!showDays)}
            className="flex h-[44px] items-center gap-2 rounded-2xl border border-[#d8e0ec] bg-white px-4 text-[14px]"
          >
            {days}
            <ChevronDown size={16} />
          </button>

          {showDays && (
            <div className="absolute z-50 mt-2 w-40 rounded-2xl border bg-white p-2 shadow-xl">
              {["1d", "7d", "14d", "30d", "90d"].map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setDays(item);
                    setShowDays(false);
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-[13px] hover:bg-[#edf7f3]"
                >
                  {item}
                  {days === item && <Check size={15} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* SEARCH */}
        <div className="relative min-w-[240px] flex-1">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748b]"
            size={16}
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search recipient or subject..."
            className="h-[44px] w-full rounded-2xl border border-[#d8e0ec] bg-white pl-11 pr-4 text-[14px] outline-none"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="mt-5 overflow-hidden rounded-[24px] border border-[#d8e0ec] bg-[#f8fafc]">
        {filtered.length === 0 ? (
          <div className="flex h-[260px] flex-col items-center justify-center">
            <div className="text-[36px] text-[#cbd5e1]">✦</div>

            <h2 className="mt-3 text-[18px] text-[#64748b]">
              No messages found in the selected window.
            </h2>

            <p className="mt-2 text-center text-[13px] text-[#64748b]">
              Configure Twilio + Resend in Settings → Integrations & Comms
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-6 border-b bg-[#f8fafc] px-5 py-4 text-[13px] font-bold text-[#475569]">
              <div>Channel</div>
              <div>Recipient</div>
              <div>Subject / Body</div>
              <div>Status</div>
              <div>Route</div>
              <div>Sent</div>
            </div>

            {filtered.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-6 items-center border-b bg-white px-5 py-4 text-[13px]"
              >
                <div>
                  <span className="rounded-full border border-[#c7d2fe] bg-[#eef2ff] px-3 py-1.5 text-[#2563eb]">
                    Email
                  </span>
                </div>

                <div className="break-all">{item.recipient}</div>

                <div className="pr-4 leading-5">{item.subject}</div>

                <div>
                  <span className="rounded-full border border-[#86efac] bg-[#ecfdf3] px-3 py-1.5 text-[#16a34a]">
                    sent
                  </span>
                </div>

                <div>
                  <span className="rounded-full border border-[#86efac] bg-[#ecfdf3] px-3 py-1.5 text-[#16a34a]">
                    Academy
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span>{item.sent}</span>
                  <Eye size={16} />
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-[420px] rounded-[26px] bg-[#f7f4e8] p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-[24px] font-black text-[#0f2240]">
                  Send Test Message
                </h2>

                <p className="mt-2 text-[14px] leading-5 text-[#64748b]">
                  Send a one-off test through your configured Twilio or Resend
                  integration.
                </p>
              </div>

              <button onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="mt-5">
              <label className="text-[13px] font-semibold text-[#0f2240]">
                Channel
              </label>

              <select className="mt-2 h-[44px] w-full rounded-2xl border border-[#00897b] bg-white px-4 text-[14px] outline-none">
                <option>WhatsApp</option>
                <option>Email</option>
                <option>SMS</option>
              </select>
            </div>

            <div className="mt-5">
              <label className="text-[13px] font-semibold text-[#0f2240]">
                Recipient Phone (E.164)
              </label>

              <input
                defaultValue="+919876543210"
                className="mt-2 h-[44px] w-full rounded-2xl border border-[#d8e0ec] bg-white px-4 text-[14px] outline-none"
              />
            </div>

            <button className="mt-6 flex h-[44px] w-full items-center justify-center gap-2 rounded-2xl bg-[#8cc7bd] text-[15px] font-bold text-white">
              <Send size={16} />
              Send Test
            </button>

            <p className="mt-4 text-[11px] leading-5 text-[#64748b]">
              Uses your stored Twilio credentials. Ensure they’re configured in
              Settings → Integrations & Comms.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}