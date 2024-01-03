import { Direction, Token } from "@config/constants";

// in order of use...
import TokenSelect from "@components/bridge/TokenSelect";
import Divider from "@components/bridge/Divider";
import Destination from "@components/bridge/Destination";
import CTA from "@components/bridge/CTA";
import TransactionPanel from "@components/bridge/TransactionPanel";
import Image from "next/image";

import { useCallback, useContext, useMemo, useState } from "react";
import Link from "next/link";
import StateContext from "@providers/stateContext";

const tabOptions = [
  {
    title: "Mantle Bridge",
    mobile: "Mantle Bridge",
    hover: `This usually takes 7 days.<br/>
    Bridge any token from Mantle network. `,
  },
  {
    title: "A third party bridge",
    mobile: "3rd party bridge",
    hover: `This usually takes around 20 min. <br/>
    Bridge to multiple chains, limited to certain tokens `,
  },
];

export default function WithdrawV2({
  selected,
  destination,
  setIsOpen,
}: {
  selected: Token;
  destination: Token;
  setIsOpen: (v: boolean) => void;
}) {
  const { bridgeList } = useContext(StateContext);
  const direction = Direction.Withdraw;

  const [showMoreOptions, setShowMoreOptions] = useState(false);

  const handleSeeMoreOptions = () => {
    setShowMoreOptions(true);
  };
  const containerHeightClass = showMoreOptions
    ? "h-[432px]"
    : "h-[216px] border-b border-[#2E524E] ";

  const [tabOption, setTabOption] = useState(0);

  const handleChangeTabOptions = useCallback((i: number) => {
    setTabOption(i);
    setShowMoreOptions(false);
  }, []);

  const showBridgeList = useMemo(() => {
    if (bridgeList && bridgeList.bridges.length > 0) {
      return showMoreOptions
        ? bridgeList.bridges
        : bridgeList.bridges.slice(0, 3);
    }
    return [];
  }, [bridgeList, showMoreOptions]);

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {tabOptions.map((option, i) => (
          <div
            className={`flex flex-row-reverse md:flex-row justify-between w-full items-center cursor-pointer p-3 border-solid border rounded-lg ${
              tabOption === i
                ? "border-[#A8D0CD] text-white"
                : "border-transparent text-[#464646]"
            } bg-white/5 hover:border-[#A8D0CD]`}
            role="button"
            onClick={() => handleChangeTabOptions(i)}
            onKeyDown={() => handleChangeTabOptions(i)}
            tabIndex={0}
          >
            <div className="flex items-center">
              <div className="hidden md:block text-sm pr-[10px]">
                {option.title}
              </div>
              <div className="block md:hidden text-sm md:pr-[10px]">
                {option.mobile}
              </div>
              <div className="hidden md:block relative group">
                <Image
                  className={`${
                    tabOption === i ? "opacity-60" : "opacity-[15%]"
                  } hover:opacity-100 `}
                  src="/thirdparty/tooltip.svg"
                  alt="tooltip"
                  width={14}
                  height={14}
                />
                <div className="w-max opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 px-4 py-2 bg-white text-black text-xs rounded-md left-1/2 transform -translate-x-1/2 pointer-events-none z-10">
                  {/* eslint-disable-next-line react/no-danger */}
                  <div dangerouslySetInnerHTML={{ __html: option.hover }} />
                  <div className="absolute left-1/2 transform -translate-x-1/2 bottom-0 mb-[-4px] w-2 h-2 bg-white rotate-45" />
                </div>
              </div>
            </div>
            <Image
              src={
                tabOption === i
                  ? "/thirdparty/checked.svg"
                  : "/thirdparty/check.svg"
              }
              alt="check"
              width={16}
              height={16}
            />
          </div>
        ))}
      </div>
      {tabOption === 0 ? (
        <>
          <TokenSelect selected={selected} direction={direction} />
          <Divider />
          <Destination direction={direction} destination={destination} />
          <CTA
            direction={direction}
            selected={selected}
            setIsOpen={setIsOpen}
          />
          <TransactionPanel
            selected={selected}
            // destination={destination}
            direction={direction}
          />
        </>
      ) : (
        <div className="grid gap-4 py-4">
          <div className="bg-white/[0.05] rounded-[10px] overflow-hidden">
            {/* <div className="px-4 py-[18px] border-b border-[#2E524E]">
              Token to withfraw
            </div> */}
            <div
              className={`${
                showMoreOptions && "overflow-auto"
              } ${containerHeightClass}`}
            >
              {showBridgeList.map((_) => (
                <Link
                  href={_.link}
                  onClick={(e) => {
                    if (!_.isVerified) {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                  }}
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  <div
                    key={_.title}
                    className={`flex items-center select-none px-4 py-4 ${
                      _.isVerified
                        ? "cursor-pointer hover:bg-white/10 active:bg-white/20 focus:outline-none focus:ring focus:ring-white/40"
                        : "cursor-not-allowed"
                    } justify-between group`}
                  >
                    <div className="flex">
                      <Image
                        className={`${
                          _.isVerified ? "opacity-100" : "opacity-40"
                        }`}
                        src={_.img}
                        alt={_.title}
                        width={40}
                        height={40}
                      />
                      <div className="flex flex-col pl-[26px]">
                        <div
                          className={`${
                            _.isVerified ? "text-white" : "text-[#464646]"
                          } text-sm"`}
                        >
                          {_.title}
                        </div>
                        <div
                          className={`${
                            _.isVerified ? "text-white" : "text-[#464646]"
                          } text-xs text-opacity-60`}
                        >
                          {_.desc}
                        </div>
                      </div>
                    </div>
                    {_.isVerified ? (
                      <Image
                        className="opacity-40 group-hover:opacity-100"
                        src="/thirdparty/external.svg"
                        alt="external"
                        width={20}
                        height={20}
                      />
                    ) : (
                      <div className="text-xs font-normal text-[#464646]">
                        Coming soon
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
            {!showMoreOptions && (
              <div
                className="p-[18px] bg-white bg-opacity-5 text-center"
                role="button"
                onClick={handleSeeMoreOptions}
                onKeyDown={handleSeeMoreOptions}
                tabIndex={0}
              >
                See more options
              </div>
            )}
          </div>

          <div className="text-xs text-center">
            These are independent service providers that Mantle is linking to
            for your convenience - Mantle has no responsibility for their
            operation.
          </div>
        </div>
      )}
    </>
  );
}
