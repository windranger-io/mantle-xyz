"use client";

import React, { useContext, useEffect, useState } from "react";

import { Tab } from "@headlessui/react";
import { clsx } from "clsx";
import { SimpleCard, Typography } from "@mantle/ui";

import StateContext from "@providers/stateContext";
import Deposit from "@components/transactions/Deposit";
import Withdraw from "@components/transactions/Withdraw";
import Account from "@components/transactions/Account";

import { MdClear } from "react-icons/md";

import { Views } from "@config/constants";
import { usePathname, useRouter } from "next/navigation";

export default function Tabs() {
  const { view, chainId, setSafeChains, setView } = useContext(StateContext);

  const router = useRouter();
  const pathName = usePathname();

  const [categories] = useState({
    Deposit: [<Deposit />],
    Withdraw: [<Withdraw />],
  });

  // on first load
  useEffect(
    () => {
      // this will deisable the incorrect network check (but still display if not 5 or 5001)
      setSafeChains([5, 5001]);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // // scroll to the top on open
  // useEffect(() => {
  //   if (view === Views.Transactions) {
  //     window.scrollTo(0, 0);
  //   }
  // }, [view]);

  return (
    (view === Views.Transactions && (
      <SimpleCard className="max-w-5xl w-full grid gap-8 relative px-8">
        <span className="flex justify-between align-middle">
          <Typography
            variant="transactionTableHeading"
            className="text-left w-full"
          >
            Account
          </Typography>
          <Typography variant="modalHeading" className="text-white w-auto pt-1">
            <MdClear
              onClick={() => {
                // also route if on /transactions page
                if (pathName === "/transactions") {
                  router.push("/");
                } else {
                  setSafeChains([chainId]);
                  setView(Views.Default);
                }
              }}
              className="cursor-pointer"
            />
          </Typography>
        </span>
        <Account />
        <Tab.Group defaultIndex={chainId === 5 ? 0 : 1}>
          <Tab.List className="flex space-x-2 rounded-[10px] bg-white/[0.05] p-1 select-none md:w-1/2 md:mx-auto">
            {Object.keys(categories).map((category, index) => (
              <span key={`cat-${category || index}`} className="w-full">
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
    )) || <span />
  );
}
