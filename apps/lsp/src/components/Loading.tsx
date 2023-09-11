import { IconLoading } from "@mantle/ui/src/LocaleSwitcher/Button/Icons";
import { HTMLAttributes, ReactNode } from "react";

export default function Loading() {
  return <IconLoading className="w-4 h-4" />;
}

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function TextLoading({ children }: Props) {
  return (
    <div className="text-sm bg-gray-400 opacity-10 animate-pulse-slow">
      {children}
    </div>
  );
}
