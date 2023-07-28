import { useContext, useEffect, useMemo, useRef, useState } from "react";
import StateContext from "@providers/stateContext";

import Image from "next/image";

import { L1_BITDAO_TOKEN } from "@config/constants";
import { Button } from "@mantle/ui";
import { formatBigNumberString } from "@mantle/utils";
import { formatUnits, parseUnits } from "ethers/lib/utils.js";

import BalanceLabel from "@components/converter/utils/BalanceLabel";
import { MantleLogo } from "./utils/MantleLogo";

const MAX_DISPLAY_DPX = 6;

export default function TokenSelect() {
  // unpack the context
  const { balances, amount, isLoadingBalances, setAmount } =
    useContext(StateContext);

  const hasBalance = useMemo(() => {
    return parseUnits(
      balances?.[L1_BITDAO_TOKEN.address] || "0",
      L1_BITDAO_TOKEN.decimals
    ).gte(parseUnits(amount || "0", L1_BITDAO_TOKEN.decimals));
  }, [balances, amount]);

  const [width, setWidth] = useState(0);
  const span = useRef<HTMLSpanElement | null>(null);
  const input = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // set the width of the space
    setWidth((span.current?.offsetWidth || 0) + 13);
  }, [amount]);

  useEffect(() => {
    input.current?.focus();
  }, []);

  return (
    <div className="z-1">
      {/* <BalanceLabel
        direction="Convert"
        logo={
          <Image
            alt={`Logo for ${L1_BITDAO_TOKEN?.name}`}
            src={L1_BITDAO_TOKEN?.logoURI}
            width={24}
            height={24}
          />
        }
        chain={`$${L1_BITDAO_TOKEN?.symbol} Tokens`}
      /> */}
      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
      <label
        htmlFor="convert-amount"
        className="flex flex-row w-full justify-between items-center py-4 px-5"
      >
        <div className="flex flex-row items-center gap-3">
          <Image
            alt={`Logo for ${L1_BITDAO_TOKEN?.name}`}
            src={L1_BITDAO_TOKEN?.logoURI}
            width={40}
            height={40}
          />
          <div className="flex flex-col">
            <div>From</div>
            <div>BIT</div>
          </div>
        </div>
        <div className="">
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0.34903 6.40001L11.3494 6.40001L6.14983 1.20041L6.99943 0.349609L13.6738 7.00001L6.99943 13.6744L6.14983 12.7996L11.3494 7.60001L0.34903 7.60001L0.34903 6.40001Z"
              fill="white"
            />
          </svg>
        </div>
        <div className="flex flex-row items-center gap-3">
          <div className="flex flex-col text-right">
            <div>To</div>
            <div>MNT</div>
          </div>
          <MantleLogo />
        </div>
      </label>

      <div className="flex flex-row pt-6 bg-[#0D0D0D] px-5">
        <div className="flex items-center text-4xl max-w-1/3">
          <span id="hide" ref={span} className="invisible fixed">
            {amount || "0"}
          </span>
          <input
            key="convert-amount"
            id="convert-amount"
            ref={input}
            value={amount}
            // when we change the value, make sure it conforms to rules can't overflow
            onChange={(e) => {
              let newAmount = e.currentTarget.value;
              const amountExpo = e.currentTarget.value
                .replace(/[^0-9.]/g, "")
                .replace(/(?<=(.*\..*))\./gm, "")
                .split(".")[1];

              try {
                if (newAmount) {
                  // clean the amount string of non nums
                  newAmount = newAmount
                    .replace(/[^0-9.]/g, "")
                    .replace(/(?<=(.*\..*))\./gm, "");

                  // if the decimals exceed 18dps we need to lose any additional digits
                  const amounts = newAmount.split(".");
                  if (amounts?.[1]?.length >= MAX_DISPLAY_DPX) {
                    // lock to tokens decimals
                    amounts[1] = amounts[1].substring(0, MAX_DISPLAY_DPX);
                    newAmount = amounts.join(".");
                  }

                  // set max at a visibly acceptable level
                  const max = "9999999999999999999999999999999999999999999"; // constants.MaxUint256

                  // fix the number to no greater than constants.MaxUint256 (with tokens decimals parsed)
                  const bnAmount = parseUnits(
                    newAmount || "0",
                    MAX_DISPLAY_DPX
                  ).gt(parseUnits(max, MAX_DISPLAY_DPX))
                    ? parseUnits(max, MAX_DISPLAY_DPX)
                    : parseUnits(newAmount || "0", MAX_DISPLAY_DPX);

                  // ensure the number is positive
                  newAmount = formatUnits(
                    bnAmount.lt(0) ? bnAmount.mul(-1) : bnAmount,
                    MAX_DISPLAY_DPX
                  );

                  // correct the decimal component
                  newAmount =
                    /* eslint-disable-next-line no-nested-ternary */
                    newAmount.match(/\.0$/) !== null &&
                    e.currentTarget.value.match(/\.0/) === null
                      ? newAmount.replace(/\.0$/, "")
                      : newAmount.split(".").length > 1
                      ? `${newAmount.split(".")[0]}.${
                          amountExpo.length >= MAX_DISPLAY_DPX
                            ? newAmount.split(".")[1]
                            : amountExpo ||
                              newAmount.split(".")[1].replace(/[^0-9.]/g, "")
                        }`
                      : newAmount;

                  // retain decimal while it's being added
                  newAmount =
                    newAmount.indexOf(".") === -1 &&
                    e.currentTarget.value.match(/\.$/) !== null
                      ? `${newAmount}.`
                      : newAmount;
                }
              } catch (err) {
                // eslint-disable-next-line no-console
                console.log(err);
              }
              setAmount(newAmount);

              // set the correct width before redraw
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
              // correction on decimal - type=number value must be number, decimal on its own is invalid
              if (e.key === "." && amount?.indexOf(".") === -1) {
                // set the correct width before redraw
                if (span.current) {
                  span.current.innerHTML = `${amount || ""}.`;
                  setWidth((span.current?.offsetWidth || 0) + 13);
                }
              }
            }}
            onPaste={(e) => {
              // clean the pasted text
              let clean = e.clipboardData
                .getData("text")
                .replace(/[^0-9.]/g, "")
                .replace(/(?<=(.*\..*))\./gm, "");

              // get rid of the surplus decimal if theres already one in the value
              if (e.currentTarget.value.indexOf(".") !== -1) {
                clean = clean.replace(".", "");
              } else if (clean === "." || parseInt(clean, 10) === 0) {
                clean = "";
              }

              // abort if empty
              if (!clean) {
                e.preventDefault();
                e.stopPropagation();
              }
            }}
            type="number"
            placeholder="0"
            className="flex text-4xl shrink border-0 focus:outline-none rounded-lg bg-transparent py-1.5 px-0 focus:ring-0 appearance-non text-left max-w-[200px]"
            style={{ width: width || 35 }}
            step={0.1}
          />
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
          <label htmlFor="convert-amount" className="text-[#C4C4C4] font-bold">
            BIT
          </label>
        </div>
        <div className="flex flex-col w-full justify-center text-right">
          <div>
            <Button
              type="button"
              variant="outline"
              className="btn"
              onClick={() => {
                setAmount(balances?.[L1_BITDAO_TOKEN.address] || "0");
              }}
            >
              MAX
            </Button>
          </div>
        </div>
      </div>
      {!hasBalance && !isLoadingBalances ? (
        <div className="flex flex-row items-center gap-2 w-full text-right justify-end bg-[#0D0D0D] px-5 pb-4">
          <span>
            <svg
              width="19"
              height="17"
              viewBox="0 0 19 17"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M9.01748 5.74147C9.42011 5.74147 9.74651 6.06787 9.74651 6.4705V9.66001C9.74651 10.0626 9.42011 10.389 9.01748 10.389C8.61485 10.389 8.28845 10.0626 8.28845 9.66001V6.4705C8.28845 6.06787 8.61485 5.74147 9.01748 5.74147Z"
                fill="#E22F3D"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M8.01554 0.269434C8.31988 0.0929479 8.66545 0 9.01726 0C9.36907 0 9.71464 0.0929477 10.019 0.269434C10.3228 0.445591 10.5747 0.698734 10.7494 1.00332L10.7504 1.00503L17.7659 13.1227C17.9416 13.427 18.0342 13.7721 18.0345 14.1234C18.0348 14.4747 17.9428 14.82 17.7677 15.1245C17.5926 15.4291 17.3405 15.6823 17.0367 15.8588C16.7329 16.0352 16.3881 16.1288 16.0367 16.13L16.0342 16.13H2.00034L1.99777 16.13C1.64645 16.1288 1.30162 16.0352 0.997832 15.8588C0.69404 15.6823 0.441956 15.4291 0.266831 15.1245C0.091706 14.82 -0.000310428 14.4747 7.86817e-07 14.1234C0.000312002 13.7721 0.0929398 13.427 0.268604 13.1227L7.28414 1.00503L7.28511 1.00332C7.45982 0.698735 7.71176 0.445591 8.01554 0.269434ZM7.91688 1.36713L8.5478 1.7324L1.53132 13.8518V13.8518C1.48352 13.9347 1.45815 14.029 1.45806 14.1247C1.45798 14.2205 1.48307 14.3147 1.53083 14.3977C1.5786 14.4808 1.64735 14.5498 1.7302 14.598C1.8127 14.6459 1.90631 14.6714 2.00171 14.6719H16.0328C16.1282 14.6714 16.2218 14.6459 16.3043 14.598C16.3872 14.5498 16.4559 14.4808 16.5037 14.3977C16.5515 14.3147 16.5765 14.2205 16.5765 14.1247C16.5764 14.029 16.5512 13.9351 16.5034 13.8522V13.8522L9.48489 1.72924C9.43774 1.64686 9.36967 1.57838 9.28755 1.53076C9.20543 1.48314 9.11219 1.45806 9.01726 1.45806C8.92233 1.45806 8.82909 1.48314 8.74697 1.53076C8.66485 1.57838 8.59677 1.64685 8.54962 1.72924L7.91688 1.36713Z"
                fill="#E22F3D"
              />
              <path
                d="M9.01748 13.4874C9.54594 13.4874 9.97433 13.059 9.97433 12.5306C9.97433 12.0021 9.54594 11.5737 9.01748 11.5737C8.48903 11.5737 8.06063 12.0021 8.06063 12.5306C8.06063 13.059 8.48903 13.4874 9.01748 13.4874Z"
                fill="#E22F3D"
              />
            </svg>
          </span>
          <span className="text-[#E22F3D]">Insufficient balance.</span>
        </div>
      ) : (
        <div className="flex flex-col w-full justify-end text-right bg-[#0D0D0D] px-5 pb-4">
          <div className="flex justify-end">
            <BalanceLabel
              className=""
              label="Available"
              logo={<span />}
              balance={`${
                Number.isNaN(
                  parseFloat(balances?.[L1_BITDAO_TOKEN.address] || "")
                )
                  ? "0.0"
                  : formatBigNumberString(
                      balances?.[L1_BITDAO_TOKEN.address],
                      L1_BITDAO_TOKEN.decimals,
                      true,
                      false
                    ) || "0.0"
              }${" "}${L1_BITDAO_TOKEN.symbol}`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
