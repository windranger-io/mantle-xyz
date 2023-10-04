import { ConvertCard } from "@components/ConvertCard";
import { DELEGATION_URL } from "@config/constants";
import { AccordionItemType, AccordionUi, Typography } from "@mantle/ui";

const faqList: Array<AccordionItemType> = [
  {
    trigger: (
      <Typography className="text-type-primary" variant="microBody14">
        Why should I migrate my $BIT tokens?
      </Typography>
    ),
    content: (
      <Typography variant="microBody14">
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
    value: "faq-1",
  },
  {
    trigger: (
      <Typography className="text-type-primary" variant="microBody14">
        Why is there a Migrator v2?
      </Typography>
    ),
    content: (
      <Typography variant="microBody14">
        Migrator v2 has been deployed to give effect to the MIP-27 Proposal. See
        more details in the{" "}
        <a
          href="https://www.mantle.xyz/blog/announcements/migrator-v2-your-bit-to-mnt-guide"
          target="__blank"
          rel="noreferrer"
          className="underline"
        >
          blog post
        </a>
        .
      </Typography>
    ),
    value: "faq-2",
  },
  {
    trigger: (
      <Typography className="text-type-primary" variant="microBody14">
        How do I migrate using multisig?
      </Typography>
    ),
    content: (
      <Typography variant="microBody14">
        Please see the &quot;Steps for using Etherscan (advanced users)&quot;
        section of the{" "}
        <a
          href="https://www.mantle.xyz/blog/announcements/migrator-v2-your-bit-to-mnt-guide"
          target="__blank"
          rel="noreferrer"
          className="underline"
        >
          blog post
        </a>
        .
      </Typography>
    ),
    value: "faq-3",
  },
  {
    trigger: (
      <Typography className="text-type-primary" variant="microBody14">
        How do I add $MNT to my wallet?
      </Typography>
    ),
    content: (
      <div>
        <Typography variant="microBody14" className="break-all">
          Token address: 0x3c3a81e81dc49A522A592e7622A7E711c06bf354
        </Typography>
        <Typography variant="microBody14">Token symbol: MNT</Typography>
        <Typography variant="microBody14">Token name: Mantle</Typography>
        <Typography variant="microBody14">Decimals: 18</Typography>
      </div>
    ),
    value: "faq-4",
  },
  {
    trigger: (
      <Typography className="text-type-primary" variant="microBody14">
        How do I vote with $MNT after?
      </Typography>
    ),
    content: (
      <Typography variant="microBody14">
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
    value: "faq-5",
  },
  {
    trigger: (
      <Typography className="text-type-primary" variant="microBody14">
        Why will the Migrator contract be halted?
      </Typography>
    ),
    content: (
      <Typography variant="microBody14">
        The contract is initially halted, then unhalted as the official
        migration period commences. The contract may be subsequenty halted in
        case there is a problem, or as instructed by Mantle Governance.
      </Typography>
    ),
    value: "faq-6",
  },
  {
    trigger: (
      <Typography className="text-type-primary" variant="microBody14">
        How do I cancel or modify my request?
      </Typography>
    ),
    content: (
      <Typography variant="microBody14">
        While the migration request is pending, you can modify the request
        amount by submitting a new value. If the value is &quot;0&quot; this is
        equivalent to cancelling your request. Please verify the &quot;Pending
        amount approved&quot;, which is the exact amount that will be migrated.
      </Typography>
    ),
    value: "faq-7",
  },
];

export function Faq() {
  return (
    <ConvertCard className="rounded-xl w-full mt-5 overflow-x-auto">
      <div className="flex gap-3">
        <AccordionUi list={faqList} className="flex flex-col w-full" />
      </div>
    </ConvertCard>
  );
}
