'use client';

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import {
  Bell,
  Building2,
  CheckCircle2,
  Clock,
  CreditCard,
  KeyRound,
  Mail,
  MessageSquare,
  Moon,
  Save,
  ShieldCheck,
  Smartphone,
  Sun,
  UserRound,
  Zap,
} from 'lucide-react';

import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';
import Loading from '../../components/Loading';
import Toast from '../../components/Toast';
import ToastContainer from '../../components/ToastContainer';

type SettingsForm = {
  academyName: string;
  ownerName: string;
  email: string;
  phone: string;
  city: string;
  timezone: string;
  currency: string;
  defaultSport: string;
  sessionDuration: string;
  theme: 'light' | 'dark';
  emailAlerts: boolean;
  smsAlerts: boolean;
  whatsappAlerts: boolean;
  feeReminders: boolean;
  attendanceAlerts: boolean;
  weeklyDigest: boolean;
};

const defaultSettings: SettingsForm = {
  academyName: 'Vijayawada Blues',
  ownerName: 'Durgesh Chowdary',
  email: 'admin@playgrid.ai',
  phone: '+91 98765 43210',
  city: 'Vijayawada',
  timezone: 'Asia/Kolkata',
  currency: 'INR',
  defaultSport: 'Cricket',
  sessionDuration: '90',
  theme: 'light',
  emailAlerts: true,
  smsAlerts: false,
  whatsappAlerts: true,
  feeReminders: true,
  attendanceAlerts: true,
  weeklyDigest: true,
};

const integrationCards = [
  {
    name: 'Razorpay',
    description: 'Online fee collection and payment receipts',
    status: 'Ready',
    icon: CreditCard,
    color: 'blue',
  },
  {
    name: 'WhatsApp',
    description: 'Broadcasts, attendance nudges, and reminders',
    status: 'Connected',
    icon: MessageSquare,
    color: 'emerald',
  },
  {
    name: 'Email',
    description: 'Announcements and weekly parent digests',
    status: 'Ready',
    icon: Mail,
    color: 'cyan',
  },
  {
    name: 'SMS',
    description: 'Fallback OTPs and urgent notifications',
    status: 'Needs setup',
    icon: Smartphone,
    color: 'amber',
  },
];

export default function SettingsPage() {
  const [authorized, setAuthorized] = useState(false);
  const [settings, setSettings] = useState(defaultSettings);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    const isAuth = localStorage.getItem('isAuthenticated');
    if (!isAuth) {
      window.location.href = '/login';
      return;
    }

    const savedSettings = localStorage.getItem('academySettings');
    if (savedSettings) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
      } catch {
        localStorage.removeItem('academySettings');
      }
    }

    setAuthorized(true);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  const enabledChannels = useMemo(
    () =>
      [
        settings.emailAlerts ? 'Email' : null,
        settings.smsAlerts ? 'SMS' : null,
        settings.whatsappAlerts ? 'WhatsApp' : null,
      ].filter(Boolean),
    [settings.emailAlerts, settings.smsAlerts, settings.whatsappAlerts],
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = event.target;
    const checked = event.target instanceof HTMLInputElement ? event.target.checked : false;

    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    localStorage.setItem('academySettings', JSON.stringify(settings));
    localStorage.setItem('playgrid-theme', settings.theme);
    document.documentElement.classList.toggle('app-dark', settings.theme === 'dark');
    setToast({ message: 'Settings saved successfully.', type: 'success' });
  };

  if (!authorized) return <Loading />;

  return (
    <main className="min-h-screen bg-[#f8f5e8] text-slate-900">
      <Sidebar />
      <ToastContainer>{toast && <Toast message={toast.message} type={toast.type} />}</ToastContainer>

      <section className="lg:pl-[280px]">
        <Topbar academyName={settings.academyName} />

        <form onSubmit={handleSubmit} className="p-5 md:p-8">
          <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-blue-100 p-2 text-blue-700">
                  <ShieldCheck size={28} />
                </div>
                <h1 className="text-3xl font-black text-slate-900">Settings</h1>
              </div>

              <p className="mt-2 text-lg text-slate-500">
                Manage academy profile, alerts, integrations, and workspace defaults.
              </p>
            </div>

            <button
              type="submit"
              className="flex w-fit items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-100 transition hover:bg-blue-700"
            >
              <Save size={18} />
              Save Changes
            </button>
          </div>

          <div className="mb-8 grid gap-4 md:grid-cols-3">
            <SummaryCard title="Workspace" value={settings.academyName} icon={Building2} color="blue" />
            <SummaryCard title="Channels" value={enabledChannels.length ? enabledChannels.join(', ') : 'None'} icon={Bell} color="emerald" />
            <SummaryCard title="Theme" value={settings.theme === 'dark' ? 'Dark mode' : 'Light mode'} icon={settings.theme === 'dark' ? Moon : Sun} color="amber" />
          </div>

          <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
            <section className="space-y-8">
              <SettingsPanel icon={Building2} title="Academy Profile">
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Academy Name" name="academyName" value={settings.academyName} onChange={handleChange} />
                  <Field label="Owner Name" name="ownerName" value={settings.ownerName} onChange={handleChange} />
                  <Field label="Email" name="email" type="email" value={settings.email} onChange={handleChange} />
                  <Field label="Phone" name="phone" value={settings.phone} onChange={handleChange} />
                  <Field label="City" name="city" value={settings.city} onChange={handleChange} />
                  <SelectField label="Timezone" name="timezone" value={settings.timezone} onChange={handleChange} options={['Asia/Kolkata', 'Asia/Dubai', 'Europe/London', 'America/New_York']} />
                </div>
              </SettingsPanel>

              <SettingsPanel icon={Clock} title="Workspace Defaults">
                <div className="grid gap-5 md:grid-cols-3">
                  <SelectField label="Currency" name="currency" value={settings.currency} onChange={handleChange} options={['INR', 'USD', 'AED', 'GBP']} />
                  <SelectField label="Default Sport" name="defaultSport" value={settings.defaultSport} onChange={handleChange} options={['Cricket', 'Football', 'Badminton', 'Tennis', 'Swimming']} />
                  <Field label="Session Duration" name="sessionDuration" type="number" value={settings.sessionDuration} onChange={handleChange} suffix="minutes" />
                </div>

                <div className="mt-6">
                  <p className="mb-3 text-sm font-black uppercase tracking-widest text-slate-400">Appearance</p>
                  <div className="flex w-fit rounded-2xl bg-slate-100 p-1">
                    {(['light', 'dark'] as const).map((theme) => (
                      <label
                        key={theme}
                        className={`flex cursor-pointer items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold capitalize transition ${
                          settings.theme === theme ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        <input
                          className="sr-only"
                          type="radio"
                          name="theme"
                          value={theme}
                          checked={settings.theme === theme}
                          onChange={handleChange}
                        />
                        {theme === 'light' ? <Sun size={17} /> : <Moon size={17} />}
                        {theme}
                      </label>
                    ))}
                  </div>
                </div>
              </SettingsPanel>

              <SettingsPanel icon={Bell} title="Notifications">
                <div className="grid gap-4 md:grid-cols-2">
                  <Toggle label="Email alerts" description="Receive operational and parent messages by email." name="emailAlerts" checked={settings.emailAlerts} onChange={handleChange} />
                  <Toggle label="SMS alerts" description="Use SMS for urgent updates and fallback delivery." name="smsAlerts" checked={settings.smsAlerts} onChange={handleChange} />
                  <Toggle label="WhatsApp alerts" description="Send fee reminders and announcements on WhatsApp." name="whatsappAlerts" checked={settings.whatsappAlerts} onChange={handleChange} />
                  <Toggle label="Fee reminders" description="Notify guardians before and after due dates." name="feeReminders" checked={settings.feeReminders} onChange={handleChange} />
                  <Toggle label="Attendance alerts" description="Send same-day absent and late arrival alerts." name="attendanceAlerts" checked={settings.attendanceAlerts} onChange={handleChange} />
                  <Toggle label="Weekly digest" description="Summarize revenue, attendance, and sessions every week." name="weeklyDigest" checked={settings.weeklyDigest} onChange={handleChange} />
                </div>
              </SettingsPanel>
            </section>

            <aside className="space-y-8">
              <SettingsPanel icon={Zap} title="Integrations">
                <div className="space-y-4">
                  {integrationCards.map((integration) => (
                    <div key={integration.name} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <div className="flex items-start gap-4">
                        <div className={`rounded-xl p-3 ${integration.color === 'blue' ? 'bg-blue-100 text-blue-700' : integration.color === 'emerald' ? 'bg-emerald-100 text-emerald-700' : integration.color === 'cyan' ? 'bg-cyan-100 text-cyan-700' : 'bg-amber-100 text-amber-700'}`}>
                          <integration.icon size={20} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-black text-slate-900">{integration.name}</p>
                            <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${integration.status === 'Needs setup' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                              {integration.status}
                            </span>
                          </div>
                          <p className="mt-1 text-sm font-medium text-slate-500">{integration.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </SettingsPanel>

              <SettingsPanel icon={KeyRound} title="Security">
                <div className="space-y-4">
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                    <div className="flex items-center gap-3 text-emerald-700">
                      <CheckCircle2 size={20} />
                      <p className="font-black">Workspace protected</p>
                    </div>
                    <p className="mt-2 text-sm font-medium text-emerald-700/80">
                      Authentication is enabled for this dashboard.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setToast({ message: 'Password reset flow is ready to connect to auth.', type: 'info' })}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
                  >
                    <UserRound size={18} />
                    Manage Admin Access
                  </button>
                </div>
              </SettingsPanel>
            </aside>
          </div>
        </form>
      </section>
    </main>
  );
}

function SettingsPanel({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-2xl bg-blue-50 p-2 text-blue-700">
          <Icon size={22} />
        </div>
        <h2 className="text-xl font-black text-slate-900">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function SummaryCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  color: 'blue' | 'emerald' | 'amber';
}) {
  const styles = {
    blue: 'bg-blue-50 text-blue-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`rounded-2xl p-3 ${styles[color]}`}>
          <Icon size={22} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">{title}</p>
          <p className="truncate text-lg font-black text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  type = 'text',
  suffix,
}: {
  label: string;
  name: keyof SettingsForm;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  suffix?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-slate-700">{label}</span>
      <div className="relative">
        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white"
        />
        {suffix ? (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
            {suffix}
          </span>
        ) : null}
      </div>
    </label>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
}: {
  label: string;
  name: keyof SettingsForm;
  value: string;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-slate-700">{label}</span>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function Toggle({
  label,
  description,
  name,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  name: keyof SettingsForm;
  checked: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-blue-100 hover:bg-blue-50/40">
      <span>
        <span className="block font-black text-slate-900">{label}</span>
        <span className="mt-1 block text-sm font-medium text-slate-500">{description}</span>
      </span>

      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="mt-1 h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
      />
    </label>
  );
}
