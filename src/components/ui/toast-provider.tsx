"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { Button } from "./button";
import { Text } from "./text";

type ToastTone = "success" | "error";

type ToastItem = {
  id: string;
  message: string;
  tone: ToastTone;
};

type ToastContextValue = {
  showToast(message: string, tone?: ToastTone): void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const value = useContext(ToastContext);

  if (!value) {
    throw new Error("useToast must be used inside ToastProvider");
  }

  return value;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, tone: ToastTone = "error") => {
      const id = crypto.randomUUID();

      setItems((current) => [...current, { id, message, tone }]);
      window.setTimeout(() => dismiss(id), 4500);
    },
    [dismiss],
  );

  const context = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={context}>
      {children}
      <div className="toast-region" aria-live="polite" aria-label="Status messages">
        {items.map((item) => (
          <div className={`toast toast-${item.tone}`} role="status" key={item.id}>
            <Text>{item.message}</Text>
            <Button variant="icon" aria-label="Dismiss message" onClick={() => dismiss(item.id)}>
              ×
            </Button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
