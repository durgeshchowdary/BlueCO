import type { ReactNode } from 'react';

interface ToastContainerProps {
  children: ReactNode;
}

export default function ToastContainer({ children }: ToastContainerProps) {
  return <div className="fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-3">{children}</div>;
}
