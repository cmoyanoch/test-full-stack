import { useCallback, useRef, useState } from 'react';

export type ToastItem = {
  id: number;
  message: string;
  severity: 'info' | 'error';
};

export function useToasts() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastIdRef = useRef(0);

  const dismissToast = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const pushToast = useCallback(
    (msg: string) => {
      const id = ++toastIdRef.current;
      setToasts((t) => [...t, { id, message: msg, severity: 'info' }]);
      window.setTimeout(() => dismissToast(id), 4000);
    },
    [dismissToast],
  );

  const pushToastError = useCallback(
    (msg: string) => {
      const id = ++toastIdRef.current;
      setToasts((t) => [...t, { id, message: msg, severity: 'error' }]);
      window.setTimeout(() => dismissToast(id), 6000);
    },
    [dismissToast],
  );

  return { toasts, pushToast, pushToastError };
}
