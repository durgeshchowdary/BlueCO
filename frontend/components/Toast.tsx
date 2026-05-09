interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
}

export default function Toast({ message, type = 'info' }: ToastProps) {
  const base = 'rounded-3xl border px-5 py-3 text-sm shadow-xl shadow-black/30';
  const colors =
    type === 'success'
      ? 'border-emerald-400/20 bg-emerald-500/10 text-emerald-200'
      : type === 'error'
      ? 'border-rose-400/20 bg-rose-500/10 text-rose-200'
      : 'border-sky-400/20 bg-sky-500/10 text-sky-200';

  return <div className={`${base} ${colors}`}>{message}</div>;
}
