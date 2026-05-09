'use client';

import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Mail,
  MessageSquare,
  Phone,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  XCircle,
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';

type RouteType = 'All' | 'SMS' | 'WhatsApp' | 'Email';

type DeliveryLog = {
  id: string;
  recipient: string;
  subject: string;
  route: 'SMS' | 'WhatsApp' | 'Email';
  status: 'Sent' | 'Failed' | 'Pending';
  date: string;
};

const logs: DeliveryLog[] = [];

export default function DeliveryLogsPage() {
  const [route, setRoute] = useState<RouteType>('All');
  const [status, setStatus] = useState('Any Status');
  const [range, setRange] = useState('7d');
  const [search, setSearch] = useState('');

  const filteredLogs = useMemo(() => {
    const q = search.toLowerCase();

    return logs.filter((log) => {
      const matchesRoute = route === 'All' || log.route === route;
      const matchesStatus = status === 'Any Status' || log.status === status;
      const matchesSearch =
        log.recipient.toLowerCase().includes(q) ||
        log.subject.toLowerCase().includes(q);

      return matchesRoute && matchesStatus && matchesSearch;
    });
  }, [route, status, search]);

  const counts = {
    sms: logs.filter((log) => log.route === 'SMS').length,
    whatsapp: logs.filter((log) => log.route === 'WhatsApp').length,
    email: logs.filter((log) => log.route === 'Email').length,
    sent: logs.filter((log) => log.status === 'Sent').length,
    errors: logs.filter((log) => log.status === 'Failed').length,
  };

  return (
    <main className="min-h-screen bg-[#f8f5e8] text-slate-900">
      <Sidebar />

      <section className="lg:pl-[280px]">
        <Topbar />

        <section className="p-5 md:p-8">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-blue-100 p-2 text-blue-700">
                  <MessageSquare size={28} />
                </div>

                <h1 className="text-3xl font-black text-slate-900">
                  Delivery Logs
                </h1>
              </div>

              <p className="mt-2 text-lg text-slate-500">
                Last 7 days · {logs.length} messages
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50">
                <RefreshCw size={18} />
                Refresh
              </button>

              <button className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-blue-700">
                <Send size={18} />
                Send Test
              </button>
            </div>
          </div>

          <div className="mb-8 grid gap-4 md:grid-cols-5">
            <StatCard
              title="SMS"
              value={counts.sms}
              label="SMS"
              icon={Phone}
              color="rose"
            />
            <StatCard
              title="WhatsApp"
              value={counts.whatsapp}
              label="WhatsApp"
              icon={MessageSquare}
              color="emerald"
            />
            <StatCard
              title="Email"
              value={counts.email}
              label="Email"
              icon={Mail}
              color="blue"
            />
            <StatCard
              title="Sent"
              value={counts.sent}
              label="0%"
              icon={CheckCircle2}
              color="cyan"
            />
            <StatCard
              title="Errors"
              value={counts.errors}
              label="Errors"
              icon={XCircle}
              color="red"
            />
          </div>

          <div className="mb-8 flex flex-col gap-3 xl:flex-row xl:items-center">
            <div className="flex w-fit overflow-hidden rounded-2xl bg-slate-100 p-1">
              {(['All', 'SMS', 'WhatsApp', 'Email'] as RouteType[]).map((item) => (
                <button
                  key={item}
                  onClick={() => setRoute(item)}
                  className={`rounded-xl px-5 py-2.5 text-sm font-bold ${
                    route === item
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-blue-600'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold shadow-sm outline-none focus:border-blue-500"
            >
              <option>Any Status</option>
              <option>Sent</option>
              <option>Failed</option>
              <option>Pending</option>
            </select>

            <select
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold shadow-sm outline-none focus:border-blue-500"
            >
              <option>Any Route</option>
              <option>Fee Reminder</option>
              <option>Announcement</option>
              <option>Attendance Alert</option>
            </select>

            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold shadow-sm outline-none focus:border-blue-500"
            >
              <option value="7d">7d</option>
              <option value="30d">30d</option>
              <option value="90d">90d</option>
            </select>

            <div className="relative min-w-[320px] flex-1">
              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search recipient or subject..."
                className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm font-medium shadow-sm outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
            {filteredLogs.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b border-slate-200 bg-slate-50 text-sm text-slate-500">
                    <tr>
                      <th className="px-5 py-4">Recipient</th>
                      <th className="px-5 py-4">Subject</th>
                      <th className="px-5 py-4">Route</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4">Date</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="border-b border-slate-100">
                        <td className="px-5 py-4 font-bold">{log.recipient}</td>
                        <td className="px-5 py-4">{log.subject}</td>
                        <td className="px-5 py-4">{log.route}</td>
                        <td className="px-5 py-4">{log.status}</td>
                        <td className="px-5 py-4">{log.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex min-h-[280px] items-center justify-center px-6 text-center">
                <div>
                  <Sparkles className="mx-auto h-12 w-12 text-slate-300" />

                  <p className="mt-5 text-xl font-medium text-slate-500">
                    No messages found in the selected window.
                  </p>

                  <p className="mx-auto mt-3 max-w-3xl text-sm text-slate-500">
                    Configure Twilio + Resend in{' '}
                    <span className="font-bold text-slate-700">
                      Settings → Integrations & Comms
                    </span>
                    , then send a fee reminder or announcement to populate this
                    dashboard.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}

function StatCard({
  title,
  value,
  label,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  label: string;
  icon: React.ElementType;
  color: 'rose' | 'emerald' | 'blue' | 'cyan' | 'red';
}) {
  const styles = {
    rose: 'border-rose-200 bg-rose-50 text-rose-700',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    blue: 'border-blue-200 bg-blue-50 text-blue-700',
    cyan: 'border-cyan-200 bg-cyan-50 text-cyan-700',
    red: 'border-red-200 bg-red-50 text-red-700',
  };

  return (
    <div className={`rounded-3xl border p-5 shadow-sm ${styles[color]}`}>
      <div className="flex items-center justify-between">
        <Icon size={22} />

        <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-bold">
          {label}
        </span>
      </div>

      <h3 className="mt-5 text-3xl font-black">{value}</h3>

      <p className="mt-1 text-sm font-semibold">{title}</p>
    </div>
  );
}
