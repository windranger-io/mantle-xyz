import { useState } from "react";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { ConvertCard } from "@components/ConvertCard";
import { Typography } from "@mantle/ui";
import { DELEGATION_URL } from "@config/constants";

const faqList: Array<{ q: string; a: JSX.Element }> = [
  {
    q: "Why should I migrate my $BIT tokens?",
    a: (
      <Typography className="text-type-secondary mx-4 mb-4">
        As per{" "}
        <a
          href="https://snapshot.org/#/bitdao.eth/proposal/0xe81f852d90ba80929b1f19683da14b334d63b31cb94e53249b8caed715475693"
          target="__blank"
          rel="noreferrer"
          className="underline"
        >
          BIP-21
        </a>{" "}
        and{" "}
        <a
          href="https://snapshot.org/#/bitdao.eth/proposal/0x950dac4d5715b8aa8eab29c484b1c9dd0eed161141262b0425874f65be4d9f8e"
          target="__blank"
          rel="noreferrer"
          className="underline"
        >
          MIP-22
        </a>
        , the community has approved the merger of BitDAO and Mantle. The new
        native token will be $MNT with usecases for Mantle Network gas fees and
        Mantle Governance voting. $BIT will be delisted on exchanges and
        replaced with $MNT trading pairs. Eventually all $BIT will be migrated
        to $MNT.
      </Typography>
    ),
  },
  {
    q: "How do I migrate using multisig?",
    a: (
      <Typography className="text-type-secondary mx-4 mb-4">
        Please see the &quot;For Advanced Users&quot; section of the{" "}
        <a
          href="https://www.mantle.xyz/blog/announcements/bit-to-mnt-user-guide"
          target="__blank"
          rel="noreferrer"
          className="underline"
        >
          blog post
        </a>
        .
      </Typography>
    ),
  },
  {
    q: "Will gas be refunded?",
    a: (
      <Typography className="text-type-secondary mx-4 mb-4">
        Yes, most users will be refunded their cost of migration in ETH. Users
        will not have to take any action and the ETH will be airdropped to the
        address. The status of the rebate will be available in a future
        dashboard.
      </Typography>
    ),
  },
  {
    q: "How do I add $MNT to my wallet?",
    a: (
      <div className="mx-4 mb-4">
        <Typography className="text-type-secondary break-all">
          Token address: 0x3c3a81e81dc49A522A592e7622A7E711c06bf354
        </Typography>
        <Typography className="text-type-secondary">
          Token symbol: MNT
        </Typography>
        <Typography className="text-type-secondary">
          Token name: Mantle
        </Typography>
        <Typography className="text-type-secondary">Decimals: 18</Typography>
      </div>
    ),
  },
  {
    q: "How do I vote with $MNT after?",
    a: (
      <Typography className="text-type-secondary mx-4 mb-4">
        $BIT delegation and voting works independently of $MNT due to the new
        token functionality. Visit{" "}
        <a
          href={DELEGATION_URL}
          target="__blank"
          rel="noreferrer"
          className="underline"
        >
          {DELEGATION_URL}
        </a>{" "}
        to delegate your $MNT again.
      </Typography>
    ),
  },
  {
    q: "Why will the Migrator contract be halted?",
    a: (
      <Typography className="text-type-secondary mx-4 mb-4">
        The contract is initially halted, then unhalted as the official
        migration period commences. The contract may be subsequenty halted in
        case there is a problem, or as instructed by Mantle Governance.
      </Typography>
    ),
  },
  {
    q: "Why will the Migrator contract be out of funds?",
    a: (
      <Typography className="text-type-secondary mx-4 mb-4">
        For security purposes, the Migrator contract will hold a minimal amount
        of funds and will require top-up from the relevant Mantle Treasury.
        Excess tokens will be occasionally transferred to the relevant Mantle
        Treasury via the &quot;defundContract&quot; mechanic.
      </Typography>
    ),
  },
];

function Accordion({
  controlText,
  panel,
}: {
  controlText: string;
  panel: JSX.Element;
}) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const togglePanel = () => setIsExpanded((curr) => !curr);

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
  return (
    <ConvertCard className="rounded-xl w-full mt-8 overflow-x-auto">
      <div className="flex gap-3">
        <div className="flex flex-col w-full">
          {faqList.map((el, idx) => (
            <div key={el.q}>
              <Accordion controlText={el.q} panel={el.a} />
              {idx < faqList.length - 1 && (
                <div className="border-t border-[#1C1E20]" />
              )}
            </div>
          ))}
        </div>
      </div>
    </ConvertCard>
  );
}
