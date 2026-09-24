"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (options: {
    title: string;
    description?: string;
    type?: ToastType;
  }) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({
      title,
      description,
      type = "info",
    }: {
      title: string;
      description?: string;
      type?: ToastType;
    }) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: Toast = { id, title, description, type };
      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        removeToast(id);
      }, 5000);
    },
    [removeToast]
  );

  const getIcon = (type: ToastType) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />;
      default:
        return <Info className="h-5 w-5 text-blue-500 flex-shrink-0" />;
    }
  };

  const getBorderColor = (type: ToastType) => {
    switch (type) {
      case "success":
        return "border-emerald-200 bg-emerald-50/90 text-emerald-950";
      case "error":
        return "border-red-200 bg-red-50/90 text-red-950";
      case "warning":
        return "border-amber-200 bg-amber-50/90 text-amber-950";
      default:
        return "border-blue-200 bg-blue-50/90 text-blue-950";
    }
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 max-w-md w-full px-4 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-start p-4 rounded-xl border shadow-lg backdrop-blur-sm transition-all animate-in slide-in-from-bottom-5",
              getBorderColor(t.type)
            )}
          >
            {getIcon(t.type)}
            <div className="ml-3 flex-1">
              <p className="text-sm font-semibold">{t.title}</p>
              {t.description && (
                <p className="mt-1 text-xs opacity-90">{t.description}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="ml-2 rounded p-1 opacity-70 hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast debe usarse dentro de un ToastProvider");
  }
  return context;
}
