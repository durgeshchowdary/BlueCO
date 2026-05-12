"use client";

export default function LiveStatusIndicator({
  status,
}: {
  status: "healthy" | "warning" | "delayed" | "disconnected";
}) {
  const styles = {
    healthy: "bg-emerald-500",
    warning: "bg-amber-500",
    delayed: "bg-orange-500",
    disconnected: "bg-red-500",
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`h-2.5 w-2.5 rounded-full animate-pulse ${styles[status]}`} />
      <span className="text-xs font-black uppercase tracking-wider text-slate-500">
        {status}
      </span>
    </div>
  );
}
