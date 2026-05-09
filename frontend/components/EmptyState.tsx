interface EmptyStateProps {
  title: string;
  description: string;
}

export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="card-glass flex flex-col items-center justify-center gap-3 p-10 text-center text-slate-300">
      <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-lg font-black text-accent">
        PG
      </div>
      <p className="text-2xl font-semibold text-white">{title}</p>
      <p className="max-w-xl text-sm leading-6 text-slate-400">{description}</p>
    </div>
  );
}
