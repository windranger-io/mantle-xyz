"use client";

import { useContext, useState } from "react";
import { Tab } from "@headlessui/react";
import { clsx } from "clsx";
import { SimpleCard } from "@mantle/ui";
import StateContext from "@context/state";
import Deposit from "./Deposit";
import Withdraw from "./Withdraw";

export default function Tabs() {
  // unpack the context
  const { setChainId } = useContext(StateContext);

  const [categories] = useState({
    Deposit: [<Deposit />],
    Withdraw: [<Withdraw />],
  });

  return (
    <SimpleCard className="max-w-lg w-full grid gap-4 relative">
      <Tab.Group
        onChange={(tab) => {
          if (tab === 0) {
            setChainId(5);
          } else {
            setChainId(5001);
          }
        }}
      >
        <Tab.List className="flex space-x-2 rounded-[10px] bg-white/[0.05] p-1 select-none w-fit">
          {Object.keys(categories).map((category, index) => (
            <span key={`cat-${category || index}`}>
              <Tab
                className={({ selected }) =>
                  clsx(
                    "w-full rounded-lg py-2.5 text-sm font-medium transition-all px-2.5",
                    "ring-white ring-opacity-0 ring-offset-0 ring-offset-white focus:outline-none focus:ring-2",
                    selected
                      ? "text-type-inversed bg-white shadow"
                      : "text-white hover:bg-white/[0.12] hover:text-white"
                  )
                }
              >
                {category}
              </Tab>
            </span>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-2" defaultValue="Withdraw">
          {Object.keys(categories).map((category, index) => (
            <span key={`tab-${category || index}`}>
              <Tab.Panel
                key={`tabPanel-${category || index}`}
                className={clsx("")}
                style={{ color: "#fff" }}
              >
                {categories[category as keyof typeof categories][0]}
              </Tab.Panel>
            </span>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </SimpleCard>
  );
}
