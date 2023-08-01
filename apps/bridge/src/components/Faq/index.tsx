"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { Typography } from "@mantle/ui";
import { ConvertCard } from "../ConvertCard";

const faqList: Array<{ q: string; a: JSX.Element }> = [
  {
    q: "How to qualify for the MNT bonus?",
    a: (
      <Typography className="text-type-secondary mx-4 mb-4">
        Deposit any token from Ethereum Mainnet to Mantle Network to receive a
        dust bonus in MNT. Limited to once per wallet address.{" "}
        <a
          href="https://www.mantle.xyz/blog/announcements/bridging-on-mantle-mainnet"
          target="__blank"
          rel="noreferrer"
          className="underline block mt-4"
        >
          Learn more
        </a>
      </Typography>
    ),
  },
  {
    q: "Looking for a test drive?",
    a: (
      <Typography className="text-type-secondary mx-4 mb-4">
        You can experience the deposit and withdraw flow by using our simulated
        testnet. It provides a safe environment to try out the bridge
        functionality without any real token transactions.
        <a
          href="https://bridge.testnet.mantle.xyz"
          target="__blank"
          rel="noreferrer"
          className="underline block mt-4"
        >
          Try on Testnet Bridge
        </a>
      </Typography>
    ),
  },
  {
    q: "What’s L1/L2 and the gas fees required for deposit/withdraw?",
    a: (
      <div className="text-type-secondary mx-4 mb-4">
        <Typography className="mb-4">
          Mantle Network is a Layer-2 (L2) scalability solution built on
          Ethereum which is the Layer-1 (L1).
        </Typography>
        <ul>
          <li className="flex">
            <span className="mr-4">•</span>
            <Typography className="text-type-secondary">
              Deposit: You need ETH on L1 as gas fees to initiate the deposit.
              After depositing, you&apos;ll need MNT on L2 as gas fees to
              transact on Mantle Network.
            </Typography>
          </li>
          <li className="flex">
            <span className="mr-4">•</span>
            <Typography className="text-type-secondary">
              Withdraw: You need MNT on L2 as gas fees to initiate the
              withdrawal and ETH on L1 as gas fees to claim the tokens on
              Ethereum Mainnet.
            </Typography>
          </li>
        </ul>
        <a
          href="https://www.mantle.xyz/blog/announcements/bridging-on-mantle-mainnet"
          target="__blank"
          rel="noreferrer"
          className="underline block mt-4 text-md"
        >
          <Typography className="text-sm">Learn more</Typography>
        </a>
      </div>
    ),
  },
  {
    q: "Where can I see the bridge token mapping?",
    a: (
      <div className="text-type-secondary mx-4 mb-4">
        <Typography className="mb-4">
          You can view the bridge token mapping by visiting{" "}
          <a
            href="https://docs.mantle.xyz/network/for-devs/resources-and-tooling/mantle-bridge-api#the-token-list"
            target="__blank"
            rel="noreferrer"
            className="underline text-md"
          >
            this link
          </a>{" "}
          which directs to the Mantle documentation. It provides comprehensive
          details on the token list and other related information.
        </Typography>
      </div>
    ),
  },
  {
    q: "How are withdrawal fees calculated?",
    a: (
      <div className="text-type-secondary mx-4 mb-4">
        <Typography className="mb-4">
          The cost to claim on the bridge is dependent on the gas costs,
          measured in Gwei, at the time of your transaction. The estimated
          formula to determine this cost is:
        </Typography>
        <Typography className="mb-4">Cost (ETH)=600,000×Gwei</Typography>
        <Typography>For example:</Typography>
        <ul>
          <li className="flex">
            <span className="mr-4">•</span>
            <Typography className="text-type-secondary">
              At 15 Gwei, the cost is approximately 0.009 ETH.
            </Typography>
          </li>
          <li className="flex">
            <span className="mr-4">•</span>
            <Typography className="text-type-secondary">
              At 30 Gwei, the cost is approximately 0.018 ETH.
            </Typography>
          </li>
        </ul>
        <Typography>
          To minimize your costs, you can opt to claim during a period when the
          Gwei is low. For current gas prices, you can check the{" "}
          <a
            href="https://etherscan.io/gastracker"
            target="__blank"
            rel="noreferrer"
            className="underline text-md"
          >
            Etherscan Gas Tracker
          </a>
          .
        </Typography>
      </div>
    ),
  },
];

function Accordion({
  controlText,
  panel,
  expandedIdx,
  setExpandedIdx,
  index,
}: {
  controlText: string;
  panel: JSX.Element;
  expandedIdx: number | null;
  setExpandedIdx: Dispatch<SetStateAction<number | null>>;
  index: number;
}) {
  const isExpanded = expandedIdx === index;
  const togglePanel = () => {
    if (!isExpanded) {
      setExpandedIdx(index);
    } else if (isExpanded) {
      setExpandedIdx(null);
    }
  };
  return (
    <div className="flex flex-col">
      <button
        type="button"
        className="flex flex-row justify-between items-center cursor-pointer p-4"
        onClick={togglePanel}
      >
        <Typography className="text-type-primary text-left">
          {controlText}
        </Typography>
        {isExpanded ? (
          <IoIosArrowUp className="text-md" />
        ) : (
          <IoIosArrowDown className="text-md" />
        )}
      </button>
      {isExpanded && panel}
    </div>
  );
}

export function Faq() {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(0);

  return (
    <ConvertCard className="rounded-xl mt-8 md:mt-0">
      <div className="flex flex-col w-full">
        {faqList.map((el, idx) => (
          <div key={el.q}>
            <Accordion
              controlText={el.q}
              panel={el.a}
              expandedIdx={expandedIdx}
              setExpandedIdx={setExpandedIdx}
              index={idx}
            />
            {idx < faqList.length - 1 && (
              <div className="border-t border-[#1C1E20]" />
            )}
          </div>
        ))}
      </div>
    </ConvertCard>
  );
}
