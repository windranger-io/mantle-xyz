import { useState } from "react";
import { ConvertCard } from "@components/ConvertCard";
import { Typography } from "@mantle/ui";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";

// TODO: replace BIP-21 and blog post links
const faqList: Array<{ q: string; a: JSX.Element }> = [
  {
    q: "Why should you convert your tokens?",
    a: (
      <Typography className="text-type-secondary mx-4 mb-4">
        This conversion is part of a strategic move following{" "}
        <a
          href="https://snapshot.org/#/bitdao.eth/proposal/0xe81f852d90ba80929b1f19683da14b334d63b31cb94e53249b8caed715475693"
          target="__blank"
          rel="noreferrer"
          className="underline"
        >
          BIP-21
        </a>
        , aimed at unifying the brand under Mantle.
      </Typography>
    ),
  },
  {
    q: "How to assure the right security?",
    a: (
      <Typography className="text-type-secondary mx-4 mb-4">
        Please follow the{" "}
        {/* <a href="/" target="__blank" rel="noreferrer" className="underline"> */}
        blog post
        {/* </a> */}
      </Typography>
    ),
  },
  {
    q: "Will gas be refunded?",
    a: (
      <Typography className="text-type-secondary mx-4 mb-4">
        Yes, once a month we will refund everyones gas.
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
