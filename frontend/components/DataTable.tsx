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
    <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.055] shadow-[0_24px_90px_rgba(0,0,0,0.25)] backdrop-blur-2xl">
      <div className="flex flex-col gap-3 border-b border-white/10 p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-black text-white">Operations Grid</p>
          <p className="mt-1 text-xs font-semibold text-slate-400">{rows.length} records in this view</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-2 text-sm font-semibold text-slate-400">
          Search, filters and bulk actions ready
        </div>
      </div>
      <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-white/10 text-left text-sm text-slate-200">
        <thead className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/70 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100/70 backdrop-blur-xl">
          <tr>
            {columns.map((column) => (
              <th key={column} className="px-6 py-4">
                {column}
              </th>
            ))}
            {(onDelete || renderActions) && <th className="px-6 py-4 text-right">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {rows.length ? (
            rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="transition hover:bg-cyan-300/[0.06]">
                {columns.map((column) => (
                  <td key={column} className="px-6 py-4 align-middle font-semibold">
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
                          className="rounded-xl border border-red-300/20 bg-red-500/10 p-2 text-red-200 transition hover:bg-red-500/20"
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
              <td colSpan={columns.length + (onDelete || renderActions ? 1 : 0)} className="px-6 py-12 text-center font-medium text-slate-400">
                <div className="flex flex-col items-center justify-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-xs font-black text-cyan-100">
                    OP
                  </span>
                  <span>{emptyMessage ?? 'No records match this view yet.'}</span>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
}
