import { AccordionUi, T, AccordionItemType } from "@mantle/ui";

const faqList: Array<AccordionItemType> = [
  {
    trigger: (
      <T className="text-type-primary" variant="microBody14">
        Why should I migrate my $BIT tokens?
      </T>
    ),
    content: (
      <T variant="microBody14">
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
      </T>
    ),
    value: "faq-1",
  },
];

export function Faq() {
  return (
    <div className="flex gap-3">
      <AccordionUi list={faqList} className="flex flex-col w-full bg-black" />
    </div>
  );
}
