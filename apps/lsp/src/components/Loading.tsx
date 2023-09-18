import { IconLoading } from "@mantle/ui/src/LocaleSwitcher/Button/Icons";
import { cn } from "@mantle/ui/src/utils";
import { HTMLAttributes, ReactNode } from "react";

export default function Loading() {
  return <IconLoading className="w-4 h-4" />;
}

interface Props extends HTMLAttributes<HTMLDivElement> {
  // eslint-disable-next-line react/require-default-props
  children?: ReactNode;
}

export function TextLoading({ className, children = null }: Props) {
  return (
    <div
      className={cn(
        "text-sm bg-gray-400 opacity-10 animate-pulse-slow",
        className
      )}
    >
      {children}
    </div>
  );
}
