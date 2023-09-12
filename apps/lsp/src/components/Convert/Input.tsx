"use client";

import { AMOUNT_MAX_DISPLAY_DIGITS } from "@config/constants";
import { Button } from "@mantle/ui";
import { useEffect, useRef, useState } from "react";

const WIDTH_BUFFER = 14;

type InputProps = {
  symbol: string;
  balance: string;
  defaultAmount?: string;
  onChange: (_: string) => void;
};

export default function ConvertInput({
  symbol,
  balance,
  defaultAmount,
  onChange,
}: InputProps) {
  const [amount, setAmount] = useState(defaultAmount);

  const [width, setWidth] = useState(0);
  const span = useRef<HTMLSpanElement | null>(null);
  const input = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // set the width of the space
    setWidth((span.current?.offsetWidth || 0) + WIDTH_BUFFER);
  }, [amount]);

  useEffect(() => {
    input.current?.focus();
  }, []);

  return (
    <div className="flex flex-row">
      <div className="flex items-center text-4xl">
        <span id="hide" ref={span} className="invisible fixed">
          {amount || "0"}
        </span>
        <input
          key="convert-amount"
          id="convert-amount"
          ref={input}
          value={amount}
          type="number"
          min="0"
          // when we change the value, make sure it conforms to rules can't overflow
          onChange={(e) => {
            const newAmount = e.currentTarget.value;
            if (newAmount.length > AMOUNT_MAX_DISPLAY_DIGITS) {
              return;
            }

            if (span.current) {
              span.current.innerHTML = `${amount || ""}.`;
              setWidth((span.current?.offsetWidth || 0) + 13);
            }

            setAmount(newAmount);
            onChange(newAmount);
            if (span.current) {
              span.current.innerHTML = newAmount || "0";
              setWidth((span.current?.offsetWidth || 0) + 13);
            }
          }}
          // disable key inputs which dont make sense
          onKeyDown={(e) => {
            if (e.key === "-" || e.key === "+" || e.key === "e") {
              e.preventDefault();
            }
          }}
          onPaste={(e) => {
            // clean the pasted text
            const clean = e.clipboardData
              .getData("text")
              .replace(/[^0-9.]/g, "")
              .replace(/(?<=(.*\..*))\./gm, "")
              .slice(0, AMOUNT_MAX_DISPLAY_DIGITS);

            // abort if empty
            if (!clean) {
              e.preventDefault();
              e.stopPropagation();
            }
            setAmount(clean);
            onChange(clean);
          }}
          placeholder="0"
          className="flex text-4xl shrink border-0 focus:outline-none rounded-lg bg-transparent py-1.5 px-0 mr-2 focus:ring-0 appearance-none text-left max-w-[200px]"
          style={{ width: width || 35 }}
          step={0.1}
        />
        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
        <label htmlFor="convert-amount" className="text-[#C4C4C4] font-bold">
          {symbol}
        </label>
      </div>
      <div className="flex flex-col w-full justify-center text-right">
        <div>
          <Button
            type="button"
            variant="outline"
            className="btn"
            onClick={() => {
              setAmount(balance);
              onChange(balance);
            }}
          >
            MAX
          </Button>
        </div>
      </div>
    </div>
  );
}

ConvertInput.defaultProps = {
  defaultAmount: "",
};
