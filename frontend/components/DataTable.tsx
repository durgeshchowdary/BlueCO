import type { ReactNode } from 'react';

interface DataTableProps {
  columns: string[];
  rows: Array<Record<string, any>>;
  onDelete?: (id: string) => void;
  renderActions?: (row: Record<string, any>) => ReactNode;
  emptyMessage?: string;
}

export default function DataTable({ columns, rows, onDelete, renderActions, emptyMessage }: DataTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-100 text-left text-sm text-slate-700">
        <thead className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">
          <tr>
            {columns.map((column) => (
              <th key={column} className="px-6 py-4">
                {column}
              </th>
            ))}
            {(onDelete || renderActions) && <th className="px-6 py-4 text-right">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 bg-white">
          {rows.length ? (
            rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-slate-50/80 transition-colors">
                {columns.map((column) => (
                  <td key={column} className="px-6 py-4 align-middle font-medium">
                    {row[column] ?? '-'}
                  </td>
                ))}
                {(onDelete || renderActions) && (
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center gap-2">
                      {renderActions && renderActions(row)}
                      {onDelete && (
                        <button
                          type="button"
                          aria-label={`Delete ${String(row.ID ?? row.id ?? 'row')}`}
                          onClick={() => onDelete(row.id as string)}
                          className="rounded-xl bg-red-50 p-2 text-red-600 hover:bg-red-100 transition"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length + (onDelete || renderActions ? 1 : 0)} className="px-6 py-12 text-center text-slate-400 font-medium">
                <div className="flex flex-col items-center justify-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 text-xs font-black text-blue-600">
                    PG
                  </span>
                  <span>{emptyMessage ?? 'No records match this view yet.'}</span>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
