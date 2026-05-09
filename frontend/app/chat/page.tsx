'use client';

import { useMemo, useState } from 'react';
import {
  MessageSquare,
  Search,
  Send,
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';

type Contact = {
  id: string;
  name: string;
  role: 'Student' | 'Parent' | 'Coach' | 'Staff';
  sport: string;
  lastMessage: string;
  unread: number;
};

type ChatMessage = {
  id: string;
  contactId: string;
  sender: 'me' | 'them';
  text: string;
  time: string;
};

const contacts: Contact[] = [
  {
    id: '1',
    name: 'Aarav Sharma',
    role: 'Student',
    sport: 'Football',
    lastMessage: 'Coach, what time is training?',
    unread: 2,
  },
  {
    id: '2',
    name: 'Priya Reddy',
    role: 'Parent',
    sport: 'Cricket',
    lastMessage: 'Can I get fee details?',
    unread: 0,
  },
  {
    id: '3',
    name: 'Coach Kiran',
    role: 'Coach',
    sport: 'Fitness',
    lastMessage: 'Attendance has been updated.',
    unread: 1,
  },
  {
    id: '4',
    name: 'Ananya Das',
    role: 'Student',
    sport: 'Swimming',
    lastMessage: 'Thank you sir.',
    unread: 0,
  },
];

const initialMessages: ChatMessage[] = [
  {
    id: 'm1',
    contactId: '1',
    sender: 'them',
    text: 'Coach, what time is training?',
    time: '10:20 AM',
  },
  {
    id: 'm2',
    contactId: '1',
    sender: 'me',
    text: 'Training starts at 6 PM today.',
    time: '10:22 AM',
  },
];

export default function ChatPage() {
  const [search, setSearch] = useState('');
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');

  const filteredContacts = useMemo(() => {
    const q = search.toLowerCase();

    return contacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(q) ||
        contact.role.toLowerCase().includes(q) ||
        contact.sport.toLowerCase().includes(q),
    );
  }, [search]);

  const selectedContact = contacts.find(
    (contact) => contact.id === selectedContactId,
  );

  const activeMessages = messages.filter(
    (message) => message.contactId === selectedContactId,
  );

  const sendMessage = () => {
    if (!input.trim() || !selectedContactId) return;

    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      contactId: selectedContactId,
      sender: 'me',
      text: input.trim(),
      time: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput('');
  };

  return (
    <main className="min-h-screen bg-[#f8f5e8] text-slate-900">
      <Sidebar />

      <section className="lg:pl-[280px]">
        <Topbar />

        <section className="p-5 md:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-900">Messages</h1>
            <p className="mt-1 text-lg text-slate-500">
              Chat with students and staff
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
            <aside className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 p-4">
                <p className="mb-3 text-sm font-black uppercase tracking-wide text-slate-600">
                  Contacts
                </p>

                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search contacts..."
                    className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="h-[620px] overflow-y-auto p-3">
                {filteredContacts.map((contact) => {
                  const isActive = contact.id === selectedContactId;

                  return (
                    <button
                      key={contact.id}
                      onClick={() => setSelectedContactId(contact.id)}
                      className={`mb-2 w-full rounded-2xl p-4 text-left transition ${
                        isActive
                          ? 'bg-blue-50 ring-1 ring-blue-200'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 font-black text-blue-700">
                          {contact.name
                            .split(' ')
                            .map((part) => part[0])
                            .join('')
                            .slice(0, 2)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate font-bold text-slate-900">
                              {contact.name}
                            </p>

                            {contact.unread > 0 ? (
                              <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">
                                {contact.unread}
                              </span>
                            ) : null}
                          </div>

                          <p className="text-xs font-semibold text-slate-500">
                            {contact.role} • {contact.sport}
                          </p>

                          <p className="mt-1 truncate text-sm text-slate-500">
                            {contact.lastMessage}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}

                {!filteredContacts.length ? (
                  <div className="py-16 text-center text-slate-500">
                    No contacts found.
                  </div>
                ) : null}
              </div>
            </aside>

            <section className="flex h-[720px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              {!selectedContact ? (
                <div className="flex flex-1 items-center justify-center text-slate-500">
                  <div className="flex items-center gap-4">
                    <MessageSquare size={42} className="text-slate-300" />
                    <p className="text-lg">Select a contact to start chatting</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="border-b border-slate-200 p-5">
                    <h3 className="text-xl font-black text-slate-900">
                      {selectedContact.name}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {selectedContact.role} • {selectedContact.sport}
                    </p>
                  </div>

                  <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/60 p-5">
                    {activeMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender === 'me'
                            ? 'justify-end'
                            : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl px-5 py-3 shadow-sm ${
                            message.sender === 'me'
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-slate-800'
                          }`}
                        >
                          <p>{message.text}</p>
                          <p
                            className={`mt-1 text-xs ${
                              message.sender === 'me'
                                ? 'text-blue-100'
                                : 'text-slate-400'
                            }`}
                          >
                            {message.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-slate-200 bg-white p-4">
                    <div className="flex gap-3">
                      <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') sendMessage();
                        }}
                        placeholder="Type your message..."
                        className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                      />

                      <button
                        onClick={sendMessage}
                        className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700"
                      >
                        <Send size={18} />
                        Send
                      </button>
                    </div>
                  </div>
                </>
              )}
            </section>
          </div>
        </section>
      </section>
    </main>
  );
}
