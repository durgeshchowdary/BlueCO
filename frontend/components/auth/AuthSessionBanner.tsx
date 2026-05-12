'use client';

export default function AuthSessionBanner({
  isVisible,
  onClose,
  message = 'Your session has expired. Please login again.',
}: {
  isVisible: boolean;
  onClose: () => void;
  message?: string;
  type?: 'warning' | 'expired';
}) {
  if (!isVisible) return null;

  return (
    <div className='fixed inset-x-0 top-0 z-[1000] border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800'>
      <div className='mx-auto flex max-w-7xl items-center justify-between gap-4'>
        <span>{message}</span>
        <button type='button' onClick={onClose} className='rounded-lg px-3 py-1 hover:bg-amber-100'>
          Close
        </button>
      </div>
    </div>
  );
}
