"use client";

const invoices = [
  {
    id: "OUTPLAY-INV001",
    academy: "Vijayawada Blues Football Club",
    amount: "₹1,178.82",
    status: "Pending",
    dueDate: "08 May 2026",
  },
  {
    id: "OUTPLAY-INV002",
    academy: "Bangalore Strikers Academy",
    amount: "₹2,540.00",
    status: "Paid",
    dueDate: "10 May 2026",
  },
  {
    id: "OUTPLAY-INV003",
    academy: "Krishna Football Club",
    amount: "₹980.00",
    status: "Overdue",
    dueDate: "01 May 2026",
  },
];

export default function InvoiceHistoryTable() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-4">
        <h2 className="text-[18px] font-black text-slate-900">
          Invoice History
        </h2>

        <p className="mt-1 text-[13px] text-slate-500">
          Recent billing activity across academies
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-[12px] font-bold uppercase tracking-wide text-slate-500">
                Invoice ID
              </th>

              <th className="px-6 py-4 text-left text-[12px] font-bold uppercase tracking-wide text-slate-500">
                Academy
              </th>

              <th className="px-6 py-4 text-left text-[12px] font-bold uppercase tracking-wide text-slate-500">
                Amount
              </th>

              <th className="px-6 py-4 text-left text-[12px] font-bold uppercase tracking-wide text-slate-500">
                Status
              </th>

              <th className="px-6 py-4 text-left text-[12px] font-bold uppercase tracking-wide text-slate-500">
                Due Date
              </th>
            </tr>
          </thead>

          <tbody>
            {invoices.map((invoice) => (
              <tr
                key={invoice.id}
                className="border-t border-slate-100"
              >
                <td className="px-6 py-5 text-[14px] font-bold text-slate-900">
                  {invoice.id}
                </td>

                <td className="px-6 py-5 text-[14px] text-slate-700">
                  {invoice.academy}
                </td>

                <td className="px-6 py-5 text-[14px] font-semibold text-slate-900">
                  {invoice.amount}
                </td>

                <td className="px-6 py-5">
                  <span
                    className={`rounded-full px-3 py-1 text-[12px] font-bold ${
                      invoice.status === "Paid"
                        ? "bg-emerald-100 text-emerald-700"
                        : invoice.status === "Pending"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {invoice.status}
                  </span>
                </td>

                <td className="px-6 py-5 text-[14px] text-slate-600">
                  {invoice.dueDate}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}