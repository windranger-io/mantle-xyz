/* eslint-disable react/require-default-props */
import { Fragment, useContext, useMemo } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { HiChevronDown } from "react-icons/hi";
import { SiEthereum } from "react-icons/si";

import StateContext from "@providers/stateContext";

import clsx from "clsx";
import Image from "next/image";

import {
  Token,
  Direction,
  CHAINS,
  L1_CHAIN_ID,
  L2_CHAIN_ID,
} from "@config/constants";
import { localeZero, formatBigNumberString } from "@utils/formatStrings";
import { formatUnits, parseUnits } from "ethers/lib/utils.js";

import DirectionLabel from "@components/bridge/utils/DirectionLabel";
import { MantleLogo } from "@components/bridge/utils/MantleLogo";

export default function TokenSelect({
  direction,
  selected,
}: {
  direction: Direction;
  selected: Token;
}) {
  // unpack the context
  const {
    tokens,
    balances,
    selectedTokenAmount,
    isLoadingBalances,

    setSelectedToken,
    setSelectedTokenAmount,
    setDestinationTokenAmount,
  } = useContext(StateContext);

  const hasBalance = useMemo(() => {
    return parseUnits(
      balances?.[selected.address] || "0",
      selected.decimals
    ).gte(parseUnits(selectedTokenAmount || "0", selected.decimals));
  }, [selected, balances, selectedTokenAmount]);

  return (
    <div className="py-6">
      <DirectionLabel
        direction="From"
        logo={direction === Direction.Deposit ? <SiEthereum /> : <MantleLogo />}
        chain={
          direction === Direction.Deposit
            ? CHAINS[L1_CHAIN_ID].chainName
            : CHAINS[L2_CHAIN_ID].chainName
        }
      />
      <Listbox
        value={selected}
        onChange={(selection) => {
          setSelectedToken(direction, selection.name);
        }}
      >
        {({ open }) => (
          <div
            className={`h-12 relative rounded-lg ring-1 ${
              hasBalance || isLoadingBalances
                ? `ring-stroke-inputs focus-within:ring-1 focus-within:ring-white/70`
                : `ring-[#E22F3D]`
            }`}
          >
            <div className="flex text-lg ">
              <input
                key={`${direction}-amount`}
                value={selectedTokenAmount}
                // when we change the value, make sure it conforms to rules can't overflow
                onChange={(e) => {
                  let amount = e.currentTarget.value;
                  const amountExpo = e.currentTarget.value
                    .replace(/[^0-9.]/g, "")
                    .replace(/(?<=(.*\..*))\./gm, "")
                    .split(".")[1];

                  try {
                    if (amount) {
                      // clean the amount string of non nums
                      amount = amount
                        .replace(/[^0-9.]/g, "")
                        .replace(/(?<=(.*\..*))\./gm, "");

                      // if the decimals exceed 18dps we need to lose any additional digits
                      const amounts = amount.split(".");
                      if (amounts?.[1]?.length >= selected.decimals) {
                        // lock to tokens decimals
                        amounts[1] = amounts[1].substring(0, selected.decimals);
                        amount = amounts.join(".");
                      }

                      // set max at a visibly acceptable level
                      const max = "9999999999999999999999999999999999999999999"; // constants.MaxUint256

                      // fix the number to no greater than constants.MaxUint256 (with tokens decimals parsed)
                      const bnAmount = parseUnits(
                        amount || "0",
                        selected.decimals
                      ).gt(parseUnits(max, selected.decimals))
                        ? parseUnits(max, selected.decimals)
                        : parseUnits(amount || "0", selected.decimals);

                      // ensure the number is positive
                      amount = formatUnits(
                        bnAmount.lt(0) ? bnAmount.mul(-1) : bnAmount,
                        selected.decimals
                      );

                      // correct the decimal component
                      amount =
                        /* eslint-disable-next-line no-nested-ternary */
                        amount.match(/\.0$/) !== null &&
                        e.currentTarget.value.match(/\.0/) === null
                          ? amount.replace(/\.0$/, "")
                          : amount.split(".").length > 1
                          ? `${amount.split(".")[0]}.${
                              amountExpo.length >= selected.decimals
                                ? amount.split(".")[1]
                                : amountExpo ||
                                  amount.split(".")[1].replace(/[^0-9.]/g, "")
                            }`
                          : amount;

                      // retain decimal while it's being added
                      amount =
                        amount.indexOf(".") === -1 &&
                        e.currentTarget.value.match(/\.$/) !== null
                          ? `${amount}.`
                          : amount;
                    }
                  } catch (err) {
                    // eslint-disable-next-line no-console
                    console.log(err);
                  }
                  setSelectedTokenAmount(amount);
                  setDestinationTokenAmount(amount);
                }}
                // disable key inputs which dont make sense
                onKeyDown={(e) => {
                  if (e.key === "-" || e.key === "+" || e.key === "e") {
                    e.preventDefault();
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
                className="grow border-0 focus:outline-none rounded-tl-lg rounded-bl-lg bg-black py-1.5 px-3 focus:ring-0 focus:ring-white/70 appearance-none"
              />
              <Listbox.Button className="h-12 relative cursor-default rounded-br-lg rounded-tr-lg bg-black py-1.5 pl-5 pr-10 text-left text-white shadow-sm focus:outline-none focus:ring-0 focus:ring-white/70">
                <span className="flex items-center">
                  <Image
                    alt={`Logo for ${selected?.name}`}
                    src={selected?.logoURI}
                    width={24}
                    height={24}
                  />
                  <span className="ml-2 truncate hidden md:block">
                    {selected?.symbol}
                  </span>
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 ml-1 flex items-center pr-2">
                  <HiChevronDown
                    className="h-5 w-5 text-white"
                    aria-hidden="true"
                  />
                </span>
              </Listbox.Button>
            </div>

            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-10 mt-2.5 max-h-56 w-full overflow-auto rounded-lg bg-black py-0 text-lg shadow-lg ring-1 ring-white/70 focus:outline-none ">
                {tokens.map((token) => (
                  <Listbox.Option
                    key={token.name}
                    className={({ active }) =>
                      clsx(
                        active
                          ? "bg-white/[0.12] text-white transition-all"
                          : "text-type-secondary",
                        "relative cursor-default select-none py-4 pl-3 pr-9"
                      )
                    }
                    value={token}
                  >
                    {() => {
                      return (
                        <div className="flex justify-between">
                          <div className="flex items-center  ">
                            <Image
                              alt={`Logo for ${token.name}`}
                              src={token.logoURI}
                              width={32}
                              height={32}
                            />

                            <span className={clsx("ml-3 block truncate ")}>
                              {token.name}
                            </span>
                          </div>
                          <div className="text-type-muted">
                            {formatBigNumberString(
                              `${balances?.[token.address] || 0}`,
                              selected.decimals,
                              true,
                              false
                            )}
                          </div>
                        </div>
                      );
                    }}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        )}
      </Listbox>
      {!hasBalance && !isLoadingBalances ? (
        <div className="flex flex-row items-center py-4 gap-2">
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
          <button
            type="button"
            className="text-[#0A8FF6]"
            onClick={() => {
              setSelectedTokenAmount(balances?.[selected.address] || "0");
              setDestinationTokenAmount(balances?.[selected.address] || "0");
            }}
          >
            Max
          </button>
        </div>
      ) : (
        <DirectionLabel
          className="pt-4"
          direction="Your balance"
          logo={<span />}
          chain={`${
            Number.isNaN(parseFloat(balances?.[selected.address] || ""))
              ? localeZero
              : formatBigNumberString(
                  balances?.[selected.address],
                  selected.decimals,
                  true,
                  false
                ) || localeZero
          }${" "}${selected.symbol}`}
        />
      )}
    </div>
  );
}
