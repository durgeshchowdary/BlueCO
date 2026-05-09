export default function Loading() {
  return (
    <div
      className="card-glass flex h-52 items-center justify-center"
      role="status"
      aria-label="Loading"
      aria-live="polite"
    >
      <div className="relative flex h-16 w-16 items-center justify-center">
        <div className="absolute inset-0 animate-spin rounded-full bg-gradient-to-r from-blue-600 via-cyan-300 to-blue-600 p-[3px] shadow-[0_0_32px_rgba(34,211,238,0.28)]">
          <div className="h-full w-full rounded-full bg-[#05101b]" />
        </div>
        <div className="absolute inset-2 rounded-full border border-cyan-200/20 bg-white/10 backdrop-blur-sm" />
        <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-black text-white shadow-[0_0_22px_rgba(37,99,235,0.45)]">
          P
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.8)]" />
        </div>
      </div>
    </div>
  );
}
