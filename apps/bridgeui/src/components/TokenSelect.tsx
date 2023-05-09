/* eslint-disable react/require-default-props */
import { Fragment, useContext, useMemo } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { HiChevronDown } from "react-icons/hi";
import { SiEthereum } from "react-icons/si";
import clsx from "clsx";

import { CHAINS, MANTLE_TOKEN_LIST } from "@config/constants";
import StateContext from "@context/state";
import Image from "next/image";
import DirectionLabel from "./DirectionLabel";

type TokenSelectProps = {
  type: "Deposit" | "Withdraw";
  selectedToken: string;
  selectedTokenAmount?: string;

  setSelectedToken: (token: string) => void;
  setSelectedTokenAmount: (amount?: string) => void;

  setDestinationToken: (token: string) => void;
  setDestinationTokenAmount: (amount: string) => void;
};

export default function TokenSelect({
  type,
  selectedToken,
  selectedTokenAmount = "",

  setSelectedToken,
  setSelectedTokenAmount,
  setDestinationToken,
  setDestinationTokenAmount,
}: TokenSelectProps) {
  // unpack the context
  const { chainId } = useContext(StateContext);

  const tokens = useMemo(() => {
    return MANTLE_TOKEN_LIST.tokens.filter((v) => {
      return v.chainId === chainId;
    });
  }, [chainId]);

  const selected = useMemo(() => {
    const selection =
      tokens.find((v) => {
        return selectedToken === v.name;
      }) || tokens[0];

    const targetChainID = chainId === 5 ? 5001 : 5;

    const destination = MANTLE_TOKEN_LIST.tokens.find((v) => {
      return selection.logoURI === v.logoURI && v.chainId === targetChainID;
    });

    setDestinationToken(destination?.name || selection.name);

    return selection;
  }, [selectedToken, tokens, chainId, setDestinationToken]);

  return (
    <div className="py-6">
      <DirectionLabel
        direction="From"
        logo={
          type === "Deposit" ? (
            <SiEthereum />
          ) : (
            <Image
              alt="Mantle logo"
              src={MANTLE_TOKEN_LIST.logoURI}
              height={16}
              width={16}
            />
          )
        }
        chain={
          type === "Deposit" ? CHAINS[5].chainName : CHAINS[5001].chainName
        }
      />
      <Listbox
        value={selected}
        onChange={(selection) => {
          setSelectedToken(selection.name);
        }}
      >
        {({ open }) => (
          <div className="relative ">
            <div className="flex text-lg ">
              <input
                key={`${type}-amount`}
                value={selectedTokenAmount}
                onChange={(e) => {
                  setSelectedTokenAmount(e.currentTarget.value);
                  setDestinationTokenAmount(
                    `${
                      parseFloat(e.currentTarget.value || "0") - 0
                      // ((e.currentTarget.value && 0.00000015) || 0)
                    }`
                  );
                }}
                type="text"
                placeholder="0"
                className="grow  border border-stroke-inputs  focus:outline-none rounded-tl-lg rounded-bl-lg  bg-black py-1.5 px-3  ring-inset ring-stroke-inputs focus:ring-2 focus:ring-white  "
              />
              <Listbox.Button className="relative  cursor-default rounded-br-lg rounded-tr-lg  bg-black py-1.5 pl-5 pr-10 text-left text-white shadow-sm ring-1 ring-inset ring-stroke-inputs focus:outline-none focus:ring-2 focus:ring-white ">
                <span className="flex items-center">
                  <Image
                    alt={`Logo for ${selected?.name}`}
                    src={selected?.logoURI}
                    width={32}
                    height={32}
                  />
                  <span className="ml-2 block truncate">{selected?.name}</span>
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
              <Listbox.Options className="absolute z-10 mt-2.5 max-h-56 w-full overflow-auto rounded-lg bg-black py-0 text-lg shadow-lg ring-2 ring-white  focus:outline-none ">
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
                          <div className="text-type-muted">{0}</div>
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
    </div>
  );
}
