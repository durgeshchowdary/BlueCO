interface EmptyStateProps {
  title: string;
  description: string;
}

export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="card-glass relative flex flex-col items-center justify-center gap-3 overflow-hidden p-10 text-center text-slate-300">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_45%)]" />
      <div className="relative mb-2 flex h-16 w-16 items-center justify-center rounded-3xl border border-cyan-300/20 bg-cyan-300/10 text-lg font-black text-cyan-100 shadow-[0_0_34px_rgba(34,211,238,0.14)]">
        OP
      </div>
      <p className="relative text-2xl font-semibold text-white">{title}</p>
      <p className="relative max-w-xl text-sm leading-6 text-slate-400">{description}</p>
    </div>
  );
}
