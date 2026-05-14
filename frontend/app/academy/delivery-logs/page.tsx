"use client";

import { useMemo, useState } from "react";
import {
  Bell,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Inbox,
  Mail,
  MessageSquare,
  Moon,
  Phone,
  RefreshCw,
  Search,
  Send,
  X,
  XCircle,
} from "lucide-react";

type Channel = "All" | "SMS" | "WhatsApp" | "Email";
type Status = "Any Status" | "Sent / Delivered" | "Failed";
type RouteType = "Any Route" | "Academy Keys" | "Out-Play Relay" | "Failover" | "Mocked";
type Range = "1d" | "7d" | "14d" | "30d" | "90d";

const channels: Channel[] = ["All", "SMS", "WhatsApp", "Email"];
const statuses: Status[] = ["Any Status", "Sent / Delivered", "Failed"];
const routes: RouteType[] = ["Any Route", "Academy Keys", "Out-Play Relay", "Failover", "Mocked"];
const ranges: Range[] = ["1d", "7d", "14d", "30d", "90d"];

export default function DeliveryLogsPage() {
  const [channel, setChannel] = useState<Channel>("Email");
  const [status, setStatus] = useState<Status>("Any Status");
  const [route, setRoute] = useState<RouteType>("Any Route");
  const [range, setRange] = useState<Range>("7d");
  const [search, setSearch] = useState("");
  const [testOpen, setTestOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const logs: any[] = [];

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const channelOk = channel === "All" || log.channel === channel;
      const statusOk = status === "Any Status" || log.status === status;
      const routeOk = route === "Any Route" || log.route === route;
      const searchOk =
        !search ||
        log.recipient?.toLowerCase().includes(search.toLowerCase()) ||
        log.subject?.toLowerCase().includes(search.toLowerCase());

      return channelOk && statusOk && routeOk && searchOk;
    });
  }, [channel, status, route, search]);

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(""), 2200);
  }

  function handleRefresh() {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      showToast("Delivery logs refreshed");
    }, 900);
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
        <h2 className="text-[22px] font-black">Welcome, Vijayawada blues</h2>

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
            <h1 className="flex items-center gap-3 text-[30px] font-black">
              <Inbox size={26} className="text-[#007f72]" />
              Delivery Logs
            </h1>
            <p className="mt-1 text-[16px] text-[#52657d]">
              Last {range} · {filteredLogs.length} messages
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold shadow-sm hover:bg-slate-50"
            >
              <RefreshCw
                size={17}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              onClick={() => setTestOpen(true)}
              className="flex h-10 items-center gap-2 rounded-xl bg-[#007f72] px-4 text-sm font-bold text-white shadow-sm hover:bg-[#006f64]"
            >
              <Send size={17} />
              Send Test
            </button>
          </div>
        </div>

        <section className="mt-7 grid grid-cols-5 gap-4">
          <MetricCard icon={<Phone size={18} />} value="0" label="SMS" tone="red" />
          <MetricCard icon={<MessageSquare size={18} />} value="0" label="WhatsApp" tone="green" />
          <MetricCard icon={<Mail size={18} />} value="0" label="Email" tone="blue" />
          <MetricCard icon={<CheckCircle2 size={18} />} value="0" label="Sent" badge="0%" tone="green" />
          <MetricCard icon={<XCircle size={18} />} value="0" label="Errors" tone="red" />
        </section>

        <section className="mt-6 flex items-center gap-2">
          <div className="inline-flex h-11 items-center gap-1 rounded-xl bg-[#eef2f6] p-1">
            {channels.map((item) => (
              <button
                key={item}
                onClick={() => setChannel(item)}
                className={`h-9 rounded-xl px-4 text-[15px] font-semibold ${
                  channel === item
                    ? "bg-[#fffdf0] text-slate-950 shadow-sm ring-1 ring-black/5"
                    : "text-[#52657d]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <Dropdown value={status} options={statuses} onSelect={setStatus} width="w-[150px]" />
          <Dropdown value={route} options={routes} onSelect={setRoute} width="w-[165px]" />
          <Dropdown value={range} options={ranges} onSelect={setRange} width="w-[120px]" />

          <div className="flex h-11 w-[420px] items-center gap-3 rounded-xl border border-slate-200 bg-white px-4">
            <Search size={17} className="text-[#52657d]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search recipient or subject..."
              className="w-full bg-transparent outline-none placeholder:text-[#52657d]"
            />
          </div>
        </section>

        <section className="mt-5 flex h-[220px] items-center justify-center rounded-xl border border-slate-200 bg-[#f8fafc] shadow-sm">
          <div className="text-center">
            <div className="flex justify-center">
              <span className="text-[48px] text-slate-300">✧</span>
            </div>

            <h2 className="mt-2 text-[19px] font-medium text-[#52657d]">
              No messages found in the selected window.
            </h2>

            <p className="mt-2 text-[14px] text-[#52657d]">
              Configure Twilio + Resend in{" "}
              <b>Settings → Integrations & Comms</b>, then send a fee reminder or
              announcement to populate this dashboard.
            </p>
          </div>
        </section>
      </div>

      {testOpen && (
        <SendTestModal
          onClose={() => setTestOpen(false)}
          onSend={() => {
            setTestOpen(false);
            showToast("Test message queued");
          }}
        />
      )}
    </main>
  );
}

function MetricCard({
  icon,
  value,
  label,
  badge,
  tone,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  badge?: string;
  tone: "red" | "green" | "blue";
}) {
  const styles = {
    red: "border-red-200 bg-red-50 text-red-700",
    green: "border-emerald-200 bg-emerald-50 text-emerald-700",
    blue: "border-blue-200 bg-blue-50 text-blue-700",
  };

  return (
    <div className={`h-[112px] rounded-xl border p-5 shadow-sm ${styles[tone]}`}>
      <div className="flex items-start justify-between">
        {icon}
        <span className="rounded-full border bg-white/50 px-3 py-1 text-[11px] font-bold text-slate-800">
          {badge || label}
        </span>
      </div>

      <p className="mt-3 text-[28px] font-black leading-none">{value}</p>
      {label === "Sent" && <p className="mt-3 text-[13px] font-semibold">Sent</p>}
    </div>
  );
}

function Dropdown<T extends string>({
  value,
  options,
  onSelect,
  width,
}: {
  value: T;
  options: readonly T[];
  onSelect: (v: T) => void;
  width: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`relative ${width}`}>
      <button
        onClick={() => setOpen(!open)}
        className="flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold"
      >
        {value}
        <ChevronDown size={16} />
      </button>

      {open && (
        <div className="absolute left-0 top-12 z-40 w-full overflow-hidden rounded-xl border border-slate-200 bg-white py-2 shadow-lg">
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
              {value === option && <Check size={15} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SendTestModal({
  onClose,
  onSend,
}: {
  onClose: () => void;
  onSend: () => void;
}) {
  const [channel, setChannel] = useState("WhatsApp");
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75">
      <div className="relative w-[470px] rounded-xl bg-[#fffdf0] p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-slate-500 hover:text-slate-800"
        >
          <X size={20} />
        </button>

        <h2 className="text-[22px] font-black">Send Test Message</h2>
        <p className="mt-2 text-[16px] leading-relaxed text-[#52657d]">
          Send a one-off test through your configured Twilio or Resend integration.
        </p>

        <div className="relative mt-6">
          <label className="text-sm font-semibold">Channel</label>

          <button
            onClick={() => setOpen(!open)}
            className="mt-2 flex h-11 w-full items-center justify-between rounded-xl border border-teal-600 bg-white px-4 text-left"
          >
            {channel}
            <ChevronDown size={17} />
          </button>

          {open && (
            <div className="absolute left-0 top-[74px] z-50 w-full overflow-hidden rounded-xl border border-slate-200 bg-white py-2 shadow-xl">
              {["SMS", "WhatsApp", "Email"].map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setChannel(item);
                    setOpen(false);
                  }}
                  className={`flex h-10 w-full items-center justify-between px-4 text-left hover:bg-slate-50 ${
                    channel === item ? "bg-[#d8ece9] text-[#047c73]" : ""
                  }`}
                >
                  {item}
                  {channel === item && <Check size={16} />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-5">
          <label className="text-sm font-semibold">
            {channel === "Email" ? "Recipient Email" : "Recipient Phone (E.164)"}
          </label>

          <input
            placeholder={channel === "Email" ? "test@email.com" : "+919876543210"}
            className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-4 outline-none placeholder:text-[#52657d]"
          />
        </div>

        <button
          onClick={onSend}
          className="mt-4 flex h-11 w-full items-center justify-center gap-3 rounded-xl bg-[#8dbfb5] font-bold text-white"
        >
          <Send size={17} />
          Send Test
        </button>

        <p className="mt-4 text-[14px] leading-relaxed text-[#52657d]">
          Uses your stored Twilio credentials. Ensure they&apos;re configured in
          Settings → Integrations & Comms.
        </p>
      </div>
    </div>
  );
}