"use client";

import { useEffect, useState, createContext, useContext, useCallback } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error";
}

interface ToastContextType {
  showToast: (message: string, type?: "success" | "error") => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    const showToast = (message: string, type: "success" | "error" = "success") => {
      window.dispatchEvent(new CustomEvent("toast", { detail: { message, type } }));
    };
    return { showToast };
  }
  return context;
}

let toastId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    const id = String(++toastId);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const { message, type } = (e as CustomEvent).detail;
      showToast(message, type);
    };
    window.addEventListener("toast", handler);
    return () => window.removeEventListener("toast", handler);
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onDismiss={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg backdrop-blur-sm border pointer-events-auto
        transition-all duration-300 ease-out min-w-[280px] max-w-[360px]
        ${toast.type === "success" 
          ? "bg-green-50/95 dark:bg-green-950/90 border-green-200 dark:border-green-800" 
          : "bg-red-50/95 dark:bg-red-950/90 border-red-200 dark:border-red-800"
        }
        ${isVisible 
          ? "translate-x-0 opacity-100" 
          : "translate-x-full opacity-0"
        }
      `}
    >
      {toast.type === "success" ? (
        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
      ) : (
        <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
      )}
      <span className={`text-sm font-medium flex-1 ${toast.type === "success" ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200"}`}>
        {toast.message}
      </span>
      <button
        onClick={onDismiss}
        className={`shrink-0 p-1 rounded-full transition-colors ${toast.type === "success" 
          ? "hover:bg-green-100 dark:hover:bg-green-900 text-green-600 dark:text-green-400" 
          : "hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400"
        }`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
