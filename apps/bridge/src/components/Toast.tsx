"use client";

import { AnimatePresence, motion } from "framer-motion";
import React, { ReactNode, useCallback, useContext, useEffect } from "react";

import StateContext from "@providers/stateContext";

import { useToast, ToastProps } from "@hooks/useToast";
import { Button } from "@mantle/ui";
import { usePathname } from "next/navigation";

import { Views } from "@config/constants";

const fromTop = true;

export function FixedToastContainer({
  hidden,
  children,
}: {
  hidden: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`fixed ${hidden ? "opacity-0 -z-1 pointer-events-none" : ""} ${
        fromTop ? `flex flex-col-reverse top-0` : `bottom-0`
      } mt-20 right-0 w-full md:w-[560px] pl-4 pr-8 pt-6 z-[9999]`}
    >
      {children}
    </div>
  );
}

export function ToastBody({
  type,
  onClick = false,
  borderLeft = "blue-700",
  children = [],
}: {
  // eslint-disable-next-line react/require-default-props
  type?: "success" | "error" | "onGoing";
  // eslint-disable-next-line react/require-default-props
  borderLeft?: string;
  onClick: false | ((e: React.MouseEvent<HTMLElement>) => void);
  children: React.ReactNode;
}) {
  return (
    // eslint-disable-next-line jsx-a11y/interactive-supports-focus
    <div
      role="button"
      tabIndex={0}
      onClick={(e) => onClick && onClick(e)}
      onKeyDown={(e) =>
        onClick && onClick(e as unknown as React.MouseEvent<HTMLElement>)
      }
      className={`flex flex-row gap-4 h-full items-center font-normal py-1 pl-1 pr-4 focus:outline-none transition-all duration-75 hover:cursor-pointer rounded-lg mb-4 bg-black border border-1 border-stroke-disabled/50 hover:border-stroke-disabled ${
        (type === "error" && ` backdrop-blur-[40px] text-color-white`) || ""
      }${
        (type === "success" && `backdrop-blur-[40px] text-color-white`) || ""
      }${
        (type === "onGoing" && `backdrop-blur-[40px] text-color-white`) || ""
      }`}
    >
      <div
        className={`rounded-lg h-20 w-[0.6rem] ${
          borderLeft ? `${`bg-${borderLeft.replace("bg-", "")}`}` : ""
        }`}
      />
      <div className="flex justify-between w-full items-center py-2">
        {children}
      </div>
    </div>
  );
}

export function Toast({
  content,
  onButtonClick,
  buttonText: ButtonText,
  borderLeft,
  type,
  onClose,
  id,
}: ToastProps) {
  const handleClose = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();

    // we don't close ongoing type until they are manually deleted
    if (type === "onGoing") return;

    onClose(id);
  };

  return (
    <ToastBody
      type={type}
      borderLeft={borderLeft}
      onClick={(e) => handleClose(e)}
    >
      <span className="truncate">{content}</span>
      {typeof ButtonText === "function" ? (
        <ButtonText />
      ) : (
        <Button
          variant="primary"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();

            // return button event chain (should we close it?)
            return onButtonClick
              ? onButtonClick(e) && type !== "onGoing" && handleClose(e)
              : type !== "onGoing" && handleClose(e);
          }}
        >
          {ButtonText || "Close"}
        </Button>
      )}
    </ToastBody>
  );
}

// toast container is the provider
export function ToastContainer({ children }: { children: ReactNode }) {
  const pathName = usePathname();

  const { toasts, deleteToast } = useToast();

  const { view, isCTAPageOpen } = useContext(StateContext);

  const escFunction = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        toasts.forEach((toast) => deleteToast(toast.id));
      }
    },
    [deleteToast, toasts]
  );

  useEffect(() => {
    document.addEventListener("keydown", escFunction, false);

    return () => {
      document.removeEventListener("keydown", escFunction, false);
    };
  }, [escFunction]);

  return (
    <>
      {children}
      <FixedToastContainer
        hidden={
          isCTAPageOpen ||
          pathName?.indexOf("/account") !== -1 ||
          view === Views.Account
        }
      >
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              layout
              initial={{ opacity: 1 }}
              key={`toast-${toast.id}`}
            >
              {/* eslint-disable-next-line react/jsx-props-no-spreading */}
              <Toast {...toast} onClose={deleteToast} />
            </motion.div>
          ))}
        </AnimatePresence>
      </FixedToastContainer>
    </>
  );
}
