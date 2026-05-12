'use client';

import { useEffect } from 'react';
import { captureFrontendException } from '../lib/observability';

export default function ObservabilityClient() {
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      captureFrontendException(event.error || event.message, {
        category: 'frontend_crash',
        source: event.filename,
        line: event.lineno,
        column: event.colno,
      });
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      captureFrontendException(event.reason, { category: 'unhandled_rejection' });
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onUnhandledRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
    };
  }, []);

  return null;
}
