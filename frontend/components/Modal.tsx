interface ModalProps {
  title: string;
  description: string;
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

export default function Modal({
  title,
  description,
  open,
  onCancel,
  onConfirm,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
}: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
      <div
        className="w-full max-w-lg rounded-[32px] border border-white/10 bg-card/95 p-6 shadow-glow"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-modal-title"
        aria-describedby="confirmation-modal-description"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-accent">Confirm action</p>
            <h2 id="confirmation-modal-title" className="mt-2 text-2xl font-semibold text-white">{title}</h2>
          </div>
          <p id="confirmation-modal-description" className="text-slate-300">{description}</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-slate-200 transition hover:bg-white/10"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-accentSoft"
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
