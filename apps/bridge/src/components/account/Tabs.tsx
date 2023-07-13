"use client";

import React, { useContext, useEffect, useState } from "react";

import { Tab } from "@headlessui/react";
import { clsx } from "clsx";
import { SimpleCard, Typography } from "@mantle/ui";

import StateContext from "@providers/stateContext";
import Deposit from "@components/account/Deposit";
import Withdraw from "@components/account/Withdraw";
import Account from "@components/account/Account";

import { MdClear } from "react-icons/md";

import Link from "next/link";
import {
  Direction,
  L1_CHAIN_ID,
  L2_CHAIN_ID,
  MANTLE_MIGRATOR_HISTORY_PATH,
  MANTLE_MIGRATOR_URL,
  Views,
} from "@config/constants";
import { usePathname, useRouter } from "next/navigation";

export default function Tabs() {
  const {
    chainId,
    view,
    setSafeChains,
    setView,
    refetchWithdrawals,
    refetchDeposits,
  } = useContext(StateContext);

  const [categories] = useState({
    Deposit: [<Deposit />],
    Withdraw: [<Withdraw />],
    Migrations: [],
  });

  const router = useRouter();
  const pathName = usePathname();

  const [selectedTab, setSelectedTab] = useState(
    pathName?.indexOf("/withdraw") !== -1
      ? Direction.Withdraw
      : Direction.Deposit
  );

  // on first load
  useEffect(
    () => {
      // this will disable the incorrect network check (but still display if not L1 or L2 chainId)
      setSafeChains([L1_CHAIN_ID, L2_CHAIN_ID]);
      // align the selected tab
      if (pathName?.indexOf("/account") === 0) {
        if (pathName?.indexOf("/withdraw") !== -1) {
          refetchWithdrawals();
          setSelectedTab(Direction.Withdraw);
        } else {
          refetchDeposits();
          setSelectedTab(Direction.Deposit);
        }
        if (view !== Views.Account) {
          setView(Views.Account);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    (view === Views.Account && (
      <SimpleCard className="max-w-5xl w-full grid gap-8 relative px-8">
        <span className="flex justify-between align-middle">
          <Typography
            variant="transactionTableHeading"
            className="text-left w-full"
          >
            Account
          </Typography>
          <Typography variant="modalHeading" className="text-white w-auto pt-1">
            <Link
              className="text-white"
              href={`/${chainId === L1_CHAIN_ID ? "deposit" : "withdraw"}`}
              shallow
            >
              <MdClear className="cursor-pointer" />
            </Link>
          </Typography>
        </span>
        <Account selectedTab={selectedTab} />
        <Tab.Group
          selectedIndex={selectedTab === 1 ? 0 : 1}
          onChange={(val) => {
            // redirect to migrator app if the user chooses the last tab (index 2)
            if (val === 2) {
              window.open(
                `${MANTLE_MIGRATOR_URL}${MANTLE_MIGRATOR_HISTORY_PATH}`,
                "_self"
              );
              return;
            }
            router.push(`/account/${val === 0 ? "deposit" : "withdraw"}`);
            // set the selected tab according to the direction
            setSelectedTab(val === 0 ? Direction.Deposit : Direction.Withdraw);
          }}
        >
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
