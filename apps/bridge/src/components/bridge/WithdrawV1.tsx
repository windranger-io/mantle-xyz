import { Direction, Token } from "@config/constants";

// in order of use...
import TokenSelect from "@components/bridge/TokenSelect";
import Divider from "@components/bridge/Divider";
import Destination from "@components/bridge/Destination";
import CTA from "@components/bridge/CTA";
import TransactionPanel from "@components/bridge/TransactionPanel";
import { Button } from "@mantle/ui";
import { useCallback, useContext, useState } from "react";
import { AiOutlineRight } from "react-icons/ai";
import Image from "next/image";
import StateContext from "@providers/stateContext";
import Link from "next/link";

const TABS_VIEWS = {
  OPTIONS: "options",
  OPTIONS_PARTY: "options_party",
};

export default function WithdrawV1({
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

  const [tabsView, setTabsView] = useState(TABS_VIEWS.OPTIONS);

  const handleBackTab = useCallback(() => {
    setShowMoreOptions(false);
    setTabsView(TABS_VIEWS.OPTIONS);
  }, []);

  if (tabsView === TABS_VIEWS.OPTIONS_PARTY) {
    return (
      <div className="grid gap-4">
        <div
          className="flex items-center justify-between bg-white/[0.05] rounded-[10px] px-3.5 py-[18px] text-sm hover:border-white/50 hover:bg-white/[0.15] focus:outline-none"
          role="button"
          onClick={handleBackTab}
          onKeyDown={handleBackTab}
          tabIndex={0}
        >
          Back to Mantel Bridge
          <div className="w-5 h-5 relative">
            <Image src="/thirdparty/back.svg" alt="back" fill />
          </div>
        </div>
        <div className="bg-white/[0.05] rounded-[10px]">
          <div className="px-4 py-[18px] border-b border-[#2E524E]">
            Token to withfraw
          </div>
          <div className={`overflow-auto ${containerHeightClass}`}>
            {bridgeList?.bridges.map((_) => (
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
                  {_.isVerified && (
                    <Image
                      className="opacity-40 group-hover:opacity-100"
                      src="/thirdparty/external.svg"
                      alt="external"
                      width={20}
                      height={20}
                    />
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
          These are independent service providers that Mantle is linking to for
          your convenience - Mantle has no responsibility for their operation.
        </div>
      </div>
    );
  }

  return (
    <>
      <TokenSelect selected={selected} direction={direction} />
      <Divider />
      <Destination direction={direction} destination={destination} />
      <CTA direction={direction} selected={selected} setIsOpen={setIsOpen} />
      <TransactionPanel
        selected={selected}
        // destination={destination}
        direction={direction}
      />
      <Button
        variant="link"
        className="flex content-center items-center m-auto py-4"
        onClick={() => setTabsView(TABS_VIEWS.OPTIONS_PARTY)}
      >
        A third party bridgen
        <AiOutlineRight className=" text-white opacity-[0.6] ml-[14px]" />
      </Button>
    </>
  );
}
