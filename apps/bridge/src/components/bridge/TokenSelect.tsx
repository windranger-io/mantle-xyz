/* eslint-disable react/require-default-props */
import { useContext, useEffect, useMemo, useState } from "react";
import { HiChevronDown } from "react-icons/hi";
import { SiEthereum } from "react-icons/si";
import { Dialog } from "@headlessui/react";
import debounce from "lodash.debounce";
import StateContext from "@providers/stateContext";

import Image from "next/image";
import {
  Token,
  Direction,
  CHAINS,
  L1_CHAIN_ID,
  L2_CHAIN_ID,
} from "@config/constants";
import { formatUnits, parseUnits } from "ethers/lib/utils.js";
import { formatBigNumberString, localeZero } from "@mantle/utils";
import { Button, Typography, DividerCaret } from "@mantle/ui";
import DirectionLabel from "@components/bridge/utils/DirectionLabel";
import { MantleLogo } from "@components/bridge/utils/MantleLogo";
import KindReminder from "@components/bridge/utils/KindReminder";
import { searchTokensByNameAndSymbol } from "@utils/searchTokens";

const POPULAR_TOKEN_SYMBOLS = ["ETH", "MNT", "USDT"];

export default function TokenSelect({
  direction: givenDirection,
  selected: givenSelected,
}: {
  direction: Direction;
  selected: Token;
}) {
  const [direction, setDirection] = useState<Direction>(givenDirection);
  const [selected, setSelected] = useState<Token>({} as Token);

  // unpack the context
  const {
    tokens,
    balances,
    selectedTokenAmount,
    isLoadingBalances,

    setSelectedToken,
    setSelectedTokenAmount,
    setDestinationTokenAmount,
    client,
  } = useContext(StateContext);

  const hasBalance = useMemo(() => {
    return parseUnits(
      balances?.[selected?.address || ""] || "0",
      selected?.decimals || 18
    ).gte(parseUnits(selectedTokenAmount || "0", selected?.decimals || 18));
  }, [selected, balances, selectedTokenAmount]);

  // avoid hydration issues
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setDirection(givenDirection), [givenDirection]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setSelected(givenSelected), [givenSelected]);

  // control if token selection dialog opens
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // get popular token info from token list
  const [popularTokenMap, setPopularTokenMap] = useState<{
    [key in string]: Token;
  }>({});

  useEffect(() => {
    if (Object.values(popularTokenMap).length < 1) {
      const mapping: { [key in string]: Token } = {};
      const popularTokens = tokens.filter((t) =>
        POPULAR_TOKEN_SYMBOLS.includes(t.symbol)
      );
      popularTokens.forEach((t) => {
        mapping[t.symbol] = t;
      });
      setPopularTokenMap(mapping);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokens]);

  const [searchResult, setSearchResult] = useState<Token[]>([]);

  const selectBtnClicked = () => {
    setIsOpen(true);
    // move selected token to the front of the token list
    const selectedIndex = tokens.findIndex((t) => t.symbol === selected.symbol);
    if (selectedIndex !== -1) {
      const reorderedTokens = [
        tokens[selectedIndex],
        ...tokens.slice(0, selectedIndex),
        ...tokens.slice(selectedIndex + 1),
      ];
      setSearchResult(reorderedTokens);
    } else {
      setSearchResult(tokens);
    }
  };

  const handleSearch = debounce((e: { target: { value: any } }) => {
    const searched = searchTokensByNameAndSymbol(tokens, e.target.value);
    setSearchResult(searched);
  }, 300);

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
                  if (
                    (amounts?.[1] || "")?.length >= (selected?.decimals || 18)
                  ) {
                    // lock to tokens decimals
                    amounts[1] = amounts[1].substring(
                      0,
                      selected?.decimals || 18
                    );
                    amount = amounts.join(".");
                  }

                  // set max at a visibly acceptable level
                  const max = "9999999999999999999999999999999999999999999"; // constants.MaxUint256

                  // fix the number to no greater than constants.MaxUint256 (with tokens decimals parsed)
                  const bnAmount = parseUnits(
                    amount || "0",
                    selected?.decimals || 18
                  ).gt(parseUnits(max, selected?.decimals || 18))
                    ? parseUnits(max, selected?.decimals || 18)
                    : parseUnits(amount || "0", selected?.decimals || 18);

                  // ensure the number is positive
                  amount = formatUnits(
                    bnAmount.lt(0) ? bnAmount.mul(-1) : bnAmount,
                    selected?.decimals || 18
                  );

                  // correct the decimal component
                  amount =
                    /* eslint-disable-next-line no-nested-ternary */
                    amount.match(/\.0$/) !== null &&
                    e.currentTarget.value.match(/\.0/) === null
                      ? amount.replace(/\.0$/, "")
                      : amount.split(".").length > 1
                      ? `${amount.split(".")[0]}.${
                          amountExpo.length >= (selected?.decimals || 18)
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
          <div className="bg-black flex items-center">
            <Button
              type="button"
              variant="ghost"
              className={`border ${
                client?.isConnected
                  ? "border-stroke-ghost"
                  : "border-stroke-disabled"
              }`}
              disabled={!client?.isConnected}
              onClick={() => {
                setSelectedTokenAmount(
                  balances?.[selected?.address || ""] || "0"
                );
                setDestinationTokenAmount(
                  balances?.[selected?.address || ""] || "0"
                );
              }}
            >
              Max
            </Button>
          </div>
          <button
            type="button"
            onClick={selectBtnClicked}
            className="h-12 relative cursor-default rounded-br-lg rounded-tr-lg bg-black py-1.5 pl-5 pr-10 text-left text-white shadow-sm focus:outline-none focus:ring-0 focus:ring-white/70"
          >
            <span className="flex items-center h-full">
              {selected?.logoURI && (
                <Image
                  alt={`Logo for ${selected?.name}`}
                  src={selected?.logoURI}
                  width={24}
                  height={24}
                />
              )}
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
          </button>
        </div>

        <Dialog
          open={isOpen}
          onClose={() => setIsOpen(false)}
          className="relative z-50"
        >
          {/* The backdrop, rendered as a fixed sibling to the panel container */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-[52px]"
            aria-hidden="true"
          />
          {/* Full-screen scrollable container */}
          <div className="fixed inset-0 overflow-y-auto">
            {/* Container to center the panel */}
            <div className="flex min-h-full items-center justify-center p-4">
              {/* The actual dialog panel  */}
              <Dialog.Panel className="relative flex flex-col items-start lg:min-w-[484px] mx-auto rounded-[14px] bg-black py-7">
                <div className="mt-2.5 w-full px-5">
                  <button
                    type="button"
                    className="absolute right-5 top-5"
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="sr-only">Close menu</span>
                    <svg
                      width="25"
                      height="25"
                      viewBox="0 0 25 25"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12.5 14.1L1.9 24.75C1.66667 24.95 1.4 25.05 1.1 25.05C0.8 25.05 0.533334 24.95 0.3 24.75C0.1 24.5167 0 24.25 0 23.95C0 23.65 0.1 23.3833 0.3 23.15L10.95 12.5L0.35 1.9C0.116667 1.7 0 1.45 0 1.15C0 0.850001 0.1 0.583334 0.3 0.35C0.533334 0.116667 0.8 0 1.1 0C1.4 0 1.66667 0.116667 1.9 0.35L12.5 11L23.1 0.35C23.3333 0.15 23.6 0.0500002 23.9 0.0500002C24.2 0.0500002 24.4667 0.15 24.7 0.35C24.9 0.583334 25 0.850001 25 1.15C25 1.45 24.9 1.71667 24.7 1.95L14.05 12.55L24.7 23.2C24.9 23.4 25 23.65 25 23.95C25 24.25 24.9 24.5 24.7 24.7C24.4667 24.9333 24.2083 25.05 23.925 25.05C23.6417 25.05 23.3833 24.9333 23.15 24.7L12.5 14.1Z"
                        fill="white"
                      />
                    </svg>
                  </button>
                  <Typography
                    variant="smallTitle18"
                    className="text-type-secondary my-2.5"
                  >
                    Select a token
                  </Typography>
                  <div className="relative flex">
                    <input
                      type="text"
                      placeholder="Enter name or symbol"
                      className="grow rounded-[10px] bg-black border border-stroke-inputs py-[10.5px] pl-[47px] pr-4 placeholder:text-lg placeholder:text-type-secondary focus:outline-none focus:ring-0 focus:ring-white/70 appearance-none focus:border-white/70"
                      onChange={handleSearch}
                    />
                    <div className="absolute left-4 top-4">
                      {/* Search icon */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="15"
                        height="16"
                        viewBox="0 0 15 16"
                        fill="none"
                      >
                        <path
                          d="M12.959 14.833L8.25 10.145C7.792 10.5064 7.29567 10.7737 6.761 10.947C6.22633 11.1204 5.688 11.207 5.146 11.207C3.71533 11.207 2.5 10.714 1.5 9.72803C0.5 8.74203 0 7.5337 0 6.10303C0 4.68636 0.5 3.4747 1.5 2.46803C2.5 1.4607 3.71533 0.957031 5.146 0.957031C6.56267 0.957031 7.764 1.45703 8.75 2.45703C9.736 3.45703 10.229 4.67236 10.229 6.10303C10.229 6.67236 10.1457 7.2247 9.979 7.76003C9.81233 8.2947 9.54867 8.77703 9.188 9.20703L13.896 13.937C14.0213 14.0617 14.0803 14.211 14.073 14.385C14.0663 14.5584 14.0003 14.7077 13.875 14.833C13.7363 14.9717 13.5803 15.041 13.407 15.041C13.233 15.041 13.0837 14.9717 12.959 14.833ZM5.146 9.87403C6.188 9.87403 7.07333 9.50603 7.802 8.77003C8.53133 8.03403 8.896 7.14503 8.896 6.10303C8.896 5.0477 8.535 4.14836 7.813 3.40503C7.09033 2.66236 6.20133 2.29103 5.146 2.29103C4.07667 2.29103 3.174 2.66236 2.438 3.40503C1.702 4.14836 1.334 5.0477 1.334 6.10303C1.334 7.15903 1.702 8.05136 2.438 8.78003C3.174 9.50936 4.07667 9.87403 5.146 9.87403Z"
                          fill="white"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="mt-2.5 w-full flex justify-between items-center px-5">
                  <Typography variant="microBody14" className="hidden lg:block">
                    Popular tokens
                  </Typography>
                  <div className="flex items-center gap-5">
                    {POPULAR_TOKEN_SYMBOLS.map((symbol) =>
                      popularTokenMap[symbol] ? (
                        <button
                          type="button"
                          key={symbol}
                          onClick={() => {
                            setSelectedToken(
                              direction,
                              popularTokenMap[symbol]?.name
                            );
                            setIsOpen(false);
                          }}
                          className="flex items-center gap-2 py-2.5 px-2 rounded-lg	border border-stroke-primary hover:border-stroke-ghostHover hover:text-stroke-ghostHover"
                        >
                          <Image
                            alt={`Logo for ${popularTokenMap[symbol]?.name}`}
                            src={popularTokenMap[symbol]?.logoURI}
                            width={24}
                            height={24}
                          />

                          {popularTokenMap[symbol]?.symbol}
                        </button>
                      ) : null
                    )}
                  </div>
                </div>
                <DividerCaret className="mt-4" stroke="#1C1E20" />
                <div className="flex flex-col w-full px-5 max-h-96 overflow-y-scroll">
                  {searchResult.length > 0 ? (
                    searchResult.map((t) => (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedToken(direction, t.name);
                          setIsOpen(false);
                        }}
                        key={t.symbol}
                        className="flex justify-between items-center gap-4 cursor-pointer"
                      >
                        <Image
                          alt={`Logo for ${t.name}`}
                          src={t.logoURI}
                          width={32}
                          height={32}
                        />
                        <div className="grow my-1.5">
                          <Typography
                            variant="body18"
                            className={
                              selected.symbol === t.symbol
                                ? "text-[#65B3AE]"
                                : ""
                            }
                          >
                            {t.symbol}
                          </Typography>
                          <Typography variant="textBtn12">{t.name}</Typography>
                        </div>
                        <div className="text-type-muted">
                          {formatBigNumberString(
                            `${balances?.[t.address] || 0}`,
                            3,
                            true,
                            false
                          )}
                        </div>
                      </button>
                    ))
                  ) : (
                    <Typography variant="microBody14">
                      Sorry, we couldn&apos;t find anything. Try a different
                      token.
                    </Typography>
                  )}
                </div>
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      </div>

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
        </div>
      ) : (
        <DirectionLabel
          className="pt-4"
          direction={(selected?.address && "Your balance") || ""}
          logo={null}
          chain={
            !client?.isConnected
              ? "Unknown. Connect Wallet."
              : (selected?.address &&
                  `${
                    Number.isNaN(
                      parseFloat(balances?.[selected?.address || ""] || "")
                    )
                      ? localeZero
                      : formatBigNumberString(
                          balances?.[selected?.address || ""] || "",
                          3,
                          true,
                          false
                        ) || localeZero
                  }${" "}${selected?.symbol}`) ||
                ""
          }
        />
      )}
      <KindReminder direction={direction} />
    </div>
  );
}
