"use client";

import { create } from "zustand";
import { ReactNode } from "react";

type Toast = Omit<ToastProps, "onClose">;

export type ToastProps = {
  id: string;
  content: ReactNode;
  onClose: (id: string) => void;
  type?: "success" | "error" | "onGoing";
  borderLeft?: string;
  buttonText?: ReactNode | (() => JSX.Element);
  onButtonClick?: false | ((e: React.MouseEvent<HTMLElement>) => boolean);
};

type ToastState = {
  toasts: Toast[];
  create: (toast: Toast) => void;
  delete: (id: string) => void;
  update: (toast: Toast) => void;
};

const useToastStore = create<ToastState>()((set) => ({
  toasts: [],
  create: (toast) =>
    set((state) => {
      const toasts = [...state.toasts];

      const index = toasts.findIndex((el) => el.id === toast.id);

      if (index !== -1) {
        return { toasts };
      }

      return { toasts: [...state.toasts, toast] };
    }),
  delete: (id) =>
    set((state) => {
      const toasts = [...state.toasts];

      return {
        toasts: toasts.filter((el) => el.id !== id),
      };
    }),
  update: (toast) =>
    set((state) => {
      const toasts = [...state.toasts];

      const index = toasts.findIndex((el) => el.id === toast.id);

      if (index !== -1) {
        toasts[index] = toast;
      } else {
        toasts.push(toast);
      }

      return {
        toasts,
      };
    }),
}));

export function useToast() {
  const toasts = useToastStore((state) => state.toasts);
  const createToast = useToastStore((state) => state.create);
  const updateToast = useToastStore((state) => state.update);
  const deleteToast = useToastStore((state) => state.delete);

  return { createToast, deleteToast, updateToast, toasts };
}
