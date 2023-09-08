import { AccordionUi, Typography, AccordionItemType } from "@mantle/ui";

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
        How do I migrate using multisig?
      </Typography>
    ),
    content: (
      <Typography variant="microBody14">
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
    value: "faq-2",
  },
  {
    trigger: (
      <Typography className="text-type-primary" variant="microBody14">
        Will gas be refunded?
      </Typography>
    ),
    content: (
      <Typography variant="microBody14">
        Yes, most users will be refunded their cost of migration in ETH. Users
        will not need to take any action and the ETH will be sent directly to
        the address used in the migration. The status of the rebate will be
        available in a future dashboard. There will be policies in place to
        reduce risk of rebate exploitation and griefing as mentioned in the
        following{" "}
        <a
          href="https://forum.mantle.xyz/t/passed-mip-22-mantle-token-design-conversion-parameters-and-asset-handling/6352/2#re-conversion-costs-3"
          target="__blank"
          rel="noreferrer"
          className="underline"
        >
          link
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
        Why will the Migrator contract be out of funds?
      </Typography>
    ),
    content: (
      <Typography variant="microBody14">
        For security purposes, the Migrator contract will hold a minimal amount
        of funds and will require top-up from the relevant Mantle Treasury.
        Excess tokens will be occasionally transferred to the relevant Mantle
        Treasury via the &quot;defundContract&quot; mechanic.
      </Typography>
    ),
    value: "faq-7",
  },
];

export function Faq() {
  return (
    <div className="flex gap-3">
      <AccordionUi list={faqList} className="flex flex-col w-full bg-black" />
    </div>
  );
}
