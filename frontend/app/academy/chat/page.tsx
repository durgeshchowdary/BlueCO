"use client";

import { useMemo, useState } from "react";
import {
  Bell,
  Clock3,
  MessageSquare,
  Moon,
  Search,
  Send,
  User,
  X,
} from "lucide-react";

type Contact = {
  id: string;
  name: string;
  role: string;
  lastMessage: string;
  time: string;
  unread?: number;
};

const contacts: Contact[] = [
  {
    id: "1",
    name: "Demo Student",
    role: "Student",
    lastMessage: "Hello coach",
    time: "10:30 AM",
    unread: 2,
  },
  {
    id: "2",
    name: "Demo Employee",
    role: "Staff",
    lastMessage: "Attendance updated",
    time: "Yesterday",
  },
];

export default function AcademyChatPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Contact | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { from: "them", text: "Hello coach", time: "10:30 AM" },
    { from: "me", text: "Hi, how can I help?", time: "10:31 AM" },
  ]);

  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) =>
      contact.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  function sendMessage() {
    if (!message.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        from: "me",
        text: message.trim(),
        time: new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);

    setMessage("");
  }

  return (
    <main className="min-h-screen bg-[#fffdf0] text-[#17223b]">
      <div className="flex h-[42px] items-center justify-center bg-[#079663] text-white">
        <div className="flex items-center gap-3 text-[16px] font-bold">
          <Clock3 size={17} />
          <span>Free trial: 9 days remaining</span>

          <button className="ml-2 flex h-7 items-center gap-3 rounded-full bg-white px-4 text-[14px] font-semibold text-slate-900">
            Upgrade
            <span className="text-xl leading-none">→</span>
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
        <div>
          <h1 className="text-[26px] font-black">Messages</h1>
          <p className="mt-1 text-[15px] text-[#52657d]">
            Chat with students and staff
          </p>
        </div>

        <section className="mt-5 grid h-[620px] grid-cols-[420px_1fr] gap-5">
          <aside className="overflow-hidden rounded-xl border border-slate-200 bg-[#f8fafc] shadow-sm">
            <div className="border-b border-slate-200 p-4">
              <p className="mb-3 text-[13px] font-black uppercase text-[#52657d]">
                Contacts
              </p>

              <div className="flex h-10 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4">
                <Search size={18} className="text-[#52657d]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search contacts..."
                  className="w-full bg-transparent outline-none placeholder:text-[#52657d]"
                />
              </div>
            </div>

            <div className="h-[540px] overflow-y-auto">
              {filteredContacts.map((contact) => {
                const active = selected?.id === contact.id;

                return (
                  <button
                    key={contact.id}
                    onClick={() => setSelected(contact)}
                    className={`flex w-full items-center gap-3 border-b border-slate-100 px-4 py-4 text-left transition ${
                      active ? "bg-[#d8ece9]" : "hover:bg-white"
                    }`}
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#007f72] text-white">
                      <User size={20} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="truncate text-[15px] font-black">
                          {contact.name}
                        </h3>
                        <span className="text-[11px] text-[#52657d]">
                          {contact.time}
                        </span>
                      </div>

                      <p className="mt-0.5 text-[12px] text-[#52657d]">
                        {contact.role}
                      </p>

                      <p className="mt-1 truncate text-[13px] text-[#52657d]">
                        {contact.lastMessage}
                      </p>
                    </div>

                    {contact.unread && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-400 text-[11px] font-bold text-white">
                        {contact.unread}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="overflow-hidden rounded-xl border border-slate-200 bg-[#f8fafc] shadow-sm">
            {!selected ? (
              <div className="flex h-full items-center justify-center">
                <div className="flex items-center gap-3 text-[#52657d]">
                  <MessageSquare size={34} className="text-slate-300" />
                  <p className="text-[16px]">
                    Select a contact to start chatting
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col">
                <div className="flex h-[70px] items-center gap-3 border-b border-slate-200 bg-white px-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#007f72] text-white">
                    <User size={20} />
                  </div>

                  <div>
                    <h2 className="text-[17px] font-black">{selected.name}</h2>
                    <p className="text-[13px] text-[#52657d]">
                      {selected.role}
                    </p>
                  </div>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto p-5">
                  {messages.map((item, index) => {
                    const mine = item.from === "me";

                    return (
                      <div
                        key={index}
                        className={`flex ${mine ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[60%] rounded-2xl px-4 py-3 shadow-sm ${
                            mine
                              ? "bg-[#007f72] text-white"
                              : "bg-white text-[#17223b]"
                          }`}
                        >
                          <p className="text-[15px]">{item.text}</p>
                          <p
                            className={`mt-1 text-[11px] ${
                              mine ? "text-white/70" : "text-[#52657d]"
                            }`}
                          >
                            {item.time}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex h-[76px] items-center gap-3 border-t border-slate-200 bg-white px-5">
                  <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") sendMessage();
                    }}
                    placeholder="Type a message..."
                    className="h-11 flex-1 rounded-xl border border-slate-200 bg-[#fffdf0] px-4 outline-none placeholder:text-[#52657d]"
                  />

                  <button
                    onClick={sendMessage}
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#007f72] text-white hover:bg-[#006f64]"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}