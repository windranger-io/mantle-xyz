"use client";

import { AccordionUi, Typography, AccordionItemType } from "@mantle/ui";
import { ConvertCard } from "../ConvertCard";

const faqList: Array<AccordionItemType> = [
  {
    trigger: (
      <Typography className="text-type-primary" variant="microBody14">
        How to qualify for the MNT bonus?
      </Typography>
    ),
    content: (
      <Typography className="text-type-secondary">
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
    value: "faq-1",
  },
  {
    trigger: (
      <Typography className="text-type-primary" variant="microBody14">
        Looking for a test drive?
      </Typography>
    ),
    content: (
      <Typography className="text-type-secondary">
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
    value: "faq-2",
  },
  {
    trigger: (
      <Typography className="text-type-primary" variant="microBody14">
        What’s L1/L2 and the gas fees required for deposit/withdraw?
      </Typography>
    ),
    content: (
      <div className="text-type-secondary">
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
    value: "faq-3",
  },
  {
    trigger: (
      <Typography className="text-type-primary" variant="microBody14">
        Where can I see the bridge token mapping?
      </Typography>
    ),
    content: (
      <div className="text-type-secondary">
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
    value: "faq-4",
  },
  {
    trigger: (
      <Typography className="text-type-primary" variant="microBody14">
        How are withdrawal fees calculated?
      </Typography>
    ),
    content: (
      <div className="text-type-secondary">
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
    value: "faq-5",
  },
  {
    trigger: (
      <Typography className="text-type-primary" variant="microBody14">
        How long do deposits and withdrawals take?
      </Typography>
    ),
    content: (
      <div className="text-type-secondary">
        <Typography className="mb-4">
          Initiating a deposit typically completes in around ~12 minutes.
        </Typography>
        <Typography className="mb-4">
          Conversely, withdrawals, due to the intricacies of Optimistic Rollups,
          have a challenge period to detect and address any discrepancies in the
          Mantle Mainnet transaction. This ensures the highest security, but
          means withdrawals to Ethereum Mainnet can take up to a week.
        </Typography>
      </div>
    ),
    value: "faq-6",
  },
];

export function Faq() {
  return (
    <ConvertCard className="rounded-xl mt-8 md:mt-0">
      <div className="flex flex-col w-full">
        <AccordionUi list={faqList} className="flex flex-col w-full" />
      </div>
    </ConvertCard>
  );
}
