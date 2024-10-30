/* eslint-disable react/require-default-props */
import { twMerge } from "tailwind-merge";

interface IconLoadingProps {
  className?: string;
}

export function IconCheck({ className = "" }: IconLoadingProps) {
  return (
    <div role="status">
      <svg
        aria-hidden="true"
        focusable="false"
        data-prefix="fas"
        className={twMerge(
          "w-6 h-6 text-gray-200 dark:text-gray-600 fill-[#26b562]",
          className
        )}
        data-icon="circle-check"
        role="img"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
      >
        <path
          fill="#26b562"
          d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"
        />
      </svg>
      <span className="sr-only">check</span>
    </div>
  );
}
